import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SSOService,  } from './sso.service';
import { AuthApiService } from './auth-api.service';
import { map, catchError } from 'rxjs/operators';

export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role?: string;
  status?: string;
  joinDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private ssoService = inject(SSOService);
  private authApiService = inject(AuthApiService);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Clear any existing auth data on startup
    this.clearAuthData();
    
    // Check authentication status on service initialization
    this.checkAuthStatus();
  }

  private hasToken(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' || this.authApiService.isAuthenticated();
  }

  private getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  private checkAuthStatus(): void {
    const isAuth = this.hasToken();
    const user = this.getCurrentUser();
    
    this.isAuthenticatedSubject.next(isAuth);
    this.currentUserSubject.next(user);
  }

  login(userId: string, password: string): Observable<boolean> {
    // Map UI's userId to API's userName
    return this.authApiService.login({ userName: userId, password: password }).pipe(
      map(response => {
        if (response.isSuccess && response.value) {
          // Create user object from successful login
          const user: User = {
            userId: userId,
            name: userId, // Use userId as name for now
            email: userId.includes('@') ? userId : `${userId}@example.com`,
            role: 'User',
            status: 'Active',
            joinDate: new Date()
          };

          // Store authentication data
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userInfo', JSON.stringify(user));
          localStorage.setItem('authMethod', 'api');

          // Update subjects
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(user);

          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  logout(): void {
    const authMethod = this.getAuthMethod();
    const currentUser = this.getCurrentUserValue();
    
    if (authMethod === 'sso') {
      // SSO logout
      try {
        this.ssoService.logoutSSO();
        this.clearAuthData();
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('SSO logout failed:', error);
        // Fallback: clear local data and redirect
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    } else if (authMethod === 'api' && currentUser?.userId) {
      // API logout
      this.authApiService.logoutFromAPI(currentUser.userId).subscribe({
        next: (response) => {
          console.log('Logout successful:', response);
          this.clearAuthData();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('API logout failed:', error);
          // Even if API fails, clear local data and redirect
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      });
    } else {
      // Traditional logout or fallback
      this.clearAuthData();
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value || this.authApiService.isAuthenticated();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUserValue();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // In a real application, you would:
        // 1. Validate the current password against the server
        // 2. Hash the new password
        // 3. Update the password on the server
        
        // For demo purposes, we'll simulate a successful password change
        // In reality, you'd validate against the stored password
        const storedPassword = localStorage.getItem('userPassword') || 'password123';
        
        if (currentPassword !== storedPassword) {
          reject(new Error('Current password is incorrect'));
          return;
        }
        
        if (newPassword.length < 8) {
          reject(new Error('New password must be at least 8 characters long'));
          return;
        }
        
        // Store the new password (in real app, this would be hashed)
        localStorage.setItem('userPassword', newPassword);
        
        resolve(true);
      }, 1500);
    });
  }

  private clearAuthData(): void {
    // Clear existing authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('authMethod');
    
    // Clear SSO specific data
    localStorage.removeItem('sso_provider');
    localStorage.removeItem('sso_user');
    localStorage.removeItem('sso_token');
    
    // Clear API tokens
    this.authApiService.logout();
    
    // Clear SSO data as well
    this.ssoService.logoutSSO();
    
    // Reset subjects
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  loginWithSSO(providerId: string): Observable<boolean> {
    return new Observable(observer => {
      this.ssoService.loginWithSSO(providerId).subscribe({
        next: (response: { success: boolean; user?: { id?: string; userId?: string; name: string; email: string; role?: string; status?: string; }; redirected?: boolean; }) => {
          if (response.success && response.user) {
            // Convert SSO user to our User format
            const user: User = {
              userId: response.user.id || response.user.userId || '',
              name: response.user.name,
              email: response.user.email,
              role: response.user.role || 'User',
              status: response.user.status || 'Active',
              joinDate: new Date()
            };

            // Store authentication data
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userInfo', JSON.stringify(user));
            localStorage.setItem('authMethod', 'sso');

            // Update subjects
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(user);

            observer.next(true);
            observer.complete();
          } else if (response.redirected) {
            // For API SSO, user will be redirected
            observer.next(true);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  validateSSOToken(token: string): Observable<boolean> {
    return new Observable(observer => {
      this.ssoService.validateSSOToken(token).subscribe({
        next: (response: { success: boolean; user?: { id?: string; userId?: string; name: string; email: string; role?: string; status?: string; }}) => {
          if (response.success && response.user) {
            // Convert SSO user to our User format
            const user: User = {
              userId: response.user.id || response.user.userId || '',
              name: response.user.name,
              email: response.user.email,
              role: response.user.role || 'User',
              status: response.user.status || 'Active',
              joinDate: new Date()
            };

            // Store authentication data
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userInfo', JSON.stringify(user));
            localStorage.setItem('authMethod', 'sso');

            // Update subjects
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(user);

            observer.next(true);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  getAuthMethod(): string | null {
    return localStorage.getItem('authMethod');
  }

  isSSOModeActive(): boolean {
    return this.getAuthMethod() === 'sso' && this.ssoService.isSSOModeEnabled();
  }
}