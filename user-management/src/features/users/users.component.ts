import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Search, Filter, X, Upload, User, Edit, Trash2, ChevronDown } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button.component';
import { UserApiService, ApiUser, ApiUsersResponse } from '../../services/user-api.service';
import { AuthService } from '../../services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';
import { UserCountService } from '../../services/user-count.service';
import { catchError, of } from 'rxjs';

export interface User {
  id: string;
  userName: string;
  picture: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  address: string;
  status: boolean;
  initials: string;
  name: string;
  joinedDate: string;
  emailVerified: boolean;
  setPassword: boolean;
  password?: string;
  confirmPassword?: string;
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

      <!-- Success Message -->
       <div *ngIf="showSuccessMessage" class="fixed top-4 right-4 z-50 max-w-md">
         <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg animate-in slide-in-from-right-full duration-300">
           <div class="flex items-start space-x-3">
             <div class="flex-shrink-0">
               <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
               </svg>
             </div>
             <div class="flex-1">
               <h3 class="text-sm font-medium text-green-800">Success!</h3>
               <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
             </div>
             <div class="flex-shrink-0">
               <button (click)="hideSuccessMessage()" class="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50">
                 <span class="sr-only">Dismiss</span>
                 <lucide-angular [img]="closeIcon" class="h-4 w-4"></lucide-angular>
               </button>
             </div>
           </div>
         </div>
       </div>

       <!-- Failure Message -->
       <div *ngIf="showFailureMessage" class="fixed top-4 right-4 z-50 max-w-md">
         <div class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg animate-in slide-in-from-right-full duration-300">
           <div class="flex items-start space-x-3">
             <div class="flex-shrink-0">
               <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
               </svg>
             </div>
             <div class="flex-1">
               <h3 class="text-sm font-medium text-red-800">Error!</h3>
               <p class="mt-1 text-sm text-red-700">{{ failureMessage }}</p>
             </div>
             <div class="flex-shrink-0">
               <button (click)="hideFailureMessage()" class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50">
                 <span class="sr-only">Dismiss</span>
                 <lucide-angular [img]="closeIcon" class="h-4 w-4"></lucide-angular>
               </button>
             </div>
           </div>
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
                <th class="h-12 px-4 text-left align-middle font-medium">User Id</th>
                <th class="h-12 px-4 text-left align-middle font-medium">User Name</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Full Name</th>
                <!-- <th class="h-12 px-4 text-left align-middle font-medium">Date of Birth</th> -->
                <th class="h-12 px-4 text-left align-middle font-medium">Contact No</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Email</th>
                <th class="h-12 px-4 text-left align-middle font-medium">Address</th>
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
                <td class="p-4 align-middle">{{ user.id || '-' }}</td>
                <td class="p-4 align-middle">{{ user.userName || '-' }}</td>
                <td class="p-4 align-middle">{{ user.fullName || '-' }}</td>
        
                <td class="p-4 align-middle">{{ user.contactNo || '-' }}</td>
                <td class="p-4 align-middle text-muted-foreground">{{ user.email || '-' }}</td>
                <td class="p-4 align-middle">{{ user.address || '-' }}</td>
               
                <td class="p-4 align-middle text-muted-foreground">{{ user.joinedDate || '-' }}</td>
                <td class="p-4 align-middle">
                  <div class="flex items-center space-x-2">
                    <button (click)="editUser(user.userName)" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8" title="Edit user">
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
              <h2 class="text-xl font-semibold">{{ isEditMode ? 'Edit User Profile' : 'Create New User Profile' }}</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ isEditMode ? 'Update the details below to modify the user account.' : 'Fill in the details below to create a new user account.' }}</p>
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
              <!-- User Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium" for="userName">User Name</label>
                <input
                  id="userName"
                  type="text"
                  [(ngModel)]="newUser.userName"
                  (input)="onFieldChange('userName')"
                  placeholder="e.g., @jeffsdeposit"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['userName'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['userName']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['userName'] }}</span>
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
                  (input)="onFieldChange('middleName')"
                  placeholder="e.g., A."
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['middleName'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['middleName']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['middleName'] }}</span>
                </div>
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
                  (input)="onFieldChange('dateOfBirth')"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['dateOfBirth'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['dateOfBirth']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['dateOfBirth'] }}</span>
                </div>
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
                  (input)="onFieldChange('address')"
                  placeholder="e.g., 123 Main St, City, Country"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['address'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['address']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['address'] }}</span>
                </div>
              </div>

              <!-- Email Verified -->
              <div *ngIf="!isEditMode" class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="newUser.emailVerified"
                    class="rounded border-input"
                  />
                  <span class="text-sm font-medium">Email Verified</span>
                </label>
              </div>

              <!-- Set Password -->
              <div *ngIf="!isEditMode" class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="newUser.setPassword"
                    class="rounded border-input"
                  />
                  <span class="text-sm font-medium">Set Password</span>
                </label>
              </div>

              <!-- Password (conditional) -->
              <div *ngIf="newUser.setPassword && !isEditMode" class="space-y-2">
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

              <!-- Confirm Password (conditional) -->
              <div *ngIf="newUser.setPassword && !isEditMode" class="space-y-2">
                <label class="text-sm font-medium" for="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  [(ngModel)]="newUser.confirmPassword"
                  (input)="onFieldChange('confirmPassword')"
                  placeholder="Confirm your password"
                  [class]="'h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (validationErrors['confirmPassword'] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : 'border-input bg-background focus-visible:ring-ring')"
                />
                <div *ngIf="validationErrors['confirmPassword']" class="flex items-center space-x-1 text-sm text-destructive">
                  <span class="text-destructive">⚠</span>
                  <span>{{ validationErrors['confirmPassword'] }}</span>
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
              [disabled]="false"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {{ isEditMode ? 'Update User' : 'Create User' }}
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
  private router = inject(Router);
  
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
  successMessage: string | null = null;
  showSuccessMessage = false;
  failureMessage: string | null = null;
  showFailureMessage = false;
  
  // Edit mode properties
  isEditMode = false;
  editingUsername = '';
  
  // Validation error tracking
  validationErrors: { [key: string]: string } = {};
  
  // Email validation regex
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  // Phone validation regex (basic format)
  private phoneRegex = /^\+?[0-9]\d{0,15}$/;
  
  // User ID validation regex (@username format)
  private userIdRegex = /^@[a-zA-Z0-9_]{3,20}$/;
  
  // Search and filter properties
  searchTerm = '';
  selectedJoinedMonth = '';
  selectedJoinedYear = '';
  showFilterDropdown = false;
  newUser = {
    picture: '',
    userName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    contactNo: '',
    email: '',
    address: '',
    emailVerified: false,
    setPassword: false,
    password: '',
    confirmPassword: ''
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
    return apiUsers.map(apiUser => {
      const firstName = apiUser.firstName || '';
      const middleName = apiUser.middleName || '';
      const lastName = apiUser.lastName || '';
      const initials = [firstName, middleName, lastName]
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
      
      return {
        id: apiUser.id?.toString() || '',
        userName: apiUser.userName || '',
        picture: apiUser.picture || '',
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        fullName: apiUser.fullName || '',
        dateOfBirth: this.formatDate(apiUser.dateOfBirth),
        contactNo: apiUser.contactNo || '',
        email: apiUser.email || '',
        address: apiUser.address || '',
        status: apiUser.status || false,
        initials: initials,
        name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
        joinedDate: this.formatDate(apiUser.dateOfBirth) || new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        emailVerified: false,
        setPassword: false
       };
     });
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





  openUserForm(): void {
    this.showUserForm = true;
    this.resetForm();
  }

  closeUserForm(): void {
    this.showUserForm = false;
    this.resetUserForm();
    // Reset edit mode state
    this.isEditMode = false;
    this.editingUsername = '';
  }

  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideSuccessMessage();
    }, 5000);
  }

  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.successMessage = null;
  }

  showFailureNotification(message: string): void {
    this.failureMessage = message;
    this.showFailureMessage = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideFailureMessage();
    }, 5000);
  }

  hideFailureMessage(): void {
    this.showFailureMessage = false;
    this.failureMessage = null;
  }

  resetForm(): void {
    this.newUser = {
      picture: '',
      userName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      contactNo: '',
      email: '',
      address: '',

      emailVerified: false,
      setPassword: false,
      password: '',
      confirmPassword: ''
    };
  }

  resetUserForm(): void {
    // Reset form
    this.newUser = {
      picture: '',
      userName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      contactNo: '',
      email: '',
      address: '',
      emailVerified: false,
      setPassword: false,
      password: '',
      confirmPassword: ''
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
    
    console.log('🔍 Validation errors:', this.validationErrors);
    console.log('🔍 Has validation errors:', this.hasAnyValidationErrors());
    
    if (this.hasAnyValidationErrors()) {
      console.log('❌ Validation errors found, stopping submission');
      this.error = 'Please fix the validation errors before submitting the form.';
      return;
    }
    
    console.log('🔍 Form valid check:', this.isFormValid());
    
    if (this.isFormValid()) {
      console.log('✅ Form is valid, proceeding with submission');
      this.loading = true;
      this.error = null;

      // Prepare user data for API call
      const userData = {
        userName: this.newUser.userName,
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

      if (this.isEditMode) {
        // Update existing user
        console.log('📤 Calling handleUserUpdate with data:', userData);
        this.handleUserUpdate(userData);
      } else {
        // Call API to create user
      this.userApiService.createApiUser({
        ...userData,
        name: `${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}`.trim()
      }).pipe(
        catchError(error => {
          console.error('Error creating user:', error);
          this.error = error.message || 'Failed to create user. Please try again.';
          this.showFailureNotification(error.message || 'Failed to create user. Please try again.');
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
          const newUserEntry: User = {
            id: response.id?.toString() || '',
            picture: response.picture || this.newUser.picture,
            userName: response.userName || this.newUser.userName,
            firstName: response.firstName,
            middleName: response.middleName,
            lastName: response.lastName,
            fullName: `${response.firstName} ${response.middleName ? response.middleName + ' ' : ''}${response.lastName}`.trim(),
            dateOfBirth: response.dateOfBirth,
            contactNo: response.contactNo,
            email: response.email,
            address: response.address,
            status: response.status || true,
            initials: initials,
            name: `${response.firstName} ${response.middleName ? response.middleName + ' ' : ''}${response.lastName}`.trim(),
            joinedDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            emailVerified: this.newUser.emailVerified,
            setPassword: this.newUser.setPassword
          };

          this.users.unshift(newUserEntry); // Add to beginning of array
          this.totalRecords++; // Increment total count
          this.userCountService.updateUserCount(this.totalRecords); // Update sidebar count
          this.applyFilters(); // Reapply filters to include new user
          this.updatePagination(); // Update pagination after adding user
          this.closeUserForm();
          
          // Show success message
          this.showSuccessNotification(`User "${newUserEntry.name}" has been successfully created!`);
          
          // Reset form
          this.resetUserForm();
        }
      });
      }
    } else {
      console.log('❌ Form is not valid, cannot proceed with submission');
      console.log('🔍 Form data:', this.newUser);
      this.loading = false;
    }
  }

  // Handle user update with API call
  handleUserUpdate(userData: any): void {
    console.log('📤 Updating user via API:', this.editingUsername, userData);

    // Prepare API payload
    const apiPayload = {
      firstName: userData.firstName,
      middleName: userData.middleName || '',
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      contactNo: userData.contactNo,
      email: userData.email,
      emailVerified: userData.emailVerified || false,
      address: userData.address,
      picture: userData.picture || ''
    };
    
    console.log('🔗 About to call userApiService.updateUserByUsername with:', {
      username: this.editingUsername,
      payload: apiPayload
    });
    
    this.userApiService.updateUserByUsername(this.editingUsername, apiPayload).subscribe({
      next: (response) => {
        console.log('✅ User updated successfully:', response);
        
        // Find and update the user in the local array
        const userIndex = this.users.findIndex(user => user.userName === this.editingUsername);
        if (userIndex !== -1) {
          // Generate initials from firstName, middleName, lastName
          const initials = [userData.firstName, userData.middleName, userData.lastName]
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);

          // Update the user in the array with API response or form data
          const updatedUser = response.isSuccess && response.value ? response.value : userData;
          this.users[userIndex] = {
            ...this.users[userIndex],
            picture: updatedUser.picture || userData.picture,
            userName: updatedUser.userName || userData.userName,
            firstName: updatedUser.firstName || userData.firstName,
            middleName: updatedUser.middleName || userData.middleName,
            lastName: updatedUser.lastName || userData.lastName,
            fullName: `${updatedUser.firstName || userData.firstName} ${(updatedUser.middleName || userData.middleName) ? (updatedUser.middleName || userData.middleName) + ' ' : ''}${updatedUser.lastName || userData.lastName}`.trim(),
            dateOfBirth: updatedUser.dateOfBirth || userData.dateOfBirth,
            contactNo: updatedUser.contactNo || userData.contactNo,
            email: updatedUser.email || userData.email,
            address: updatedUser.address || userData.address,
            initials: initials,
            name: `${updatedUser.firstName || userData.firstName} ${(updatedUser.middleName || userData.middleName) ? (updatedUser.middleName || userData.middleName) + ' ' : ''}${updatedUser.lastName || userData.lastName}`.trim()
          };

          this.applyFilters(); // Reapply filters
          this.updatePagination(); // Update pagination
          this.closeUserForm();
          
          // Show success message
          this.showSuccessNotification(`User "${this.users[userIndex].name}" has been successfully updated!`);
          
          // Reset form and edit state
          this.resetUserForm();
          this.isEditMode = false;
          this.editingUsername = '';
        } else {
          this.error = 'User not found in local list';
          this.showFailureNotification('User not found in local list');
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error updating user:', error);
        this.error = error.message || 'Failed to update user';
        this.showFailureNotification(error.message || 'Failed to update user');
        this.loading = false;
      }
    });
  }

  // Validation methods
  validateField(fieldName: string, value: string): string | null {
    switch (fieldName) {
      case 'userName':
        if (!value.trim()) return 'User Name is required';
        return null;
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        return null;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        return null;
      
      case 'middleName':
        // Middle name is optional, so no validation required
        return null;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!this.emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      
      case 'password':
        if (this.newUser.setPassword && !value.trim()) return 'Password is required when Set Password is enabled';
        if (this.newUser.setPassword && !this.passwordRegex.test(value)) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        return null;
      
      case 'confirmPassword':
        if (this.newUser.setPassword && !value.trim()) return 'Confirm Password is required when Set Password is enabled';
        if (this.newUser.setPassword && value !== this.newUser.password) return 'Passwords do not match';
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
    
    const fieldsToValidate = ['userName', 'firstName', 'lastName', 'email', 'contactNo', 'dateOfBirth', 'address'];
    
    // Add conditional password validation
    if (this.newUser.setPassword) {
      fieldsToValidate.push('password', 'confirmPassword');
    }
    
    // Always validate middleName but it's optional (no error if empty)
    fieldsToValidate.push('middleName');
    
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
    const hasErrors = Object.keys(this.validationErrors).length > 0;
    console.log('🔍 hasAnyValidationErrors() check:', {
      validationErrors: this.validationErrors,
      errorCount: Object.keys(this.validationErrors).length,
      hasErrors: hasErrors,
      errorKeys: Object.keys(this.validationErrors)
    });
    return hasErrors;
  }

  getValidationErrorsList(): string[] {
    return Object.values(this.validationErrors);
  }
  
  isFormValid(): boolean {
    this.validateAllFields();
    const baseFieldsValid = !!(this.newUser.userName &&
                              this.newUser.firstName &&
                              this.newUser.lastName &&
                              this.newUser.email &&
                              this.newUser.contactNo &&
                              this.newUser.dateOfBirth &&
                              this.newUser.address);
    
    const passwordFieldsValid = !this.newUser.setPassword || 
                               !!(this.newUser.password && this.newUser.confirmPassword && this.newUser.password === this.newUser.confirmPassword);
    
    return !this.hasAnyValidationErrors() && baseFieldsValid && passwordFieldsValid;
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
        user.userName.toLowerCase().includes(this.searchTerm.toLowerCase());



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

      return searchMatch && dateMatch;
    });

    // Don't call updatePagination here since we're using API-based pagination
    // this.updatePagination();
  }

  // Edit user - open form in edit mode and load user data
  editUser(username: string): void {
    console.log('Editing user:', username);
    this.isEditMode = true;
    this.editingUsername = username;
    this.loadUserForEdit(username);
    this.showUserForm = true;
  }

  // Load user data for editing
  loadUserForEdit(username: string): void {
    this.loading = true;
    this.error = null;
    
    this.userApiService.getUserByUsername(username).subscribe({
      next: (response: any) => {
        console.log('✅ API Response received:', response);
        
        if (response.isSuccess && response.value) {
          const apiUser = response.value;
          console.log('✅ User data loaded for editing:', apiUser);
          
          // Format date for input field (convert from ISO to YYYY-MM-DD)
          let formattedDate = '';
          if (apiUser.dateOfBirth) {
            const date = new Date(apiUser.dateOfBirth);
            formattedDate = date.toISOString().split('T')[0];
          }
          
          // Populate the form with user data
          this.newUser = {
            picture: apiUser.picture || '',
            userName: apiUser.userName || '',
            firstName: apiUser.firstName || '',
            middleName: apiUser.middleName || '',
            lastName: apiUser.lastName || '',
            dateOfBirth: formattedDate,
            contactNo: apiUser.contactNo || '',
            email: apiUser.email || '',
            address: apiUser.address || '',
            emailVerified: false, // Set default or from API if available
            setPassword: false, // Don't pre-fill password fields for security
            password: '',
            confirmPassword: ''
          };
          
          this.loading = false;
        } else {
          console.error('❌ API returned unsuccessful response:', response);
          this.error = response.errorMessage || 'Failed to load user data';
          this.showFailureNotification(response.errorMessage || 'Failed to load user data');
          this.loading = false;
          this.showUserForm = false; // Close form on error
        }
      },
      error: (error) => {
        console.error('❌ Error loading user for edit:', error);
        this.error = error.message || 'Failed to load user data';
        this.showFailureNotification(error.message || 'Failed to load user data');
        this.loading = false;
        this.showUserForm = false; // Close form on error
      }
    });
  }
}