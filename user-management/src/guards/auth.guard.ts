import { Injectable, inject, Injector } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from '../services/auth.service';
import { appConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private injector = inject(Injector);
  private keycloakService?: KeycloakService;

  constructor() {
    // Only inject KeycloakService if Keycloak is enabled
    if (appConfig.features.enableKeycloak) {
      try {
        this.keycloakService = this.injector.get(KeycloakService);
      } catch (error) {
        console.warn('KeycloakService not available:', error);
      }
    }
  }

  async canActivate(): Promise<boolean> {
    // Check if user is authenticated via Keycloak (only if enabled)
    let isKeycloakAuthenticated = false;
    if (appConfig.features.enableKeycloak && this.keycloakService) {
      try {
        isKeycloakAuthenticated = this.keycloakService.isLoggedIn();
      } catch (error) {
        console.warn('Error checking Keycloak authentication:', error);
      }
    }
    
    // Check if user is authenticated via regular auth
    const isRegularAuthenticated = this.authService.isLoggedIn();
    
    if (isKeycloakAuthenticated || isRegularAuthenticated) {
      return true;
    } else {
      // Redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }

  // Optional: Method to check specific roles
  canActivateWithRole(roles: string[]): boolean {
    if (!appConfig.features.enableKeycloak || !this.keycloakService) {
      return false;
    }
    
    try {
      if (!this.keycloakService.isLoggedIn()) {
        return false;
      }
      
      return roles.some(role => this.keycloakService!.isUserInRole(role));
    } catch (error) {
      console.warn('Error checking Keycloak roles:', error);
      return false;
    }
  }
}