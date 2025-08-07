namespace invoiceService.db;

using { Currency, cuid, managed } from '@sap/cds/common';

entity Invoices : cuid, managed {
    invoiceNumber   : String(20) @title: 'Rechnungsnummer';
    vendor          : Association to Vendors;
    amount          : Decimal(15,2) @title: 'Betrag';
    currency        : Currency;
    dueDate         : Date @title: 'Fälligkeitsdatum';
    status          : String(20) @title: 'Status';
    
    // Berechnete Felder für UI5
    virtual formattedAmount : String @title: 'Formatierter Betrag';
    virtual statusText      : String @title: 'Status Text';
    virtual daysOverdue     : Integer @title: 'Überfällige Tage';
}

entity Vendors : cuid {
    name        : String(100) @title: 'Lieferantenname';
    email       : String(100) @title: 'E-Mail';
    invoices    : Composition of many Invoices on invoices.vendor = $self;
}

