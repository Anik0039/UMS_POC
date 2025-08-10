import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, BarChart3, TrendingUp, Activity } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">
          Welcome back! Here's what's happening with your users.
        </p>
      </div>

      <!-- Stats cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Total Users</h3>
            <lucide-angular [img]="usersIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">1,234</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+12%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Active Users</h3>
            <lucide-angular [img]="activityIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">892</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+8%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Growth Rate</h3>
            <lucide-angular [img]="trendingUpIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">23.5%</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+2.1%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Revenue</h3>
            <lucide-angular [img]="barChartIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">$45,231</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+15%</span> from last month
            </p>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div class="col-span-4">
          <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Recent Users</h3>
              <button class="text-sm text-primary hover:underline">View all</button>
            </div>
            <div class="mt-4 space-y-4">
              <div *ngFor="let user of recentUsers" class="flex items-center space-x-4">
                <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span class="text-sm font-medium">{{ user.initials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ user.name }}</p>
                  <p class="text-sm text-muted-foreground truncate">{{ user.email }}</p>
                </div>
                <div class="text-sm text-muted-foreground">{{ user.joinedDate }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-3">
          <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <button class="w-full justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Add New User
              </button>
              <button class="w-full justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Generate Report
              </button>
              <button class="w-full justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Export Data
              </button>
              <button class="w-full justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usersIcon = Users;
  activityIcon = Activity;
  trendingUpIcon = TrendingUp;
  barChartIcon = BarChart3;

  recentUsers = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      initials: 'AJ',
      joinedDate: '2 hours ago'
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      initials: 'BS',
      joinedDate: '4 hours ago'
    },
    {
      name: 'Carol Davis',
      email: 'carol@example.com',
      initials: 'CD',
      joinedDate: '1 day ago'
    },
    {
      name: 'David Wilson',
      email: 'david@example.com',
      initials: 'DW',
      joinedDate: '2 days ago'
    },
    {
      name: 'Eva Brown',
      email: 'eva@example.com',
      initials: 'EB',
      joinedDate: '3 days ago'
    }
  ];
}