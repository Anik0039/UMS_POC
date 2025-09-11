import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../shared/components/dashboard-layout.component';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { LoginComponent } from '../features/auth/login.component';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sso-callback',
    loadComponent: () => import('../features/auth/sso-callback.component').then(m => m.SSOCallbackComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('../features/services/services-dashboard.component').then(m => m.ServicesDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'users',
        loadComponent: () => import('../features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('../features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('../features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('../features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'auth-test',
        loadComponent: () => import('../features/auth/auth-test.component').then(m => m.AuthTestComponent)
      },
      // Banking service routes removed - now handled by services dashboard
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
