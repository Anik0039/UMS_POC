import { Component } from '@angular/core';
import { BankingServiceComponent, ServiceData } from './banking-service.component';

@Component({
  selector: 'app-trade-finance',
  standalone: true,
  imports: [BankingServiceComponent],
  template: `<app-banking-service [serviceData]="serviceData"></app-banking-service>`
})
export class TradeFinanceComponent {
  serviceData: ServiceData = {
    title: 'Trade Finance',
    description: 'International trade financing and letter of credit services',
    stats: [
      { label: 'Active LCs', value: '342', icon: 'FileText', color: 'bg-blue-100 text-blue-600' },
      { label: 'Trade Volume', value: '$45.2M', icon: 'DollarSign', color: 'bg-green-100 text-green-600' },
      { label: 'Countries', value: '67', icon: 'Globe', color: 'bg-purple-100 text-purple-600' },
      { label: 'Growth Rate', value: '+12.5%', icon: 'TrendingUp', color: 'bg-yellow-100 text-yellow-600' }
    ],
    activities: [
      { id: '1', description: 'Issued new Letter of Credit for Global Exports Ltd', status: 'Completed', date: '2024-01-15' },
      { id: '2', description: 'Processed Trade Guarantee for International Trade Co', status: 'Processing', date: '2024-01-14' },
      { id: '3', description: 'Completed Documentary Collection for Export Solutions Inc', status: 'Completed', date: '2024-01-13' }
    ],
    tableHeaders: [
      { key: 'client', label: 'Client' },
      { key: 'type', label: 'Trade Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' }
    ],
    tableData: [
      { client: 'Global Exports Ltd', type: 'Letter of Credit', amount: '$250,000', status: 'Active', date: '2024-01-15' },
      { client: 'International Trade Co', type: 'Trade Guarantee', amount: '$180,000', status: 'Processing', date: '2024-01-14' },
      { client: 'Export Solutions Inc', type: 'Documentary Collection', amount: '$95,000', status: 'Completed', date: '2024-01-13' },
      { client: 'Maritime Trading', type: 'Trade Finance', amount: '$320,000', status: 'Pending', date: '2024-01-12' },
      { client: 'Commodity Traders', type: 'Letter of Credit', amount: '$150,000', status: 'Active', date: '2024-01-11' }
    ]
  };
}