import { Component } from '@angular/core';
import { BankingServiceComponent, ServiceData } from './banking-service.component';


@Component({
  selector: 'app-digital-banking',
  standalone: true,
  imports: [BankingServiceComponent],
  template: `<app-banking-service [serviceData]="serviceData"></app-banking-service>`
})
export class DigitalBankingComponent {
  serviceData: ServiceData = {
    title: 'Digital Banking',
    description: 'Online banking platform and digital financial services',
    stats: [
      { label: 'Active Users', value: '45,678', icon: 'Users', color: 'bg-blue-100 text-blue-600' },
      { label: 'Digital Transactions', value: '$12.5M', icon: 'DollarSign', color: 'bg-green-100 text-green-600' },
      { label: 'Mobile App Rating', value: '4.8/5', icon: 'Building2', color: 'bg-purple-100 text-purple-600' },
      { label: 'User Growth', value: '+25.4%', icon: 'TrendingUp', color: 'bg-yellow-100 text-yellow-600' }
    ],
    activities: [],
    tableHeaders: [
      { key: 'user', label: 'User' },
      { key: 'transaction', label: 'Transaction Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'timestamp', label: 'Timestamp' }
    ],
    tableData: [
      { user: 'john.doe@email.com', transaction: 'Fund Transfer', amount: '$2,500', status: 'Completed', timestamp: '2024-01-15 14:30' },
      { user: 'sarah.smith@email.com', transaction: 'Bill Payment', amount: '$450', status: 'Processing', timestamp: '2024-01-15 14:25' },
      { user: 'mike.johnson@email.com', transaction: 'Mobile Deposit', amount: '$1,200', status: 'Completed', timestamp: '2024-01-15 14:20' },
      { user: 'emma.wilson@email.com', transaction: 'Investment Purchase', amount: '$5,000', status: 'Pending', timestamp: '2024-01-15 14:15' },
      { user: 'david.brown@email.com', transaction: 'Loan Payment', amount: '$850', status: 'Completed', timestamp: '2024-01-15 14:10' }
    ]
  };
}