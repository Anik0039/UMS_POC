import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, DollarSign, TrendingUp, Building2, Shield, UserPlus, FileCheck, Users, Grid3X3 } from 'lucide-angular';

interface BankingService {
  id: string;
  name: string;
  description: string;
  icon: typeof DollarSign | typeof TrendingUp | typeof Building2 | typeof Shield | typeof UserPlus | typeof FileCheck | typeof Users;
  route: string;
  isExternal: boolean;
  color: string;
  category: string;
}

@Component({
  selector: 'app-services-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Banking Services Portal
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose from our comprehensive suite of banking services to manage your financial operations efficiently.
          </p>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            *ngFor="let service of bankingServices" 
            class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden" 
            tabindex="0"
            (keydown.enter)="navigateToService(service)"
            (click)="navigateToService(service)"
          >
            <!-- Service Card Header -->
            <div class="p-6 pb-4">
              <div class="flex items-center justify-between mb-4">
                <div 
                  class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300"
                  [style.background-color]="service.color + '20'"
                >
                  <lucide-angular 
                    [img]="service.icon" 
                    class="h-6 w-6 transition-colors duration-300"
                    [style.color]="service.color"
                  ></lucide-angular>
                </div>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  [class]="getCategoryClass(service.category)"
                >
                  {{ service.category }}
                </span>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {{ service.name }}
              </h3>
              
              <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ service.description }}
              </p>
            </div>

            <!-- Service Card Footer -->
            <div class="px-6 pb-6">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ service.isExternal ? 'External Service' : 'Internal Service' }}
                </span>
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors duration-300">
                  <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        <!-- Quick Stats Section -->
        <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <lucide-angular [img]="gridIcon" class="h-6 w-6 text-blue-600 dark:text-blue-400"></lucide-angular>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ bankingServices.length }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Available Services</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <lucide-angular [img]="usersIcon" class="h-6 w-6 text-green-600 dark:text-green-400"></lucide-angular>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getInternalServicesCount() }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Internal Services</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <lucide-angular [img]="shieldIcon" class="h-6 w-6 text-purple-600 dark:text-purple-400"></lucide-angular>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getExternalServicesCount() }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">External Services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './services-dashboard.component.scss'
})
export class ServicesDashboardComponent {
  private router = inject(Router);

  gridIcon = Grid3X3;
  usersIcon = Users;
  shieldIcon = Shield;

  bankingServices: BankingService[] = [
    {
      id: 'ums',
      name: 'User Management System',
      description: 'Comprehensive user management, authentication, and access control system for banking operations.',
      icon: Users,
      route: '/dashboard',
      isExternal: false,
      color: '#3B82F6',
      category: 'Core'
    },
    {
      id: 'loan-management',
      name: 'Loan Management System',
      description: 'Complete loan processing, approval workflows, and portfolio management solution.',
      icon: DollarSign,
      route: '/loan-management',
      isExternal: true,
      color: '#10B981',
      category: 'Lending'
    },
    {
      id: 'trade-finance',
      name: 'Trade Finance',
      description: 'International trade financing, letters of credit, and documentary collections platform.',
      icon: TrendingUp,
      route: '/trade-finance',
      isExternal: true,
      color: '#F59E0B',
      category: 'Trading'
    },
    {
      id: 'investment-banking',
      name: 'Investment Banking',
      description: 'Capital markets, securities trading, and investment advisory services platform.',
      icon: Building2,
      route: '/investment-banking',
      isExternal: true,
      color: '#8B5CF6',
      category: 'Investment'
    },
    {
      id: 'risk-management',
      name: 'Risk Management',
      description: 'Comprehensive risk assessment, monitoring, and mitigation tools for banking operations.',
      icon: Shield,
      route: '/risk-management',
      isExternal: true,
      color: '#EF4444',
      category: 'Risk'
    },
    {
      id: 'customer-onboarding',
      name: 'Customer Onboarding',
      description: 'Digital customer acquisition, KYC verification, and account opening processes.',
      icon: UserPlus,
      route: '/customer-onboarding',
      isExternal: true,
      color: '#06B6D4',
      category: 'Customer'
    },
    {
      id: 'compliance',
      name: 'Compliance Portal',
      description: 'Regulatory compliance monitoring, reporting, and audit trail management system.',
      icon: FileCheck,
      route: '/compliance',
      isExternal: true,
      color: '#84CC16',
      category: 'Compliance'
    },
    {
      id: 'digital-banking',
      name: 'Digital Banking',
      description: 'Modern digital banking platform with mobile and web banking capabilities.',
      icon: Building2,
      route: '/digital-banking',
      isExternal: true,
      color: '#F97316',
      category: 'Digital'
    },
    {
      id: 'credit-card',
      name: 'Credit Card Services',
      description: 'Credit card management, processing, and customer service platform.',
      icon: DollarSign,
      route: '/credit-card',
      isExternal: true,
      color: '#EC4899',
      category: 'Cards'
    },
    {
      id: 'mortgage',
      name: 'Mortgage Services',
      description: 'Home loan origination, processing, and servicing management system.',
      icon: Building2,
      route: '/mortgage',
      isExternal: true,
      color: '#14B8A6',
      category: 'Lending'
    },
    {
      id: 'treasury',
      name: 'Treasury Management',
      description: 'Cash management, liquidity planning, and treasury operations platform.',
      icon: TrendingUp,
      route: '/treasury',
      isExternal: true,
      color: '#6366F1',
      category: 'Treasury'
    },
    {
      id: 'forex',
      name: 'Foreign Exchange',
      description: 'Currency trading, exchange rate management, and FX risk hedging tools.',
      icon: TrendingUp,
      route: '/forex',
      isExternal: true,
      color: '#F59E0B',
      category: 'Trading'
    },
    {
      id: 'asset-management',
      name: 'Asset Management',
      description: 'Portfolio management, asset allocation, and investment tracking system.',
      icon: Shield,
      route: '/asset-management',
      isExternal: true,
      color: '#8B5CF6',
      category: 'Investment'
    },
    {
      id: 'insurance',
      name: 'Insurance Services',
      description: 'Insurance product management, claims processing, and policy administration.',
      icon: Shield,
      route: '/insurance',
      isExternal: true,
      color: '#10B981',
      category: 'Insurance'
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      description: 'Secure payment processing, transaction management, and merchant services.',
      icon: DollarSign,
      route: '/payment-gateway',
      isExternal: true,
      color: '#EF4444',
      category: 'Payments'
    },
    {
      id: 'mobile-banking',
      name: 'Mobile Banking',
      description: 'Native mobile banking application with advanced features and security.',
      icon: UserPlus,
      route: '/mobile-banking',
      isExternal: true,
      color: '#06B6D4',
      category: 'Digital'
    },
    {
      id: 'corporate-banking',
      name: 'Corporate Banking',
      description: 'Enterprise banking solutions for corporate clients and business accounts.',
      icon: Building2,
      route: '/corporate-banking',
      isExternal: true,
      color: '#84CC16',
      category: 'Corporate'
    }
  ];

  navigateToService(service: BankingService): void {
    if (service.id === 'ums') {
      // Navigate to UMS dashboard (current project)
      this.router.navigate(['/dashboard']);
    } else {
      // For external services, you can implement different logic:
      // 1. Open in new window/tab
      // 2. Navigate to external URL
      // 3. Show "Coming Soon" message
      // For now, we'll show an alert and could redirect to external URLs
      
      console.log(`Navigating to external service: ${service.name}`);
      
      // Example: Open external service in new tab
      // window.open(`https://external-service.com${service.route}`, '_blank');
      
      // For demo purposes, show alert
      alert(`${service.name} will open in a separate application. This would typically redirect to: ${service.route}`);
    }
  }

  getCategoryClass(category: string): string {
    const categoryClasses: { [key: string]: string } = {
      'Core': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Lending': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Trading': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Investment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Risk': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Customer': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Compliance': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      'Digital': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Cards': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Treasury': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Insurance': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Payments': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      'Corporate': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    
    return categoryClasses[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }

  getInternalServicesCount(): number {
    return this.bankingServices.filter(service => !service.isExternal).length;
  }

  getExternalServicesCount(): number {
    return this.bankingServices.filter(service => service.isExternal).length;
  }
}