const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  
  const { Invoices, CustomerSummary } = this.entities;
  
  // ========================================
  // 1. MOCK-DATEN BEIM SERVERSTART ERSTELLEN
  // ========================================
  this.on('served', async () => {
    const { Invoices } = cds.entities('invoiceservice');
    
    try {
      // Prüfen ob bereits Daten vorhanden
      const count = await cds.run(SELECT.from(Invoices));
      
      if (count.length === 0) {
        console.log('🚀 Erstelle Mock-Daten für CAP Service Tests...');
        
        // Umfangreiche Mock-Daten für realistische Tests
        const mockData = [
          // Kunde C001 - Müller GmbH (Premium Kunde)
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C001', 
            customerName: 'Müller GmbH', 
            amount: 1500.00, 
            date: '2025-01-15', 
            status: 'paid', 
            region: 'North' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C001', 
            customerName: 'Müller GmbH', 
            amount: 2300.00, 
            date: '2025-02-20', 
            status: 'open', 
            region: 'North' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C001', 
            customerName: 'Müller GmbH', 
            amount: 3200.00, 
            date: '2025-03-10', 
            status: 'paid', 
            region: 'North' 
          },
          
          // Kunde C002 - Schmidt AG (Standard Kunde)
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C002', 
            customerName: 'Schmidt AG', 
            amount: 890.50, 
            date: '2025-01-10', 
            status: 'paid', 
            region: 'South' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C002', 
            customerName: 'Schmidt AG', 
            amount: 1200.00, 
            date: '2025-03-05', 
            status: 'overdue', 
            region: 'South' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C002', 
            customerName: 'Schmidt AG', 
            amount: 750.25, 
            date: '2025-04-15', 
            status: 'open', 
            region: 'South' 
          },
          
          // Kunde C003 - Weber Ltd (Premium Kunde)
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C003', 
            customerName: 'Weber Ltd', 
            amount: 3450.00, 
            date: '2025-02-28', 
            status: 'paid', 
            region: 'East' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C003', 
            customerName: 'Weber Ltd', 
            amount: 4200.00, 
            date: '2025-03-20', 
            status: 'paid', 
            region: 'East' 
          },
          
          // Kunde C004 - Fischer Corp (Basic Kunde)
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C004', 
            customerName: 'Fischer Corp', 
            amount: 450.00, 
            date: '2025-01-25', 
            status: 'paid', 
            region: 'West' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C004', 
            customerName: 'Fischer Corp', 
            amount: 320.75, 
            date: '2025-02-15', 
            status: 'overdue', 
            region: 'West' 
          },
          
          // Kunde C005 - Becker Industries (Standard Kunde)
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C005', 
            customerName: 'Becker Industries', 
            amount: 1890.00, 
            date: '2025-03-01', 
            status: 'open', 
            region: 'North' 
          },
          { 
            ID: cds.utils.uuid(), 
            customerID: 'C005', 
            customerName: 'Becker Industries', 
            amount: 2100.50, 
            date: '2025-04-10', 
            status: 'paid', 
            region: 'North' 
          }
        ];
        
        // Mock-Daten in Datenbank einfügen
        await INSERT.into(Invoices).entries(mockData);
        console.log('✅ Mock-Daten erfolgreich erstellt:', mockData.length, 'Rechnungen');
        console.log('📊 Kunden:', [...new Set(mockData.map(item => item.customerName))].length);
        console.log('🌍 Regionen:', [...new Set(mockData.map(item => item.region))].join(', '));
      } else {
        console.log('ℹ️  Mock-Daten bereits vorhanden:', count.length, 'Rechnungen');
      }
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der Mock-Daten:', error.message);
    }
  });
  
  // ========================================
  // 2. CUSTOMER SUMMARY - AUTOMATISCHE AGGREGATION
  // ========================================
  this.on('READ', CustomerSummary, async (req) => {
    console.log('📈 CustomerSummary READ Handler ausgeführt');
    console.log('🔍 Filter:', req.query.SELECT.where || 'keine Filter');
    
    try {
      // Erweiterte SQL-Aggregation mit allen relevanten Kennzahlen
      const result = await cds.run(`
        SELECT 
          customerID,
          customerName,
          SUM(amount) as totalAmount,
          COUNT(*) as invoiceCount,
          AVG(amount) as averageAmount,
          MIN(amount) as minAmount,
          MAX(amount) as maxAmount,
          region,
          MAX(date) as lastInvoiceDate,
          MIN(date) as firstInvoiceDate
        FROM invoiceservice_Invoices 
        GROUP BY customerID, customerName, region
        ORDER BY totalAmount DESC
      `);
      
      console.log('📊 Aggregierte Datensätze:', result.length);
      
      // Daten für UI5 Aggregation Binding optimiert formatieren
      const formattedResult = result.map(item => {
        const totalAmount = parseFloat(item.totalAmount || 0);
        const averageAmount = parseFloat(item.averageAmount || 0);
        
        // Geschäftslogik: Kundenkategorisierung
        let customerCategory = 'Basic';
        let riskLevel = 'Low';
        
        if (totalAmount > 10000) {
          customerCategory = 'Premium';
          riskLevel = 'Low';
        } else if (totalAmount > 5000) {
          customerCategory = 'Standard';
          riskLevel = 'Medium';
        } else if (totalAmount < 1000) {
          customerCategory = 'Basic';
          riskLevel = 'High';
        }
        
        return {
          customerID: item.customerID,
          customerName: item.customerName,
          totalAmount: totalAmount.toFixed(2),
          invoiceCount: parseInt(item.invoiceCount || 0),
          averageAmount: averageAmount.toFixed(2),
          minAmount: parseFloat(item.minAmount || 0).toFixed(2),
          maxAmount: parseFloat(item.maxAmount || 0).toFixed(2),
          region: item.region,
          lastInvoiceDate: item.lastInvoiceDate,
          firstInvoiceDate: item.firstInvoiceDate,
          // Berechnete Felder für UI5
          customerCategory: customerCategory,
          riskLevel: riskLevel,
          performanceIndicator: averageAmount > 1000 ? 'High' : averageAmount > 500 ? 'Medium' : 'Low',
          loyaltyScore: Math.min(100, Math.round((parseInt(item.invoiceCount) * 10) + (totalAmount / 100)))
        };
      });
      
      return formattedResult;
      
    } catch (error) {
      console.error('❌ Fehler in CustomerSummary Handler:', error.message);
      req.error(500, `Fehler bei Datenaggregation: ${error.message}`);
    }
  });
  
  // ========================================
  // 3. CUSTOM ACTION - ERWEITERTE ANALYTICS
  // ========================================
  this.on('getCustomerAnalytics', async (req) => {
    const { region } = req.data;
    console.log(`🔬 Custom Analytics ausgeführt für Region: ${region || 'ALL'}`);
    
    try {
      // Basis-SQL mit dynamischer Filterung
      let whereClause = '';
      let params = [];
      
      if (region && region !== 'ALL') {
        whereClause = ' WHERE region = ?';
        params.push(region);
      }
      
      const query = `
        SELECT 
          customerID,
          customerName,
          SUM(amount) as totalAmount,
          COUNT(*) as invoiceCount,
          AVG(amount) as averageAmount,
          region,
          MAX(date) as lastInvoiceDate,
          MIN(date) as firstInvoiceDate,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidCount,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdueCount,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as openCount
        FROM invoiceservice_Invoices 
        ${whereClause}
        GROUP BY customerID, customerName, region 
        ORDER BY totalAmount DESC
      `;
      
      const result = await cds.run(query, params);
      console.log('📈 Analytics Ergebnis:', result.length, 'Kunden analysiert');
      
      // Erweiterte Geschäftslogik mit Analytics
      const analyticsResult = result.map(item => {
        const totalAmount = parseFloat(item.totalAmount || 0);
        const invoiceCount = parseInt(item.invoiceCount || 0);
        const averageAmount = parseFloat(item.averageAmount || 0);
        const paidCount = parseInt(item.paidCount || 0);
        const overdueCount = parseInt(item.overdueCount || 0);
        const openCount = parseInt(item.openCount || 0);
        
        // Erweiterte Berechnungen
        const paymentReliability = invoiceCount > 0 ? Math.round((paidCount / invoiceCount) * 100) : 0;
        const riskScore = Math.round(((overdueCount * 40) + (openCount * 20)) / Math.max(invoiceCount, 1));
        
        // Trend-Analyse (vereinfacht)
        const daysSinceLastInvoice = item.lastInvoiceDate ? 
          Math.floor((new Date() - new Date(item.lastInvoiceDate)) / (1000 * 60 * 60 * 24)) : 999;
        
        const customerStatus = daysSinceLastInvoice > 90 ? 'Inactive' :
                              daysSinceLastInvoice > 30 ? 'At Risk' : 'Active';
        
        return {
          customerID: item.customerID,
          customerName: item.customerName,
          totalAmount: totalAmount.toFixed(2),
          invoiceCount: invoiceCount,
          averageAmount: averageAmount.toFixed(2),
          region: item.region,
          lastInvoiceDate: item.lastInvoiceDate,
          firstInvoiceDate: item.firstInvoiceDate,
          
          // Status-Analytics
          paidCount: paidCount,
          overdueCount: overdueCount,
          openCount: openCount,
          paymentReliability: paymentReliability,
          riskScore: Math.min(100, riskScore),
          
          // Kategorisierung
          customerCategory: totalAmount > 10000 ? 'Premium' : 
                           totalAmount > 5000 ? 'Standard' : 'Basic',
          performanceIndicator: averageAmount > 1000 ? 'High' : 
                               averageAmount > 500 ? 'Medium' : 'Low',
          customerStatus: customerStatus,
          
          // Zusätzliche Metriken für UI5 Dashboards
          loyaltyScore: Math.min(100, Math.round((invoiceCount * 15) + (paymentReliability * 0.5))),
          profitabilityIndex: Math.round((totalAmount / Math.max(invoiceCount, 1)) / 10),
          daysSinceLastInvoice: daysSinceLastInvoice
        };
      });
      
      // Region-spezifische Statistiken hinzufügen
      if (analyticsResult.length > 0) {
        const regionStats = {
          totalCustomers: analyticsResult.length,
          totalRevenue: analyticsResult.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0).toFixed(2),
          averageCustomerValue: (analyticsResult.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0) / analyticsResult.length).toFixed(2),
          highRiskCustomers: analyticsResult.filter(item => item.riskScore > 50).length
        };
        
        console.log('📊 Region Statistics:', regionStats);
      }
      
      return analyticsResult;
      
    } catch (error) {
      console.error('❌ Fehler in Custom Analytics:', error.message);
      req.error(500, `Analytics Fehler: ${error.message}`);
    }
  });
  
  // ========================================
  // 4. BEFORE EVENTS - DATENVALIDIERUNG
  // ========================================
  this.before('CREATE', Invoices, async (req) => {
    const { data } = req;
    console.log('⚡ Before CREATE Handler - Validierung für neue Rechnung');
    
    try {
      // Automatische ID-Generierung falls nicht vorhanden
      if (!data.ID) {
        data.ID = cds.utils.uuid();
      }
      
      // Geschäftslogik: Automatische Kundennamen-Zuordnung
      if (!data.customerName && data.customerID) {
        // In realer Anwendung: Lookup in Kundenstammdaten
        const customerNames = {
          'C001': 'Müller GmbH',
          'C002': 'Schmidt AG',  
          'C003': 'Weber Ltd',
          'C004': 'Fischer Corp',
          'C005': 'Becker Industries'
        };
        data.customerName = customerNames[data.customerID] || `Customer ${data.customerID}`;
      }
      
      // Automatisches Datum falls nicht gesetzt
      if (!data.date) {
        data.date = new Date().toISOString().split('T')[0];
      }
      
      // Default Status
      if (!data.status) {
        data.status = 'open';
      }
      
      // Default Region basierend auf Customer ID (Beispiel-Logik)
      if (!data.region && data.customerID) {
        const regionMap = {
          'C001': 'North',
          'C002': 'South',
          'C003': 'East',
          'C004': 'West',
          'C005': 'North'
        };
        data.region = regionMap[data.customerID] || 'Unknown';
      }
      
      // Datenvalidierung
      if (!data.customerID) {
        req.error(400, 'CustomerID ist erforderlich');
      }
      
      if (!data.amount || data.amount <= 0) {
        req.error(400, 'Rechnungsbetrag muss größer als 0 sein');
      }
      
      if (data.amount > 999999.99) {
        req.error(400, 'Rechnungsbetrag ist zu hoch (Maximum: 999.999,99)');
      }
      
      // Status-Validierung
      const validStatuses = ['open', 'paid', 'overdue', 'cancelled'];
      if (data.status && !validStatuses.includes(data.status)) {
        req.error(400, `Ungültiger Status. Gültige Werte: ${validStatuses.join(', ')}`);
      }
      
      console.log('✅ Validierung erfolgreich für Kunde:', data.customerName);
      
    } catch (error) {
      console.error('❌ Fehler in Before CREATE Handler:', error.message);
      req.error(500, `Validierungsfehler: ${error.message}`);
    }
  });
  
  // ========================================
  // 5. AFTER EVENTS - ZUSÄTZLICHE AKTIONEN
  // ========================================
  this.after('CREATE', Invoices, async (data, req) => {
    console.log(`✅ Neue Rechnung erfolgreich erstellt:`);
    console.log(`   📋 ID: ${data.ID}`);
    console.log(`   👤 Kunde: ${data.customerName} (${data.customerID})`);
    console.log(`   💰 Betrag: ${data.amount} EUR`);
    console.log(`   📍 Region: ${data.region}`);
    console.log(`   📅 Datum: ${data.date}`);
    
    try {
      // Hier könnten weitere Geschäftsprozesse ausgelöst werden:
      
      // 1. Automatische Benachrichtigungen (Beispiel-Log)
      if (data.amount > 5000) {
        console.log('📧 [SIMULATION] Benachrichtigung an Vertrieb: Hochwertige Rechnung erstellt');
      }
      
      // 2. Risikobewertung für neue Kunden
      const existingInvoices = await cds.run(
        SELECT.from('invoiceservice.Invoices').where({customerID: data.customerID})
      );
      
      if (existingInvoices.length === 1) {
        console.log('🎉 [INFO] Neukunde erkannt - Willkommensprozess könnte ausgelöst werden');
      }
      
      // 3. Cache-Aktualisierung (Simulation)
      console.log('🔄 [SIMULATION] CustomerSummary Cache wird aktualisiert');
      
    } catch (error) {
      console.error('⚠️  Fehler in After CREATE Handler (nicht kritisch):', error.message);
      // After-Handler Fehler sind meist nicht kritisch für die Hauptfunktion
    }
  });
  
  // ========================================
  // 6. UPDATE/DELETE EVENTS
  // ========================================
  this.before('UPDATE', Invoices, async (req) => {
    const { data } = req;
    console.log('⚡ Before UPDATE Handler - Validierung für Rechnungsupdate');
    
    // Ähnliche Validierung wie bei CREATE, aber für Updates
    if (data.amount !== undefined && data.amount <= 0) {
      req.error(400, 'Rechnungsbetrag muss größer als 0 sein');
    }
    
    if (data.status) {
      const validStatuses = ['open', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        req.error(400, `Ungültiger Status. Gültige Werte: ${validStatuses.join(', ')}`);
      }
    }
  });
  
  this.after('UPDATE', Invoices, async (data, req) => {
    console.log(`🔄 Rechnung aktualisiert: ${data.customerName} - ${data.amount} EUR`);
  });
  
  this.before('DELETE', Invoices, async (req) => {
    console.log('🗑️  Before DELETE Handler - Löschvalidierung');
    // Hier könnten Geschäftsregeln für das Löschen implementiert werden
    // z.B. bezahlte Rechnungen nicht löschen
  });
  
  // ========================================
  // 7. ERROR HANDLING UND LOGGING
  // ========================================
  this.on('error', (err, req) => {
    console.error('🔥 Service Error:', err.message);
    console.error('🔍 Request Details:', req.method, req.url);
    
    // Erweiterte Fehlerbehandlung basierend auf Fehlertyp
    if (err.code === 'SQLITE_CONSTRAINT') {
      req.error(400, 'Datenbankconstraint verletzt - möglicherweise doppelte Einträge');
    }
  });
});


  
  