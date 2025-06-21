import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../services/journal-service.service';
import { Journal } from '../../models/journal.model';
import jsPDF from 'jspdf';
import { environment } from '../../../environments/environment';
import { AiAssistantService } from '../../services/ai-assistant.service';

@Component({
  selector: 'app-view-journal',
  templateUrl: './view-journal.component.html',
  styleUrls: ['./view-journal.component.scss'],
})
export class ViewJournalComponent implements OnInit {
  journalId: string | null = null;
  journalEntry: Journal | undefined;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  isSaving: boolean = false;
  successMessage: string | null = null;
  newRelatedLink: string = '';

  aiInsights: string = '';
  isGeneratingInsights: boolean = false;
  showInsightsSection: boolean = false;

  private readonly backendUrl: string = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private journalService: JournalService,
    private router: Router,
    private aiService: AiAssistantService
  ) {}

  ngOnInit(): void {
    this.journalId = this.route.snapshot.paramMap.get('id');
    if (this.journalId) {
      this.getJournalDetails(this.journalId);
    } else {
      this.errorMessage = 'Journal ID not provided.';
      this.isLoading = false;
    }
  }

  getJournalDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.journalService.getJournalById(id).subscribe({
      next: (data: Journal) => {
        let processedJournal: Journal = { ...data };
        if (
          processedJournal.imageUrl &&
          typeof processedJournal.imageUrl === 'string' &&
          processedJournal.imageUrl.trim() !== ''
        ) {
          if (
            !processedJournal.imageUrl.startsWith('http://') &&
            !processedJournal.imageUrl.startsWith('https://') &&
            !processedJournal.imageUrl.startsWith('data:image/')
          ) {
            processedJournal.imageUrl = `${this.backendUrl}${processedJournal.imageUrl}`;
          }
        }
        this.journalEntry = processedJournal;

        if (!this.journalEntry.relatedLinks) {
          this.journalEntry.relatedLinks = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load journal:', err);
        this.errorMessage =
          'Failed to load journal details. It might not exist or there was a server error.';
        this.isLoading = false;
      },
    });
  }

  getInsightsFromAI(): void {
    if (!this.journalEntry || !this.journalEntry.content) {
      this.aiInsights = "No journal content available to analyze.";
      this.showInsightsSection = true;
      return;
    }

    this.isGeneratingInsights = true;
    this.showInsightsSection = true;
    this.aiInsights = '### Generating AI Insights...\n\nPlease wait, this might take a few moments...'; // Use Markdown here now

    this.aiService.getJournalInsights(this.journalEntry.content).subscribe({
      next: (response) => {
        this.aiInsights = response.insights;
        this.isGeneratingInsights = false;
      },
      error: (err) => {
        console.error('Error getting AI insights for journal:', err);
        this.aiInsights = '### Error!\n\nFailed to generate insights from the AI. Please try again.'; // Use Markdown for errors too
        this.isGeneratingInsights = false;
      }
    });
  }

  goBackToJournals(): void {
    this.router.navigate(['/journal']);
  }

  getTagsAsString(tags: string[] | undefined): string {
    return tags && tags.length > 0
      ? tags.map((tag) => '#' + tag).join(', ')
      : '';
  }

  saveChanges(): void {
    if (!this.journalEntry || !this.journalEntry._id) {
      this.errorMessage =
        'Cannot save changes: Journal entry or ID is missing.';
      setTimeout(() => (this.errorMessage = null), 5000);
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const journalToSave = { ...this.journalEntry };
    if (
      journalToSave.imageUrl &&
      journalToSave.imageUrl.startsWith(this.backendUrl)
    ) {
      journalToSave.imageUrl = journalToSave.imageUrl.replace(
        this.backendUrl,
        ''
      );
    }

    this.journalService
      .updateJournal(journalToSave._id!, journalToSave)
      .subscribe({
        next: (updatedJournal) => {
          let processedUpdatedJournal: Journal = { ...updatedJournal };
          if (
            processedUpdatedJournal.imageUrl &&
            typeof processedUpdatedJournal.imageUrl === 'string' &&
            processedUpdatedJournal.imageUrl.trim() !== ''
          ) {
            if (
              !processedUpdatedJournal.imageUrl.startsWith('http://') &&
              !processedUpdatedJournal.imageUrl.startsWith('https://') &&
              !processedUpdatedJournal.imageUrl.startsWith('data:image/')
            ) {
              processedUpdatedJournal.imageUrl = `${this.backendUrl}${processedUpdatedJournal.imageUrl}`;
            }
          }
          this.journalEntry = processedUpdatedJournal;

          this.successMessage = 'Changes saved successfully!';
          this.isSaving = false;
          setTimeout(() => (this.successMessage = null), 3000);
        },
        error: (err) => {
          console.error('Failed to save changes:', err);
          this.errorMessage = 'Failed to save changes. Please try again.';
          this.isSaving = false;
          setTimeout(() => (this.errorMessage = null), 5000);
        },
      });
  }

  saveNotes(): void {
    if (this.journalEntry) {
      this.saveChanges();
    }
  }

  addRelatedLink(): void {
    if (this.journalEntry && this.newRelatedLink.trim()) {
      if (!this.journalEntry.relatedLinks) {
        this.journalEntry.relatedLinks = [];
      }
      this.journalEntry.relatedLinks.push(this.newRelatedLink.trim());
      this.newRelatedLink = '';
      this.saveChanges();
    }
  }

  deleteRelatedLink(index: number): void {
    if (
      this.journalEntry &&
      this.journalEntry.relatedLinks &&
      confirm('Are you sure you want to remove this link?')
    ) {
      this.journalEntry.relatedLinks.splice(index, 1);
      this.saveChanges();
    }
  }

  editJournal(): void {
    if (this.journalEntry && this.journalEntry._id) {
      this.router.navigate(['/edit-journal', this.journalEntry._id]);
    } else {
      this.errorMessage = 'Cannot edit: Journal ID is missing.';
      setTimeout(() => (this.errorMessage = null), 3000);
    }
  }

  deleteJournal(): void {
    if (!this.journalEntry || !this.journalEntry._id) {
      this.errorMessage = 'Journal not found for deletion.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    if (
      confirm(
        'Are you sure you want to delete this journal entry? This action cannot be undone.'
      )
    ) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.journalService.deleteJournal(this.journalEntry._id).subscribe({
        next: () => {
          this.successMessage = 'Journal entry deleted successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/journal']);
          }, 1500);
        },
        error: (err) => {
          console.error('Failed to delete journal entry:', err);
          this.errorMessage =
            'Failed to delete journal entry. Please try again.';
          this.isLoading = false;
          setTimeout(() => (this.errorMessage = null), 5000);
        },
      });
    }
  }

  exportJournalAsPdf(): void {
    if (!this.journalEntry) {
      this.errorMessage = 'No journal data to export.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const doc = new jsPDF();
      let yPos = 10;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Helper function to add new page if content overflows
      const addNewPage = (
        docInstance: jsPDF,
        currentY: number,
        lineSpacing: number = 0
      ) => {
        if (currentY + lineSpacing >= pageHeight - margin) {
          docInstance.addPage();
          return margin;
        }
        return currentY + lineSpacing;
      };

      // Add Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      let titleLines = doc.splitTextToSize(
        this.journalEntry.title,
        pageWidth - 2 * margin
      );
      doc.text(titleLines, margin, yPos);
      yPos = addNewPage(doc, yPos, titleLines.length * 9 + 5);

      // Add Date and Category
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100); // Gray color
      doc.text(
        `Written on: ${new Date(this.journalEntry.date).toLocaleDateString()}`,
        margin,
        yPos
      );
      yPos = addNewPage(doc, yPos, 6);

      if (this.journalEntry.category) {
        doc.text(`Category: ${this.journalEntry.category}`, margin, yPos);
        yPos = addNewPage(doc, yPos, 6);
      }
      if (this.journalEntry.tags && this.journalEntry.tags.length > 0) {
        doc.text(
          `Tags: ${this.getTagsAsString(this.journalEntry.tags)}`,
          margin,
          yPos
        );
        yPos = addNewPage(doc, yPos, 6);
      }
      doc.setTextColor(0, 0, 0); // Reset to black

      yPos = addNewPage(doc, yPos, 10); // Space before content

      // Add Image (if exists)
      if (this.journalEntry.imageUrl) {
        this.isLoading = true; // Indicate loading while fetching image
        this.loadImageToBase64(this.journalEntry.imageUrl)
          .then((base64Image) => {
            if (base64Image) {
              const imgProps = doc.getImageProperties(base64Image);
              const imgWidth = pageWidth - 2 * margin;
              const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

              yPos = addNewPage(doc, yPos, 5); // Small margin before image
              if (yPos + imgHeight >= pageHeight - margin) {
                doc.addPage();
                yPos = margin;
              }
              doc.addImage(
                base64Image,
                'PNG',
                margin,
                yPos,
                imgWidth,
                imgHeight
              );
              yPos = addNewPage(doc, yPos, imgHeight + 5);
            }
            this.continuePdfGeneration(doc, yPos);
          })
          .catch((err) => {
            console.error('Error loading image for PDF:', err);
            this.errorMessage =
              'Failed to load image for PDF. Exporting text only.';
            this.continuePdfGeneration(doc, yPos);
          });
      } else {
        this.continuePdfGeneration(doc, yPos);
      }
    } catch (err) {
      console.error('Error during PDF export:', err);
      this.errorMessage = 'Error exporting journal as PDF. Please try again.';
      this.isLoading = false;
      setTimeout(() => (this.errorMessage = null), 5000);
    }
  }

  private continuePdfGeneration(doc: jsPDF, currentY: number): void {
    let yPos = currentY;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper function to add new page if content overflows
    const addNewPage = (
      docInstance: jsPDF,
      currentY: number,
      lineSpacing: number = 0
    ) => {
      if (currentY + lineSpacing >= pageHeight - margin) {
        docInstance.addPage();
        return margin;
      }
      return currentY + lineSpacing;
    };

    // Add Content (HTML to Text conversion)
    if (this.journalEntry?.content) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      yPos = addNewPage(doc, yPos, 10); // Space before content

      // Convert HTML content to plain text, handling common tags
      const parser = new DOMParser();
      const docHtml = parser.parseFromString(
        this.journalEntry.content,
        'text/html'
      );
      const textContent = docHtml.body.textContent || '';

      const contentLines = doc.splitTextToSize(
        textContent,
        pageWidth - 2 * margin
      );
      contentLines.forEach((line: string | string[]) => {
        yPos = addNewPage(doc, yPos, 7); // Line height for content
        doc.text(line, margin, yPos);
      });
    }

    // Add Notes
    if (this.journalEntry?.notes) {
      yPos = addNewPage(doc, yPos, 15); // Space before Notes heading
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', margin, yPos);
      yPos = addNewPage(doc, yPos, 10);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(
        this.journalEntry.notes,
        pageWidth - 2 * margin
      );
      notesLines.forEach((line: string | string[]) => {
        yPos = addNewPage(doc, yPos, 7);
        doc.text(line, margin, yPos);
      });
    }

    // Add Related Work
    if (
      this.journalEntry?.relatedLinks &&
      this.journalEntry.relatedLinks.length > 0
    ) {
      yPos = addNewPage(doc, yPos, 15); // Space before Related Work heading
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Related Work', margin, yPos);
      yPos = addNewPage(doc, yPos, 10);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      this.journalEntry.relatedLinks.forEach((link) => {
        yPos = addNewPage(doc, yPos, 6);
        doc.text(`🔗 ${link}`, margin, yPos);
      });
    }

    doc.save(`${this.journalEntry?.title || 'Journal_Entry'}.pdf`);
    this.successMessage = 'Journal exported as PDF!';
    this.isLoading = false;
    setTimeout(() => (this.successMessage = null), 3000);
  }

  // Helper function to load image and convert to Base64
  private loadImageToBase64(url: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Required for CORS images
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Could not get canvas context');
        }
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }
}
