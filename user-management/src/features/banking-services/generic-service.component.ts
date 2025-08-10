import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankingServiceComponent, ServiceData } from './banking-service.component';


@Component({
  selector: 'app-generic-service',
  standalone: true,
  imports: [BankingServiceComponent],
  template: `<app-banking-service [serviceData]="serviceData"></app-banking-service>`
})
export class GenericServiceComponent implements OnInit {
  private route = inject(ActivatedRoute);

  serviceName: string = '';

  constructor() {}

  ngOnInit() {
    this.serviceName = this.route.snapshot.data['serviceName'] || '';
  }
  
  get serviceData(): ServiceData {
    const serviceConfigs: { [key: string]: ServiceData } = {
      'risk-management': {
        title: 'Risk Management',
        description: 'Comprehensive risk assessment and mitigation strategies',
        stats: [
          { label: 'Risk Assessments', value: '1,234', icon: 'Shield', color: 'bg-red-100 text-red-600' },
          { label: 'Mitigation Plans', value: '567', icon: 'FileText', color: 'bg-blue-100 text-blue-600' },
          { label: 'Risk Score', value: '7.2/10', icon: 'TrendingUp', color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Compliance Rate', value: '98.5%', icon: 'Building2', color: 'bg-green-100 text-green-600' }
        ],
        tableHeaders: [
          { key: 'entity', label: 'Entity' },
          { key: 'riskType', label: 'Risk Type' },
          { key: 'severity', label: 'Severity' },
          { key: 'status', label: 'Status' },
          { key: 'lastReview', label: 'Last Review' }
        ],
        tableData: [
          { entity: 'Corporate Account A', riskType: 'Credit Risk', severity: 'Medium', status: 'Active', lastReview: '2024-01-15' },
          { entity: 'Investment Portfolio B', riskType: 'Market Risk', severity: 'High', status: 'Under Review', lastReview: '2024-01-14' },
          { entity: 'Loan Portfolio C', riskType: 'Operational Risk', severity: 'Low', status: 'Completed', lastReview: '2024-01-13' }
        ],
        activities: []
      },
      'customer-onboarding': {
        title: 'Customer Onboarding',
        description: 'Streamlined customer registration and KYC processes',
        stats: [
          { label: 'New Customers', value: '2,456', icon: 'Users', color: 'bg-blue-100 text-blue-600' },
          { label: 'KYC Completed', value: '2,234', icon: 'FileText', color: 'bg-green-100 text-green-600' },
          { label: 'Approval Rate', value: '91%', icon: 'TrendingUp', color: 'bg-purple-100 text-purple-600' },
          { label: 'Avg. Processing Time', value: '2.3 days', icon: 'Building2', color: 'bg-yellow-100 text-yellow-600' }
        ],
        tableHeaders: [
          { key: 'customer', label: 'Customer' },
          { key: 'accountType', label: 'Account Type' },
          { key: 'kycStatus', label: 'KYC Status' },
          { key: 'status', label: 'Status' },
          { key: 'submissionDate', label: 'Submission Date' }
        ],
        tableData: [
          { customer: 'Alice Johnson', accountType: 'Savings', kycStatus: 'Verified', status: 'Completed', submissionDate: '2024-01-15' },
          { customer: 'Bob Smith', accountType: 'Business', kycStatus: 'Pending', status: 'Processing', submissionDate: '2024-01-14' },
          { customer: 'Carol Davis', accountType: 'Investment', kycStatus: 'Verified', status: 'Active', submissionDate: '2024-01-13' }
        ],
        activities: []
      },
      'compliance': {
        title: 'Compliance Portal',
        description: 'Regulatory compliance monitoring and reporting system',
        stats: [
          { label: 'Compliance Checks', value: '15,678', icon: 'Shield', color: 'bg-green-100 text-green-600' },
          { label: 'Violations', value: '23', icon: 'FileText', color: 'bg-red-100 text-red-600' },
          { label: 'Compliance Score', value: '96.8%', icon: 'TrendingUp', color: 'bg-blue-100 text-blue-600' },
          { label: 'Reports Generated', value: '456', icon: 'Building2', color: 'bg-purple-100 text-purple-600' }
        ],
        tableHeaders: [
          { key: 'regulation', label: 'Regulation' },
          { key: 'department', label: 'Department' },
          { key: 'compliance', label: 'Compliance Level' },
          { key: 'status', label: 'Status' },
          { key: 'nextReview', label: 'Next Review' }
        ],
        tableData: [
          { regulation: 'AML/KYC', department: 'Risk Management', compliance: '98%', status: 'Compliant', nextReview: '2024-02-15' },
          { regulation: 'Basel III', department: 'Capital Management', compliance: '95%', status: 'Under Review', nextReview: '2024-02-20' },
          { regulation: 'GDPR', department: 'Data Protection', compliance: '100%', status: 'Compliant', nextReview: '2024-03-01' }
        ],
        activities: [
          { id: '1', description: 'Reviewed AML/KYC compliance', status: 'Completed', date: '2024-01-10' },
          { id: '2', description: 'Updated GDPR policies', status: 'Completed', date: '2024-01-08' },
          { id: '3', description: 'Filed Basel III report', status: 'Completed', date: '2024-01-05' }
        ]
      }
    };

    return serviceConfigs[this.serviceName] || this.getDefaultServiceData();
  }

  private getDefaultServiceData(): ServiceData {
    return {
      title: this.formatServiceName(this.serviceName),
      description: `Comprehensive ${this.formatServiceName(this.serviceName).toLowerCase()} services and solutions`,
      stats: [
        { label: 'Active Services', value: '1,234', icon: 'Building2', color: 'bg-blue-100 text-blue-600' },
        { label: 'Total Volume', value: '$5.2M', icon: 'DollarSign', color: 'bg-green-100 text-green-600' },
        { label: 'Growth Rate', value: '+15.2%', icon: 'TrendingUp', color: 'bg-purple-100 text-purple-600' },
        { label: 'Customer Satisfaction', value: '94%', icon: 'Users', color: 'bg-yellow-100 text-yellow-600' }
      ],
      tableHeaders: [
        { key: 'item', label: 'Item' },
        { key: 'type', label: 'Type' },
        { key: 'value', label: 'Value' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' }
      ],
      tableData: [
        { item: 'Service Item 1', type: 'Standard', value: '$10,000', status: 'Active', date: '2024-01-15' },
        { item: 'Service Item 2', type: 'Premium', value: '$25,000', status: 'Processing', date: '2024-01-14' },
        { item: 'Service Item 3', type: 'Enterprise', value: '$50,000', status: 'Completed', date: '2024-01-13' }
      ],
      activities: []
    };
  }

  private formatServiceName(serviceName: string): string {
    return serviceName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}