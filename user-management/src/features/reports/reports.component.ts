import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText, Download, Calendar, Filter } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Reports</h1>
          <p class="text-muted-foreground">
            Generate and download various reports about your users and system.
          </p>
        </div>
        <app-button>
          <lucide-angular [img]="downloadIcon" class="mr-2 h-4 w-4"></lucide-angular>
          Generate Report
        </app-button>
      </div>

      <!-- Filters -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <lucide-angular [img]="calendarIcon" class="h-4 w-4 text-muted-foreground"></lucide-angular>
          <select class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
        <button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <lucide-angular [img]="filterIcon" class="mr-2 h-4 w-4"></lucide-angular>
          More Filters
        </button>
      </div>

      <!-- Reports grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let report of reports" class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <lucide-angular [img]="fileTextIcon" class="h-5 w-5 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="font-semibold">{{ report.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ report.description }}</p>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Last generated:</span>
              <span>{{ report.lastGenerated }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Records:</span>
              <span>{{ report.recordCount }}</span>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button class="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <lucide-angular [img]="downloadIcon" class="mr-2 h-4 w-4"></lucide-angular>
              Download
            </button>
            <button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  fileTextIcon = FileText;
  downloadIcon = Download;
  calendarIcon = Calendar;
  filterIcon = Filter;

  reports = [
    {
      title: 'User Activity Report',
      description: 'Detailed user engagement and activity metrics',
      lastGenerated: '2 hours ago',
      recordCount: '1,234'
    },
    {
      title: 'Registration Report',
      description: 'New user registrations and trends',
      lastGenerated: '1 day ago',
      recordCount: '456'
    },
    {
      title: 'System Usage Report',
      description: 'Overall system performance and usage statistics',
      lastGenerated: '3 days ago',
      recordCount: '789'
    },
    {
      title: 'Security Report',
      description: 'Login attempts, security events, and alerts',
      lastGenerated: '1 week ago',
      recordCount: '234'
    },
    {
      title: 'Performance Report',
      description: 'Application performance metrics and insights',
      lastGenerated: '2 weeks ago',
      recordCount: '567'
    },
    {
      title: 'Custom Report',
      description: 'User-defined custom report with specific filters',
      lastGenerated: 'Never',
      recordCount: '0'
    }
  ];
}