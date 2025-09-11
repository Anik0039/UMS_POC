import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    // Check if user is authenticated via regular auth
    const isAuthenticated = this.authService.isLoggedIn();
    
    if (isAuthenticated) {
      return true;
    } else {
      // Clear any stale authentication data
      this.authService.logout();
      // Redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}