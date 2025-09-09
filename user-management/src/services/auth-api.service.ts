import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { appConfig } from '../config/app.config';
import { PermittedServicesResponse, SsoTokenRequest, SsoTokenResponse, PermittedService } from '../models/sso.models';

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
    accessTokenExpiresIn: string;
  };
  errorMessage: string | null;
  totalRecord: number;
}

export interface RefreshTokenRequest {
  userName: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  isSuccess: boolean;
  value: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    scope: string;
    accessTokenExpiresIn: string;
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
    const loginUrl = `${this.baseUrl}/api/auth/login`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post<LoginResponse>(loginUrl, credentials, { headers }).pipe(
      map((response) => {
        // Expecting response in the format you provided
        if (response && response.isSuccess && response.value && response.value.access_token) {
          const loginResponse: LoginResponse = {
            isSuccess: response.isSuccess,
            value: {
              access_token: response.value.access_token,
              refresh_token: response.value.refresh_token || '',
              id_token: response.value.id_token || '',
              expires_in: response.value.expires_in || 1800,
              refresh_expires_in: response.value.refresh_expires_in || 86400,
              token_type: response.value.token_type || 'Bearer',
              scope: response.value.scope || 'openid email profile',
              accessTokenExpiresIn: response.value.accessTokenExpiresIn || new Date(Date.now() + (response.value.expires_in || 1800) * 1000).toISOString()
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
    localStorage.setItem('api_refresh_expires_in', tokens.refresh_expires_in.toString());
    localStorage.setItem('api_token_type', tokens.token_type);
    localStorage.setItem('api_token_scope', tokens.scope);
    localStorage.setItem('api_access_token_expires_in', tokens.accessTokenExpiresIn);
    
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
   * Refresh access token using refresh token
   * @param refreshRequest - Username and refresh token
   * @returns Observable with refresh token response
   */
  refreshToken(refreshRequest: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    const refreshUrl = `${this.baseUrl}/api/auth/refresh-token`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post<RefreshTokenResponse>(refreshUrl, refreshRequest, { headers }).pipe(
      map((response) => {
        if (response && response.isSuccess && response.value && response.value.access_token) {
          const refreshResponse: RefreshTokenResponse = {
            isSuccess: response.isSuccess,
            value: {
              access_token: response.value.access_token,
              refresh_token: response.value.refresh_token || '',
              id_token: response.value.id_token || '',
              expires_in: response.value.expires_in || 1800,
              refresh_expires_in: response.value.refresh_expires_in || 86400,
              token_type: response.value.token_type || 'Bearer',
              scope: response.value.scope || 'openid email profile',
              accessTokenExpiresIn: response.value.accessTokenExpiresIn || new Date(Date.now() + (response.value.expires_in || 1800) * 1000).toISOString()
            },
            errorMessage: response.errorMessage || null,
            totalRecord: response.totalRecord || 1
          };
          this.storeTokens(refreshResponse.value);
          return refreshResponse;
        } else {
          throw new Error(response?.errorMessage || 'Token refresh failed');
        }
      }),
      catchError(error => {
        let errorMessage = 'Token refresh failed';
        if (error.status === 401) {
          errorMessage = 'Refresh token expired or invalid';
        } else if (error.status === 400) {
          errorMessage = 'Invalid refresh token request';
        } else if (error.error && error.error.errorMessage) {
          errorMessage = error.error.errorMessage;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout using the custom API endpoint
   * @param username - Username to logout
   * @returns Observable with logout response
   */
  logoutFromAPI(username: string): Observable<ApiError | { success: boolean }> {
    const logoutUrl = `${this.baseUrl}/api/auth/logout/${username}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post<ApiError | { success: boolean }>(logoutUrl, {}, { headers }).pipe(
      map((response) => {
        // Clear local tokens after successful API logout
        this.clearTokens();
        return response;
      }),
      catchError(error => {
        // Even if API call fails, clear local tokens
        this.clearTokens();
        console.error('Logout API error:', error);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  private clearTokens(): void {
    localStorage.removeItem('api_access_token');
    localStorage.removeItem('api_refresh_token');
    localStorage.removeItem('api_id_token');
    localStorage.removeItem('api_token_expires_in');
    localStorage.removeItem('api_refresh_expires_in');
    localStorage.removeItem('api_token_type');
    localStorage.removeItem('api_token_scope');
    localStorage.removeItem('api_access_token_expires_in');
    localStorage.removeItem('api_token_expiration');
  }

  /**
   * Logout and clear stored tokens
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Get token information
   * @returns Token information object
   */
  getTokenInfo(): {
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    tokenType: string | null;
    scope: string | null;
    expiresIn: string | null;
    expiration: string | null;
    isAuthenticated: boolean;
    isExpired: boolean;
  } {
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

  /**
   * Get headers with authorization
   * @returns HttpHeaders with authorization
   */
  private getHeaders(): HttpHeaders {
    const authHeader = this.getAuthorizationHeader();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }
    
    return headers;
  }

  /**
   * Validate and sanitize a service object
   * @param service Raw service data from API
   * @returns Validated PermittedService or null if invalid
   */
  private validateAndSanitizeService(service: any): PermittedService | null {
    try {
      // Check for required fields
      if (!service.clientId || typeof service.clientId !== 'string') {
        console.warn('Service missing or invalid clientId:', service);
        return null;
      }

      // Extract baseUrl from attributes if available
      let baseUrl = '';
      if (service.attributes && service.attributes.baseUrl) {
        baseUrl = service.attributes.baseUrl.trim();
        // Remove quotes if present
        baseUrl = baseUrl.replace(/^["']|["']$/g, '');
      }
      
      // Fallback to direct baseUrl or url properties
      if (!baseUrl) {
        baseUrl = service.baseUrl || service.url || '';
      }
      
      // Sanitize baseUrl - ensure it has protocol and proper format
      if (baseUrl && typeof baseUrl === 'string') {
        baseUrl = baseUrl.trim();
        if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
          baseUrl = 'https://' + baseUrl;
        }
        // Remove trailing slash
        baseUrl = baseUrl.replace(/\/$/, '');
      }

      // Create sanitized service object
      const sanitizedService: PermittedService = {
        id: service.id || '',
        clientId: service.clientId.trim(),
        name: service.name || service.clientId,
        baseUrl: baseUrl,
        enabled: service.enabled !== false, // Default to true if not specified
        protocol: service.protocol || 'openid-connect',
        publicClient: service.publicClient || false,
        serviceAccountsEnabled: service.serviceAccountsEnabled || false,
        standardFlowEnabled: service.standardFlowEnabled || false,
        directAccessGrantsEnabled: service.directAccessGrantsEnabled || false,
        attributes: service.attributes || {},
        description: service.description || '',
        icon: service.icon || 'globe',
        category: service.category || 'general'
      };

      return sanitizedService;
    } catch (error) {
      console.error('Error validating service:', error, service);
      return null;
    }
  }

  /**
   * Get permitted services for the authenticated user
   * @returns Observable with permitted services response
   */
  getPermittedServices(): Observable<PermittedServicesResponse> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/api/services/permitted-services`;
    
    console.log('=== API Call Debug ===');
    console.log('Making request to:', url);
    console.log('Headers:', headers);
    console.log('Is authenticated:', this.isAuthenticated());
    console.log('Access token:', this.getAccessToken()?.substring(0, 20) + '...');
    console.log('=====================');
    
    return this.http.get<{ isSuccess: boolean; value: unknown[] }>(url, { headers })
      .pipe(
        map(response => {
          console.log('=== API Response Debug ===');
          console.log('Raw response:', response);
          console.log('Is success:', response.isSuccess);
          console.log('Services count:', response.value?.length || 0);
          console.log('Services data:', response.value);
          console.log('========================');
          
          // Validate response structure
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid API response format');
          }

          if (!response.isSuccess) {
            throw new Error('API returned unsuccessful response');
          }

          if (!Array.isArray(response.value)) {
            console.warn('API response value is not an array, defaulting to empty array');
            return { services: [] };
          }

          // Validate and sanitize each service
          const validatedServices: PermittedService[] = [];
          let invalidCount = 0;

          response.value.forEach((service, index) => {
            const validatedService = this.validateAndSanitizeService(service);
            if (validatedService) {
              validatedServices.push(validatedService);
            } else {
              invalidCount++;
              console.warn(`Skipping invalid service at index ${index}:`, service);
            }
          });

          if (invalidCount > 0) {
            console.warn(`Filtered out ${invalidCount} invalid services from API response`);
          }

          console.log(`=== Validation Results ===`);
          console.log(`Total services received: ${response.value.length}`);
          console.log(`Valid services: ${validatedServices.length}`);
          console.log(`Invalid services filtered: ${invalidCount}`);
          console.log(`========================`);
          
          return {
            services: validatedServices
          };
        }),
        catchError(error => {
          console.error('=== API Error Debug ===');
          console.error('Error fetching permitted services:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          console.error('======================');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get SSO token for a specific service
   * @param request - SSO token request
   * @returns Observable with SSO token response
   */
  getSsoToken(request: SsoTokenRequest): Observable<SsoTokenResponse> {
    const headers = this.getHeaders();
    
    return this.http.post<{ token: string; expiresIn?: number; expires_in?: number }>(`${this.baseUrl}/api/auth/sso-token`, request, { headers })
      .pipe(
        map(response => ({
          token: response.token,
          expiresIn: response.expiresIn || response.expires_in
        })),
        catchError(error => {
          console.error('Error getting SSO token:', error);
          return throwError(() => error);
        })
      );
  }
}