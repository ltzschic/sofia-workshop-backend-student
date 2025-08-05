using workshop.invoice as inv from '../db/invoice-model';

service InvoiceService {
    entity Invoices as projection on inv.Invoices;
    entity Customers as projection on inv.Customers;
}
