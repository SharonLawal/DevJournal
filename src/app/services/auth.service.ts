import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserProfile } from '../models/UserProfile.model';
import { environment } from '../../environments/environment';

interface JwtPayload {
  id: string;
  email: string;
  name?: string;
  iat: number;
  exp: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private _currentUserProfile = new BehaviorSubject<UserProfile | null>(null);
  currentUserProfile$ = this._currentUserProfile.asObservable();

  private apiURL = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.loadTokenAndProfile();
  }

  private loadTokenAndProfile(): void {
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(savedToken);
        const isValid = decodedToken.exp ? (decodedToken.exp * 1000 > Date.now()) : true;

        if (isValid) {
          this.token = savedToken;
          this.loggedIn.next(true);
          this.fetchUserProfile().subscribe({
            error: () => {
              this.logout();
            }
          });
        } else {
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    } else {
      this.loggedIn.next(false);
      this._currentUserProfile.next(null);
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiURL}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http
      .post<{ token: string }>(`${this.apiURL}/auth/login`, data)
      .pipe(
        tap((response) => {
          this.token = response.token;
          sessionStorage.setItem('token', response.token);
          this.loggedIn.next(true);
          this.fetchUserProfile().subscribe({
          });
        })
      );
  }

  logout(): void {
    this.token = null;
    sessionStorage.removeItem('token');
    this.loggedIn.next(false);
    this._currentUserProfile.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getCachedUserEmail(): string | null {
    const currentUser = this._currentUserProfile.getValue();
    return currentUser ? currentUser.email : null;
  }

  getCurrentUser(): JwtPayload | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          this.logout();
          return null;
        }
        return decodedToken;
      } catch (error) {
        this.logout();
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  isLoggedInSnapshot(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUserProfileSnapshot(): UserProfile | null {
    return this._currentUserProfile.getValue();
  }

  fetchUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiURL}/auth/profile`).pipe(
      tap(profile => this._currentUserProfile.next(profile)),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return throwError(() => new Error('Failed to fetch user profile'));
      })
    );
  }

  updateProfile(updateData: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiURL}/auth/profile`, updateData).pipe(
      tap(profile => this._currentUserProfile.next(profile)),
      catchError(error => {
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }
}