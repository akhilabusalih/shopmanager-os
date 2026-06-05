"""
ShopManager OS — Default Jinja2 Templates
"""

A4_DEFAULT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .company-info h1 { margin: 0; font-size: 24px; color: #333; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 20px; color: #666; }
        .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        table th, table td { padding: 10px; border-bottom: 1px solid #eee; }
        table th { background: #f8f8f8; font-weight: bold; }
        .totals { margin-top: 30px; text-align: right; }
        .totals p { margin: 5px 0; }
        .totals h3 { margin: 10px 0 0 0; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="company-info">
                <h1>{{ settings.shop_name | default('Shop Name') }}</h1>
                <p>{{ settings.shop_address | default('') }}<br>
                GSTIN: {{ settings.shop_gstin | default('') }}<br>
                Phone: {{ settings.shop_phone | default('') }}</p>
            </div>
            <div class="invoice-details">
                <h2>TAX INVOICE</h2>
                <p>Invoice #: <strong>{{ invoice.invoice_no }}</strong><br>
                Date: {{ invoice.invoice_date }}</p>
            </div>
        </div>

        <div class="billing-info">
            <div>
                <strong>Billed To:</strong><br>
                {{ invoice.customer_name }}<br>
                {% if invoice.customer_address %}{{ invoice.customer_address }}<br>{% endif %}
                {% if invoice.customer_phone %}Phone: {{ invoice.customer_phone }}<br>{% endif %}
                {% if invoice.customer_gstin %}GSTIN: {{ invoice.customer_gstin }}{% endif %}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>GST %</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {% for item in invoice.items %}
                <tr>
                    <td>{{ item.description }}</td>
                    <td>{{ item.hsn }}</td>
                    <td>{{ item.qty }} {{ item.unit or '' }}</td>
                    <td>₹{{ "%.2f"|format(item.rate) }}</td>
                    <td>{{ item.gst_rate }}%</td>
                    <td>₹{{ "%.2f"|format(item.qty * item.rate) }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <div class="totals">
            <p>Subtotal: ₹{{ "%.2f"|format(invoice.subtotal) }}</p>
            <p>CGST: ₹{{ "%.2f"|format(invoice.cgst) }}</p>
            <p>SGST: ₹{{ "%.2f"|format(invoice.sgst) }}</p>
            {% if invoice.igst > 0 %}
            <p>IGST: ₹{{ "%.2f"|format(invoice.igst) }}</p>
            {% endif %}
            <h3>Grand Total: ₹{{ "%.2f"|format(invoice.total) }}</h3>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Subject to {{ settings.shop_city | default('local') }} jurisdiction.</p>
        </div>
    </div>
</body>
</html>
"""

THERMAL_DEFAULT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
        .center { text-align: center; }
        .header h2 { margin: 0 0 5px 0; font-size: 16px; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        table th, table td { padding: 3px 0; text-align: right; }
        table th:first-child, table td:first-child { text-align: left; }
        .totals { margin-top: 10px; }
        .totals p { margin: 3px 0; display: flex; justify-content: space-between; }
        .grand-total { font-size: 14px; font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header center">
        <h2>{{ settings.shop_name | default('Shop Name') }}</h2>
        <div>{{ settings.shop_address | default('') }}</div>
        <div>GSTIN: {{ settings.shop_gstin | default('') }}</div>
        <div>Ph: {{ settings.shop_phone | default('') }}</div>
    </div>
    
    <div class="divider"></div>
    
    <div>
        Inv: {{ invoice.invoice_no }}<br>
        Date: {{ invoice.invoice_date }}<br>
        To: {{ invoice.customer_name }}
    </div>
    
    <div class="divider"></div>
    
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amt</th>
            </tr>
        </thead>
        <tbody>
            {% for item in invoice.items %}
            <tr>
                <td>{{ item.description }}</td>
                <td>{{ item.qty }}</td>
                <td>{{ "%.2f"|format(item.qty * item.rate) }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    
    <div class="divider"></div>
    
    <div class="totals">
        <p><span>Subtotal:</span> <span>{{ "%.2f"|format(invoice.subtotal) }}</span></p>
        <p><span>CGST:</span> <span>{{ "%.2f"|format(invoice.cgst) }}</span></p>
        <p><span>SGST:</span> <span>{{ "%.2f"|format(invoice.sgst) }}</span></p>
        <p class="grand-total"><span>Total:</span> <span>₹{{ "%.2f"|format(invoice.total) }}</span></p>
    </div>
    
    <div class="divider"></div>
    <div class="center">
        Thank You! Visit Again.
    </div>
</body>
</html>
"""
