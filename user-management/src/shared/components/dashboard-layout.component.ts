import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="isSidebarOpen" 
        (toggleSidebarEvent)="toggleSidebar()"
      ></app-sidebar>

      <!-- Main content area -->
      <div [ngClass]="{
        'lg:pl-72': isSidebarOpen,
        'lg:pl-0': !isSidebarOpen
      }" class="transition-all duration-300 ease-in-out">
        <!-- Navbar -->
        <app-navbar 
          [pageTitle]="currentPageTitle"
          (toggleSidebarEvent)="toggleSidebar()"
        ></app-navbar>

        <!-- Page content -->
        <main class="py-6">
          <div [ngClass]="{
            'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:ml-4': isSidebarOpen,
            'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8': !isSidebarOpen
          }" class="transition-all duration-300 ease-in-out">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = false;
  currentPageTitle = 'Dashboard';

  ngOnInit() {
    // Set initial sidebar state based on screen size
    this.checkScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private checkScreenSize() {
    // Auto-open sidebar on large screens, close on mobile
    if (window.innerWidth >= 1024) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }
}