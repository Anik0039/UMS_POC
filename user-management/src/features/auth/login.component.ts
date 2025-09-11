import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, Eye, EyeOff, Shield } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';
import { SSOService } from '../../services/sso.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Card Container with Flip Animation -->
        <div class="card-container" [class.flipped]="showPasswordSetup">
          <!-- Front Face - Login Form -->
          <div class="card-face card-front bg-white rounded-lg shadow-lg p-8">
          <!-- Logo and Header -->
          <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
              <img src="/Era_logo.png" alt="ERA Logo" class="h-16 w-auto mx-auto" />
            </div>
            <div class="text-center">
              <!-- <h2 class="text-2xl font-bold text-gray-900">ERA</h2> -->
              <!-- <p class="text-sm text-gray-600 mt-1">INFOTECH LTD</p> -->
            </div>
            <h3 class="text-xl font-bold text-gray-900 mt-6 text-center">Sign In</h3>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-6 text-center">
            <!-- User ID Field -->
            <div class="space-y-2">
              <div class="relative flex justify-center">
                <input
                  type="text"
                  [(ngModel)]="credentials.userId"
                  name="userId"
                  placeholder="User ID"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-left"
                  required
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <lucide-angular [img]="userIcon" class="h-5 w-5 text-black"></lucide-angular>
                </div>
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <div class="relative flex justify-center">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="credentials.password"
                  name="password"
                  placeholder="Password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-left"
                  required
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <lucide-angular 
                    [img]="showPassword ? eyeOffIcon : eyeIcon" 
                    class="h-5 w-5 text-black hover:text-gray-600"
                  ></lucide-angular>
                </button>
              </div>
            </div>

            <!-- Remember Me and Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                  class="h-4 w-4 accent-black focus:ring-black border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-black-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <!-- New User button has been completely removed as requested -->
            
            <!-- Sign In Button -->
            <div>
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              </button>
            </div>

            <!-- OR Divider (only show if SSO is enabled) -->
            <div *ngIf="isSSOEnabled" class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <!-- SSO Login Buttons (only show if SSO is enabled) -->
            <div *ngIf="isSSOEnabled" class="space-y-3">
              <button
                *ngFor="let provider of ssoProviders"
                type="button"
                (click)="loginWithSSO(provider.id)"
                [disabled]="isLoading"
                class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                [style.border-color]="provider.color"
              >
                <lucide-angular [img]="shieldIcon" class="h-5 w-5 mr-2" [style.color]="provider.color"></lucide-angular>
                <span *ngIf="!isLoading">Sign in with {{ provider.name }}</span>
                <span *ngIf="isLoading">Redirecting...</span>
              </button>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>
          </form>
          </div>
          
          <!-- Back Face - Password Setup Interface -->
          <div class="card-face card-back bg-white rounded-lg shadow-lg p-8">
            <!-- Logo and Header -->
            <div class="text-center mb-8">
              <div class="flex items-center justify-center mb-4">
                <img src="/Era_logo.png" alt="ERA Logo" class="h-16 w-auto mx-auto" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 mt-6 text-center">Set New Password</h3>
            </div>
            
            <form (ngSubmit)="onPasswordSetup()" class="space-y-4">
              <!-- User ID Field -->
              <div class="space-y-2">
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="passwordSetupData.userId"
                    name="userId"
                    placeholder="User ID"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <!-- Temporary Password Field -->
              <div class="space-y-2">
                <label for="temp-password" class="block text-sm font-medium text-gray-700">Temporary Password</label>
                <div class="relative">
                  <input
                    id="temp-password"
                    [type]="showTempPassword ? 'text' : 'password'"
                    [(ngModel)]="passwordSetupData.temporaryPassword"
                    name="temporaryPassword"
                    placeholder="Enter temporary password from email"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    (click)="toggleTempPasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <lucide-angular 
                      [img]="showTempPassword ? eyeOffIcon : eyeIcon" 
                      class="h-4 w-4 text-gray-400 hover:text-gray-600"
                    ></lucide-angular>
                  </button>
                </div>
              </div>
              
              <!-- New Password Field -->
              <div class="space-y-2">
                <label for="new-password" class="block text-sm font-medium text-gray-700">New Password</label>
                <div class="relative">
                  <input
                    id="new-password"
                    [type]="showNewPassword ? 'text' : 'password'"
                    [(ngModel)]="passwordSetupData.newPassword"
                    name="newPassword"
                    placeholder="Enter new password"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minlength="8"
                  />
                  <button
                    type="button"
                    (click)="toggleNewPasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <lucide-angular 
                      [img]="showNewPassword ? eyeOffIcon : eyeIcon" 
                      class="h-4 w-4 text-gray-400 hover:text-gray-600"
                    ></lucide-angular>
                  </button>
                </div>
              </div>
              
              <!-- Confirm Password Field -->
              <div class="space-y-2">
                <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div class="relative">
                  <input
                    id="confirm-password"
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    [(ngModel)]="passwordSetupData.confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    [class.border-red-500]="passwordSetupData.confirmPassword && !passwordsMatch()"
                  />
                  <button
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <lucide-angular 
                      [img]="showConfirmPassword ? eyeOffIcon : eyeIcon" 
                      class="h-4 w-4 text-gray-400 hover:text-gray-600"
                    ></lucide-angular>
                  </button>
                </div>
                <div *ngIf="passwordSetupData.confirmPassword && !passwordsMatch()" class="text-red-600 text-xs">
                  Passwords do not match
                </div>
              </div>
              
              <!-- Submit Button -->
              <div class="pt-4">
                <button
                  type="submit"
                  [disabled]="!isPasswordSetupValid() || isSettingPassword"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span *ngIf="!isSettingPassword">Set New Password</span>
                  <span *ngIf="isSettingPassword" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting Password...
                  </span>
                </button>
              </div>
              
              <!-- Password Setup Error Message -->
              <div *ngIf="passwordSetupError" class="text-red-600 text-sm text-center">
                {{ passwordSetupError }}
              </div>
              
              <!-- Cancel Button -->
              <div class="text-center">
                <button
                  type="button"
                  (click)="togglePasswordSetup()"
                  class="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  credentials = {
    userId: '',
    password: ''
  };
  
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  
  // New user password setup
  showPasswordSetup = false;
  passwordSetupData = {
    userId: '',
    temporaryPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  showTempPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  passwordSetupError = '';
  isSettingPassword = false;
  
  // Check if SSO is enabled
  get isSSOEnabled(): boolean {
    return this.ssoProviders.length > 0;
  }

  get ssoProviders() {
    return this.ssoService.getSSOProviders();
  }

  userIcon = User;
  eyeIcon = Eye;
  eyeOffIcon = EyeOff;
  shieldIcon = Shield;

  private router = inject(Router);
  private authService = inject(AuthService);
  private authApiService = inject(AuthApiService);
  private ssoService = inject(SSOService);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // Component initialization
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.credentials.userId || !this.credentials.password) {
      this.errorMessage = 'Please enter both User ID and Password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Use AuthService which now handles API authentication
    this.authService.login(this.credentials.userId, this.credentials.password)
      .subscribe({
        next: (success) => {
          if (success) {
            console.log('Login successful');
            this.router.navigate(['/services']);
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = error?.message || 'Login failed. Please try again.';
          this.isLoading = false;
        }
      });
  }

  loginWithSSO(providerId: string): void {
    if (!this.isSSOEnabled) {
      this.errorMessage = 'SSO is currently disabled.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.loginWithSSO(providerId)
      .subscribe({
        next: (success) => {
          if (success) {
            console.log('SSO Login successful');
            // For API SSO, user will be redirected, so don't navigate here
            // For Keycloak SSO, navigation will happen after successful authentication
            if (providerId !== 'api-sso') {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.errorMessage = 'SSO login failed. Please try again.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('SSO Login failed:', error);
          this.errorMessage = 'SSO login failed. Please try again.';
          this.isLoading = false;
        }
      });
  }

  // Password setup methods
  togglePasswordSetup(): void {
    this.showPasswordSetup = !this.showPasswordSetup;
    if (this.showPasswordSetup) {
      // Clear any existing errors when opening
      this.passwordSetupError = '';
      this.errorMessage = '';
    }
  }

  toggleTempPasswordVisibility(): void {
    this.showTempPassword = !this.showTempPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.passwordSetupData.newPassword === this.passwordSetupData.confirmPassword;
  }

  isPasswordSetupValid(): boolean {
    return (
      this.passwordSetupData.userId.trim().length > 0 &&
      this.passwordSetupData.temporaryPassword.length > 0 &&
      this.passwordSetupData.newPassword.length >= 8 &&
      this.passwordSetupData.confirmPassword.length > 0 &&
      this.passwordsMatch()
    );
  }

  onPasswordSetup(): void {
    if (!this.isPasswordSetupValid()) {
      this.passwordSetupError = 'Please fill all fields correctly and ensure passwords match.';
      return;
    }

    this.isSettingPassword = true;
    this.passwordSetupError = '';

    // Simulate API call for password setup
    // In a real application, you would call your API service here
    setTimeout(() => {
      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        console.log('Password setup successful');
        // Reset form and show success message
        this.passwordSetupData = {
          userId: '',
          temporaryPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.showPasswordSetup = false;
        this.errorMessage = '';
        // You might want to show a success message or redirect
        alert('Password set successfully! You can now login with your new password.');
      } else {
        this.passwordSetupError = 'Failed to set password. Please check your temporary password and try again.';
      }
      
      this.isSettingPassword = false;
    }, 2000); // Simulate network delay
  }
}