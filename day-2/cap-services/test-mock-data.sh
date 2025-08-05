#!/bin/bash

echo "=== Mock-Daten Test für UI5 ==="
echo ""

echo "1. Anzahl Customers:"
curl -s "http://localhost:4004/invoice/Customers?\$count=true&\$top=0" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('   ', data['@odata.count'], 'Kunden gefunden')
"

echo "2. Anzahl Invoices:"
curl -s "http://localhost:4004/invoice/Invoices?\$count=true&\$top=0" | python3 -c "
import sys, json  
data = json.load(sys.stdin)
print('   ', data['@odata.count'], 'Rechnungen gefunden')
"

echo "3. Status-Verteilung:"
curl -s "http://localhost:4004/invoice/Invoices" | python3 -c "
import sys, json
from collections import Counter
data = json.load(sys.stdin)
statuses = [inv['status'] for inv in data['value']]
for status, count in Counter(statuses).items():
    print(f'    {status}: {count}')
"

echo "4. Betrags-Spanne:"
curl -s "http://localhost:4004/invoice/Invoices?\$orderby=amount" | python3 -c "
import sys, json
data = json.load(sys.stdin)
amounts = [inv['amount'] for inv in data['value']]
print(f'    Min: {min(amounts):.2f} €')
print(f'    Max: {max(amounts):.2f} €')
print(f'    Durchschnitt: {sum(amounts)/len(amounts):.2f} €')
"

echo "5. UI5-ListView Test:"
curl -s "http://localhost:4004/invoice/InvoiceListView?\$top=1" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('value'):
    print('    ✅ ListView funktioniert')
    print('    Verfügbare Felder:', list(data['value'][0].keys()))
else:
    print('    ❌ ListView-Problem')
"

echo ""
echo "=== Mock-Daten Test abgeschlossen ==="
