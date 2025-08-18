import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthApiService } from './auth-api.service';
import { appConfig } from '../config/app.config';

export interface ApiUser {
  id: number;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  address: string;
  picture: string | null;
  status: boolean;
}

export interface ApiUsersResponse {
  isSuccess: boolean;
  value: ApiUser[];
  errorMessage: string | null;
  totalRecord: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  role?: string;
  status?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  private authApiService = inject(AuthApiService);
  private baseUrl = appConfig.api.baseUrl;

  constructor() {}

  // Get users from the specific API endpoint with authentication
  getApiUsers(page: number = 1, pageSize: number = 10): Observable<ApiUsersResponse> {
    // Use the baseUrl directly since it already includes /api
    const url = `${this.baseUrl}/users?Page=${page}&PageSize=${pageSize}`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': this.authApiService.getAuthorizationHeader() || ''
    });

    console.log('🔍 Fetching users from API:', {
      baseUrl: this.baseUrl,
      finalUrl: url,
      headers: headers.keys(),
      authHeader: this.authApiService.getAuthorizationHeader()
    });

    return this.http.get<ApiUsersResponse>(url, { headers }).pipe(
      catchError(error => {
        console.error('🚨 API Request Failed:', {
          url,
          error: error,
          status: error.status,
          statusText: error.statusText,
          message: error.message
        });
        
        // Handle specific error cases
        if (error.status === 0) {
          throw new Error('Network error: Unable to connect to the API server. Please check if the server is running and accessible.');
        } else if (error.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.status === 403) {
          throw new Error('Access forbidden. You do not have permission to access this resource.');
        } else if (error.status === 404) {
          throw new Error('API endpoint not found. Please check the API URL.');
        } else {
          throw new Error(`API request failed: ${error.message || 'Unknown error'}`);
        }
      })
    );
  }

  // Get all users with pagination and filtering (existing method)
  getUsers(params?: UserQueryParams): Observable<UserListResponse> {
    return this.apiService.get<UserListResponse>('/users', params);
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.apiService.get<User>(`/users/${userId}`);
  }

  // Create new user
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.apiService.post<User>('/users', userData);
  }

  // Update user
  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.apiService.put<User>(`/users/${userId}`, userData);
  }

  // Partially update user
  patchUser(userId: string, userData: Partial<UpdateUserRequest>): Observable<User> {
    return this.apiService.patch<User>(`/users/${userId}`, userData);
  }

  // Delete user
  deleteUser(userId: string): Observable<void> {
    return this.apiService.delete<void>(`/users/${userId}`);
  }

  // Get current user profile (from token)
  getCurrentUserProfile(): Observable<User> {
    return this.apiService.get<User>('/users/me');
  }

  // Update current user profile
  updateCurrentUserProfile(userData: UpdateUserRequest): Observable<User> {
    return this.apiService.put<User>('/users/me', userData);
  }

  // Change user password
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  // Reset user password (admin only)
  resetUserPassword(userId: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>(`/users/${userId}/reset-password`, {
      newPassword
    });
  }

  // Get user roles
  getUserRoles(): Observable<string[]> {
    return this.apiService.get<string[]>('/users/roles');
  }

  // Assign role to user
  assignRole(userId: string, role: string): Observable<void> {
    return this.apiService.post<void>(`/users/${userId}/roles`, { role });
  }

  // Remove role from user
  removeRole(userId: string, role: string): Observable<void> {
    return this.apiService.delete<void>(`/users/${userId}/roles/${role}`);
  }

  // Bulk operations
  bulkUpdateUsers(userIds: string[], updates: UpdateUserRequest): Observable<User[]> {
    return this.apiService.post<User[]>('/users/bulk-update', {
      userIds,
      updates
    });
  }

  // Bulk delete users
  bulkDeleteUsers(userIds: string[]): Observable<void> {
    return this.apiService.post<void>('/users/bulk-delete', { userIds });
  }

  // Export users
  exportUsers(params?: UserQueryParams): Observable<Blob> {
    return this.apiService.get<Blob>('/users/export', params);
  }

  // Import users
  importUsers(file: File): Observable<{ imported: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<{ imported: number; errors: any[] }>('/users/import', formData);
  }

  // Get user statistics
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [role: string]: number };
    recentJoins: number;
  }> {
    return this.apiService.get('/users/stats');
  }

  // Search users
  searchUsers(query: string, filters?: {
    role?: string;
    status?: string;
    limit?: number;
  }): Observable<User[]> {
    return this.apiService.get<User[]>('/users/search', {
      q: query,
      ...filters
    });
  }

  // Get user activity log
  getUserActivity(userId: string, params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Observable<{
    activities: any[];
    total: number;
  }> {
    return this.apiService.get(`/users/${userId}/activity`, params);
  }
}