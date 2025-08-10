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
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
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
      {
        path: 'loan-management',
        loadComponent: () => import('../features/banking-services/loan-management.component').then(m => m.LoanManagementComponent)
      },
      {
        path: 'trade-finance',
        loadComponent: () => import('../features/banking-services/trade-finance.component').then(m => m.TradeFinanceComponent)
      },
      {
        path: 'investment-banking',
        loadComponent: () => import('../features/banking-services/investment-banking.component').then(m => m.InvestmentBankingComponent)
      },
      {
        path: 'digital-banking',
        loadComponent: () => import('../features/banking-services/digital-banking.component').then(m => m.DigitalBankingComponent)
      },
      {
        path: 'risk-management',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'risk-management' }
      },
      {
        path: 'customer-onboarding',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'customer-onboarding' }
      },
      {
        path: 'compliance',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'compliance' }
      },
      {
        path: 'credit-card',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'credit-card' }
      },
      {
        path: 'mortgage',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'mortgage' }
      },
      {
        path: 'treasury',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'treasury' }
      },
      {
        path: 'forex',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'forex' }
      },
      {
        path: 'asset-management',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'asset-management' }
      },
      {
        path: 'insurance',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'insurance' }
      },
      {
        path: 'payment-gateway',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'payment-gateway' }
      },
      {
        path: 'mobile-banking',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'mobile-banking' }
      },
      {
        path: 'corporate-banking',
        loadComponent: () => import('../features/banking-services/generic-service.component').then(m => m.GenericServiceComponent),
        data: { serviceName: 'corporate-banking' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
