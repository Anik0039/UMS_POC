import { Component } from '@angular/core';
import { BankingServiceComponent, ServiceData } from './banking-service.component';

@Component({
  selector: 'app-investment-banking',
  standalone: true,
  imports: [BankingServiceComponent],
  template: `<app-banking-service [serviceData]="serviceData"></app-banking-service>`
})
export class InvestmentBankingComponent {
  serviceData: ServiceData = {
    title: 'Investment Banking',
    description: 'Corporate finance, mergers & acquisitions, and capital markets services',
    stats: [
      { label: 'Assets Under Management', value: '$2.8B', icon: 'DollarSign', color: 'bg-green-100 text-green-600' },
      { label: 'Active Deals', value: '28', icon: 'Building2', color: 'bg-blue-100 text-blue-600' },
      { label: 'Portfolio Growth', value: '+18.3%', icon: 'TrendingUp', color: 'bg-purple-100 text-purple-600' },
      { label: 'Institutional Clients', value: '156', icon: 'Users', color: 'bg-yellow-100 text-yellow-600' }
    ],
    activities: [
      { id: '1', name: 'IPO Advisory Session', description: 'Advisory for IPO launch', date: '2024-02-10', status: 'Scheduled' },
      { id: '2', name: 'M&A Due Diligence', description: 'Due diligence for M&A deal', date: '2024-01-22', status: 'Completed' }
    ],
    tableHeaders: [
      { key: 'client', label: 'Client' },
      { key: 'service', label: 'Service Type' },
      { key: 'value', label: 'Deal Value' },
      { key: 'status', label: 'Status' },
      { key: 'completion', label: 'Expected Completion' }
    ],
    tableData: [
      { client: 'TechCorp Industries', service: 'IPO Advisory', value: '$500M', status: 'Active', completion: '2024-03-15' },
      { client: 'Global Manufacturing', service: 'M&A Advisory', value: '$1.2B', status: 'Under Review', completion: '2024-04-20' },
      { client: 'Energy Solutions Ltd', service: 'Debt Financing', value: '$300M', status: 'Completed', completion: '2024-01-10' },
      { client: 'Retail Chain Corp', service: 'Restructuring', value: '$150M', status: 'Processing', completion: '2024-02-28' },
      { client: 'Biotech Innovations', service: 'Private Placement', value: '$75M', status: 'Active', completion: '2024-03-05' }
    ]
  };
}