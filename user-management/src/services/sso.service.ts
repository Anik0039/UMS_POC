import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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
  private readonly ssoProviders: SSOProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
      color: '#4285f4'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: 'M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z',
      color: '#00a1f1'
    },
    {
      id: 'azure',
      name: 'Azure AD',
      icon: 'M0 0h24v24H0z',
      color: '#0078d4'
    }
  ];

  // Mock SSO users for demo purposes
  private readonly mockSSOUsers: { [key: string]: SSOUser } = {
    'google': {
      id: 'google_123',
      email: 'user@gmail.com',
      name: 'John Doe',
      provider: 'google',
      avatar: 'https://via.placeholder.com/40'
    },
    'microsoft': {
      id: 'ms_456',
      email: 'user@outlook.com',
      name: 'Jane Smith',
      provider: 'microsoft',
      avatar: 'https://via.placeholder.com/40'
    },
    'azure': {
      id: 'azure_789',
      email: 'user@company.com',
      name: 'Admin User',
      provider: 'azure',
      avatar: 'https://via.placeholder.com/40'
    }
  };

  getSSOProviders(): SSOProvider[] {
    return this.ssoProviders;
  }

  loginWithSSO(providerId: string): Observable<SSOUser> {
    // Simulate SSO authentication process
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        const user = this.mockSSOUsers[providerId];
        if (!user) {
          throw new Error(`SSO provider ${providerId} not found`);
        }
        
        // Store SSO session info
        localStorage.setItem('sso_provider', providerId);
        localStorage.setItem('sso_user', JSON.stringify(user));
        
        return user;
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
    localStorage.removeItem('sso_provider');
    localStorage.removeItem('sso_user');
  }

  isSSOModeEnabled(): boolean {
    return !!this.getSSOProvider();
  }

  // Simulate SSO token validation
  validateSSOToken(): Observable<boolean> {
    const provider = this.getSSOProvider();
    const user = this.getSSOUser();
    
    if (!provider || !user) {
      return of(false);
    }

    // Simulate token validation
    return of(true).pipe(delay(500));
  }
}