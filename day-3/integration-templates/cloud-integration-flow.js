// Cloud Integration Flow Template
// Für Daten-Anreicherung aus externen Systemen

const integrationConfig = {
    name: "EnrichInvoiceData",
    description: "Anreicherung von Rechnungsdaten mit externen Kundendaten",
    
    // Eingangsdaten von CAP-Service
    inputFormat: {
        invoiceData: {
            invoiceNumber: "String",
            customerName: "String", 
            amount: "Number",
            status: "String"
        }
    },
    
    // Externe API-Calls
    externalAPIs: [
        {
            name: "CustomerCreditCheck",
            endpoint: "https://api.external-credit.com/check",
            method: "POST",
            authentication: "OAuth2"
        },
        {
            name: "IndustryClassification", 
            endpoint: "https://api.industry-data.com/classify",
            method: "GET",
            authentication: "ApiKey"
        }
    ],
    
    // Ausgabeformat für UI5-Consumption
    outputFormat: {
        enrichedInvoiceData: {
            // Original-Daten
            invoiceNumber: "String",
            customerName: "String",
            amount: "Number", 
            status: "String",
            
            // Angereicherte Daten für UI5
            creditRating: "String",
            riskLevel: "String", 
            industryCode: "String",
            recommendedPaymentTerms: "Number",
            
            // UI5-spezifische Felder
            displayStatus: "String",
            statusColor: "String",
            riskIcon: "String"
        }
    }
};

// Transformation-Logik für UI5-Optimierung
function transformForUI5(inputData, externalData) {
    return {
        ...inputData,
        
        // Externe Daten integrieren
        creditRating: externalData.creditScore > 700 ? 'A' : 'B',
        riskLevel: externalData.creditScore > 700 ? 'Low' : 'High',
        industryCode: externalData.industryClassification,
        
        // UI5-spezifische Transformationen
        displayStatus: mapStatusForUI5(inputData.status),
        statusColor: getStatusColor(inputData.status),
        riskIcon: externalData.creditScore > 700 ? 'sap-icon://accept' : 'sap-icon://warning',
        
        // Formatierungen für UI5-Darstellung
        formattedAmount: new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(inputData.amount)
    };
}

module.exports = {
    integrationConfig,
    transformForUI5
};
