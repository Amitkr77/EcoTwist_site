import Invoice from '@/models/Invoice';
import dbConnect from '@/lib/mongodb';
import { format } from 'date-fns';

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Utility function to calculate GST based on HSN code and amount
const calculateGST = (hsnCode, taxableAmount) => {
  // Define GST rates based on HSN codes (simplified - update as per your tax rules)
  const gstRates = {
    // 0% GST items
    '0': { rate: 0, cgst: 0, sgst: 0, igst: 0 },
    // 5% GST items
    '5': { rate: 5, cgst: 2.5, sgst: 2.5, igst: 5 },
    // 12% GST items
    '12': { rate: 12, cgst: 6, sgst: 6, igst: 12 },
    // 18% GST items
    '18': { rate: 18, cgst: 9, sgst: 9, igst: 18 },
    // 28% GST items
    '28': { rate: 28, cgst: 14, sgst: 14, igst: 28 },
    // Default to 18% if HSN code doesn't match
    'default': { rate: 18, cgst: 9, sgst: 9, igst: 18 }
  };

  // Extract rate from HSN code (last 2 digits)
  const rateStr = hsnCode.slice(-2);
  const rateKey = gstRates[rateStr] ? rateStr : 'default';

  const taxInfo = gstRates[rateKey];

  return {
    rate: taxInfo.rate,
    cgst: (taxableAmount * taxInfo.cgst / 100),
    sgst: (taxableAmount * taxInfo.sgst / 100),
    igst: (taxableAmount * taxInfo.igst / 100),
    taxableAmount: taxableAmount
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { invoiceId } = req.query;

  if (!invoiceId || typeof invoiceId !== 'string') {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    await dbConnect();

    const invoice = await Invoice.findOne({ invoiceId })
      .populate('orderId', 'orderNumber') // Optional: populate order details
      .lean(); // Use lean for better performance with HTML generation

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    console.log('Generating PDF for invoice:', invoice.invoiceId);

    const htmlContent = generateInvoiceHtml(invoice);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(htmlContent);

  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateInvoiceHtml(invoice) {
  // Calculate tax for each item
  const itemsWithTax = invoice.items.map((item) => {
    const itemTotal = item.quantity * item.price;
    const gstInfo = calculateGST(item.hsnCode, itemTotal);

    return {
      ...item,
      itemTotal,
      taxableAmount: gstInfo.taxableAmount,
      cgst: gstInfo.cgst,
      sgst: gstInfo.sgst,
      igst: gstInfo.igst,
      gstRate: gstInfo.rate,
      taxAmount: gstInfo.cgst + gstInfo.sgst + gstInfo.igst
    };
  });

  // Calculate totals
  const subtotal = itemsWithTax.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalTax = itemsWithTax.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalAmount = subtotal + totalTax + (invoice.shippingFee || 0);

  // Use invoice.gstDetails if available, otherwise calculate
  const gstDetails = invoice.gstDetails || {
    cgst: itemsWithTax.reduce((sum, item) => sum + item.cgst, 0),
    sgst: itemsWithTax.reduce((sum, item) => sum + item.sgst, 0),
    igst: itemsWithTax.reduce((sum, item) => sum + item.igst, 0),
    taxRate: totalTax > 0 ? (totalTax / subtotal * 100) : 0
  };

  const itemsHtml = itemsWithTax.map((item) => {
    return `
      <tr>
        <td>${item.hsnCode}</td>
        <td>${item.name}</td>
        <td style="text-align: right;">${formatCurrency(item.taxableAmount)}</td>
        <td style="text-align: right;">${formatCurrency(item.igst)}</td>
        <td style="text-align: right;">${formatCurrency(item.sgst)}</td>
        <td style="text-align: right;">${formatCurrency(item.cgst)}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.price)}</td>
        <td style="text-align: right;">${formatCurrency(item.itemTotal)}</td>
      </tr>
    `;
  }).join('');

  const issueDate = format(new Date(invoice.issueDate || invoice.createdAt), 'dd MMM yyyy');
  const dueDate = format(new Date(invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), 'dd MMM yyyy');
  console.log(invoice);


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #fff;
          font-size: 12px;
          line-height: 1.4;
        }

        .container {
          width: 100%;
          max-width: 800px;
          margin: auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px double #e0e0e0;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }

        .logo {
          flex: 1;
        }

        .logo img {
          width: 120px;
          height: auto;
        }

        .company-details {
          flex: 2;
          text-align: right;
          font-size: 11px;
          line-height: 1.5;
        }

        .company-details h3 {
          margin: 0 0 8px 0;
          color: #2c5aa0;
          font-size: 16px;
        }

        .invoice-title {
          text-align: center;
          margin: 20px 0;
          font-size: 24px;
          font-weight: bold;
          color: #2c5aa0;
        }

        .invoice-metadata {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          font-size: 11px;
        }

        .metadata-section {
          flex: 1;
          margin: 0 10px;
        }

        .metadata-section h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #666;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 2px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 10px;
        }

        table thead {
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }

        table th, table td {
          border: 1px solid #dee2e6;
          padding: 8px 6px;
          text-align: left;
          vertical-align: top;
        }

        table th {
          font-weight: 600;
          color: #495057;
          background-color: #f8f9fa;
          text-align: center;
        }

        .amount-right {
          text-align: right !important;
        }

        .center {
          text-align: center !important;
        }

        .totals-table {
          width: 50%;
          margin-left: auto;
          margin-top: 20px;
          font-size: 11px;
        }

        .totals-table td {
          padding: 6px 8px;
          border: 1px solid #dee2e6;
        }

        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
          font-size: 12px;
        }

        .gst-breakdown {
          margin-top: 10px;
          font-size: 10px;
        }

        .gst-breakdown div {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
        }

        .status {
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 11px;
        }

        .status.paid {
          background-color: #d4edda;
          border-color: #c3e6cb;
          color: #155724;
        }

        .status.unpaid {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
          padding-top: 15px;
        }

        .payment-terms {
          margin-top: 20px;
          font-size: 10px;
          color: #6c757d;
          text-align: justify;
        }

        @media print {
          body { -webkit-print-color-adjust: exact; }
          .container { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            <img src="https://ecotwist.in/logo.png" alt="EcoTwist Logo" />
          </div>
          <div class="company-details">
            <h3>EcoTwist Innovations Pvt. Ltd.</h3>
            <div>Mauryalok Complex</div>
            <div>Patna, Bihar 800001</div>
            <div>Email: info@ecotwist.in</div>
            <div>Phone: +91 987-654-3210</div>
            <div>GSTIN: 10ABCDE1234F1Z5</div>
          </div>
        </div>

        <!-- Invoice Title -->
        <div class="invoice-title">TAX INVOICE</div>

        <!-- Invoice Metadata -->
        <div class="invoice-metadata">
          <div class="metadata-section">
            <h4>Invoice Details</h4>
            <div><strong>Invoice #:</strong> ${invoice.invoiceId}</div>
            <div><strong>Issue Date:</strong> ${issueDate}</div>
            <div><strong>Due Date:</strong> ${dueDate}</div>
            ${invoice.orderId ? `<div><strong>Order #:</strong> ${invoice.orderId.orderNumber}</div>` : ''}
          </div>
          
          <div class="metadata-section">
            <h4>Bill To:</h4>
            <div>${invoice.billingAddress.fullName}</div>
            <div>${invoice.billingAddress.street || ''}</div>
            <div>${invoice.billingAddress.city}, ${invoice.billingAddress.state}</div>
            <div>${invoice.billingAddress.postalCode}, ${invoice.billingAddress.country}</div>
            <div>Phone: ${invoice.billingAddress.phone}</div>
          </div>
          
          <div class="metadata-section">
            <h4>Ship To:</h4>
            <div>${invoice.billingAddress.fullName}</div>
            <div>${invoice.billingAddress.street || ''}</div>
            <div>${invoice.billingAddress.city}, ${invoice.billingAddress.state}</div>
            <div>${invoice.billingAddress.postalCode}, ${invoice.billingAddress.country}</div>
            <div>Phone: ${invoice.billingAddress.phone}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">HSN</th>
              <th style="width: 30%;">Product Description</th>
              <th style="width: 8%;">Rate (%)</th>
              <th style="width: 10%; class="amount-right">Taxable Value</th>
              <th style="width: 8%; class="amount-right">CGST</th>
              <th style="width: 8%; class="amount-right">SGST</th>
              <th style="width: 8%; class="amount-right">IGST</th>
              <th style="width: 6%; class="center">Qty</th>
              <th style="width: 8%; class="amount-right">Unit Price</th>
              <th style="width: 10%; class="amount-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Table -->
        <table class="totals-table">
          <tr>
            <td style="width: 60%;">Subtotal (Taxable Value):</td>
            <td style="width: 40%; text-align: right;">${formatCurrency(subtotal)}</td>
          </tr>
          <tr>
            <td>Add: CGST @ ${gstDetails.cgst > 0 ? ((gstDetails.cgst / subtotal) * 100).toFixed(2) : '0'}%:</td>
            <td class="amount-right">${formatCurrency(gstDetails.cgst)}</td>
          </tr>
          <tr>
            <td>Add: SGST @ ${gstDetails.sgst > 0 ? ((gstDetails.sgst / subtotal) * 100).toFixed(2) : '0'}%:</td>
            <td class="amount-right">${formatCurrency(gstDetails.sgst)}</td>
          </tr>
          <tr>
            <td>Add: IGST @ ${gstDetails.igst > 0 ? ((gstDetails.igst / subtotal) * 100).toFixed(2) : '0'}%:</td>
            <td class="amount-right">${formatCurrency(gstDetails.igst)}</td>
          </tr>
          ${invoice.shippingFee > 0 ? `
          <tr>
            <td>Add: Shipping Charges:</td>
            <td class="amount-right">${formatCurrency(invoice.shippingFee)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td><strong>Total Amount:</strong></td>
            <td class="amount-right"><strong>${formatCurrency(totalAmount)}</strong></td>
          </tr>
        </table>

        <!-- Payment Status -->
        <div class="status ${invoice.paymentStatus}">
          <strong>Payment Status:</strong> ${invoice.paymentStatus.toUpperCase()} | 
          <strong>Method:</strong> ${invoice.paymentMethod.toUpperCase()}
        </div>

        <!-- Payment Terms -->
        <div class="payment-terms">
          <h4 style="margin-top: 20px; font-size: 11px; color: #666;">Payment Terms:</h4>
          <p>Payment is due within 30 days from invoice date. Late payments may attract interest @ 18% per annum. 
          All disputes must be raised within 7 days of invoice date.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business with <strong>EcoTwist Innovations Pvt. Ltd.</strong></p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>For queries, contact us at info@ecotwist.in or +91 987-654-3210</p>
        </div>
      </div>
    </body>
    </html>
  `;
}