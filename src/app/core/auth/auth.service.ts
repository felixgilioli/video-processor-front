import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

interface JwtPayload {
  exp: number;
  name?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}

const TOKEN_KEY = 'vp_access_token';
const REFRESH_KEY = 'vp_refresh_token';

const TOKEN_URL =
  'http://localhost:8180/realms/video-processing/protocol/openid-connect/token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  isAuthenticated = signal(this.checkToken());

  login(username: string, password: string): Observable<void> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: 'video-web-app',
      username,
      password,
    });

    return this.http
      .post<TokenResponse>(TOKEN_URL, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          if (res.refresh_token) {
            localStorage.setItem(REFRESH_KEY, res.refresh_token);
          }
          this.isAuthenticated.set(true);
        }),
        map(() => void 0),
        catchError((err) => {
          const status = err?.status;
          if (status === 401 || status === 400) {
            return throwError(() => new Error('Usuário ou senha inválidos'));
          }
          return throwError(
            () => new Error('Servidor de autenticação indisponível')
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.checkToken();
  }

  getUserInfo(): { name: string; initials: string; email: string } {
    const token = this.getToken();
    if (!token) return { name: 'Usuário', initials: 'U', email: '' };
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      const name =
        payload.name ||
        `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim() ||
        payload.preferred_username ||
        'Usuário';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      return { name, initials, email: payload.email ?? '' };
    } catch {
      return { name: 'Usuário', initials: 'U', email: '' };
    }
  }

  private checkToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
