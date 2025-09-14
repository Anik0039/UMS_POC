import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, User, LogOut } from 'lucide-angular';
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

          <!-- Services menu removed - now handled by services dashboard -->

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
  currentUser: AuthUser | null = null;
  private userSubscription: Subscription = new Subscription();

  menuIcon = Menu;
  userIcon = User;
  logoutIcon = LogOut;

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
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
    this.isUserMenuOpen = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/dashboard/settings']);
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