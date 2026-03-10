import { Injectable, inject, signal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class KeycloakHelperService {
  private readonly keycloak = inject(KeycloakService);

  initialized = signal(false);
  loggedIn = signal(false);

  private initPromise: Promise<boolean> | null = null;

  async init(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.keycloak
      .init({
        config: {
          url: 'http://localhost:8180',
          realm: 'video-processing',
          clientId: 'video-web-app',
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri:
            window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
        },
        enableBearerInterceptor: false,
      })
      .then(authenticated => {
        this.initialized.set(true);
        this.loggedIn.set(authenticated);
        return authenticated;
      })
      .catch(err => {
        console.error('[Keycloak] Falha na inicialização:', err);
        this.initialized.set(false);
        this.initPromise = null;
        return false;
      });

    return this.initPromise;
  }

  async login(): Promise<void> {
    await this.keycloak.login({
      redirectUri: window.location.origin + '/',
    });
  }

  logout(): void {
    this.keycloak.logout(window.location.origin + '/login');
  }

  isLoggedIn(): boolean {
    try {
      return this.keycloak.isLoggedIn();
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  async loadUserProfile() {
    return this.keycloak.loadUserProfile();
  }
}
