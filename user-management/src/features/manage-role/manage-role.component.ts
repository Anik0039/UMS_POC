import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Users, Shield } from 'lucide-angular';
import { AuthApiService } from '../../services/auth-api.service';
import { UserApiService, ApiUser, ApiUsersResponse } from '../../services/user-api.service';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-manage-role',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-3 mb-2">
          <lucide-angular [img]="shieldIcon" class="h-8 w-8 text-primary"></lucide-angular>
          <h1 class="text-3xl font-bold text-foreground">Manage Role</h1>
        </div>
        <p class="text-muted-foreground">Assign roles to users and manage user permissions</p>
      </div>

      <!-- Main Content -->
      <div class="bg-card rounded-lg border shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Users Dropdown -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center space-x-2">
              <lucide-angular [img]="usersIcon" class="h-4 w-4"></lucide-angular>
              <span>Select User</span>
            </label>
            <div class="relative">
              <div class="relative">
                <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"></lucide-angular>
                <input
                  type="text"
                  [(ngModel)]="userSearchTerm"
                  (input)="filterUsers()"
                  (focus)="showUserDropdown = true"
                  placeholder="Search users..."
                  class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              
              <!-- Users Dropdown List -->
              <div 
                *ngIf="showUserDropdown && filteredUsers.length > 0" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <div 
                  *ngFor="let user of filteredUsers" 
                  (click)="selectUser(user)"
                  class="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                >
                  <div class="font-medium">{{ user.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ user.email }}</div>
                </div>
              </div>
              
              <!-- No users found -->
              <div 
                *ngIf="showUserDropdown && filteredUsers.length === 0 && userSearchTerm" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground"
              >
                No users found
              </div>
            </div>
            
            <!-- Selected User Display -->
            <div *ngIf="selectedUser" class="mt-2 p-3 bg-muted rounded-md">
              <div class="font-medium text-foreground">{{ selectedUser.name }}</div>
              <div class="text-sm text-muted-foreground">{{ selectedUser.email }}</div>
            </div>
          </div>

          <!-- Services Dropdown -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center space-x-2">
              <lucide-angular [img]="shieldIcon" class="h-4 w-4"></lucide-angular>
              <span>Select Service</span>
            </label>
            <div class="relative">
              <div class="relative">
                <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"></lucide-angular>
                <input
                  type="text"
                  [(ngModel)]="serviceSearchTerm"
                  (input)="filterServices()"
                  (focus)="showServiceDropdown = true"
                  placeholder="Search services..."
                  class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              
              <!-- Services Dropdown List -->
              <div 
                *ngIf="showServiceDropdown && filteredServices.length > 0" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <div 
                  *ngFor="let service of filteredServices" 
                  (click)="selectService(service)"
                  class="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                >
                  <div class="font-medium">{{ service.name }}</div>
                  <div *ngIf="service.description" class="text-sm text-muted-foreground">{{ service.description }}</div>
                </div>
              </div>
              
              <!-- No services found -->
              <div 
                *ngIf="showServiceDropdown && filteredServices.length === 0 && serviceSearchTerm" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground"
              >
                No services found
              </div>
              
              <!-- Loading services -->
              <div 
                *ngIf="loadingServices" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground"
              >
                Loading services...
              </div>
            </div>
            
            <!-- Selected Service Display -->
            <div *ngIf="selectedService" class="mt-2 p-3 bg-muted rounded-md">
              <div class="font-medium text-foreground">{{ selectedService.name }}</div>
              <div *ngIf="selectedService.description" class="text-sm text-muted-foreground">{{ selectedService.description }}</div>
            </div>
          </div>
             <!-- Roles Dropdown -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center space-x-2">
              <lucide-angular [img]="shieldIcon" class="h-4 w-4"></lucide-angular>
              <span>Select Role</span>
            </label>
            <div class="relative">
              <div class="relative">
                <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"></lucide-angular>
                <input
                  type="text"
                  [(ngModel)]="roleSearchTerm"
                  (input)="filterRoles()"
                  (focus)="showRoleDropdown = true"
                  placeholder="Search roles..."
                  class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              
              <!-- Roles Dropdown List -->
              <div 
                *ngIf="showRoleDropdown && filteredRoles.length > 0" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <div 
                  *ngFor="let role of filteredRoles" 
                  (click)="selectRole(role)"
                  class="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                >
                  <div class="font-medium">{{ role.name }}</div>
                  <div *ngIf="role.description" class="text-sm text-muted-foreground">{{ role.description }}</div>
                </div>
              </div>
              
              <!-- No roles found -->
              <div 
                *ngIf="showRoleDropdown && filteredRoles.length === 0 && roleSearchTerm" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground"
              >
                No roles found
              </div>
              
              <!-- Loading roles -->
              <div 
                *ngIf="loadingRoles" 
                class="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground"
              >
                Loading roles...
              </div>
            </div>
            
            <!-- Selected Role Display -->
            <div *ngIf="selectedRole" class="mt-2 p-3 bg-muted rounded-md">
              <div class="font-medium text-foreground">{{ selectedRole.name }}</div>
              <div *ngIf="selectedRole.description" class="text-sm text-muted-foreground">{{ selectedRole.description }}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex justify-end space-x-4">
          <button 
            (click)="clearSelections()"
            class="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Clear
          </button>
          <button 
            (click)="assignRole()"
            [disabled]="!selectedUser || !selectedRole || !selectedService || isAssigning"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isAssigning ? 'Assigning...' : 'Assign Role' }}
          </button>
        </div>

        <!-- Success/Error Messages -->
        <div *ngIf="successMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styleUrl: './manage-role.component.scss'
})
export class ManageRoleComponent implements OnInit {
  private authApiService = inject(AuthApiService);
  private userApiService = inject(UserApiService);

  // Icons
  searchIcon = Search;
  usersIcon = Users;
  shieldIcon = Shield;

  // Users data
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  userSearchTerm = '';
  showUserDropdown = false;

  // Roles data
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  selectedRole: Role | null = null;
  roleSearchTerm = '';
  showRoleDropdown = false;
  loadingRoles = false;

  // Services data
  services: Service[] = [];
  filteredServices: Service[] = [];
  selectedService: Service | null = null;
  serviceSearchTerm = '';
  showServiceDropdown = false;
  loadingServices = false;

  // UI state
  isAssigning = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.loadServices();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showUserDropdown = false;
        this.showRoleDropdown = false;
        this.showServiceDropdown = false;
      }
    });
  }

  loadUsers() {
    // Fetch users from API using UserApiService
    this.userApiService.getApiUsers(1, 100).subscribe({
      next: (response: ApiUsersResponse) => {
        if (response.isSuccess && response.value) {
          // Map the API response to match our User interface
          this.users = response.value.map((user: ApiUser) => ({
            id: user.id.toString(),
            name: user.userName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email || ''
          }));
          this.filteredUsers = [...this.users];
        } else {
          console.error('API returned unsuccessful response:', response.errorMessage);
          this.errorMessage = response.errorMessage || 'Failed to load users. Please try again.';
          this.users = [];
          this.filteredUsers = [];
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = error.message || 'Failed to load users. Please try again.';
        // Fallback to empty array
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  loadRoles() {
    this.loadingRoles = true;
    // Mock roles data - replace with actual GET API call
    setTimeout(() => {
      this.roles = [
        { id: '1', name: 'Administrator', description: 'Full system access and management privileges' },
        { id: '2', name: 'Manager', description: 'Manage users and view reports' },
        { id: '3', name: 'User', description: 'Basic user access with limited permissions' },
        { id: '4', name: 'Viewer', description: 'Read-only access to system data' },
        { id: '5', name: 'Editor', description: 'Edit content and manage data' }
      ];
      this.filteredRoles = [...this.roles];
      this.loadingRoles = false;
    }, 1000);
  }

  loadServices() {
    this.loadingServices = true;
    // Fetch services from API using AuthApiService
    this.authApiService.get('/api/services').subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          // Map the API response to match our Service interface
          this.services = response.map((service: any) => ({
            id: service.id?.toString() || service.serviceId?.toString() || '',
            name: service.name || service.serviceName || service.title || '',
            description: service.description || service.desc || ''
          }));
        } else if (response && response.isSuccess && response.value) {
          // Handle wrapped response format like users API
          this.services = response.value.map((service: any) => ({
            id: service.id?.toString() || service.serviceId?.toString() || '',
            name: service.name || service.serviceName || service.title || '',
            description: service.description || service.desc || ''
          }));
        } else {
          console.error('API returned unexpected response format:', response);
          this.errorMessage = 'Failed to load services. Unexpected response format.';
          this.services = [];
        }
        this.filteredServices = [...this.services];
        this.loadingServices = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.errorMessage = error.message || 'Failed to load services. Please try again.';
        // Fallback to empty array
        this.services = [];
        this.filteredServices = [];
        this.loadingServices = false;
      }
    });
  }

  filterUsers() {
    const term = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
    this.showUserDropdown = true;
  }

  filterRoles() {
    const term = this.roleSearchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(role => 
      role.name.toLowerCase().includes(term) || 
      (role.description && role.description.toLowerCase().includes(term))
    );
    this.showRoleDropdown = true;
  }

  filterServices() {
    const term = this.serviceSearchTerm.toLowerCase();
    this.filteredServices = this.services.filter(service => 
      service.name.toLowerCase().includes(term) || 
      (service.description && service.description.toLowerCase().includes(term))
    );
    this.showServiceDropdown = true;
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.userSearchTerm = user.name;
    this.showUserDropdown = false;
    this.clearMessages();
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    this.roleSearchTerm = role.name;
    this.showRoleDropdown = false;
    this.clearMessages();
  }

  selectService(service: Service) {
    this.selectedService = service;
    this.serviceSearchTerm = service.name;
    this.showServiceDropdown = false;
    this.clearMessages();
  }

  clearSelections() {
    this.selectedUser = null;
    this.selectedRole = null;
    this.selectedService = null;
    this.userSearchTerm = '';
    this.roleSearchTerm = '';
    this.serviceSearchTerm = '';
    this.filteredUsers = [...this.users];
    this.filteredRoles = [...this.roles];
    this.filteredServices = [...this.services];
    this.clearMessages();
  }

  assignRole() {
    if (!this.selectedUser || !this.selectedRole || !this.selectedService) {
      this.errorMessage = 'Please select a user, role, and service';
      return;
    }

    this.isAssigning = true;
    this.clearMessages();

    // Mock API call - replace with actual role assignment API
    setTimeout(() => {
      this.successMessage = `Successfully assigned role "${this.selectedRole!.name}" to user "${this.selectedUser!.name}" for service "${this.selectedService!.name}"`;
      this.isAssigning = false;
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }, 1500);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}