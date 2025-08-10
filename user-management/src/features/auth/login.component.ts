import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Login Card -->
        <div class="bg-white rounded-lg shadow-lg p-8">
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-center"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-center"
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

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>
          </form>

          <!-- Demo Credentials Info
          <div class="mt-6 p-4 bg-blue-50 rounded-md">
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-2">Demo Credentials:</p>
              <p>Username: <span class="font-mono">admin</span></p>
              <p>Password: <span class="font-mono">admin123</span></p>
            </div>
          </div>
          -->
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

  userIcon = User;
  eyeIcon = Eye;
  eyeOffIcon = EyeOff;

  private router = inject(Router);
  private authService = inject(AuthService);

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

    this.authService.login(this.credentials.userId, this.credentials.password)
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Login failed. Please try again.';
          this.isLoading = false;
        }
      });
  }


}