namespace workshop.invoice;

using { Currency, managed, cuid } from '@sap/cds/common';

// Entitäten speziell für UI5-Consumption optimiert
entity Invoices : cuid, managed {
    invoiceNumber   : String(20)  @title: 'Rechnungsnummer';
    customerName    : String(100) @title: 'Kundenname';
    amount          : Decimal(15,2) @title: 'Betrag';
    currency        : Currency @title: 'Währung';
    status          : String(20)  @title: 'Status' enum {
        DRAFT    = 'DRAFT';
        OPEN     = 'OPEN';
        PAID     = 'PAID';
        OVERDUE  = 'OVERDUE';
    };
    dueDate         : Date @title: 'Fälligkeitsdatum';
    
    // UI5-optimierte berechnete Felder (werden in Service-Handler gefüllt)
    virtual formattedAmount : String(50) @title: 'Formatierter Betrag';
    virtual statusIcon      : String(50) @title: 'Status Icon';
    virtual urgency        : String(10) @title: 'Dringlichkeit';
    virtual daysToDue      : Integer @title: 'Tage bis Fälligkeit';
    
    // Beziehungen für UI5-Navigation
    customer        : Association to Customers;
}

entity Customers : cuid, managed {
    name            : String(100) @title: 'Firmenname';
    email           : String(100) @title: 'E-Mail';
    phone           : String(50)  @title: 'Telefon';
    street          : String(100) @title: 'Straße';
    city            : String(50)  @title: 'Stadt';
    postalCode      : String(10)  @title: 'PLZ';
    country         : String(2)   @title: 'Land';
    
    // UI5-optimierte Felder
    virtual displayName : String(150) @title: 'Anzeigename';
    virtual flag        : String(10) @title: 'Länderflagge';
    
    // Beziehungen
    invoices        : Composition of many Invoices on invoices.customer = $self;
}

// View für aggregierte Daten (Dashboard)
entity InvoiceSummary {
    key summaryId   : String(10);
    totalInvoices   : Integer @title: 'Gesamtanzahl Rechnungen';
    totalAmount     : Decimal(15,2) @title: 'Gesamtbetrag';
    averageAmount   : Decimal(15,2) @title: 'Durchschnittsbetrag';
    openInvoices    : Integer @title: 'Offene Rechnungen';
    overdueInvoices : Integer @title: 'Überfällige Rechnungen';
    currency        : Currency;
}
