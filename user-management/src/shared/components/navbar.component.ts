import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, Search, Bell, User, LogOut, Grid3X3, DollarSign, TrendingUp, Building2, Shield, UserPlus, FileCheck } from 'lucide-angular';
import { ThemeToggleComponent } from './theme-toggle.component';
import { AuthService, User as AuthUser } from '../../services/auth.service';
import { SSOService } from '../../services/sso.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ThemeToggleComponent],
  template: `
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="w-full flex h-16 items-center px-4 lg:px-6">
        <!-- Sidebar toggle button -->
        <button
          class="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          (click)="toggleSidebar()"
        >
          <lucide-angular [img]="menuIcon" class="h-5 w-5"></lucide-angular>
          <span class="sr-only">Toggle sidebar</span>
        </button>

        <!-- Breadcrumb / Page title -->
        <div class="flex items-center space-x-2 lg:ml-0 ml-2">
          <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Right Section -->
        <div class="flex items-center space-x-4 ml-auto flex-shrink-0">
          <div class="relative hidden md:block">
            <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"></lucide-angular>
            <input
              type="search"
              placeholder="Search..."
              class="h-9 w-64 rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <!-- Notifications -->
          <button class="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <lucide-angular [img]="bellIcon" class="h-5 w-5"></lucide-angular>
            <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
            <span class="sr-only">Notifications</span>
          </button>

          <!-- Services menu (visible on all screens, dropdown only on large screens) -->
          <div class="relative">
            <button 
              class="flex items-center space-x-2 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              (click)="toggleServicesMenu()"
            >
              <lucide-angular [img]="servicesIcon" class="h-5 w-5"></lucide-angular>
              <span class="sr-only">Services menu</span>
            </button>

            <!-- Services dropdown menu (visible on all screens) -->
            <div 
              *ngIf="isServicesMenuOpen" 
              class="absolute right-0 mt-2 w-80 lg:w-80 sm:w-72 rounded-md border bg-popover p-4 shadow-md animate-in slide-in-from-top-2 z-50"
            >
              <h3 class="text-sm font-medium mb-3">Banking Services</h3>
              <div class="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div class="grid grid-cols-2 gap-3 pr-2">
                  <button 
                    *ngFor="let service of bankingServices"
                    (click)="navigateToService(service.route)"
                    class="flex flex-col items-center p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <lucide-angular [img]="service.icon" class="h-4 w-4 text-primary"></lucide-angular>
                    </div>
                    <span class="text-xs text-center font-medium">{{ service.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme toggle (hidden on small screens) -->
          <div class="hidden lg:block">
            <app-theme-toggle></app-theme-toggle>
          </div>

          <!-- User menu -->
          <div class="relative">
            <button 
              class="flex items-center space-x-2 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              (click)="toggleUserMenu()"
            >
              <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <lucide-angular [img]="userIcon" class="h-4 w-4"></lucide-angular>
              </div>
              <span class="sr-only">User menu</span>
            </button>

            <!-- User dropdown menu -->
            <div 
              *ngIf="isUserMenuOpen" 
              class="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md animate-in slide-in-from-top-2"
            >
              <div class="px-3 py-2 text-sm">
                <p class="font-medium">{{ currentUser?.name || 'User' }}</p>
                <p class="text-muted-foreground">{{ currentUser?.email || 'user@example.com' }}</p>
                <p class="text-xs text-muted-foreground mt-1" *ngIf="getAuthMethodDisplay()">
                  {{ getAuthMethodDisplay() }}
                </p>
              </div>
              <div class="h-px bg-border my-1"></div>
              <button 
                (click)="navigateToProfile()" 
                class="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Profile
              </button>
              <button 
                (click)="navigateToSettings()" 
                class="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Settings
              </button>
              <div class="h-px bg-border my-1"></div>
              <button 
                (click)="logout()" 
                class="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
              >
                <lucide-angular [img]="logoutIcon" class="h-4 w-4"></lucide-angular>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ssoService = inject(SSOService);

  @Input() pageTitle = 'Dashboard';
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  isUserMenuOpen = false;
  isServicesMenuOpen = false;
  currentUser: AuthUser | null = null;
  private userSubscription: Subscription = new Subscription();

  menuIcon = Menu;
  searchIcon = Search;
  bellIcon = Bell;
  userIcon = User;
  logoutIcon = LogOut;
  servicesIcon = Grid3X3;

  bankingServices = [
    { name: 'Loan Management System', icon: DollarSign, route: '/loan-management' },
    { name: 'Trade Finance', icon: TrendingUp, route: '/trade-finance' },
    { name: 'Investment Banking', icon: Building2, route: '/investment-banking' },
    { name: 'Risk Management', icon: Shield, route: '/risk-management' },
    { name: 'Customer Onboarding', icon: UserPlus, route: '/customer-onboarding' },
    { name: 'Compliance Portal', icon: FileCheck, route: '/compliance' },
    { name: 'Digital Banking', icon: Building2, route: '/digital-banking' },
    { name: 'Credit Card Services', icon: DollarSign, route: '/credit-card' },
    { name: 'Mortgage Services', icon: Building2, route: '/mortgage' },
    { name: 'Treasury Management', icon: TrendingUp, route: '/treasury' },
    { name: 'Foreign Exchange', icon: TrendingUp, route: '/forex' },
    { name: 'Asset Management', icon: Shield, route: '/asset-management' },
    { name: 'Insurance Services', icon: Shield, route: '/insurance' },
    { name: 'Payment Gateway', icon: DollarSign, route: '/payment-gateway' },
    { name: 'Mobile Banking', icon: UserPlus, route: '/mobile-banking' },
    { name: 'Corporate Banking', icon: Building2, route: '/corporate-banking' }
  ];

  constructor() {}

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Close services menu if open
    if (this.isServicesMenuOpen) {
      this.isServicesMenuOpen = false;
    }
  }

  toggleServicesMenu() {
    this.isServicesMenuOpen = !this.isServicesMenuOpen;
    // Close user menu if open
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  navigateToService(route: string): void {
    this.router.navigate([route]);
    this.isServicesMenuOpen = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.isUserMenuOpen = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isUserMenuOpen = false;
  }

  getAuthMethodDisplay(): string {
    const authMethod = this.authService.getAuthMethod();
    if (authMethod === 'sso') {
      const ssoProvider = this.ssoService.getSSOProvider();
      return ssoProvider ? `Signed in via ${ssoProvider.charAt(0).toUpperCase() + ssoProvider.slice(1)}` : 'SSO Login';
    } else if (authMethod === 'traditional') {
      return 'Traditional Login';
    }
    return '';
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }
}