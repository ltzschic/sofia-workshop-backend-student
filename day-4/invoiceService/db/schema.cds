namespace invoiceservice;

entity Invoices {
  key ID          : UUID;
  customerID      : String(10);
  customerName    : String(100);
  amount          : Decimal(10,2);
  date           : Date;
  status         : String(20);
  region         : String(50);
}

// Neue Entity für aggregierte Daten
entity CustomerSummary {
  key customerID     : String(10);
  customerName       : String(100);
  totalAmount        : Decimal(15,2);
  invoiceCount       : Integer;
  averageAmount      : Decimal(10,2);
  region            : String(50);
  lastInvoiceDate   : Date;
}
