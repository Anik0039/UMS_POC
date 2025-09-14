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

  

  
  `,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usersIcon = Users;
  activityIcon = Activity;
  trendingUpIcon = TrendingUp;
  barChartIcon = BarChart3;


}