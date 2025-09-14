import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Mail, Phone, MapPin, Calendar } from 'lucide-angular';
import { AuthService, User as AuthUser } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p class="text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-card rounded-lg border shadow-sm">
        <!-- Profile Header -->
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Profile Picture -->
              <div class="relative">
                <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                  {{ getInitials(currentUser?.name || '') }}
                </div>
              </div>
              
              <!-- User Info -->
              <div>
                <h2 class="text-2xl font-semibold text-foreground">{{ currentUser?.name || 'User Name' }}</h2>
                <p class="text-muted-foreground">{{ currentUser?.role || 'User' }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <div class="h-2 w-2 rounded-full bg-green-500"></div>
                  <span class="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        <!-- Profile Details -->
        <div class="p-6">
          <div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Personal Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                
                <!-- Full Name -->
                <div>
                  <label for="profile-name" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="userIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    [value]="currentUser?.name || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label for="profile-email" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="mailIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    [value]="currentUser?.email || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label for="profile-phone" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="phoneIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    [value]="currentUser?.phone || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Location -->
                <div>
                  <label for="profile-location" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="locationIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Location
                  </label>
                  <input
                    id="profile-location"
                    type="text"
                    [value]="currentUser?.location || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <!-- Account Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                
                <!-- User ID -->
                <div>
                  <label for="profile-user-id" class="block text-sm font-medium text-foreground mb-2">User ID</label>
                  <input
                    id="profile-user-id"
                    type="text"
                    [value]="currentUser?.userId || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Role -->
                <div>
                  <label for="profile-role" class="block text-sm font-medium text-foreground mb-2">Role</label>
                  <input
                    id="profile-role"
                    type="text"
                    [value]="currentUser?.role || 'User'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Join Date -->
                <div>
                  <label for="profile-member-since" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="calendarIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Member Since
                  </label>
                  <input
                    id="profile-member-since"
                    type="text"
                    [value]="formatDate(currentUser?.joinDate)"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Account Status -->
                <div>
                  <span class="block text-sm font-medium text-foreground mb-2">Account Status</span>
                  <div class="flex items-center space-x-2">
                    <div class="h-3 w-3 rounded-full bg-green-500"></div>
                    <span class="text-sm text-foreground">{{ currentUser?.status || 'Active' }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Additional Information Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <!-- Recent Activity -->
        <div class="bg-card rounded-lg border shadow-sm p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 text-sm">
              <div class="h-2 w-2 rounded-full bg-blue-500"></div>
              <span class="text-muted-foreground">Logged in from new device</span>
              <span class="text-xs text-muted-foreground ml-auto">2 hours ago</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
              <div class="h-2 w-2 rounded-full bg-green-500"></div>
              <span class="text-muted-foreground">Profile updated</span>
              <span class="text-xs text-muted-foreground ml-auto">1 day ago</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
              <div class="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span class="text-muted-foreground">Password changed</span>
              <span class="text-xs text-muted-foreground ml-auto">3 days ago</span>
            </div>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="bg-card rounded-lg border shadow-sm p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Account Statistics</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Total Logins</span>
              <span class="font-semibold text-foreground">{{ accountStats.totalLogins }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Last Login</span>
              <span class="font-semibold text-foreground">{{ formatDate(accountStats.lastLogin) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Sessions Today</span>
              <span class="font-semibold text-foreground">{{ accountStats.sessionsToday }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  currentUser: AuthUser | null = null;
  private userSubscription: Subscription = new Subscription();

  accountStats = {
    totalLogins: 127,
    lastLogin: new Date(),
    sessionsToday: 3
  };

  // Icons
  userIcon = User;
  mailIcon = Mail;
  phoneIcon = Phone;
  locationIcon = MapPin;
  calendarIcon = Calendar;

  constructor() {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }



  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}