import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, DollarSign, Users, TrendingUp, FileText } from 'lucide-angular';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Loan Management System</h1>
        <p class="text-gray-600">Comprehensive loan processing and management platform</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <lucide-angular [img]="dollarIcon" class="h-6 w-6 text-blue-600"></lucide-angular>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Loans</p>
              <p class="text-2xl font-bold text-gray-900">$2.4M</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <lucide-angular [img]="usersIcon" class="h-6 w-6 text-green-600"></lucide-angular>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Borrowers</p>
              <p class="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <lucide-angular [img]="trendingIcon" class="h-6 w-6 text-yellow-600"></lucide-angular>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Approval Rate</p>
              <p class="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <lucide-angular [img]="fileIcon" class="h-6 w-6 text-purple-600"></lucide-angular>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Applications</p>
              <p class="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Loans Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Loan Applications</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let loan of recentLoans">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ loan.applicant }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ loan.type }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ loan.amount }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(loan.status)">{{ loan.status }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ loan.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LoanManagementComponent {
  dollarIcon = DollarSign;
  usersIcon = Users;
  trendingIcon = TrendingUp;
  fileIcon = FileText;

  recentLoans = [
    { applicant: 'John Smith', type: 'Personal Loan', amount: '$25,000', status: 'Approved', date: '2024-01-15' },
    { applicant: 'Sarah Johnson', type: 'Home Loan', amount: '$350,000', status: 'Under Review', date: '2024-01-14' },
    { applicant: 'Mike Davis', type: 'Auto Loan', amount: '$45,000', status: 'Pending', date: '2024-01-13' },
    { applicant: 'Emily Brown', type: 'Business Loan', amount: '$100,000', status: 'Approved', date: '2024-01-12' },
    { applicant: 'David Wilson', type: 'Personal Loan', amount: '$15,000', status: 'Rejected', date: '2024-01-11' }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
      case 'Under Review':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }
}