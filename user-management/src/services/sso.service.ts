import { Injectable, Optional } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { appConfig } from '../config/app.config';

export interface SSOProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  provider: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SSOService {
  constructor(@Optional() private keycloakService: KeycloakService) {}
  private readonly ssoProviders: SSOProvider[] = [
    {
      id: 'keycloak',
      name: 'Keycloak SSO',
      icon: 'M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z',
      color: '#4d7c0f'
    }
  ];

  // Keycloak user profile mapping
  private mapKeycloakUserToSSOUser(keycloakProfile: any): SSOUser {
    return {
      id: keycloakProfile.sub || keycloakProfile.id,
      email: keycloakProfile.email || '',
      name: keycloakProfile.name || `${keycloakProfile.given_name || ''} ${keycloakProfile.family_name || ''}`.trim(),
      provider: 'keycloak',
      avatar: keycloakProfile.picture || 'https://via.placeholder.com/40'
    };
  }

  getSSOProviders(): SSOProvider[] {
    if (!appConfig.features.enableKeycloak) {
      return [];
    }
    return this.ssoProviders;
  }

  loginWithSSO(providerId: string): Observable<SSOUser> {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      throw new Error('SSO is disabled. Please use API authentication.');
    }

    if (providerId !== 'keycloak') {
      throw new Error(`SSO provider ${providerId} not supported`);
    }

    // Use proper redirect URI for login
    const loginOptions = {
      redirectUri: window.location.origin + '/'
    };

    return from(this.keycloakService.login(loginOptions)).pipe(
      map(() => {
        // After successful login, get user profile
        const userProfile = this.keycloakService.getKeycloakInstance().profile;
        if (!userProfile) {
          throw new Error('Failed to get user profile from Keycloak');
        }

        const ssoUser = this.mapKeycloakUserToSSOUser(userProfile);
        
        // Store SSO session info
        localStorage.setItem('sso_provider', providerId);
        localStorage.setItem('sso_user', JSON.stringify(ssoUser));
        
        return ssoUser;
      }),
      catchError(error => {
        console.error('Keycloak login error:', error);
        throw error;
      })
    );
  }

  getSSOUser(): SSOUser | null {
    const userStr = localStorage.getItem('sso_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getSSOProvider(): string | null {
    return localStorage.getItem('sso_provider');
  }

  logoutSSO(): void {
    if (appConfig.features.enableKeycloak && this.keycloakService) {
      // Logout from Keycloak
      this.keycloakService.logout();
    }
    
    // Clear local storage
    localStorage.removeItem('sso_provider');
    localStorage.removeItem('sso_user');
  }

  isSSOModeEnabled(): boolean {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return false;
    }
    return this.keycloakService.isLoggedIn();
  }

  // Validate Keycloak token
  validateSSOToken(): Observable<boolean> {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return of(false);
    }
    
    return of(this.keycloakService.isLoggedIn()).pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          // Check if token is still valid
          const token = this.keycloakService.getKeycloakInstance().token;
          return !!token && !this.keycloakService.isTokenExpired();
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // Get Keycloak access token
  getAccessToken(): string | undefined {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return undefined;
    }
    return this.keycloakService.getKeycloakInstance().token;
  }

  // Get user roles from Keycloak
  getUserRoles(): string[] {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return [];
    }
    return this.keycloakService.getUserRoles();
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return false;
    }
    return this.keycloakService.isUserInRole(role);
  }
}