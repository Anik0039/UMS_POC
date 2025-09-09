import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../config/app.config';
import { AuthApiService } from './auth-api.service';
import { PermittedService, SsoRedirectInfo } from '../models/sso.models';
import { SsoErrorHandlerService, SsoErrorCode } from './sso-error-handler.service';

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



export interface SSOLoginResponse {
  success: boolean;
  user?: SSOUser;
  error?: string;
  redirected?: boolean;
}

export interface SSOTokenValidationResponse {
  success: boolean;
  user?: SSOUser;
  error?: string;
}

export interface SSOTokenApiResponse {
  user?: SSOUser;
  success?: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SSOService {
  private http = inject(HttpClient);
  private baseUrl = appConfig.api.baseUrl;
  
  private authApiService = inject(AuthApiService);
  private errorHandler = inject(SsoErrorHandlerService);
  private readonly ssoProviders: SSOProvider[] = [
    {
      id: 'api-sso',
      name: 'API SSO',
      icon: 'M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z',
      color: '#0f4d7c'
    }
  ];

  getSSOProviders(): SSOProvider[] {
    const providers: SSOProvider[] = [];
    
    // Add API SSO provider if API integration is enabled
    if (appConfig.features.enableApiIntegration) {
      providers.push(this.ssoProviders.find(p => p.id === 'api-sso')!);
    }
    
    return providers;
  }

  loginWithSSO(providerId: string): Observable<SSOLoginResponse> {
    switch (providerId) {
      case 'api-sso':
        return this.loginWithApiSSO();
      default:
        return of({ success: false, error: 'Unknown SSO provider' });
    }
  }

  private loginWithApiSSO(): Observable<SSOLoginResponse> {
    // For API SSO, we'll redirect to the SSO token endpoint
    // Include callback URL so the API knows where to redirect after authentication
    const callbackUrl = `${window.location.origin}/sso-callback`;
    const ssoUrl = `${this.baseUrl}/api/auth/sso-token?callback=${encodeURIComponent(callbackUrl)}`;
    window.location.href = ssoUrl;
    
    return of({ success: true, redirected: true });
  }

  validateSSOToken(token: string): Observable<SSOTokenValidationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<SSOTokenApiResponse>(`${this.baseUrl}/api/auth/sso-token`, { token }, { headers }).pipe(
      map((response: SSOTokenApiResponse) => {
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
    // Clear local storage
    localStorage.removeItem('sso_provider');
    localStorage.removeItem('sso_user');
  }



  // === POST-LOGIN SSO WORKFLOW METHODS ===

  /**
   * Get all permitted services that have direct access grants enabled
   * @returns Observable with filtered permitted services
   */
  getEnabledServices(): Observable<PermittedService[]> {
    return this.authApiService.getPermittedServices().pipe(
      map(response => {
        const services = response.services || [];
        const enabledServices = services.filter(service => {
          try {
            this.errorHandler.validateServiceConfiguration(service);
            return service.directAccessGrantsEnabled;
          } catch (validationError) {
            this.errorHandler.handleError(validationError, 'service-validation');
            return false;
          }
        });
        
        if (enabledServices.length === 0 && services.length > 0) {
          this.errorHandler.handleError(
            { code: SsoErrorCode.NO_ENABLED_SERVICES },
            'permitted-services-filter'
          );
        }
        
        return enabledServices;
      }),
      catchError(error => {
        this.errorHandler.handleError(error, 'permitted-services-fetch');
        return of([]);
      })
    );
  }

  /**
   * Get SSO token for a specific service
   * @param service - The permitted service
   * @returns Observable with SSO redirect information
   */
  getSsoRedirectInfo(service: PermittedService): Observable<SsoRedirectInfo> {
    try {
      this.errorHandler.validateServiceConfiguration(service);
    } catch (validationError) {
      this.errorHandler.handleError(validationError, 'service-validation');
      return throwError(() => validationError);
    }

    return this.authApiService.getSsoToken({ clientId: service.clientId }).pipe(
      map(tokenResponse => {
        if (!tokenResponse?.token) {
          throw new Error('Invalid token response: token is missing');
        }
        
        return {
          service,
          token: tokenResponse.token,
          redirectUrl: `${service.baseUrl}${tokenResponse.token}`
        };
      }),
      catchError(error => {
        this.errorHandler.handleError(error, `sso-token-request-${service.clientId}`);
        throw error;
      })
    );
  }

  /**
   * Get SSO redirect information for all enabled services
   * @returns Observable with array of SSO redirect information
   */
  getAllSsoRedirectInfo(): Observable<SsoRedirectInfo[]> {
    return this.getEnabledServices().pipe(
      switchMap(services => {
        if (services.length === 0) {
          return of([]);
        }

        // Get SSO tokens for all enabled services in parallel
        const ssoRequests = services.map(service => 
          this.getSsoRedirectInfo(service).pipe(
            catchError(error => {
              console.error(`Failed to get SSO info for ${service.clientId}:`, error);
              return of(null); // Return null for failed requests
            })
          )
        );

        return forkJoin(ssoRequests).pipe(
          map(results => results.filter(result => result !== null) as SsoRedirectInfo[])
        );
      })
    );
  }

  /**
   * Redirect user to a service using SSO
   * @param service - The permitted service to redirect to
   */
  redirectToService(service: PermittedService): void {
    try {
      if (!service) {
        throw new Error('Service information is null or undefined');
      }
      
      if (!service.clientId) {
        throw new Error('Service client ID is missing');
      }

      this.getSsoRedirectInfo(service).subscribe({
        next: (redirectInfo) => {
          try {
            if (!redirectInfo) {
              throw new Error('Redirect information is null or undefined');
            }
            
            if (!redirectInfo.redirectUrl) {
              throw new Error('Redirect URL is missing from redirect information');
            }
            
            // Validate URL format before redirecting
            try {
              new URL(redirectInfo.redirectUrl);
            } catch (urlError) {
              throw new Error(`Invalid redirect URL format: ${redirectInfo.redirectUrl}`);
            }
            
            console.log(`🔐 Redirecting to service: ${service.clientId}`);
            console.log(`🔗 Redirect URL: ${redirectInfo.redirectUrl}`);
            window.location.href = redirectInfo.redirectUrl;
          } catch (redirectError) {
            this.errorHandler.handleError(redirectError, 'service-redirect');
          }
        },
        error: (error) => {
          this.errorHandler.handleError(error, `service-redirect-${service.clientId}`);
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'service-redirect-validation');
    }
  }

  /**
   * Redirect to the first available enabled service
   * Useful for automatic redirection after login
   */
  redirectToFirstAvailableService(): void {
    this.getEnabledServices().subscribe({
      next: (services) => {
        if (services.length > 0) {
          this.redirectToService(services[0]);
        } else {
          console.warn('No enabled services available for SSO redirect');
        }
      },
      error: (error) => {
        console.error('Error getting enabled services for redirect:', error);
      }
    });
  }

  /**
   * Process the complete post-login SSO workflow
   * @returns Observable that completes when the workflow is done
   */
  processPostLoginSso(): Observable<SsoRedirectInfo[]> {
    console.log('🔐 Starting post-login SSO workflow');
    
    return this.getEnabledServices().pipe(
      switchMap(services => {
        if (!services || services.length === 0) {
          const error = {
            code: SsoErrorCode.NO_ENABLED_SERVICES,
            message: 'No enabled services available for SSO'
          };
          this.errorHandler.handleError(error, 'post-login-workflow');
          return of([]);
        }

        console.log(`🔐 Found ${services.length} enabled service(s):`, services.map(s => s.clientId));

        // Get SSO tokens for all enabled services
        const redirectInfoRequests = services.map(service => 
          this.getSsoRedirectInfo(service).pipe(
            catchError(error => {
              this.errorHandler.handleError(error, `post-login-sso-${service.clientId}`);
              return of(null);
            })
          )
        );

        return forkJoin(redirectInfoRequests).pipe(
          map(redirectInfos => {
            const validRedirectInfos = redirectInfos.filter(info => info !== null);
            console.log(`🔐 Successfully processed ${validRedirectInfos.length}/${redirectInfos.length} services`);
            return validRedirectInfos;
          })
        );
      }),
      catchError(error => {
        this.errorHandler.handleError(error, 'post-login-sso-workflow');
        return of([]);
      })
    );
  }
}