const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {
    
    // Datenaufbereitung für UI5 Aggregation Binding
    this.on('READ', 'Invoices', async (req) => {
        const invoices = await SELECT.from('Invoices')
        
        // Datenaufbereitung für UI5-Listen
        return invoices.map(invoice => ({
            ...invoice,
            formattedAmount: formatCurrency(invoice.amount),
            statusText: getStatusText(invoice.status),
            daysOverdue: calculateDaysOverdue(invoice.dueDate)
        }))
    })
    
    // Custom Action für UI5-Buttons
    this.on('approve', 'Invoices', async (req) => {
        const { ID } = req.params[0]
        await UPDATE('Invoices').set({ status: 'approved' }).where({ ID })
        return { success: true, message: 'Invoice approved' }
    })
})

// Hilfsfunktionen
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Ausstehend',
        'approved': 'Genehmigt',
        'rejected': 'Abgelehnt'
    }
    return statusMap[status] || status
}

function calculateDaysOverdue(dueDate) {
    if (!dueDate) return 0
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today - due
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}
