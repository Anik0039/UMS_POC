import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Shield, Bell, Palette, Database, Eye, EyeOff, Check, X } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';
import { AuthService, User as AuthUser } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, ThemeToggleComponent],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <!-- Settings sections -->
      <div class="grid gap-6">
        <!-- Profile Settings -->
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="userIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Profile Settings</h3>
              <p class="text-sm text-muted-foreground">Manage your personal information and preferences</p>
            </div>
          </div>
          
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label for="settings-name" class="text-sm font-medium">Full Name</label>
              <input 
                id="settings-name"
                type="text" 
                [(ngModel)]="profileData.name" 
                class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
            <div class="space-y-2">
              <label for="settings-email" class="text-sm font-medium">Email</label>
              <input 
                id="settings-email"
                type="email" 
                [(ngModel)]="profileData.email" 
                class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <app-button (click)="saveProfileSettings()">Save Changes</app-button>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="shieldIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Security Settings</h3>
              <p class="text-sm text-muted-foreground">Manage your account security and authentication</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Two-Factor Authentication</h4>
                <p class="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Enable
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">Change Password</h4>
                  <p class="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <button 
                  (click)="togglePasswordForm()" 
                  class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {{ showPasswordForm ? 'Cancel' : 'Change' }}
                </button>
              </div>
              
              <!-- Password Change Form -->
              <div *ngIf="showPasswordForm" class="mt-4 p-4 border rounded-lg bg-muted/30">
                <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
                  <div class="space-y-4">
                    <!-- Current Password -->
                    <div class="space-y-2">
                      <label for="current-password" class="text-sm font-medium">Current Password</label>
                      <div class="relative">
                        <input
                          id="current-password"
                          [type]="showCurrentPassword ? 'text' : 'password'"
                          [(ngModel)]="passwordData.currentPassword"
                          name="currentPassword"
                          required
                          class="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          (click)="toggleCurrentPasswordVisibility()"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <lucide-angular [img]="showCurrentPassword ? eyeOffIcon : eyeIcon" class="h-4 w-4"></lucide-angular>
                        </button>
                      </div>
                    </div>
                    
                    <!-- New Password -->
                    <div class="space-y-2">
                      <label for="new-password" class="text-sm font-medium">New Password</label>
                      <div class="relative">
                        <input
                          id="new-password"
                          [type]="showNewPassword ? 'text' : 'password'"
                          [(ngModel)]="passwordData.newPassword"
                          name="newPassword"
                          required
                          minlength="8"
                          class="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          (click)="toggleNewPasswordVisibility()"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <lucide-angular [img]="showNewPassword ? eyeOffIcon : eyeIcon" class="h-4 w-4"></lucide-angular>
                        </button>
                      </div>
                      <div class="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </div>
                    </div>
                    
                    <!-- Confirm Password -->
                    <div class="space-y-2">
                      <label for="confirm-password" class="text-sm font-medium">Confirm New Password</label>
                      <div class="relative">
                        <input
                          id="confirm-password"
                          [type]="showConfirmPassword ? 'text' : 'password'"
                          [(ngModel)]="passwordData.confirmPassword"
                          name="confirmPassword"
                          required
                          class="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          placeholder="Confirm new password"
                          [class.border-red-500]="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword"
                        />
                        <button
                          type="button"
                          (click)="toggleConfirmPasswordVisibility()"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <lucide-angular [img]="showConfirmPassword ? eyeOffIcon : eyeIcon" class="h-4 w-4"></lucide-angular>
                        </button>
                      </div>
                      <div *ngIf="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword" class="text-xs text-red-500">
                        Passwords do not match
                      </div>
                    </div>
                    
                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        (click)="togglePasswordForm()"
                        class="inline-flex items-center space-x-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                      >
                        <lucide-angular [img]="cancelIcon" class="h-4 w-4"></lucide-angular>
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        [disabled]="!passwordForm.valid || passwordData.newPassword !== passwordData.confirmPassword || isChangingPassword"
                        class="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-angular [img]="checkIcon" class="h-4 w-4"></lucide-angular>
                        <span>{{ isChangingPassword ? 'Changing...' : 'Change Password' }}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="bellIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Notification Settings</h3>
              <p class="text-sm text-muted-foreground">Configure how you receive notifications</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div *ngFor="let notification of notificationSettings; let i = index" class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ notification.title }}</h4>
                <p class="text-sm text-muted-foreground">{{ notification.description }}</p>
              </div>
              <label [for]="'notification-' + i" class="relative inline-flex items-center cursor-pointer">
                <input 
                  [id]="'notification-' + i"
                  type="checkbox" 
                  [(ngModel)]="notification.enabled" 
                  (change)="saveNotificationSettings()" 
                  class="sr-only peer" 
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="paletteIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Appearance Settings</h3>
              <p class="text-sm text-muted-foreground">Customize the look and feel of your interface</p>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Theme</h4>
              <p class="text-sm text-muted-foreground">Choose between light and dark mode</p>
            </div>
            <app-theme-toggle></app-theme-toggle>
          </div>
        </div>

        <!-- System Settings -->
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="databaseIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-lg font-semibold">System Settings</h3>
              <p class="text-sm text-muted-foreground">Advanced system configuration options</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Data Export</h4>
                <p class="text-sm text-muted-foreground">Export your data in various formats</p>
              </div>
              <button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Export
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Clear Cache</h4>
                <p class="text-sm text-muted-foreground">Clear application cache and temporary data</p>
              </div>
              <button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  currentUser: AuthUser | null = null;
  private userSubscription: Subscription = new Subscription();
  
  profileData = {
    name: '',
    email: ''
  };

  // Password change form
  showPasswordForm = false;
  isChangingPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  userIcon = User;
  shieldIcon = Shield;
  bellIcon = Bell;
  paletteIcon = Palette;
  databaseIcon = Database;
  eyeIcon = Eye;
  eyeOffIcon = EyeOff;
  checkIcon = Check;
  cancelIcon = X;

  notificationSettings = [
    {
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      enabled: true
    },
    {
      title: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      enabled: false
    },
    {
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      enabled: false
    },
    {
      title: 'Marketing Emails',
      description: 'Receive marketing and promotional emails',
      enabled: true
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        if (user) {
          this.profileData = {
            name: user.name || '',
            email: user.email || ''
          };
        }
      }
    );
    
    // Load saved notification settings
    this.loadNotificationSettings();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  saveProfileSettings(): void {
    if (this.currentUser) {
      const updatedUser: AuthUser = {
        ...this.currentUser,
        name: this.profileData.name,
        email: this.profileData.email
      };
      
      this.authService.updateUser(updatedUser);
      console.log('Profile settings saved successfully');
    }
  }

  saveNotificationSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    console.log('Notification settings saved successfully');
  }

  loadNotificationSettings(): void {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      this.notificationSettings = JSON.parse(saved);
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      console.error('Password must be at least 8 characters long');
      return;
    }

    this.isChangingPassword = true;

    // Use AuthService to change password
    this.authService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).then(() => {
      // Success
      console.log('Password changed successfully');
      
      // Reset form and close
      this.resetPasswordForm();
      this.showPasswordForm = false;
      this.isChangingPassword = false;
      
      // Show success message
      alert('Password changed successfully!');
    }).catch((error) => {
      // Handle error
      console.error('Password change failed:', error.message);
      this.isChangingPassword = false;
      
      // Show error message
      alert('Password change failed: ' + error.message);
    });
  }
}