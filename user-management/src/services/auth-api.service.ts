import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { appConfig } from '../config/app.config';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  value: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    scope: string;
  };
  errorMessage: string | null;
  totalRecord: number;
}

export interface ApiError {
  isSuccess: boolean;
  errorMessage: string;
  value: null;
  totalRecord: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private baseUrl = appConfig.api.baseUrl;

  constructor() {}

  /**
   * Login using the custom API endpoint
   * @param credentials - Username and password
   * @returns Observable with login response
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const loginUrl = `${this.baseUrl}/auth/login`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post<any>(loginUrl, credentials, { headers }).pipe(
      map((response) => {
        // Expecting response in the format you provided
        if (response && response.isSuccess && response.value && response.value.access_token) {
          const loginResponse: LoginResponse = {
            isSuccess: response.isSuccess,
            value: {
              access_token: response.value.access_token,
              refresh_token: response.value.refresh_token || '',
              id_token: response.value.id_token || '',
              expires_in: response.value.expires_in || 3600,
              refresh_expires_in: response.value.refresh_expires_in || 1800,
              token_type: response.value.token_type || 'Bearer',
              scope: response.value.scope || ''
            },
            errorMessage: response.errorMessage || null,
            totalRecord: response.totalRecord || 1
          };
          this.storeTokens(loginResponse.value);
          return loginResponse;
        } else {
          throw new Error(response?.errorMessage || 'Invalid credentials or login failed');
        }
      }),
      catchError(error => {
        let errorMessage = 'Login failed';
        if (error.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.status === 400) {
          errorMessage = 'Invalid request format or user not found';
        } else if (error.error && error.error.errorMessage) {
          errorMessage = error.error.errorMessage;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Store authentication tokens
   * @param tokens - Token data from login response
   */
  private storeTokens(tokens: LoginResponse['value']): void {
    localStorage.setItem('api_access_token', tokens.access_token);
    localStorage.setItem('api_refresh_token', tokens.refresh_token);
    localStorage.setItem('api_id_token', tokens.id_token);
    localStorage.setItem('api_token_expires_in', tokens.expires_in.toString());
    localStorage.setItem('api_token_type', tokens.token_type);
    localStorage.setItem('api_token_scope', tokens.scope);
    
    // Calculate and store expiration time
    const expirationTime = Date.now() + (tokens.expires_in * 1000);
    localStorage.setItem('api_token_expiration', expirationTime.toString());
  }

  /**
   * Get stored access token
   * @returns Access token or null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('api_access_token');
  }

  /**
   * Get stored refresh token
   * @returns Refresh token or null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('api_refresh_token');
  }

  /**
   * Get stored ID token
   * @returns ID token or null
   */
  getIdToken(): string | null {
    return localStorage.getItem('api_id_token');
  }

  /**
   * Check if user is authenticated (has valid token)
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiration = localStorage.getItem('api_token_expiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    return Date.now() < parseInt(expiration);
  }

  /**
   * Check if token is expired
   * @returns True if token is expired, false otherwise
   */
  isTokenExpired(): boolean {
    const expiration = localStorage.getItem('api_token_expiration');
    if (!expiration) {
      return true;
    }
    return Date.now() >= parseInt(expiration);
  }

  /**
   * Get authorization header for API requests
   * @returns Authorization header value or null
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    const tokenType = localStorage.getItem('api_token_type') || 'Bearer';
    
    if (!token) {
      return null;
    }
    
    return `${tokenType} ${token}`;
  }

  /**
   * Logout and clear stored tokens
   */
  logout(): void {
    localStorage.removeItem('api_access_token');
    localStorage.removeItem('api_refresh_token');
    localStorage.removeItem('api_id_token');
    localStorage.removeItem('api_token_expires_in');
    localStorage.removeItem('api_token_type');
    localStorage.removeItem('api_token_scope');
    localStorage.removeItem('api_token_expiration');
  }

  /**
   * Get token information
   * @returns Token information object
   */
  getTokenInfo(): any {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      idToken: this.getIdToken(),
      tokenType: localStorage.getItem('api_token_type'),
      scope: localStorage.getItem('api_token_scope'),
      expiresIn: localStorage.getItem('api_token_expires_in'),
      expiration: localStorage.getItem('api_token_expiration'),
      isAuthenticated: this.isAuthenticated(),
      isExpired: this.isTokenExpired()
    };
  }
}