import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Journal } from '../models/journal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private apiUrl = `${environment.apiUrl}/journals`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders();
  }

  getAllJournals(status?: 'draft' | 'published'): Observable<Journal[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Journal[]>(this.apiUrl, { params });
  }

  getPublishedJournals(): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.apiUrl}?status=published`);
  }

  getDraftJournals(): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.apiUrl}?status=draft`, {
      headers: this.getAuthHeaders(),
    });
  }

  getJournalById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createJournal(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateJournal(id: string, journal: Journal): Observable<Journal> {
    return this.http.put<Journal>(`${this.apiUrl}/${id}`, journal, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteJournal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/upload-image`, formData, {
      headers: this.getAuthHeaders(),
    });
  }
}
