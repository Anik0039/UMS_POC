import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sso-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div *ngIf="isProcessing" class="space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 class="text-xl font-semibold text-gray-900">Processing SSO Authentication...</h2>
            <p class="text-gray-600">Please wait while we validate your credentials.</p>
          </div>
          
          <div *ngIf="error" class="space-y-4">
            <div class="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-red-900">Authentication Failed</h2>
            <p class="text-red-600">{{ error }}</p>
            <button 
              (click)="redirectToLogin()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Return to Login
            </button>
          </div>
          
          <div *ngIf="success" class="space-y-4">
            <div class="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-green-900">Authentication Successful</h2>
            <p class="text-green-600">Redirecting to services...</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SSOCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  isProcessing = true;
  error: string | null = null;
  success = false;
  
  ngOnInit(): void {
    this.handleSSOCallback();
  }
  
  private handleSSOCallback(): void {
    // Get token from URL parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];
      
      if (error) {
        this.handleError(`SSO Error: ${error}`);
        return;
      }
      
      if (!token) {
        this.handleError('No authentication token received from SSO provider.');
        return;
      }
      
      // Validate the token
      this.authService.validateSSOToken(token).subscribe({
        next: (isValid) => {
          this.isProcessing = false;
          if (isValid) {
            this.success = true;
            // Redirect to services dashboard after a short delay
            setTimeout(() => {
              this.router.navigate(['/services']);
            }, 2000);
          } else {
            this.handleError('Invalid authentication token.');
          }
        },
        error: (err) => {
          this.handleError('Failed to validate authentication token.');
          console.error('SSO token validation error:', err);
        }
      });
    });
  }
  
  private handleError(errorMessage: string): void {
    this.isProcessing = false;
    this.error = errorMessage;
  }
  
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}