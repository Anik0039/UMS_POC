import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, icons } from 'lucide-angular';

export interface ServiceData {
  title: string;
  description: string;
  stats: Array<{
    label: string;
    value: string;
    icon: string;
    color: string;
  }>;
  tableData: Array<{
    [key: string]: string;
  }>;
  tableHeaders: Array<{
    key: string;
    label: string;
  }>;
  activities: Array<{
    id: string;
    description: string;
    amount?: string;
    status: string;
    date: string;
    [key: string]: string | undefined;
  }>;
}

@Component({
  selector: 'app-banking-service',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ serviceData.title }}</h1>
        <p class="text-gray-600">{{ serviceData.description }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div *ngFor="let stat of serviceData.stats" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div [class]="'p-2 rounded-lg ' + stat.color">
              <lucide-angular [img]="getIcon(stat.icon)" class="h-6 w-6"></lucide-angular>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th *ngFor="let header of serviceData.tableHeaders" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let row of serviceData.tableData">
                <td *ngFor="let header of serviceData.tableHeaders" 
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span *ngIf="header.key === 'status'" [class]="getStatusClass(row[header.key])">
                    {{ row[header.key] }}
                  </span>
                  <span *ngIf="header.key !== 'status'">
                    {{ row[header.key] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BankingServiceComponent {
  @Input() serviceData!: ServiceData;

  getIcon(iconName: string) {
    return icons[iconName as keyof typeof icons] ?? icons['CircleAlert'];
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
      case 'under review':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'rejected':
      case 'failed':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
      case 'new':
      case 'draft':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800';
      default:
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }
}