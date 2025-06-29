import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../services/journal-service.service';
import { Journal } from '../../models/journal.model';
import { environment } from '../../../environments/environment';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-add-journal',
  templateUrl: './add-journal.component.html',
  styleUrls: ['./add-journal.component.scss'],
})
export class AddJournalComponent implements OnInit {
  journalForm!: FormGroup;
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  isSaving: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isEditMode: boolean = false;
  journalId: string | null = null;

  @ViewChild(QuillEditorComponent, { static: false })
  quillEditor!: QuillEditorComponent;
  private readonly backendUrl: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.journalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      tags: [''],
      relatedLinks: [''],
      status: ['draft'],
    });

    this.route.paramMap.subscribe((params) => {
      this.journalId = params.get('id');
      if (this.journalId) {
        this.isEditMode = true;
        this.loadJournalData(this.journalId);
      }
    });
  }

  // loadJournalData(id: string): void {
  //   this.isSaving = true;
  //   this.journalService.getJournalById(id).subscribe({
  //     next: (journal: Journal) => {
  //       const formData = {
  //         title: journal.title,
  //         content: journal.content,
  //         category: journal.category,
  //         date: new Date(journal.date).toISOString().split('T')[0],
  //         tags: journal.tags ? journal.tags.join(', ') : '',
  //         relatedLinks: journal.relatedLinks
  //           ? journal.relatedLinks.join(', ')
  //           : '',
  //         status: journal.status || 'draft',
  //       };

  //       this.journalForm.reset(formData);

  //       setTimeout(() => {
  //         if (this.quillEditor && this.quillEditor.quillEditor) {
  //           this.quillEditor.writeValue(journal.content);
  //         }
  //       }, 100);

  //       if (journal.imageUrl && !journal.imageUrl.startsWith('http')) {
  //         this.imageUrl = `${this.backendUrl}${journal.imageUrl}`;
  //       } else {
  //         this.imageUrl = journal.imageUrl ?? null;
  //       }
  //       this.isSaving = false;
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Failed to load journal. Please try again.';
  //       this.isSaving = false;
  //     },
  //   });
  // }

  loadJournalData(id: string): void {
    this.isSaving = true;
    this.journalService.getJournalById(id).subscribe({
      next: (journal: Journal) => {
        console.log(
          '%c1. Journal data received from backend:',
          'color: limegreen; font-weight: bold;',
          journal
        );

        const formData = {
          title: journal.title,
          content: journal.content,
          category: journal.category,
          date: new Date(journal.date).toISOString().split('T')[0],
          tags: journal.tags ? journal.tags.join(', ') : '',
          relatedLinks: journal.relatedLinks
            ? journal.relatedLinks.join(', ')
            : '',
          status: journal.status || 'draft',
        };

        this.journalForm.reset(formData);
        console.log('%c2. Form model has been reset.', 'color: skyblue;');

        setTimeout(() => {
          console.log(
            '%c3. Inside setTimeout: Attempting to update the editor view.',
            'color: orange;'
          );

          if (this.quillEditor && this.quillEditor.quillEditor) {
            console.log(
              '%c4. SUCCESS: quillEditor ViewChild is valid.',
              'color: limegreen; font-weight: bold;',
              this.quillEditor
            );

            console.log(
              '%c5. Calling writeValue with content:',
              'color: skyblue;',
              journal.content
            );

            if (this.quillEditor && this.quillEditor.quillEditor) {
              this.quillEditor.writeValue(journal.content);
              this.cdr.detectChanges();
            }

            console.log(
              '%c6. FINISHED: writeValue has been called.',
              'color: limegreen; font-weight: bold;'
            );
          } else {
            console.error(
              '%c4. FAILURE: quillEditor ViewChild is UNDEFINED or not ready.',
              'color: red; font-weight: bold;'
            );
          }
        }, 200);

        if (journal.imageUrl && !journal.imageUrl.startsWith('http')) {
          this.imageUrl = `${this.backendUrl}${journal.imageUrl}`;
        } else {
          this.imageUrl = journal.imageUrl ?? null;
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load journal. Please try again.';
        this.isSaving = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      const reader = new FileReader();
      reader.onload = () => (this.imageUrl = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imageUrl = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onPublish(): void {
    if (this.journalForm.invalid) {
      this.journalForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all required fields to publish.';
      return;
    }
    this.processSave('published');
  }

  onSaveDraft(): void {
    this.processSave('draft');
  }

  private processSave(status: 'published' | 'draft'): void {
    this.isSaving = true;
    this.successMessage = null;
    this.errorMessage = null;

    let journalData: Partial<Journal> = {
      title: this.journalForm.value.title,
      content: this.journalForm.value.content,
      category: this.journalForm.value.category,
      date: this.journalForm.value.date,
      tags: this.journalForm.value.tags
        ? this.journalForm.value.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [],
      relatedLinks: this.journalForm.value.relatedLinks
        ? this.journalForm.value.relatedLinks
            .split(',')
            .map((link: string) => link.trim())
            .filter(Boolean)
        : [],
      status: status,
    };

    const finalizeSave = () => {
      if (this.imageUrl && this.imageUrl.startsWith(this.backendUrl)) {
        journalData.imageUrl = this.imageUrl.replace(this.backendUrl, '');
      } else if (this.imageUrl === null) {
        journalData.imageUrl = '';
      }

      const saveObservable =
        this.isEditMode && this.journalId
          ? this.journalService.updateJournal(
              this.journalId,
              journalData as Journal
            )
          : this.journalService.createJournal(journalData as Journal);

      saveObservable.subscribe({
        next: () => {
          this.successMessage = `Journal ${status} successfully!`;
          this.isSaving = false;
          setTimeout(() => this.router.navigate(['/journal']), 1500);
        },
        error: (err) => {
          this.errorMessage = `Failed to save journal. ${
            err.error?.error || 'Please check the server logs.'
          }`;
          this.isSaving = false;
        },
      });
    };

    if (this.selectedFile) {
      this.journalService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          journalData.imageUrl = response.imageUrl;
          finalizeSave();
        },
        error: (err) => {
          this.errorMessage = `Image upload failed. ${err.error?.error || ''}`;
          this.isSaving = false;
        },
      });
    } else {
      finalizeSave();
    }
  }

  onCancel(): void {
    this.router.navigate(['/journal']);
  }

  get f() {
    return this.journalForm.controls;
  }
}
