import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthApiService } from '../services/auth-api.service';

// Global state for token refresh
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const authApiService = inject(AuthApiService);
  // Add authorization header if we have a token
  const authHeader = authApiService.getAuthorizationHeader();
  if (authHeader && !request.headers.has('Authorization')) {
    request = request.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for API endpoints (not auth endpoints)
      if (error.status === 401 && !isAuthEndpoint(request.url)) {
        return handle401Error(request, next, authService, authApiService);
      }
      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/refresh-token');
}

function handle401Error(
  request: HttpRequest<unknown>, 
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>, 
  authService: AuthService, 
  authApiService: AuthApiService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authApiService.getRefreshToken();
    const username = localStorage.getItem('current_username');

    if (refreshToken && username) {
      return authService.refreshAccessToken().pipe(
        switchMap((success: boolean): Observable<HttpEvent<unknown>> => {
          isRefreshing = false;
          if (success) {
            // Token refreshed successfully, retry the original request
            const authHeader = authApiService.getAuthorizationHeader();
            const newRequest = request.clone({
              setHeaders: {
                Authorization: authHeader || ''
              }
            });
            refreshTokenSubject.next(authHeader);
            return next(newRequest);
          } else {
            // Refresh failed, logout user
            authService.logout();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((error): Observable<HttpEvent<unknown>> => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // No refresh token available, logout user
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
      // Token refresh is already in progress, wait for it to complete
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token): Observable<HttpEvent<unknown>> => {
        const newRequest = request.clone({
          setHeaders: {
            Authorization: token
          }
        });
        return next(newRequest);
      })
    );
  }
}