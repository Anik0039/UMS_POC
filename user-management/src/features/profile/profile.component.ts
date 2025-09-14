import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Mail, Phone, MapPin, Calendar } from 'lucide-angular';
import { UserApiService, ApiUser, ApiUsersResponse } from '../../services/user-api.service';
import { AuthService, User as AuthUser } from '../../services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
                  {{ getInitials(apiUserData?.fullName || currentUser?.name || '') }}
                </div>
              </div>
              
              <!-- User Info -->
              <div>
                <h2 class="text-2xl font-semibold text-foreground">{{ apiUserData?.fullName || currentUser?.name || 'User Name' }}</h2>
                <p class="text-muted-foreground">{{ currentUser?.role || 'User' }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <div class="h-2 w-2 rounded-full" [class]="apiUserData?.status ? 'bg-green-500' : 'bg-red-500'"></div>
                  <span class="text-sm text-muted-foreground">{{ apiUserData?.status ? 'Active' : 'Inactive' }}</span>
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
                    [value]="apiUserData?.fullName || currentUser?.name || 'N/A'"
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
                    [value]="apiUserData?.email || currentUser?.email || 'N/A'"
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
                    [value]="apiUserData?.contactNo || currentUser?.phone || 'N/A'"
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
                    [value]="apiUserData?.address || currentUser?.location || 'N/A'"
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
                    [value]="apiUserData?.userName || currentUser?.userId || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Username -->
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

                <!-- Date of Birth -->
                <div>
                  <label for="profile-dob" class="block text-sm font-medium text-foreground mb-2">
                    <lucide-angular [img]="calendarIcon" class="inline h-4 w-4 mr-2"></lucide-angular>
                    Date of Birth
                  </label>
                  <input
                    id="profile-dob"
                    type="text"
                    [value]="formatDate(apiUserData?.dateOfBirth) || 'N/A'"
                    readonly
                    class="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>

                <!-- Account Status -->
                <div>
                  <span class="block text-sm font-medium text-foreground mb-2">Account Status</span>
                  <div class="flex items-center space-x-2">
                    <div class="h-3 w-3 rounded-full" [class]="apiUserData?.status ? 'bg-green-500' : 'bg-red-500'"></div>
                    <span class="text-sm text-foreground">{{ apiUserData?.status ? 'Active' : 'Inactive' }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Additional Information Cards -->

    </div>
  `,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
    private userApiService = inject(UserApiService);
  private authService = inject(AuthService);
private authApiService = inject(AuthApiService);
  private http = inject(HttpClient);

  currentUser: AuthUser | null = null;
  apiUserData: any = null;
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
        console.log(this.currentUser);
        if (user && user.name) {
          this.getUserInfo(user.name);
        }
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

  getUserInfo(username: string): void {
    this.userApiService.getUserByUsername(username).subscribe({
      next: (res) => {
        console.log(res,"api response");
        if (res.isSuccess && res.value) {
          this.apiUserData = res.value;
        }
      },
      error: (error) => {
        console.error('Error fetching user info:', error);
      }
    })
  }
}