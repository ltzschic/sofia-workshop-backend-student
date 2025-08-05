namespace workshop.invoice;

// Kunden-Entity
entity Customers {
    key ID          : UUID;
    customerNumber  : String(20);       // z.B. "CUST-001"
    name            : String(100);      // Firmenname
    email           : String(100);      // E-Mail-Adresse
    country         : String(2);        // Ländercode z.B. "DE"
    
    // UI5-optimierte Felder
    displayName     : String(150);      // z.B. "Max Mustermann GmbH (CUST-001)"
    flagIcon        : String(20);       // Länderflagge als Icon
    riskLevel       : String(10);       // "Low", "Medium", "High"
}

// Erweiterte Invoices-Entity mit Kundenbeziehung
entity Invoices {
    key ID              : UUID;
    invoiceNumber       : String(20);
    
    // Beziehung zum Kunden
    customer            : Association to Customers;
    customerID          : UUID;         // Fremdschlüssel
    
    amount              : Decimal(15,2);
    status              : String(20);
    createdAt           : Timestamp;
    
    // UI5-optimierte Felder
    formattedAmount     : String(50);
    statusIcon          : String(20);
    urgency             : String(10);
    statusColor         : String(10);
}




