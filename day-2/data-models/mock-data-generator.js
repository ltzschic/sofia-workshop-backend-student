// Mock-Daten Generator für UI5-Testing
// Erstellt realistische Testdaten für Workshop-Zwecke

const { v4: uuidv4 } = require('uuid');

const customerNames = [
    "Mustermann GmbH & Co. KG",
    "TechSolutions AG", 
    "Digital Innovation Partners",
    "Consulting Excellence Ltd.",
    "Future Systems International",
    "Business Process Experts",
    "Data Analytics Pro GmbH",
    "Software Development House",
    "Enterprise Solutions Corp",
    "Modern Business Systems"
];

const statuses = ['OPEN', 'PAID', 'OVERDUE', 'DRAFT'];
const currencies = ['EUR', 'USD', 'GBP'];

function generateMockInvoices(count = 50) {
    const invoices = [];
    
    for (let i = 1; i <= count; i++) {
        const amount = Math.floor(Math.random() * 50000) + 1000;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        
        // Datum-Logik für realistische Fälligkeiten
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
        
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + 30); // 30 Tage Zahlungsziel
        
        invoices.push({
            ID: uuidv4(),
            createdAt: createdDate.toISOString(),
            modifiedAt: createdDate.toISOString(),
            invoiceNumber: `INV-2025-${String(i).padStart(4, '0')}`,
            customerName: customerName,
            amount: amount,
            currency_code: currencies[Math.floor(Math.random() * currencies.length)],
            status: status,
            dueDate: dueDate.toISOString().split('T')[0], // Nur Datum
        });
    }
    
    return invoices;
}

function generateMockCustomers(count = 20) {
    const customers = [];
    
    customerNames.forEach((name, index) => {
        if (index < count) {
            customers.push({
                ID: uuidv4(),
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                name: name,
                email: `contact@${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
                phone: `+49 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 900000) + 100000}`,
                street: `Musterstraße ${Math.floor(Math.random() * 200) + 1}`,
                city: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt'][Math.floor(Math.random() * 5)],
                postalCode: String(Math.floor(Math.random() * 90000) + 10000),
                country: 'DE'
            });
        }
    });
    
    return customers;
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateMockInvoices,
        generateMockCustomers
    };
}

// Test-Ausführung
if (require.main === module) {
    const fs = require('fs');
    
    // Generiere Mock-Daten
    const invoices = generateMockInvoices(50);
    const customers = generateMockCustomers(10);
    
    // Schreibe in CSV-Dateien für SQLite-Import
    const invoiceCsv = [
        'ID,createdAt,modifiedAt,invoiceNumber,customerName,amount,currency_code,status,dueDate',
        ...invoices.map(inv => 
            `${inv.ID},"${inv.createdAt}","${inv.modifiedAt}","${inv.invoiceNumber}","${inv.customerName}",${inv.amount},"${inv.currency_code}","${inv.status}","${inv.dueDate}"`
        )
    ].join('\n');
    
    const customerCsv = [
        'ID,createdAt,modifiedAt,name,email,phone,street,city,postalCode,country',
        ...customers.map(cust => 
            `${cust.ID},"${cust.createdAt}","${cust.modifiedAt}","${cust.name}","${cust.email}","${cust.phone}","${cust.street}","${cust.city}","${cust.postalCode}","${cust.country}"`
        )
    ].join('\n');
    
    fs.writeFileSync('workshop.invoice-Invoices.csv', invoiceCsv);
    fs.writeFileSync('workshop.invoice-Customers.csv', customerCsv);
    
    console.log('✅ Mock-Daten generiert:');
    console.log(`   📄 ${invoices.length} Rechnungen in workshop.invoice-Invoices.csv`);
    console.log(`   👥 ${customers.length} Kunden in workshop.invoice-Customers.csv`);
    console.log('\n📋 JSON-Vorschau für UI5-Testing:');
    console.log('Rechnungen:', JSON.stringify(invoices.slice(0, 2), null, 2));
}
