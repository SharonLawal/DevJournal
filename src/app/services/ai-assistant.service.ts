// frontend/src/app/services/ai-assistant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Assuming you have environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private apiUrl = `${environment.apiUrl}/ai`; // Base URL for AI endpoints

  constructor(private http: HttpClient) { }

  /**
   * Sends a general chat message to the AI assistant.
   * @param message The user's message.
   * @returns An Observable with the AI's reply.
   */
  sendMessage(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.apiUrl}/chat`, { message });
  }

  /**
   * Sends journal content to the AI for insights and recommendations.
   * @param journalContent The text content of the journal entry.
   * @returns An Observable with the AI's generated insights.
   */
  getJournalInsights(journalContent: string): Observable<{ insights: string }> {
    return this.http.post<{ insights: string }>(`${this.apiUrl}/journal-insights`, { journalEntryContent: journalContent });
  }
}