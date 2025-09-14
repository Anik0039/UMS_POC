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
          
          <!-- <div class="mt-4 flex justify-end">
            <app-button (click)="saveProfileSettings()">Save Changes</app-button>
          </div> -->
        </div>

        <!-- Security Settings -->


        <!-- Notification Settings -->


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