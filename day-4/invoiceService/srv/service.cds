using { invoiceservice } from '../db/schema';

// Service-Namen ändern um Konflikt zu vermeiden
service InvoiceServiceAPI {
  entity Invoices as projection on invoiceservice.Invoices;
  entity CustomerSummary as projection on invoiceservice.CustomerSummary;
  
  action getCustomerAnalytics(region: String) returns array of CustomerSummary;
}

