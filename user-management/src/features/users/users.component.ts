import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Filter, X, Upload, User, Edit, Trash2, ChevronDown } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button.component';
import { UserApiService, ApiUser, ApiUsersResponse } from '../../services/user-api.service';
import { AuthService } from '../../services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';
import { UserCountService } from '../../services/user-count.service';
import { catchError, of } from 'rxjs';

export interface User {
  picture: string;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  address: string;
  initials: string;
  name: string;
  role: string;
  status: string;
  joinedDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Users</h1>
          <p class="text-muted-foreground">
            Manage your user accounts and permissions.
          </p>
        </div>
        <app-button (click)="openUserForm()">
          <lucide-angular [img]="plusIcon" class="mr-2 h-4 w-4"></lucide-angular>
          Add User
        </app-button>
      </div>

      <!-- Search and filters -->
      <div class="flex items-center space-x-4">
        <div class="relative flex-1 max-w-sm">
          <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"></lucide-angular>
          <input
            type="search"
            placeholder="Search users..."
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div class="relative">
          <button 
            (click)="toggleFilterDropdown()"
            class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <lucide-angular [img]="filterIcon" class="mr-2 h-4 w-4"></lucide-angular>
            Filter
            <lucide-angular [img]="chevronDownIcon" class="ml-2 h-4 w-4"></lucide-angular>
          </button>
          
          <!-- Filter Dropdown -->
          <div *ngIf="showFilterDropdown" class="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
            <div class="p-4 space-y-4">
              <!-- Status Filter -->
              <div>
                <label class="text-sm font-medium mb-2 block" for="filterStatus">Status</label>
                <select 
                  id="filterStatus"
                  [(ngModel)]="selectedStatus"
                  (change)="onFilterChange()"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <!-- Role Filter -->
              <div>
                <label class="text-sm font-medium mb-2 block" for="filterRole">Role</label>
                <select 
                  id="filterRole"
                  [(ngModel)]="selectedRole"
                  (change)="onFilterChange()"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="User">User</option>
                </select>
                <div *ngIf="validationErrors['role']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['role'] }}</span>
                </div>
              </div>
              
              <!-- Joined Date Filter -->
              <div>
                <label class="text-sm font-medium mb-2 block" for="joinedMonth">Joined Date</label>
                <div class="space-y-2">
                  <select 
                    id="joinedMonth"
                    [(ngModel)]="selectedJoinedMonth"
                    (change)="onFilterChange()"
                    class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <select 
                    id="joinedYear"
                    [(ngModel)]="selectedJoinedYear"
                    (change)="onFilterChange()"
                    class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">All Years</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
              </div>
              
              <!-- Clear Filters -->
              <button 
                (click)="clearFilters()"
                class="w-full px-3 py-2 text-sm border rounded-md hover:bg-accent"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center p-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p class="text-muted-foreground">Loading users...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="rounded-md border border-destructive bg-destructive/10 p-4">
        <div class="flex items-center space-x-2">
          <div class="text-destructive font-medium">Error</div>
        </div>
        <p class="text-destructive mt-1">{{ error }}</p>
        <button 
          (click)="loadUsers()" 
          class="mt-2 px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
        >
          Retry
        </button>
      </div>

      <!-- Users table -->
      <div *ngIf="!loading && !error" class="rounded-md border">
        <div class="overflow-auto max-h-96" style="scrollbar-width: thin; scrollbar-color: #888 #f1f1f1;">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-gray-800 text-white sticky top-0 z-10">
                <th class="h-12 px-4 text-left align-middle font-medium">Picture</th>
                <th class="h-12 px-4 text-left align-middle font-medium">User ID</th>
                <th class="h-12 px-4 text-left align-middle font-medium">First Name</th>
                <!-- <th class="h-12 px-4 text-left align-middle font-medium">Middle Name</th> -->
                <th class="h-12 px-4 text-left align-middle font-medium">Last Name</th>
                <!-- <th class="h-12 px-4 text-left align-middle font-medium">Date of Birth</th> -->
                <th class="h-12 px-4 text-left align-middle font-medium">Contact No</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Email</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Address</th>
                <!-- <th class="h-12 px-4 text-left align-middle font-medium">Role</th> -->
                <th class="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th class="h-12 px-4 text-left align-middle font-medium">D.O.B</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of paginatedFilteredUsers" class="border-b transition-colors hover:bg-muted/50">
                <td class="p-4 align-middle">
                  <div class="flex items-center justify-center">
                    <img *ngIf="user.picture" [src]="user.picture" class="h-10 w-10 object-cover rounded-full" alt="Profile" />
                    <span *ngIf="!user.picture" class="h-10 w-10 rounded-full bg-muted flex items-center justify-center">{{ user.initials }}</span>
                  </div>
                </td>
                <td class="p-4 align-middle">{{ user.userId || '-' }}</td>
                <td class="p-4 align-middle">{{ user.firstName || '-' }}</td>
                <!-- <td class="p-4 align-middle">{{ user.middleName || '-' }}</td> -->
                <td class="p-4 align-middle">{{ user.lastName || '-' }}</td>
                <!-- <td class="p-4 align-middle">{{ user.dateOfBirth || '-' }}</td> -->
                <td class="p-4 align-middle">{{ user.contactNo || '-' }}</td>
                <td class="p-4 align-middle text-muted-foreground">{{ user.email || '-' }}</td>
                <td class="p-4 align-middle">{{ user.address || '-' }}</td>
                <!-- <td class="p-4 align-middle">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [ngClass]="getRoleBadgeClass(user.role)">
                    {{ user.role || '-' }}
                  </span>
                </td> -->
                <td class="p-4 align-middle">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [ngClass]="getStatusBadgeClass(user.status)">
                    {{ user.status || '-' }}
                  </span>
                </td>
                <td class="p-4 align-middle text-muted-foreground">{{ user.joinedDate || '-' }}</td>
                <td class="p-4 align-middle">
                  <div class="flex items-center space-x-2">
                    <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8" title="Edit user">
                      <lucide-angular [img]="editIcon" class="h-4 w-4"></lucide-angular>
                    </button>
                    <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-destructive" title="Delete user">
                      <lucide-angular [img]="deleteIcon" class="h-4 w-4"></lucide-angular>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t bg-gradient-to-r from-muted/20 to-muted/40 backdrop-blur-sm">
          <div class="flex items-center space-x-4">
            <div class="text-sm text-muted-foreground font-medium">
              Showing <span class="text-foreground font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="text-foreground font-semibold">{{ Math.min(currentPage * itemsPerPage, totalRecords) }}</span> of <span class="text-foreground font-semibold">{{ totalRecords }}</span> users
            </div>
            <!-- Entries per page selector -->
            <div class="flex items-center space-x-2">
              <label class="text-sm text-muted-foreground font-medium" for="entriesPerPage">Show:</label>
              <select 
                id="entriesPerPage"
                [(ngModel)]="itemsPerPage"
                (change)="onEntriesPerPageChange()"
                class="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-ring/50 shadow-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span class="text-sm text-muted-foreground font-medium">entries</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              (click)="previousPage()" 
              [disabled]="currentPage === 1"
              class="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            >
              Previous
            </button>
            
            <div class="flex items-center space-x-1">
              <!-- First page button -->
              <button 
                *ngIf="currentPage > 3 && totalPages > 5"
                (click)="goToPage(1)"
                class="px-3 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                title="First page"
              >
                1
              </button>
              
              <!-- Left ellipsis -->
              <span 
                *ngIf="currentPage > 4 && totalPages > 6"
                class="px-2 py-2 text-sm text-muted-foreground animate-pulse"
              >
                ...
              </span>
              
              <!-- Page numbers -->
              <button 
                *ngFor="let page of pageNumbers" 
                (click)="goToPage(page)"
                [class]="'px-3 py-2 text-sm font-medium border rounded-md transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ' + (currentPage === page ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : 'border-input hover:bg-accent')"
              >
                {{ page }}
              </button>
              
              <!-- Right ellipsis -->
              <span 
                *ngIf="currentPage < totalPages - 3 && totalPages > 6"
                class="px-2 py-2 text-sm text-muted-foreground animate-pulse"
              >
                ...
              </span>
              
              <!-- Last page button -->
              <button 
                *ngIf="currentPage < totalPages - 2 && totalPages > 5"
                (click)="goToPage(totalPages)"
                class="px-3 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                [title]="'Last page (' + totalPages + ')'"
              >
                {{ totalPages }}
              </button>
            </div>
            
            <button 
              (click)="nextPage()" 
              [disabled]="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- User Creation Form Modal -->
      <div *ngIf="showUserForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b">
            <div>
              <h2 class="text-xl font-semibold">Create New User Profile</h2>
              <p class="text-sm text-muted-foreground mt-1">Fill in the details below to create a new user account.</p>
            </div>
            <button (click)="closeUserForm()" class="rounded-md p-2 hover:bg-accent">
              <lucide-angular [img]="closeIcon" class="h-4 w-4"></lucide-angular>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- General Error Summary -->
            <div *ngIf="hasAnyValidationErrors()" class="rounded-md border border-destructive bg-destructive/10 p-4">
              <div class="flex items-center space-x-2">
                <span class="text-destructive font-medium">⚠ Please fix the following errors:</span>
              </div>
              <ul class="mt-2 text-sm text-destructive list-disc list-inside">
                <li *ngFor="let error of getValidationErrorsList()">{{ error }}</li>
              </ul>
            </div>
            <!-- Profile Picture Section -->
            <div class="flex flex-col items-center space-y-4">
              <div class="text-center">
                <h3 class="font-medium">Profile Picture</h3>
                <p class="text-sm text-muted-foreground">Upload a picture for the user profile.</p>
              </div>
              <div class="flex flex-col items-center space-y-3">
                <div class="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
                  <img *ngIf="newUser.picture" [src]="newUser.picture" class="h-20 w-20 object-cover rounded-lg" alt="Profile Picture" />
                  <lucide-angular *ngIf="!newUser.picture" [img]="userIcon" class="h-8 w-8 text-muted-foreground"></lucide-angular>
                </div>
                <input type="file" accept="image/*" (change)="onPictureSelected($event)" class="hidden" #fileInput />
                <button class="inline-flex items-center px-3 py-2 text-sm border border-input rounded-md hover:bg-accent" (click)="$any(fileInput).click()">
                  <lucide-angular [img]="uploadIcon" class="mr-2 h-4 w-4"></lucide-angular>
                  Upload Image
                </button>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- User ID -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="userId">User ID</label>
                <input
                  id="userId"
                  type="text"
                  [(ngModel)]="newUser.userId"
                  (input)="onFieldChange('userId')"
                  placeholder="e.g., @jeffsdeposit"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['userId'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['userId']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['userId'] }}</span>
                </div>
              </div>

              <!-- First Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  [(ngModel)]="newUser.firstName"
                  (input)="onFieldChange('firstName')"
                  placeholder="e.g., John"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['firstName'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['firstName']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['firstName'] }}</span>
                </div>
              </div>

              <!-- Middle Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="middleName">Middle Name</label>
                <input
                  id="middleName"
                  type="text"
                  [(ngModel)]="newUser.middleName"
                  placeholder="e.g., A."
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <!-- Last Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  [(ngModel)]="newUser.lastName"
                  (input)="onFieldChange('lastName')"
                  placeholder="e.g., Doe"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['lastName'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['lastName']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['lastName'] }}</span>
                </div>
              </div>

              <!-- Date of Birth -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  [(ngModel)]="newUser.dateOfBirth"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <!-- Contact Number -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="contactNo">Contact Number</label>
                <input
                  id="contactNo"
                  type="text"
                  [(ngModel)]="newUser.contactNo"
                  (input)="onFieldChange('contactNo')"
                  placeholder="e.g., +1234567890"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['contactNo'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['contactNo']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['contactNo'] }}</span>
                </div>
              </div>

              <!-- Email Address -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="newUser.email"
                  (input)="onFieldChange('email')"
                  placeholder="e.g., user@example.com"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['email'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['email']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['email'] }}</span>
                </div>
              </div>

              <!-- Address -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium" for="address">Address</label>
                <input
                  id="address"
                  type="text"
                  [(ngModel)]="newUser.address"
                  placeholder="e.g., 123 Main St, City, Country"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <!-- Password -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium" for="password">Password</label>
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="newUser.password"
                  (input)="onFieldChange('password')"
                  placeholder="Enter a secure password"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['password'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['password']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['password'] }}</span>
                </div>
              </div>

              <!-- Role -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="role">Role</label>
                <select
                  id="role"
                  [(ngModel)]="newUser.role"
                  (change)="onFieldChange('role')"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['role'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="User">User</option>
                </select>
              </div>

              <!-- Account Status -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="status-active">Account Status</label>
                <div class="flex space-x-4">
                  <label class="flex items-center space-x-2 cursor-pointer" for="status-active">
                    <input
                      id="status-active"
                      type="radio"
                      name="status"
                      value="Active"
                      [(ngModel)]="newUser.status"
                      class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span class="px-3 py-1 text-xs font-medium bg-black text-white rounded">Active</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer" for="status-inactive">
                    <input
                      id="status-inactive"
                      type="radio"
                      name="status"
                      value="Inactive"
                      [(ngModel)]="newUser.status"
                      class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span class="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end space-x-3 p-6 border-t">
            <button
              (click)="closeUserForm()"
              class="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              (click)="saveUser()"
              [disabled]="hasAnyValidationErrors()"
              [class]="'px-4 py-2 text-sm font-medium rounded-md transition-colors ' + (hasAnyValidationErrors() ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary text-primary-foreground hover:bg-primary/90')"
            >
              Create User
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private userApiService = inject(UserApiService);
  private authService = inject(AuthService);
  private authApiService = inject(AuthApiService);
  private userCountService = inject(UserCountService);
  
  plusIcon = Plus;
  searchIcon = Search;
  filterIcon = Filter;
  filteredUsers: User[] = [];
  uploadIcon = Upload;
  userIcon = User;
  editIcon = Edit;
  deleteIcon = Trash2;
  chevronDownIcon = ChevronDown;
  closeIcon = X;
  Math = Math; // Make Math available in template

  showUserForm = false;
  loading = false;
  error: string | null = null;
  
  // Validation error tracking
  validationErrors: { [key: string]: string } = {};
  
  // Email validation regex
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  // Phone validation regex (basic format)
  private phoneRegex = /^\+?[1-9]\d{0,15}$/;
  
  // User ID validation regex (@username format)
  private userIdRegex = /^@[a-zA-Z0-9_]{3,20}$/;
  
  // Search and filter properties
  searchTerm = '';
  selectedStatus = '';
  selectedRole = '';
  selectedJoinedMonth = '';
  selectedJoinedYear = '';
  showFilterDropdown = false;
  newUser = {
    picture: '',
    userId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    contactNo: '',
    email: '',
    address: '',
    password: '',
    role: '',
    status: 'Active'
  };

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  totalRecords = 0;

  users: User[] = [];
  
  ngOnInit() {
    this.loadUsers();
  }

  private retryCount = 0;
  private maxRetries = 3;

  loadUsers() {
    // Check authentication before making API call
    if (!this.authService.isLoggedIn()) {
      this.error = 'You must be logged in to view users';
      console.error('❌ User not authenticated');
      return;
    }

    const authHeader = this.authApiService.getAuthorizationHeader();
    if (!authHeader) {
      this.error = 'Authentication token not found. Please login again.';
      console.error('❌ No authentication token found');
      return;
    }

    console.log('🔐 Authentication check passed:', {
      isLoggedIn: this.authService.isLoggedIn(),
      hasAuthHeader: !!authHeader,
      tokenInfo: this.authApiService.getTokenInfo()
    });

    this.loading = true;
    this.error = null;
    this.retryCount = 0;
    
    this.userApiService.getApiUsers(this.currentPage, this.itemsPerPage)
      .pipe(
        catchError(error => {
          console.error('❌ Error loading users:', error);
          
          // Handle specific authentication errors
          if (error.status === 401) {
            this.error = 'Authentication failed. Please login again.';
            // Clear stored authentication data on 401
            this.authApiService.logout();
            // Optionally redirect to login page
            console.warn('🔐 Authentication token expired or invalid. User needs to re-login.');
          } else if (error.status === 403) {
            this.error = 'You do not have permission to view users.';
          } else if (error.status === 404) {
            this.error = 'Users endpoint not found. Please check the API configuration.';
          } else if (error.status === 500) {
            this.error = 'Server error occurred. Please try again later.';
          } else if (error.status === 0) {
            // Network error - attempt retry
            if (this.retryCount < this.maxRetries) {
              this.retryCount++;
              console.log(`🔄 Retrying request (${this.retryCount}/${this.maxRetries})...`);
              this.error = `Network error. Retrying... (${this.retryCount}/${this.maxRetries})`;
              // Retry after a short delay
              setTimeout(() => {
                this.loadUsers();
              }, 2000);
              return of({ isSuccess: false, value: [], errorMessage: 'Retrying...', totalRecord: 0 });
            } else {
              this.error = 'Network error. Please check your connection and try again.';
            }
          } else {
            this.error = error.message || 'Failed to load users. Please try again.';
          }
          
          return of({ isSuccess: false, value: [], errorMessage: error.message, totalRecord: 0 });
        })
      )
      .subscribe((response: ApiUsersResponse) => {
        this.loading = false;
        
        if (response.isSuccess) {
          console.log('✅ Users loaded successfully:', response);
          this.users = this.transformApiUsers(response.value);
          this.totalRecords = response.totalRecord;
          this.userCountService.updateUserCount(this.totalRecords);
          this.applyFilters();
        } else {
          this.error = response.errorMessage || 'Failed to load users';
          console.error('❌ API returned error:', response.errorMessage);
        }
      });
  }

  transformApiUsers(apiUsers: ApiUser[]): User[] {
    return apiUsers.map(apiUser => ({
      picture: apiUser.picture || '',
      userId: apiUser.id?.toString() || apiUser.userName || '',
      firstName: apiUser.firstName || '',
      middleName: apiUser.middleName || '',
      lastName: apiUser.lastName || '',
      dateOfBirth: this.formatDate(apiUser.dateOfBirth),
      contactNo: apiUser.contactNo || '',
      email: apiUser.email || '',
      address: apiUser.address || '',
      initials: this.generateInitials(apiUser.firstName, apiUser.middleName, apiUser.lastName),
      name: apiUser.fullName || `${apiUser.firstName} ${apiUser.middleName ? apiUser.middleName + ' ' : ''}${apiUser.lastName}`.trim(),
      role: 'User', // Default role since API doesn't provide role field
      status: apiUser.status ? 'Active' : 'Inactive', // Convert boolean to string
      joinedDate: this.formatDate(apiUser.dateOfBirth) // Use dateOfBirth since createdAt is not available
    }));
  }

  generateInitials(firstName: string, middleName: string, lastName: string): string {
    return [firstName, middleName, lastName]
      .filter(Boolean)
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  // Mock users for fallback (keeping original structure)
  mockUsers = [
    {
      picture: '',
      userId: 'alicej',
      firstName: 'Alice',
      middleName: '',
      lastName: 'Johnson',
      dateOfBirth: '',
      contactNo: '',
      email: 'alice@example.com',
      address: '',
      initials: 'AJ',
      name: 'Alice Johnson',
      role: 'Admin',
      status: 'Active',
      joinedDate: 'Jan 15, 2024'
    },
    {
      picture: '',
      userId: 'bobsmith',
      firstName: 'Bob',
      middleName: '',
      lastName: 'Smith',
      dateOfBirth: '',
      contactNo: '',
      email: 'bob@example.com',
      address: '',
      initials: 'BS',
      name: 'Bob Smith',
      role: 'User',
      status: 'Active',
      joinedDate: 'Jan 12, 2024'
    },
    {
      picture: '',
      userId: 'carold',
      firstName: 'Carol',
      middleName: '',
      lastName: 'Davis',
      dateOfBirth: '',
      contactNo: '',
      email: 'carol@example.com',
      address: '',
      initials: 'CD',
      name: 'Carol Davis',
      role: 'Moderator',
      status: 'Inactive',
      joinedDate: 'Jan 10, 2024'
    },
    {
      picture: '',
      userId: 'davidw',
      firstName: 'David',
      middleName: '',
      lastName: 'Wilson',
      dateOfBirth: '',
      contactNo: '',
      email: 'david@example.com',
      address: '',
      initials: 'DW',
      name: 'David Wilson',
      role: 'User',
      status: 'Active',
      joinedDate: 'Jan 8, 2024'
    },
    {
      picture: '',
      userId: 'evab',
      firstName: 'Eva',
      middleName: '',
      lastName: 'Brown',
      dateOfBirth: '',
      contactNo: '',
      email: 'eva@example.com',
      address: '',
      initials: 'EB',
      name: 'Eva Brown',
      role: 'User',
      status: 'Pending',
      joinedDate: 'Jan 5, 2024'
    },
    {
      picture: '',
      userId: 'frankm',
      firstName: 'Frank',
      middleName: '',
      lastName: 'Miller',
      dateOfBirth: '',
      contactNo: '',
      email: 'frank@example.com',
      address: '',
      initials: 'FM',
      name: 'Frank Miller',
      role: 'User',
      status: 'Active',
      joinedDate: 'Mar 20, 2023'
    },
    {
      picture: '',
      userId: 'gracet',
      firstName: 'Grace',
      middleName: '',
      lastName: 'Taylor',
      dateOfBirth: '',
      contactNo: '',
      email: 'grace@example.com',
      address: '',
      initials: 'GT',
      name: 'Grace Taylor',
      role: 'Moderator',
      status: 'Active',
      joinedDate: 'Jun 15, 2023'
    },
    {
      picture: '',
      userId: 'henryc',
      firstName: 'Henry',
      middleName: '',
      lastName: 'Clark',
      dateOfBirth: '',
      contactNo: '',
      email: 'henry@example.com',
      address: '',
      initials: 'HC',
      name: 'Henry Clark',
      role: 'User',
      status: 'Active',
      joinedDate: 'Sep 10, 2022'
    },
    {
      picture: '',
      userId: 'irener',
      firstName: 'Irene',
      middleName: '',
      lastName: 'Rodriguez',
      dateOfBirth: '',
      contactNo: '',
      email: 'irene@example.com',
      address: '',
      initials: 'IR',
      name: 'Irene Rodriguez',
      role: 'Admin',
      status: 'Active',
      joinedDate: 'Dec 5, 2022'
    }
  ];

  constructor() {
    // Constructor simplified - initialization happens in ngOnInit
  }

  // Pagination methods
  get paginatedFilteredUsers() {
    // For API-based pagination, return filtered users directly since pagination is handled by API
    return this.filteredUsers;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
    // Reset to first page if current page is beyond available pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
      this.loadUsers(); // Reload data for the correct page
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers(); // Load data for the selected page
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers(); // Load data for the previous page
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers(); // Load data for the next page
    }
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onEntriesPerPageChange() {
    // Reset to first page when changing entries per page
    this.currentPage = 1;
    this.updatePagination();
    this.loadUsers();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'User':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  openUserForm(): void {
    this.showUserForm = true;
    this.resetForm();
  }

  closeUserForm(): void {
    this.showUserForm = false;
    this.resetUserForm();
  }

  resetForm(): void {
    this.newUser = {
      picture: '',
      userId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      contactNo: '',
      email: '',
      address: '',
      password: '',
      role: '',
      status: 'Active'
    };
  }

  resetUserForm(): void {
    // Reset form
    this.newUser = {
      picture: '',
      userId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      contactNo: '',
      email: '',
      address: '',
      password: '',
      role: '',
      status: 'Active'
    };
    this.error = null;
    this.validationErrors = {};
  }

  onPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target && e.target.result;
        this.newUser.picture = typeof result === 'string' ? result : '';
      };
      reader.readAsDataURL(file);
    }
  }

  saveUser(): void {
    // Validate all fields before submission
    this.validateAllFields();
    
    if (this.hasAnyValidationErrors()) {
      this.error = 'Please fix the validation errors before submitting the form.';
      return;
    }
    
    if (this.isFormValid()) {
      this.loading = true;
      this.error = null;

      // Prepare user data for API call
      const userData = {
        userName: this.newUser.userId,
        firstName: this.newUser.firstName,
        middleName: this.newUser.middleName || '',
        lastName: this.newUser.lastName,
        dateOfBirth: this.newUser.dateOfBirth,
        contactNo: this.newUser.contactNo,
        email: this.newUser.email,
        address: this.newUser.address,
        picture: this.newUser.picture || '',
        password: this.newUser.password,
        confirmPassword: this.newUser.password
      };

      // Call API to create user
      this.userApiService.createApiUser({
        ...userData,
        name: `${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}`.trim()
      }).pipe(
        catchError(error => {
          console.error('Error creating user:', error);
          this.error = error.message || 'Failed to create user. Please try again.';
          this.loading = false;
          return of(null);
        })
      ).subscribe(response => {
        this.loading = false;
        
        if (response) {
          // Generate initials from firstName, middleName, lastName
          const initials = [this.newUser.firstName, this.newUser.middleName, this.newUser.lastName]
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);

          // Add new user to the users array with API response data
          const newUserEntry = {
            picture: response.picture || this.newUser.picture,
            userId: response.userName || this.newUser.userId,
            firstName: response.firstName,
            middleName: response.middleName,
            lastName: response.lastName,
            dateOfBirth: response.dateOfBirth,
            contactNo: response.contactNo,
            email: response.email,
            address: response.address,
            initials: initials,
            name: `${response.firstName} ${response.middleName ? response.middleName + ' ' : ''}${response.lastName}`.trim(),
            role: this.newUser.role,
            status: response.status ? 'Active' : 'Inactive',
            joinedDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          };

          this.users.unshift(newUserEntry); // Add to beginning of array
          this.totalRecords++; // Increment total count
          this.userCountService.updateUserCount(this.totalRecords); // Update sidebar count
          this.applyFilters(); // Reapply filters to include new user
          this.updatePagination(); // Update pagination after adding user
          this.closeUserForm();
          
          // Reset form
          this.resetUserForm();
        }
      });
    }
  }

  // Validation methods
  validateField(fieldName: string, value: string): string | null {
    switch (fieldName) {
      case 'userId':
        if (!value.trim()) return 'User ID is required';
        if (!this.userIdRegex.test(value)) return 'User ID must start with @ and contain 3-20 alphanumeric characters or underscores';
        return null;
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        return null;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        return null;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!this.emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (!this.passwordRegex.test(value)) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        return null;
      
      case 'contactNo':
        if (!value.trim()) return 'Contact number is required';
        if (!this.phoneRegex.test(value)) return 'Please enter a valid phone number';
        return null;
      
      case 'dateOfBirth':
        if (!value.trim()) return 'Date of birth is required';
        let birthDate = new Date(value);
        const today = new Date();
        if (birthDate >= today) return 'Date of birth must be in the past';
        return null;
      
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        return null;
      
      case 'role':
        if (!value.trim()) return 'Role is required';
        return null;
      
      default:
        return null;
    }
  }
  
  validateAllFields(): void {
    this.validationErrors = {};
    
    const fieldsToValidate = ['userId', 'firstName', 'lastName', 'email', 'password', 'contactNo', 'dateOfBirth', 'address', 'role'];
    
    fieldsToValidate.forEach(field => {
      const value = this.newUser[field as keyof typeof this.newUser] as string;
      const error = this.validateField(field, value);
      if (error) {
        this.validationErrors[field] = error;
      }
    });
  }
  
  onFieldChange(fieldName: string): void {
    // Get the current value from the newUser object
    const value = this.newUser[fieldName as keyof typeof this.newUser] as string;
    
    // Validate the field and update errors
    const error = this.validateField(fieldName, value);
    if (error) {
      this.validationErrors[fieldName] = error;
    } else {
      delete this.validationErrors[fieldName];
    }
  }
  
  hasValidationError(fieldName: string): boolean {
    return !!this.validationErrors[fieldName];
  }
  
  getValidationError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }
  
  hasAnyValidationErrors(): boolean {
    return Object.keys(this.validationErrors).length > 0;
  }

  getValidationErrorsList(): string[] {
    return Object.values(this.validationErrors);
  }
  
  isFormValid(): boolean {
    this.validateAllFields();
    return !this.hasAnyValidationErrors() && 
           !!(this.newUser.userId &&
              this.newUser.firstName &&
              this.newUser.lastName &&
              this.newUser.email &&
              this.newUser.password &&
              this.newUser.contactNo &&
              this.newUser.dateOfBirth &&
              this.newUser.address &&
              this.newUser.role &&
              this.newUser.status);
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.applyFilters();
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedRole = '';
    this.selectedJoinedMonth = '';
    this.selectedJoinedYear = '';
    this.showFilterDropdown = false;
    this.currentPage = 1; // Reset to first page when clearing filters
    this.loadUsers(); // Reload data without filters
  }

  private applyFilters(): void {
    // For API-based filtering, we'll apply filters locally for now
    // In a real implementation, you might want to send filter parameters to the API
    this.filteredUsers = this.users.filter(user => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.userId.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Status filter
      const statusMatch = !this.selectedStatus || user.status === this.selectedStatus;

      // Role filter
      const roleMatch = !this.selectedRole || user.role === this.selectedRole;

      // Joined date filter
       let dateMatch = true;
       if (this.selectedJoinedMonth || this.selectedJoinedYear) {
         if (user.joinedDate) {
           const joinedDate = new Date(user.joinedDate);
           if (!isNaN(joinedDate.getTime())) { // Check if date is valid
             const joinedMonth = joinedDate.getMonth() + 1; // getMonth() returns 0-11
             const joinedYear = joinedDate.getFullYear();

             const monthMatch = !this.selectedJoinedMonth || joinedMonth.toString() === this.selectedJoinedMonth;
             const yearMatch = !this.selectedJoinedYear || joinedYear.toString() === this.selectedJoinedYear;
             
             dateMatch = monthMatch && yearMatch;
           } else {
             dateMatch = false; // Invalid date format
           }
         } else {
           dateMatch = false; // If no joined date, exclude from filtered results when date filter is applied
         }
       }

      return searchMatch && statusMatch && roleMatch && dateMatch;
    });

    // Don't call updatePagination here since we're using API-based pagination
    // this.updatePagination();
  }
}