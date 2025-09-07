import { Injectable, Optional, inject } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private http = inject(HttpClient);
  private baseUrl = appConfig.api.baseUrl;
  
  constructor(@Optional() private keycloakService: KeycloakService) {}
  private readonly ssoProviders: SSOProvider[] = [
    {
      id: 'keycloak',
      name: 'Keycloak SSO',
      icon: 'M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z',
      color: '#4d7c0f'
    },
    {
      id: 'api-sso',
      name: 'API SSO',
      icon: 'M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z',
      color: '#0f4d7c'
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
    const providers: SSOProvider[] = [];
    
    // Add Keycloak provider if enabled
    if (appConfig.features.enableKeycloak) {
      providers.push(this.ssoProviders.find(p => p.id === 'keycloak')!);
    }
    
    // Add API SSO provider if API integration is enabled
    if (appConfig.features.enableApiIntegration) {
      providers.push(this.ssoProviders.find(p => p.id === 'api-sso')!);
    }
    
    return providers;
  }

  loginWithSSO(providerId: string): Observable<any> {
    switch (providerId) {
      case 'keycloak':
        return this.loginWithKeycloak();
      case 'api-sso':
        return this.loginWithApiSSO();
      default:
        return of({ success: false, error: 'Unknown SSO provider' });
    }
  }

  private loginWithKeycloak(): Observable<any> {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return of({ success: false, error: 'Keycloak service not available' });
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
        localStorage.setItem('sso_provider', 'keycloak');
        localStorage.setItem('sso_user', JSON.stringify(ssoUser));
        
        return { success: true, user: ssoUser };
      }),
      catchError(error => {
        console.error('Keycloak login error:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  private loginWithApiSSO(): Observable<any> {
    // For API SSO, we'll redirect to the SSO token endpoint
    // Include callback URL so the API knows where to redirect after authentication
    const callbackUrl = `${window.location.origin}/sso-callback`;
    const ssoUrl = `${this.baseUrl}/api/auth/sso-token?callback=${encodeURIComponent(callbackUrl)}`;
    window.location.href = ssoUrl;
    
    return of({ success: true, redirected: true });
  }

  validateSSOToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/api/auth/sso-token`, { token }, { headers }).pipe(
      map((response: any) => {
        if (response && response.user) {
          // Store SSO session info
          localStorage.setItem('sso_provider', 'api-sso');
          localStorage.setItem('sso_user', JSON.stringify(response.user));
          localStorage.setItem('sso_token', token);
          
          return { success: true, user: response.user };
        }
        return { success: false, error: 'Invalid token response' };
      }),
      catchError(error => {
        console.error('SSO token validation failed:', error);
        return of({ success: false, error: error.message || 'Token validation failed' });
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
  validateKeycloakToken(): Observable<boolean> {
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