import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { PermittedService } from '../../models/sso.models';
import { appConfig } from '../../config/app.config';
import { LucideAngularModule, ExternalLink, Shield, CheckCircle, Grid3X3, Users, AlertCircle, Home, Database, Settings, Cloud, Lock, Globe, Server, Zap, FileText, Mail, Calendar, BarChart3 } from 'lucide-angular';

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
            Available Services
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access your enabled services below. Click on any service card to navigate.
          </p>
          
          <!-- Debug Controls -->
           <div class="mt-6 flex justify-center space-x-4 flex-wrap">
             <button 
               (click)="toggleDebug()"
               [class]="showDebug ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
               class="px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium mb-2">
               {{ showDebug ? '🐛 Hide Debug' : '🐛 Show Debug' }}
             </button>
             <button 
               *ngIf="showDebug" 
               (click)="clearDebugLogs()"
               class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium mb-2">
               Clear Logs
             </button>
             <button 
               *ngIf="showDebug" 
               (click)="testAuthentication()"
               class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium mb-2">
               🔐 Test Auth
             </button>
             <button 
               *ngIf="showDebug" 
               (click)="testApiConnection()"
               class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium mb-2">
               🌐 Test API
             </button>
           </div>
        </div>
        
        <!-- Debug Panel -->
        <div *ngIf="showDebug" class="mb-8 bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm max-h-96 overflow-y-auto">
          <h3 class="text-white font-bold mb-4 text-lg">🐛 Debug Information</h3>
          <div class="space-y-1">
            <div *ngFor="let log of debugLogs" class="whitespace-pre-wrap break-words">
              {{ log }}
            </div>
            <div *ngIf="debugLogs.length === 0" class="text-gray-500 italic">
              No debug logs yet. Logs will appear here when services are loaded.
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-300">Loading services...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <lucide-angular [img]="alertIcon" class="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4"></lucide-angular>
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Services</h3>
          <p class="text-red-600 dark:text-red-300 mb-4">{{ error }}</p>
          <button 
            (click)="loadServices()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>

        <!-- No Services State -->
        <div *ngIf="!loading && !error && services.length === 0" class="text-center py-12">
          <lucide-angular [img]="shieldIcon" class="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"></lucide-angular>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Services Available</h3>
          <p class="text-gray-600 dark:text-gray-400">
            No enabled services are currently available for your account.
          </p>
        </div>

        <!-- Services Grid -->
        <div *ngIf="!loading && !error && services.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            *ngFor="let service of services; trackBy: trackByService" 
            class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
            [class.opacity-75]="isSSOLoading(service.clientId)"
            [class.pointer-events-none]="isSSOLoading(service.clientId)"
            tabindex="0"
            (keydown.enter)="onServiceClick(service)"
            (click)="onServiceClick(service)"
          >
            <!-- Service Card Header -->
            <div class="p-6 pb-4">
              <div class="flex items-center justify-between mb-4">
                <div class="relative w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300"
                     [class]="getServiceIconBackgroundClass(service)">
                  <lucide-angular 
                    *ngIf="!isSSOLoading(service.clientId)"
                    [img]="getServiceIcon(service)" 
                    class="h-6 w-6 transition-colors duration-300"
                    [class]="getServiceIconColorClass(service)"
                  ></lucide-angular>
                  <div *ngIf="isSSOLoading(service.clientId)" class="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  
                  <!-- Status Indicator -->
                  <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white" 
                       [class]="getStatusIndicatorClass(service)"
                       [title]="getStatusText(service)">
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <lucide-angular 
                    *ngIf="!isSSOLoading(service.clientId)"
                    [img]="checkCircleIcon" 
                    class="h-4 w-4 text-green-600 dark:text-green-400"
                  ></lucide-angular>
                  <div *ngIf="isSSOLoading(service.clientId)" class="h-4 w-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300"
                    [class]="getServiceStatusClass(service)"
                  >
                    {{ getServiceStatusText(service) }}
                  </span>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {{ service.clientId }}
              </h3>
              
              <p *ngIf="service.name && service.name !== service.clientId && !isSSOLoading(service.clientId)" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                {{ service.name }}
              </p>
              
              <p *ngIf="isSSOLoading(service.clientId)" class="text-sm text-blue-600 dark:text-blue-400 leading-relaxed mb-2 animate-pulse">
                🔐 Connecting via SSO...
              </p>
              
              <p *ngIf="service.baseUrl && !isSSOLoading(service.clientId)" class="text-xs text-gray-500 dark:text-gray-500 truncate">
                {{ service.baseUrl }}
              </p>
              
              <p *ngIf="isSSOLoading(service.clientId)" class="text-xs text-yellow-600 dark:text-yellow-400 truncate">
                ⏳ Please wait...
              </p>
            </div>

            <!-- Service Card Footer -->
            <div class="px-6 pb-6">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  <span *ngIf="!isSSOLoading(service.clientId)">
                    {{ service.clientId === 'ums' ? 'Internal Service' : 'Direct Access Enabled' }}
                  </span>
                  <span *ngIf="isSSOLoading(service.clientId)" class="text-blue-600 dark:text-blue-400">
                    🔐 Authenticating...
                  </span>
                </span>
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors duration-300">
                  <lucide-angular 
                    *ngIf="!isSSOLoading(service.clientId)"
                    [img]="externalLinkIcon" 
                    class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                  ></lucide-angular>
                  <div *ngIf="isSSOLoading(service.clientId)" class="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <!-- SSO Loading Overlay -->
            <div *ngIf="isSSOLoading(service.clientId)" class="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
              <div class="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg border border-blue-200 dark:border-blue-700">
                <div class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">Connecting...</span>
                </div>
              </div>
            </div>
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
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ services.length }}</p>
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
export class ServicesDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authApiService = inject(AuthApiService);
  private authService = inject(AuthService);

  services: PermittedService[] = [];
  loading = true;
  error: string | null = null;
  retryCount = 0;
  maxRetries = 3;
  retryDelay = 1000; // Start with 1 second
  baseUrl = appConfig.api.baseUrl;
  debugLogs: string[] = [];
  showDebug = false;
  isRetrying = false;
  
  // Lucide icons
  gridIcon = Grid3X3;
  usersIcon = Users;
  shieldIcon = Shield;
  externalLinkIcon = ExternalLink;
  checkCircleIcon = CheckCircle;
  alertIcon = AlertCircle;
  homeIcon = Home;
  databaseIcon = Database;
  settingsIcon = Settings;
  cloudIcon = Cloud;
  lockIcon = Lock;
  globeIcon = Globe;
  serverIcon = Server;
  zapIcon = Zap;
  fileTextIcon = FileText;
  mailIcon = Mail;
  calendarIcon = Calendar;
  barChartIcon = BarChart3;



  ngOnInit(): void {
    this.addDebugLog('=== Services Dashboard Debug Info ===');
    this.addDebugLog(`Authentication status: ${this.authApiService.isAuthenticated()}`);
    this.addDebugLog(`Access token exists: ${!!this.authApiService.getAccessToken()}`);
    this.addDebugLog(`Token expired: ${this.authApiService.isTokenExpired()}`);
    this.addDebugLog(`Authorization header: ${this.authApiService.getAuthorizationHeader()}`);
    this.addDebugLog(`API base URL: ${this.baseUrl}`);
    this.addDebugLog('=====================================');
    
    this.loadServices();
  }

  ngOnDestroy(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  addDebugLog(message: string) {
    this.debugLogs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    console.log(message);
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }

  clearDebugLogs() {
    this.debugLogs = [];
  }

  testApiConnection() {
    this.addDebugLog('=== Testing API Connection ===');
    this.addDebugLog(`Testing endpoint: ${this.baseUrl}/api/services/permitted-services`);
    
    // Test basic connectivity first
    this.authApiService.getPermittedServices().subscribe({
      next: (response) => {
        this.addDebugLog('✅ API call successful!');
        this.addDebugLog(`Response received: ${JSON.stringify(response)}`);
      },
      error: (error: any) => {
        this.addDebugLog('❌ API call failed!');
        this.addDebugLog(`Error: ${error.message}`);
        this.addDebugLog(`Status: ${error.status}`);
        this.addDebugLog(`URL: ${error.url}`);
      }
    });
  }

  /**
   * Track SSO loading states for each service
   */
  private ssoLoadingStates: { [clientId: string]: boolean } = {};
  private serviceStatusMap = new Map<string, 'online' | 'offline' | 'checking' | 'unknown'>();
  private statusCheckInterval?: number;
  
  /**
   * Check if SSO is loading for a specific service
   */
  isSSOLoading(clientId: string): boolean {
    return this.ssoLoadingStates[clientId] || false;
  }
  
  /**
   * Set SSO loading state for a service
   */
  private setSSOLoading(clientId: string, loading: boolean): void {
    this.ssoLoadingStates[clientId] = loading;
  }
  
  /**
   * Enhanced SSO token handling with better error management
   */
  private handleSSORedirect(service: PermittedService): void {
    this.setSSOLoading(service.clientId, true);
    this.addDebugLog(`🔐 Requesting SSO token for ${service.name} (${service.clientId})`);
    
    const startTime = Date.now();
    
    this.authApiService.getSsoToken({ clientId: service.clientId }).subscribe({
      next: (tokenResponse: any) => {
        const duration = Date.now() - startTime;
        this.addDebugLog(`✅ SSO token received for ${service.clientId} in ${duration}ms: ${JSON.stringify(tokenResponse)}`);
        
        this.setSSOLoading(service.clientId, false);
        
        // Enhanced token handling
        if (tokenResponse && tokenResponse.token) {
          // If we have a proper token response, construct SSO URL
          const ssoUrl = this.constructSSOUrl(service, tokenResponse.token);
          this.addDebugLog(`🚀 Opening SSO URL: ${ssoUrl}`);
          window.location.href = ssoUrl;
        } else if (tokenResponse && tokenResponse.redirectUrl) {
          // If we have a redirect URL, use it directly
          this.addDebugLog(`🔗 Using redirect URL: ${tokenResponse.redirectUrl}`);
          window.location.href = tokenResponse.redirectUrl;
        } else {
          // Fallback to base URL
          this.addDebugLog(`⚠️ No token or redirect URL, falling back to base URL`);
          this.openServiceDirectly(service);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        this.setSSOLoading(service.clientId, false);
        
        this.addDebugLog(`❌ SSO token request failed for ${service.clientId} after ${duration}ms: ${JSON.stringify(error)}`);
        
        // Enhanced error handling for SSO failures
        if (error.status === 401) {
          this.addDebugLog(`🔒 Authentication required for SSO - redirecting to login`);
          // Could redirect to login or show auth modal
          this.handleAuthenticationRequired(service);
        } else if (error.status === 403) {
          this.addDebugLog(`🚫 Access denied for ${service.name}`);
          this.showServiceAccessDenied(service);
        } else if (error.status === 404) {
          this.addDebugLog(`🔍 SSO endpoint not found for ${service.name} - opening directly`);
          this.openServiceDirectly(service);
        } else {
          // Network or server errors - try direct access
          this.addDebugLog(`🌐 SSO service unavailable - attempting direct access to ${service.name}`);
          this.openServiceDirectly(service);
        }
      }
    });
  }
  
  /**
    * Construct SSO URL with token
    */
   private constructSSOUrl(service: PermittedService, token: string): string {
     const baseUrl = service.baseUrl.endsWith('/') ? service.baseUrl.slice(0, -1) : service.baseUrl;
     
     // Different SSO URL patterns based on service configuration
     // Use default SSO path since ssoPath is not available in PermittedService
     const ssoPath = '/sso';
     return `${baseUrl}${ssoPath}?token=${encodeURIComponent(token)}`;
     
     // Default SSO pattern - append token parameter
     return `${baseUrl}?token=${encodeURIComponent(token)}`;
   }
  
  /**
   * Open service directly without SSO
   */
  private openServiceDirectly(service: PermittedService): void {
    if (service.baseUrl) {
      this.addDebugLog(`🔗 Opening ${service.name} directly: ${service.baseUrl}`);
      window.open(service.baseUrl, '_blank');
    } else {
      this.addDebugLog(`❌ No URL available for ${service.name}`);
      this.showServiceUnavailable(service);
    }
  }
  
  /**
   * Handle authentication required scenario
   */
  private handleAuthenticationRequired(service: PermittedService): void {
    // Could implement login modal or redirect to auth
    alert(`Authentication required to access ${service.name}. Please log in and try again.`);
  }
  
  /**
   * Show access denied message
   */
  private showServiceAccessDenied(service: PermittedService): void {
    alert(`Access denied to ${service.name}. Please contact your administrator for access.`);
  }
  
  /**
   * Show service unavailable message
   */
  private showServiceUnavailable(service: PermittedService): void {
    alert(`${service.name} is currently unavailable. Please try again later or contact support.`);
  }
  
  /**
   * Get service status CSS class based on current state
   */
  getServiceStatusClass(service: PermittedService): string {
    if (this.isSSOLoading(service.clientId)) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    }
    
    if (service.clientId === 'ums') {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
    
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  }
  
  /**
   * Get service status text based on current state
   */
  getServiceStatusText(service: PermittedService): string {
    if (this.isSSOLoading(service.clientId)) {
      return 'Connecting';
    }
    
    if (service.clientId === 'ums') {
      return 'Internal';
    }
    
    return 'Enabled';
  }
  
  /**
   * Get dynamic service icon based on service type and clientId
   */
  getServiceIcon(service: PermittedService): any {
    const clientId = service.clientId?.toLowerCase() || '';
    const serviceName = service.name?.toLowerCase() || '';
    
    // UMS service gets home icon
    if (clientId === 'ums') {
      return this.homeIcon;
    }
    
    // Icon mapping based on common service patterns
    const iconMap: { [key: string]: any } = {
      // Authentication & Security
      'auth': this.lockIcon,
      'sso': this.lockIcon,
      'keycloak': this.lockIcon,
      'oauth': this.lockIcon,
      'security': this.shieldIcon,
      
      // Database & Storage
      'db': this.databaseIcon,
      'database': this.databaseIcon,
      'postgres': this.databaseIcon,
      'mysql': this.databaseIcon,
      'mongo': this.databaseIcon,
      'redis': this.databaseIcon,
      'storage': this.databaseIcon,
      
      // Cloud & Infrastructure
      'cloud': this.cloudIcon,
      'aws': this.cloudIcon,
      'azure': this.cloudIcon,
      'gcp': this.cloudIcon,
      'docker': this.serverIcon,
      'kubernetes': this.serverIcon,
      'k8s': this.serverIcon,
      'server': this.serverIcon,
      'api': this.serverIcon,
      
      // Communication
      'mail': this.mailIcon,
      'email': this.mailIcon,
      'smtp': this.mailIcon,
      'notification': this.mailIcon,
      'chat': this.mailIcon,
      'messaging': this.mailIcon,
      
      // Analytics & Monitoring
      'analytics': this.barChartIcon,
      'metrics': this.barChartIcon,
      'monitoring': this.barChartIcon,
      'grafana': this.barChartIcon,
      'prometheus': this.barChartIcon,
      'kibana': this.barChartIcon,
      'dashboard': this.barChartIcon,
      
      // Productivity
      'calendar': this.calendarIcon,
      'schedule': this.calendarIcon,
      'booking': this.calendarIcon,
      'docs': this.fileTextIcon,
      'document': this.fileTextIcon,
      'wiki': this.fileTextIcon,
      'cms': this.fileTextIcon,
      
      // Configuration
      'config': this.settingsIcon,
      'settings': this.settingsIcon,
      'admin': this.settingsIcon,
      'management': this.settingsIcon,
      
      // Performance & Speed
      'cache': this.zapIcon,
      'cdn': this.zapIcon,
      'performance': this.zapIcon,
      'speed': this.zapIcon,
      
      // Web & Global
      'web': this.globeIcon,
      'website': this.globeIcon,
      'portal': this.globeIcon,
      'public': this.globeIcon
    };
    
    // Check clientId first
    for (const [pattern, icon] of Object.entries(iconMap)) {
      if (clientId.includes(pattern)) {
        return icon;
      }
    }
    
    // Check service name
    for (const [pattern, icon] of Object.entries(iconMap)) {
      if (serviceName.includes(pattern)) {
        return icon;
      }
    }
    
    // Default to external link icon for unknown services
    return this.externalLinkIcon;
  }
  
  /**
   * Get service icon background color class
   */
  getServiceIconBackgroundClass(service: PermittedService): string {
    const clientId = service.clientId?.toLowerCase() || '';
    
    // UMS gets blue background
    if (clientId === 'ums') {
      return 'bg-blue-100 dark:bg-blue-900';
    }
    
    // Color mapping based on service type
    const colorMap: { [key: string]: string } = {
      // Security - Red
      'auth': 'bg-red-100 dark:bg-red-900',
      'sso': 'bg-red-100 dark:bg-red-900',
      'security': 'bg-red-100 dark:bg-red-900',
      'keycloak': 'bg-red-100 dark:bg-red-900',
      
      // Database - Purple
      'db': 'bg-purple-100 dark:bg-purple-900',
      'database': 'bg-purple-100 dark:bg-purple-900',
      'postgres': 'bg-purple-100 dark:bg-purple-900',
      'mysql': 'bg-purple-100 dark:bg-purple-900',
      'mongo': 'bg-purple-100 dark:bg-purple-900',
      'redis': 'bg-purple-100 dark:bg-purple-900',
      
      // Cloud - Sky Blue
      'cloud': 'bg-sky-100 dark:bg-sky-900',
      'aws': 'bg-sky-100 dark:bg-sky-900',
      'azure': 'bg-sky-100 dark:bg-sky-900',
      'gcp': 'bg-sky-100 dark:bg-sky-900',
      
      // Infrastructure - Gray
      'server': 'bg-gray-100 dark:bg-gray-900',
      'api': 'bg-gray-100 dark:bg-gray-900',
      'docker': 'bg-gray-100 dark:bg-gray-900',
      'kubernetes': 'bg-gray-100 dark:bg-gray-900',
      
      // Communication - Green
      'mail': 'bg-green-100 dark:bg-green-900',
      'email': 'bg-green-100 dark:bg-green-900',
      'chat': 'bg-green-100 dark:bg-green-900',
      'messaging': 'bg-green-100 dark:bg-green-900',
      
      // Analytics - Orange
      'analytics': 'bg-orange-100 dark:bg-orange-900',
      'metrics': 'bg-orange-100 dark:bg-orange-900',
      'monitoring': 'bg-orange-100 dark:bg-orange-900',
      'dashboard': 'bg-orange-100 dark:bg-orange-900',
      
      // Productivity - Indigo
      'calendar': 'bg-indigo-100 dark:bg-indigo-900',
      'docs': 'bg-indigo-100 dark:bg-indigo-900',
      'wiki': 'bg-indigo-100 dark:bg-indigo-900',
      
      // Performance - Yellow
      'cache': 'bg-yellow-100 dark:bg-yellow-900',
      'cdn': 'bg-yellow-100 dark:bg-yellow-900',
      'performance': 'bg-yellow-100 dark:bg-yellow-900',
      
      // Web - Teal
      'web': 'bg-teal-100 dark:bg-teal-900',
      'website': 'bg-teal-100 dark:bg-teal-900',
      'portal': 'bg-teal-100 dark:bg-teal-900'
    };
    
    // Check for pattern matches
    for (const [pattern, colorClass] of Object.entries(colorMap)) {
      if (clientId.includes(pattern)) {
        return colorClass;
      }
    }
    
    // Default to blue for unknown services
    return 'bg-blue-100 dark:bg-blue-900';
  }
  
  /**
   * Get service icon color class
   */
  getServiceIconColorClass(service: PermittedService): string {
    const clientId = service.clientId?.toLowerCase() || '';
    
    // UMS gets blue color
    if (clientId === 'ums') {
      return 'text-blue-600 dark:text-blue-400';
    }
    
    // Color mapping based on service type
    const colorMap: { [key: string]: string } = {
      // Security - Red
      'auth': 'text-red-600 dark:text-red-400',
      'sso': 'text-red-600 dark:text-red-400',
      'security': 'text-red-600 dark:text-red-400',
      'keycloak': 'text-red-600 dark:text-red-400',
      
      // Database - Purple
      'db': 'text-purple-600 dark:text-purple-400',
      'database': 'text-purple-600 dark:text-purple-400',
      'postgres': 'text-purple-600 dark:text-purple-400',
      'mysql': 'text-purple-600 dark:text-purple-400',
      'mongo': 'text-purple-600 dark:text-purple-400',
      'redis': 'text-purple-600 dark:text-purple-400',
      
      // Cloud - Sky Blue
      'cloud': 'text-sky-600 dark:text-sky-400',
      'aws': 'text-sky-600 dark:text-sky-400',
      'azure': 'text-sky-600 dark:text-sky-400',
      'gcp': 'text-sky-600 dark:text-sky-400',
      
      // Infrastructure - Gray
      'server': 'text-gray-600 dark:text-gray-400',
      'api': 'text-gray-600 dark:text-gray-400',
      'docker': 'text-gray-600 dark:text-gray-400',
      'kubernetes': 'text-gray-600 dark:text-gray-400',
      
      // Communication - Green
      'mail': 'text-green-600 dark:text-green-400',
      'email': 'text-green-600 dark:text-green-400',
      'chat': 'text-green-600 dark:text-green-400',
      'messaging': 'text-green-600 dark:text-green-400',
      
      // Analytics - Orange
      'analytics': 'text-orange-600 dark:text-orange-400',
      'metrics': 'text-orange-600 dark:text-orange-400',
      'monitoring': 'text-orange-600 dark:text-orange-400',
      'dashboard': 'text-orange-600 dark:text-orange-400',
      
      // Productivity - Indigo
      'calendar': 'text-indigo-600 dark:text-indigo-400',
      'docs': 'text-indigo-600 dark:text-indigo-400',
      'wiki': 'text-indigo-600 dark:text-indigo-400',
      
      // Performance - Yellow
      'cache': 'text-yellow-600 dark:text-yellow-400',
      'cdn': 'text-yellow-600 dark:text-yellow-400',
      'performance': 'text-yellow-600 dark:text-yellow-400',
      
      // Web - Teal
      'web': 'text-teal-600 dark:text-teal-400',
      'website': 'text-teal-600 dark:text-teal-400',
      'portal': 'text-teal-600 dark:text-teal-400'
    };
    
    // Check for pattern matches
    for (const [pattern, colorClass] of Object.entries(colorMap)) {
      if (clientId.includes(pattern)) {
        return colorClass;
      }
    }
    
    // Default to blue for unknown services
    return 'text-blue-600 dark:text-blue-400';
  }

  /**
   * Initialize service status checking
   */
  private initializeStatusChecking(): void {
    // Check status immediately
    this.checkAllServicesStatus();
    
    // Set up periodic status checking (every 30 seconds)
    this.statusCheckInterval = window.setInterval(() => {
      this.checkAllServicesStatus();
    }, 30000);
  }

  /**
   * Check status of all services
   */
  private async checkAllServicesStatus(): Promise<void> {
    if (!this.services || this.services.length === 0) return;

    const statusPromises = this.services.map(service => this.checkServiceStatus(service));
    await Promise.allSettled(statusPromises);
  }

  /**
   * Check individual service status
   */
  private async checkServiceStatus(service: PermittedService): Promise<void> {
    const clientId = service.clientId;
    this.serviceStatusMap.set(clientId, 'checking');

    try {
      // Create a simple health check URL
      const healthCheckUrl = this.constructHealthCheckUrl(service);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Handle CORS issues
      });

      clearTimeout(timeoutId);
      
      // For no-cors mode, we can't read the response, but if no error is thrown, service is likely online
      this.serviceStatusMap.set(clientId, 'online');
    } catch (error) {
      // Service is offline or unreachable
      this.serviceStatusMap.set(clientId, 'offline');
    }
  }

  /**
   * Construct health check URL for service
   */
  private constructHealthCheckUrl(service: PermittedService): string {
    const baseUrl = service.baseUrl;
    if (!baseUrl) return '';

    // Try common health check endpoints
    const healthPaths = ['/health', '/api/health', '/status', '/ping', '/'];
    return `${baseUrl}${healthPaths[0]}`; // Use the first one as default
  }

  /**
   * Get service status
   */
  getServiceStatus(service: PermittedService): 'online' | 'offline' | 'checking' | 'unknown' {
    return this.serviceStatusMap.get(service.clientId) || 'unknown';
  }

  /**
   * Get status indicator class
   */
  getStatusIndicatorClass(service: PermittedService): string {
    const status = this.getServiceStatus(service);
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  }

  /**
   * Get status text
   */
  getStatusText(service: PermittedService): string {
    const status = this.getServiceStatus(service);
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  }

  onServiceClick(service: PermittedService): void {
    this.addDebugLog(`🎯 Service clicked: ${service.name || service.clientId} (${service.clientId})`);
    
    // Prevent multiple clicks while SSO is loading
    if (this.isSSOLoading(service.clientId)) {
      this.addDebugLog(`⏳ SSO already in progress for ${service.name || service.clientId}`);
      return;
    }
    
    // Handle UMS service - navigate to dashboard
    if (service.clientId === 'ums') {
      this.addDebugLog('🏠 UMS service clicked - navigating to dashboard');
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Only proceed if service has a valid clientId string
    if (!service.clientId || service.clientId === '') {
      this.addDebugLog(`Service ${service.clientId || 'unknown'} does not have valid clientId - skipping SSO flow`);
      return;
    }
    
    // For external services, use enhanced SSO flow
    if (service.baseUrl) {
      this.handleSSORedirect(service);
    } else {
      this.addDebugLog(`❌ No baseUrl configured for service: ${service.name || service.clientId}`);
      this.showServiceUnavailable(service);
    }
  }

  testAuthentication() {
    this.addDebugLog('=== Testing Authentication ===');
    const tokenInfo = this.authApiService.getTokenInfo();
    this.addDebugLog(`Token info: ${JSON.stringify(tokenInfo, null, 2)}`);
    
    if (!tokenInfo.isAuthenticated) {
      this.addDebugLog('❌ Not authenticated - need to login first');
    } else if (tokenInfo.isExpired) {
      this.addDebugLog('⚠️ Token is expired - need to refresh');
    } else {
      this.addDebugLog('✅ Authentication looks good');
    }
  }

  private getUMSService(): PermittedService {
    return {
      id: 'ums-internal',
      clientId: 'ums',
      name: 'User Management System',
      enabled: true,
      protocol: 'openid-connect',
      publicClient: false,
      serviceAccountsEnabled: false,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      attributes: {
        'created-by': 'internal-system',
        'internal-service': 'true'
      },
      baseUrl: window.location.origin + '/dashboard',
      description: 'Internal user management and authentication system',
      icon: 'users',
      category: 'internal'
    };
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(error: any): string {
    if (!error) return 'Unknown error occurred';
    
    // Network errors
    if (error.status === 0 || error.name === 'NetworkError') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    // Authentication errors
    if (error.status === 401) {
      return 'Authentication failed. Please log in again.';
    }
    
    // Authorization errors
    if (error.status === 403) {
      return 'Access denied. You do not have permission to view services.';
    }
    
    // Not found errors
    if (error.status === 404) {
      return 'Services endpoint not found. Please contact system administrator.';
    }
    
    // Server errors
    if (error.status >= 500) {
      return 'Server error occurred. Please try again later or contact support.';
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }
    
    // Default error message
    return error.message || error.error?.message || 'Failed to load services. Please try again.';
  }

  /**
   * Retry loading services with exponential backoff
   */
  private retryLoadServices(): void {
    if (this.retryCount >= this.maxRetries) {
      this.addDebugLog(`Max retries (${this.maxRetries}) reached. Stopping retry attempts.`);
      return;
    }

    this.retryCount++;
    this.isRetrying = true;
    const currentDelay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
    
    this.addDebugLog(`Retrying in ${currentDelay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
    
    setTimeout(() => {
      this.isRetrying = false;
      this.loadServicesInternal();
    }, currentDelay);
  }

  /**
   * Internal method to load services
   */
  private loadServicesInternal(): void {
    this.loading = true;
    this.error = null;
    
    this.addDebugLog(`Loading permitted services from API... (attempt ${this.retryCount + 1})`);
    this.addDebugLog('Loading all permitted services for current user');
    
    this.authApiService.getPermittedServices().subscribe({
      next: (response) => {
        // Reset retry count on success
        this.retryCount = 0;
        
        const services = response.services || [];
        this.addDebugLog(`✅ API call successful - services: ${JSON.stringify(services)}`);
        this.addDebugLog(`Number of services received: ${services.length}`);
        
        // Log each service for debugging
        services.forEach((service, index) => {
          this.addDebugLog(`Service ${index + 1}: ${JSON.stringify({
            clientId: service.clientId,
            name: service.name,
            baseUrl: service.baseUrl,
            directAccessGrantsEnabled: service.directAccessGrantsEnabled
          })}`);
        });
        
        // Filter services with valid clientId (exclude UMS as it's added separately)
        const filteredServices = services.filter(service => 
          service.clientId && 
          service.clientId !== '' && 
          service.clientId !== 'ums'
        );
        
        this.addDebugLog(`Filtered permitted services: ${filteredServices.length}`);
        
        // Always include UMS as the first service (parent service)
        const umsService = this.getUMSService();
        this.services = [umsService, ...filteredServices];
        
        this.addDebugLog(`Final services array: ${JSON.stringify(this.services.map(s => ({ clientId: s.clientId, name: s.name })))}`);
        
        this.loading = false;
        
        // Initialize status checking after services are loaded
        this.initializeStatusChecking();
      },
      error: (error: any) => {
        this.addDebugLog(`❌ API call failed: ${JSON.stringify(error)}`);
        this.addDebugLog(`Error details: ${JSON.stringify({
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          retryCount: this.retryCount
        })}`);
        
        const errorMessage = this.getErrorMessage(error);
        
        // Determine if we should retry
        const shouldRetry = this.retryCount < this.maxRetries && 
                           error.status !== 401 && // Don't retry auth errors
                           error.status !== 403 && // Don't retry permission errors
                           error.status !== 404;   // Don't retry not found errors
        
        if (shouldRetry) {
          this.addDebugLog(`Will retry loading services. Error: ${errorMessage}`);
          this.error = `${errorMessage} Retrying... (${this.retryCount}/${this.maxRetries})`;
          this.loading = false;
          this.retryLoadServices();
        } else {
          // Final failure - show UMS service and error
          this.services = [this.getUMSService()];
          this.error = errorMessage;
          this.loading = false;
          this.addDebugLog(`Final error (no more retries): ${errorMessage}`);
        }
      }
    });
  }

  loadServices(): void {
    // Reset retry state
    this.retryCount = 0;
    this.isRetrying = false;
    this.loadServicesInternal();
  }

  trackByService(index: number, service: PermittedService): string {
    return service.clientId;
  }

  navigateToService(service: PermittedService): void {
    if (service.clientId === 'ums') {
      // Navigate to internal UMS dashboard
      this.router.navigate(['/dashboard']);
      return;
    }

    if (service.baseUrl) {
      // Check if this is a token-based URL (contains token parameter placeholder)
      if (service.baseUrl.includes('?token=') && service.baseUrl.endsWith('?token=')) {
        // For token-based URLs, we need to get SSO token first
        // This functionality would need to be implemented with proper SSO service
        console.warn('Token-based URL detected but SSO service not available:', service.baseUrl);
        // Fallback: try to open base URL without token
        const baseUrlWithoutToken = service.baseUrl.split('?token=')[0];
        window.open(baseUrlWithoutToken, '_blank');
      } else {
        // Regular URL, open directly
        window.open(service.baseUrl, '_blank');
      }
    }
  }



  getInternalServicesCount(): number {
    return this.services.filter(service => service.baseUrl?.includes(window.location.hostname)).length;
  }

  getExternalServicesCount(): number {
    return this.services.filter(service => !service.baseUrl?.includes(window.location.hostname)).length;
  }
}