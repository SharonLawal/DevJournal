import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../services/journal-service.service';
import { Journal } from '../../models/journal.model';
import { environment } from '../../../environments/environment';

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

  private readonly backendUrl: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.journalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      date: [new Date(), Validators.required],
      tags: [''],
      relatedLinks: [''],
    });

    this.route.paramMap.subscribe((params) => {
      this.journalId = params.get('id');
      if (this.journalId) {
        this.isEditMode = true;
        this.loadJournalData(this.journalId);
      } else {
        this.isEditMode = false;
        this.journalForm.reset({ date: new Date() });
        this.selectedFile = null;
        this.imageUrl = null;
      }
    });
  }

  loadJournalData(id: string): void {
    this.isSaving = true;
    this.errorMessage = null;
    this.journalService.getJournalById(id).subscribe({
      next: (journal: Journal) => {
        this.journalForm.patchValue({
          title: journal.title,
          content: journal.content,
          category: journal.category,
          date: journal.date ? new Date(journal.date) : new Date(),
          tags: journal.tags ? journal.tags.join(', ') : '',
          relatedLinks: journal.relatedLinks
            ? journal.relatedLinks.join(', ')
            : '',
        });

        if (
          journal.imageUrl &&
          typeof journal.imageUrl === 'string' &&
          journal.imageUrl.trim() !== ''
        ) {
          if (
            !journal.imageUrl.startsWith('http://') &&
            !journal.imageUrl.startsWith('https://') &&
            !journal.imageUrl.startsWith('data:image/')
          ) {
            this.imageUrl = `${this.backendUrl}${journal.imageUrl}`;
          } else {
            this.imageUrl = journal.imageUrl;
          }
        } else {
          this.imageUrl = null;
        }

        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load journal. Please try again.';
        this.isSaving = false;
        this.router.navigate(['/journal']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imageUrl = null;
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
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveJournal(isDraft: boolean): void {
    if (this.journalForm.invalid && !isDraft) {
      this.journalForm.markAllAsTouched();
      this.errorMessage = 'Please correct the highlighted errors.';
      return;
    }

    this.isSaving = true;
    this.successMessage = null;
    this.errorMessage = null;

    let journalData: Journal = {
      title: this.journalForm.value.title,
      content: this.journalForm.value.content,
      category: this.journalForm.value.category,
      date: this.journalForm.value.date,
      tags: this.journalForm.value.tags
        ? this.journalForm.value.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [],
      relatedLinks: this.journalForm.value.relatedLinks
        ? this.journalForm.value.relatedLinks
            .split(',')
            .map((link: string) => link.trim())
            .filter((link: string) => link.length > 0)
        : [],
      status: isDraft ? 'draft' : 'published',
    };

    const finalizeSave = () => {
      if (this.imageUrl && typeof this.imageUrl === 'string') {
        if (this.imageUrl.startsWith(this.backendUrl)) {
          journalData.imageUrl = this.imageUrl.replace(this.backendUrl, '');
        } else if (this.imageUrl.startsWith('data:image/')) {
          journalData.imageUrl = undefined;
        } else {
          journalData.imageUrl = this.imageUrl;
        }
      } else {
        journalData.imageUrl = undefined;
      }

      let saveObservable;
      if (this.isEditMode && this.journalId) {
        saveObservable = this.journalService.updateJournal(
          this.journalId,
          journalData
        );
      } else {
        saveObservable = this.journalService.createJournal(journalData);
      }

      saveObservable.subscribe({
        next: () => {
          this.successMessage = this.isEditMode
            ? 'Journal updated successfully!'
            : isDraft
            ? 'Journal saved as draft!'
            : 'Journal published successfully!';
          this.isSaving = false;
          this.journalForm.reset();
          this.selectedFile = null;
          this.imageUrl = null;
          setTimeout(() => {
            this.router.navigate(['/journal']);
          }, 1500);
        },
        error: () => {
          this.errorMessage = 'Failed to save journal. Please try again.';
          this.isSaving = false;
        },
      });
    };

    if (this.selectedFile) {
      this.journalService.uploadImage(this.selectedFile).subscribe({
        next: (imageUploadResponse) => {
          journalData.imageUrl = imageUploadResponse.imageUrl;
          finalizeSave();
        },
        error: () => {
          this.errorMessage = 'Failed to upload image. Please try again.';
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
