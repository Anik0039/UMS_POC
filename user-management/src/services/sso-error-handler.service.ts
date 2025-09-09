import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SsoError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  userMessage: string;
}

export interface ServiceConfiguration {
  clientId: string;
  baseUrl: string;
  directAccessGrantsEnabled: boolean;
}

export enum SsoErrorCode {
  PERMITTED_SERVICES_FETCH_FAILED = 'PERMITTED_SERVICES_FETCH_FAILED',
  SSO_TOKEN_REQUEST_FAILED = 'SSO_TOKEN_REQUEST_FAILED',
  NO_ENABLED_SERVICES = 'NO_ENABLED_SERVICES',
  SERVICE_REDIRECT_FAILED = 'SERVICE_REDIRECT_FAILED',
  INVALID_SERVICE_CONFIGURATION = 'INVALID_SERVICE_CONFIGURATION',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
}

@Injectable({
  providedIn: 'root'
})
export class SsoErrorHandlerService {

  private errorMessages: Record<SsoErrorCode, string> = {
    [SsoErrorCode.PERMITTED_SERVICES_FETCH_FAILED]: 'Failed to fetch available services. Please try again later.',
    [SsoErrorCode.SSO_TOKEN_REQUEST_FAILED]: 'Failed to obtain access token for the service. Please try again.',
    [SsoErrorCode.NO_ENABLED_SERVICES]: 'No services are currently available for access.',
    [SsoErrorCode.SERVICE_REDIRECT_FAILED]: 'Failed to redirect to the requested service. Please try again.',
    [SsoErrorCode.INVALID_SERVICE_CONFIGURATION]: 'Service configuration is invalid. Please contact support.',
    [SsoErrorCode.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
    [SsoErrorCode.AUTHENTICATION_REQUIRED]: 'Authentication is required to access this service.',
    [SsoErrorCode.UNAUTHORIZED_ACCESS]: 'You do not have permission to access this service.'
  };

  /**
   * Handle and log SSO-related errors
   * @param error - The original error
   * @param context - Additional context about where the error occurred
   * @returns SsoError object with user-friendly message
   */
  handleError(error: unknown, context: string): SsoError {
    const ssoError = this.mapToSsoError(error, context);
    this.logError(ssoError, context);
    return ssoError;
  }

  /**
   * Map generic errors to SSO-specific errors
   * @param error - The original error
   * @param context - Context where the error occurred
   * @returns SsoError object
   */
  private mapToSsoError(error: unknown, context: string): SsoError {
    let errorCode: SsoErrorCode;
    const details = error;

    // Determine error code based on HTTP status or error type
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number };
      switch (httpError.status) {
        case 401:
          errorCode = SsoErrorCode.AUTHENTICATION_REQUIRED;
          break;
        case 403:
          errorCode = SsoErrorCode.UNAUTHORIZED_ACCESS;
          break;
        case 404:
          errorCode = context.includes('permitted-services') 
            ? SsoErrorCode.PERMITTED_SERVICES_FETCH_FAILED
            : SsoErrorCode.SSO_TOKEN_REQUEST_FAILED;
          break;
        case 500:
        case 502:
        case 503:
          errorCode = context.includes('sso-token')
            ? SsoErrorCode.SSO_TOKEN_REQUEST_FAILED
            : SsoErrorCode.PERMITTED_SERVICES_FETCH_FAILED;
          break;
        default:
          errorCode = SsoErrorCode.NETWORK_ERROR;
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string };
        if (errorWithMessage.message.includes('network') || errorWithMessage.message.includes('connection')) {
        errorCode = SsoErrorCode.NETWORK_ERROR;
      } else if (context.includes('redirect')) {
        errorCode = SsoErrorCode.SERVICE_REDIRECT_FAILED;
      } else {
        errorCode = SsoErrorCode.PERMITTED_SERVICES_FETCH_FAILED;
      }
    } else {
      errorCode = SsoErrorCode.NETWORK_ERROR;
    }

    return {
      code: errorCode,
      message: (error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : null) || 'Unknown error occurred',
      details,
      timestamp: new Date(),
      userMessage: this.errorMessages[errorCode]
    };
  }

  /**
   * Log error details for debugging
   * @param ssoError - The SSO error to log
   * @param context - Context where the error occurred
   */
  private logError(ssoError: SsoError, context: string): void {
    console.group(`🔐 SSO Error in ${context}`);
    console.error('Error Code:', ssoError.code);
    console.error('User Message:', ssoError.userMessage);
    console.error('Technical Message:', ssoError.message);
    console.error('Timestamp:', ssoError.timestamp.toISOString());
    if (ssoError.details) {
      console.error('Details:', ssoError.details);
    }
    console.groupEnd();
  }

  /**
   * Create a user-friendly error observable
   * @param error - The original error
   * @param context - Context where the error occurred
   * @returns Observable that emits null and logs the error
   */
  createErrorObservable<T>(error: unknown, context: string): Observable<T | null> {
    this.handleError(error, context);
    
    // You could emit the error to a global error handler here
    // this.globalErrorHandler.handleSsoError(ssoError);
    
    return of(null);
  }

  /**
   * Validate service configuration
   * @param service - Service to validate
   * @returns True if valid, throws error if invalid
   */
  validateServiceConfiguration(service: ServiceConfiguration): boolean {
    if (!service) {
      throw this.createConfigurationError('Service is null or undefined');
    }

    if (!service.clientId) {
      throw this.createConfigurationError('Service clientId is missing');
    }

    if (!service.baseUrl) {
      throw this.createConfigurationError('Service baseUrl is missing');
    }

    if (typeof service.directAccessGrantsEnabled !== 'boolean') {
      throw this.createConfigurationError('Service directAccessGrantsEnabled flag is missing or invalid');
    }

    return true;
  }

  /**
   * Create a configuration error
   * @param message - Error message
   * @returns SsoError object
   */
  private createConfigurationError(message: string): SsoError {
    return {
      code: SsoErrorCode.INVALID_SERVICE_CONFIGURATION,
      message,
      timestamp: new Date(),
      userMessage: this.errorMessages[SsoErrorCode.INVALID_SERVICE_CONFIGURATION]
    };
  }

  /**
   * Get user-friendly error message by error code
   * @param errorCode - The SSO error code
   * @returns User-friendly error message
   */
  getUserMessage(errorCode: SsoErrorCode): string {
    return this.errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}