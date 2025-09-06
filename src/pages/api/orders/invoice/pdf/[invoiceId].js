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

    const invoice = await Invoice.findOne({ invoiceId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const htmlContent = generateInvoiceHtml(invoice);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(htmlContent);

  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateInvoiceHtml(invoice) {
  const itemsHtml = invoice.items.map((item, index) => {
    const total = item.quantity * item.price;

    return `
      <tr>
        <td>INV-${invoice.invoiceId}</td>
        <td>${item.name}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td>${formatCurrency(item.igst || 0)}</td>
        <td>${formatCurrency(item.sgst || 0)}</td>
        <td>${formatCurrency(item.cgst || 0)}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.price)}</td>
        <td style="text-align: right;">${formatCurrency(total)}</td>
      </tr>
    `;
  }).join('');

  const issueDate = format(new Date(invoice.createdAt), 'dd MMM yyyy');
  const dueDate = format(new Date(invoice.dueDate || invoice.createdAt), 'dd MMM yyyy');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }

        body {
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #fff;
        }

        .container {
          width: 90%;
          max-width: 900px;
          margin: auto;
          padding: 30px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 20px;
        }

        .logo img {
          width: 160px;
          height: auto;
        }

        .company-details {
          text-align: right;
          font-size: 14px;
          line-height: 1.6;
        }

        .invoice-metadata {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          font-size: 14px;
        }

        .invoice-metadata h2 {
          margin-bottom: 10px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          font-size: 14px;
        }

        table thead {
          background-color: #f9f9f9;
        }

        table th, table td {
          border: 1px solid #e0e0e0;
          padding: 10px;
          text-align: left;
        }

        table th {
          font-weight: 600;
        }

        .totals {
          width: 50%;
          margin-left: auto;
          font-size: 14px;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }

        .total-line {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #444;
          padding-top: 10px;
          margin-top: 10px;
        }

        .status {
          margin-top: 20px;
          font-size: 14px;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 40px;
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
            <strong>EcoTwist Innovations Pvt. Ltd.</strong><br />
            Mauryalok Complex, Patna, Bihar 800001<br />
            info@ecotwist.in<br />
            +1 (123) 456-7890
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="invoice-metadata">
          <div>
            <h2>Invoice #${invoice.invoiceId}</h2>
            <p>Issue Date: ${issueDate}<br />Due Date: ${dueDate}</p>
          </div>
          <div>
            <strong>Bill To:</strong><br />
            ${invoice.billingAddress.fullName}<br />
            ${invoice.billingAddress.street}<br />
            ${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}<br />
            ${invoice.billingAddress.country}<br />
            ${invoice.billingAddress.phone}
          </div>
        </div>

        <!-- Item Table -->
        <table>
          <thead>
            <tr>
              <th>HSN</th>
              <th>Product</th>
              <th>Taxable</th>
              <th>IGST</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <div><span>Subtotal:</span> <span>${formatCurrency(invoice.subtotal)}</span></div>
          <div><span>Tax:</span> <span>${formatCurrency(invoice.tax)}</span></div>
          <div><span>Shipping:</span> <span>${formatCurrency(invoice.shippingFee)}</span></div>
          <div class="total-line"><span>Total:</span> <span>${formatCurrency(invoice.totalAmount)}</span></div>
        </div>

        <!-- Payment Info -->
        <div class="status">
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${invoice.paymentStatus.toUpperCase()}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for shopping with EcoTwist!</p>
          <p><strong>Terms:</strong> Payment due within 30 days of invoice date.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}