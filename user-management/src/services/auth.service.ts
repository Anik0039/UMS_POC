import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SSOService } from './sso.service';
import { AuthApiService, RefreshTokenRequest } from './auth-api.service';
import { map, catchError } from 'rxjs/operators';
import { SsoRedirectInfo } from '../models/sso.models';
import { SsoErrorHandlerService } from './sso-error-handler.service';

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

export interface SSOLoginResponse {
  success: boolean;
  user?: {
    id?: string;
    userId?: string;
    name: string;
    email: string;
    role?: string;
    status?: string;
  };
  redirected?: boolean;
}

export interface SSOTokenValidationResponse {
  success: boolean;
  user?: {
    id?: string;
    userId?: string;
    name: string;
    email: string;
    role?: string;
    status?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private ssoService = inject(SSOService);
  private authApiService = inject(AuthApiService);
  private errorHandler = inject(SsoErrorHandlerService);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  // Initialize user data from storage
  private _initialized = this.loadUserFromStorage();

  // Constructor removed - using dependency injection with inject()

  private loadUserFromStorage(): void {
    // Load user data from storage if available
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
          localStorage.setItem('current_username', userId); // Store username for refresh token

          // Update subjects
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(user);

          // Trigger post-login SSO workflow
          this.processPostLoginSso();

          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh the access token using the stored refresh token
   * @returns Observable<boolean> indicating success or failure
   */
  refreshAccessToken(): Observable<boolean> {
    const refreshToken = this.authApiService.getRefreshToken();
    const username = localStorage.getItem('current_username');
    
    if (!refreshToken || !username) {
      console.error('No refresh token or username available');
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = {
      userName: username,
      refreshToken: refreshToken
    };

    return this.authApiService.refreshToken(refreshRequest).pipe(
      map(response => {
        if (response.isSuccess && response.value) {
          // Token refresh successful, authentication state remains the same
          console.log('Token refreshed successfully');
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // If refresh fails, logout the user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the access token needs to be refreshed and refresh it if necessary
   * @returns Observable<boolean> indicating if the token is valid (refreshed if needed)
   */
  ensureValidToken(): Observable<boolean> {
    if (!this.authApiService.isAuthenticated()) {
      if (this.authApiService.getRefreshToken()) {
        // Token expired but we have refresh token, try to refresh
        return this.refreshAccessToken();
      } else {
        // No valid token and no refresh token
        return throwError(() => new Error('No valid authentication'));
      }
    }
    // Token is still valid
    return new Observable<boolean>(observer => {
      observer.next(true);
      observer.complete();
    });
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
    localStorage.removeItem('current_username');
    
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
        next: (response: SSOLoginResponse) => {
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
        next: (response: SSOTokenValidationResponse) => {
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
    return this.getAuthMethod() === 'sso';
  }

  /**
   * Process post-login SSO workflow
   * This method is called after successful login to handle SSO redirects
   */
  private processPostLoginSso(): void {
    console.log('🔐 AuthService: Starting post-login SSO workflow');
    
    this.ssoService.processPostLoginSso().subscribe({
      next: (redirectInfos) => {
        try {
          if (redirectInfos && redirectInfos.length > 0) {
            // Store redirect information for later use
            const redirectData = JSON.stringify(redirectInfos);
            localStorage.setItem('sso_redirect_info', redirectData);
            console.log(`🔐 AuthService: SSO redirect information stored for ${redirectInfos.length} service(s)`);
            
            // Log service details for debugging
            redirectInfos.forEach(info => {
              console.log(`🔗 Service: ${info.service.clientId} - Ready for redirect`);
            });
          } else {
            console.log('🔐 AuthService: No SSO services available for redirect');
            // Clear any existing redirect info
            localStorage.removeItem('sso_redirect_info');
          }
        } catch (storageError) {
          this.errorHandler.handleError(storageError, 'sso-redirect-storage');
        }
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'auth-service-post-login-sso');
      }
    });
  }

  /**
   * Get SSO redirect information from storage
   * @returns Array of SSO redirect information or empty array
   */
  getSsoRedirectInfo(): SsoRedirectInfo[] {
    try {
      const storedInfo = localStorage.getItem('sso_redirect_info');
      if (!storedInfo) {
        console.log('🔐 AuthService: No SSO redirect information found in storage');
        return [];
      }
      
      const redirectInfos = JSON.parse(storedInfo);
      
      // Validate the stored data structure
      if (!Array.isArray(redirectInfos)) {
        throw new Error('Invalid SSO redirect info format: expected array');
      }
      
      // Validate each redirect info object
      const validRedirectInfos = redirectInfos.filter(info => {
        try {
          if (!info || typeof info !== 'object') return false;
          if (!info.service?.clientId) return false;
          if (!info.token) return false;
          if (!info.redirectUrl) return false;
          return true;
        } catch (validationError) {
          this.errorHandler.handleError(validationError, 'sso-redirect-info-validation');
          return false;
        }
      });
      
      console.log(`🔐 AuthService: Retrieved ${validRedirectInfos.length} valid SSO redirect info(s)`);
      return validRedirectInfos;
    } catch (error) {
      this.errorHandler.handleError(error, 'sso-redirect-info-retrieval');
      // Clear corrupted data
      localStorage.removeItem('sso_redirect_info');
      return [];
    }
  }

  /**
   * Redirect to a specific service using SSO
   * @param serviceClientId - The client ID of the service to redirect to
   */
  redirectToSsoService(serviceClientId: string): void {
    try {
      if (!serviceClientId) {
        throw new Error('Service client ID is required for SSO redirect');
      }
      
      const ssoRedirectInfos = this.getSsoRedirectInfo();
      
      if (ssoRedirectInfos.length === 0) {
        throw new Error('No SSO redirect information available');
      }
      
      const targetService = ssoRedirectInfos.find(info => info.service.clientId === serviceClientId);
      
      if (!targetService) {
        throw new Error(`Service ${serviceClientId} not found in available SSO services`);
      }
      
      if (!targetService.redirectUrl) {
        throw new Error(`No redirect URL available for service ${serviceClientId}`);
      }
      
      console.log(`🔗 AuthService: Redirecting to service ${serviceClientId}:`, targetService.redirectUrl);
      
      // Perform the redirect
      window.location.href = targetService.redirectUrl;
      
    } catch (error) {
      this.errorHandler.handleError(error, 'sso-service-redirect');
      console.error(`Failed to redirect to SSO service ${serviceClientId}:`, error);
    }
  }
}