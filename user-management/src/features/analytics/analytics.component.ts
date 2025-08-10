import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, BarChart3, TrendingUp, Users, Activity } from 'lucide-angular';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
        <p class="text-muted-foreground">
          View detailed analytics and insights about your users.
        </p>
      </div>

      <!-- Analytics cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Page Views</h3>
            <lucide-angular [img]="barChartIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">45,231</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+20.1%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Unique Visitors</h3>
            <lucide-angular [img]="usersIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">2,350</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+180.1%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Bounce Rate</h3>
            <lucide-angular [img]="trendingUpIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">54.3%</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-red-600">-2.1%</span> from last month
            </p>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium tracking-tight">Session Duration</h3>
            <lucide-angular [img]="activityIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">3m 42s</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+12.5%</span> from last month
            </p>
          </div>
        </div>
      </div>

      <!-- Chart placeholder -->
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="text-lg font-semibold mb-4">User Activity Over Time</h3>
        <div class="h-64 flex items-center justify-center bg-muted/20 rounded-md">
          <div class="text-center">
            <lucide-angular [img]="barChartIcon" class="h-12 w-12 text-muted-foreground mx-auto mb-2"></lucide-angular>
            <p class="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  barChartIcon = BarChart3;
  trendingUpIcon = TrendingUp;
  usersIcon = Users;
  activityIcon = Activity;
}