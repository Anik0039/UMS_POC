import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { SSOService, SSOProvider } from '../../services/sso.service';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Current Authentication Status -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Current Authentication Status</h2>
          <div class="space-y-2">
            <p><strong>Logged In:</strong> {{ isLoggedIn ? 'Yes' : 'No' }}</p>
            <p><strong>Auth Method:</strong> {{ authMethod || 'None' }}</p>
            <p *ngIf="currentUser"><strong>User:</strong> {{ currentUser.name }} ({{ currentUser.email }})</p>
            <p *ngIf="ssoProvider"><strong>SSO Provider:</strong> {{ ssoProvider }}</p>
          </div>
        </div>

        <!-- SSO Login Options -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">SSO Login Test</h2>
          <div class="space-y-3">
            <button 
              *ngFor="let provider of ssoProviders"
              (click)="testSSOLogin(provider.id)"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Login with {{ provider.name }}
            </button>
          </div>
        </div>

        <!-- Traditional Login Test -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Traditional Login Test</h2>
          <button 
            (click)="testTraditionalLogin()"
            class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Login with Demo Credentials
          </button>
        </div>

        <!-- Actions -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Actions</h2>
          <div class="space-y-3">
            <button 
              (click)="logout()"
              class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
            <button 
              (click)="goToDashboard()"
              class="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Banking Services Test -->
      <div class="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Banking Services Navigation Test</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            *ngFor="let service of testServices"
            (click)="navigateToService(service.route)"
            class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
          >
            {{ service.name }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuthTestComponent implements OnInit {
  private authService = inject(AuthService);
  private ssoService = inject(SSOService);
  private router = inject(Router);

  isLoggedIn = false;
  authMethod = '';
  currentUser: User | null = null;
  ssoProvider = '';
  ssoProviders: SSOProvider[] = [];

  testServices = [
    { name: 'Loan Management', route: '/loan-management' },
    { name: 'Trade Finance', route: '/trade-finance' },
    { name: 'Investment Banking', route: '/investment-banking' },
    { name: 'Digital Banking', route: '/digital-banking' },
    { name: 'Risk Management', route: '/risk-management' },
    { name: 'Corporate Banking', route: '/corporate-banking' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.updateAuthStatus();
    this.ssoProviders = this.ssoService.getSSOProviders();
    
    // Subscribe to auth changes
    this.authService.isAuthenticated$.subscribe(() => {
      this.updateAuthStatus();
    });
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authMethod = this.authService.getAuthMethod() ?? '';
    this.currentUser = this.authService.getCurrentUserValue();
    this.ssoProvider = this.ssoService.getSSOProvider() ?? '';
  }

  testSSOLogin(providerId: string): void {
    this.authService.loginWithSSO(providerId).subscribe({
      next: (success) => {
        if (success) {
          console.log('SSO login successful');
          this.updateAuthStatus();
        } else {
          console.error('SSO login failed');
        }
      },
      error: (error) => {
        console.error('SSO login error:', error);
      }
    });
  }

  testTraditionalLogin(): void {
    this.authService.login('demo@example.com', 'password123').subscribe({
      next: (success) => {
        if (success) {
          console.log('Traditional login successful');
          this.updateAuthStatus();
        } else {
          console.error('Traditional login failed');
        }
      },
      error: (error) => {
        console.error('Traditional login error:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthStatus();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToService(route: string): void {
    this.router.navigate([route]);
  }
}