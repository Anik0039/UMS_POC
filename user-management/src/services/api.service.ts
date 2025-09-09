import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SSOService } from './sso.service';
import { AuthApiService } from './auth-api.service';
import { appConfig } from '../config/app.config';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private ssoService = inject(SSOService);
  private authApiService = inject(AuthApiService);
  
  // API configuration from centralized config
  private config: ApiConfig = {
    baseUrl: appConfig.api.baseUrl,
    timeout: appConfig.api.timeout,
    retries: appConfig.api.retries
  };

  constructor() {}

  // Update API configuration
  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get HTTP headers with authentication
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add API authentication header if available
    const apiAuthHeader = this.authApiService.getAuthorizationHeader();
    if (apiAuthHeader) {
      headers = headers.set('Authorization', apiAuthHeader);
    }

    return headers;
  }

  // Generic GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return this.http.get<ApiResponse<T>>(url, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  // Generic POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return this.http.post<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  // Generic PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return this.http.put<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return this.http.delete<ApiResponse<T>>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  // Generic PATCH request
  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return this.http.patch<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  // Build HTTP params from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  // Handle API response
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'API request failed');
    }
  }

  // Handle API errors
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `HTTP Error ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Health check endpoint
  healthCheck(): Observable<any> {
    return this.get('/health');
  }

  // Get API configuration
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}