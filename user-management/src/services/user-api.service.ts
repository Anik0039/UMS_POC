import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthApiService } from './auth-api.service';
import { appConfig } from '../config/app.config';

export interface ApiUser {
  value: any;
  isSuccess: any;
  id: number;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
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

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface CreateUserRequest {
  userName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  emailVerified?: boolean;
  address: string;
  picture?: string;
  setPassword?: boolean;
  password: string;
  confirmPassword: string;
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
    // Use the baseUrl with /api path as requested
    const url = `${this.baseUrl}/api/users?Page=${page}&PageSize=${pageSize}`;
    
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

  // Get user by username
  getUserByUsername(username: string): Observable<ApiUser> {
    const url = `${this.baseUrl}/api/users/${username}`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': this.authApiService.getAuthorizationHeader() || ''
    });

    console.log('🔍 Fetching user by username from API:', {
      baseUrl: this.baseUrl,
      finalUrl: url,
      username: username,
      headers: headers.keys(),
      authHeader: this.authApiService.getAuthorizationHeader()
    });

    return this.http.get<ApiUser>(url, { headers }).pipe(
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
          throw new Error('User not found.');
        } else {
          throw new Error(`API request failed: ${error.message || 'Unknown error'}`);
        }
      })
    );
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

  // Update user by username
  updateUserByUsername(username: string, userData: any): Observable<any> {
    const url = `${this.baseUrl}/api/users/${username}`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': this.authApiService.getAuthorizationHeader() || ''
    });
    
    console.log('🔄 Making PUT request to:', url);
    console.log('📤 Request payload:', userData);
    console.log('🔑 Request headers:', headers);
    
    return this.http.put<any>(url, userData, { headers }).pipe(
      tap(response => {
        console.log('✅ PUT /api/users/' + username + ' - Success:', response);
      }),
      catchError(error => {
        console.error('❌ PUT /api/users/' + username + ' - Error:', error);
        
        let errorMessage = 'Failed to update user';
        
        if (error.status === 0) {
          errorMessage = 'Network error - please check your connection';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized - please login again';
        } else if (error.status === 403) {
          errorMessage = 'Forbidden - insufficient permissions';
        } else if (error.status === 404) {
          errorMessage = 'User not found';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid user data';
        } else if (error.status >= 500) {
          errorMessage = 'Server error - please try again later';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      }),
    )
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



  // Create new user with API-specific interface
  createApiUser(userData:any): Observable<any> {
    const url = `${this.baseUrl}/api/users`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': this.authApiService.getAuthorizationHeader() || ''
    });

    return this.http.post<any>(url, userData, { headers }).pipe(
      catchError(error => {
        console.error('🚨 Create User API Request Failed:', error);
        throw new Error(`Failed to create user: ${error.message || 'Unknown error'}`);
      })
    );
  }
}