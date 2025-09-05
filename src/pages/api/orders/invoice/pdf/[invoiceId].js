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
  const itemsHtml = invoice.items.map(item => `
    <tr>
      <td style="padding: 12px;">${item.name}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const issueDate = format(new Date(invoice.createdAt), 'MMM dd, yyyy');
  const dueDate = format(new Date(invoice.dueDate || invoice.createdAt), 'MMM dd, yyyy');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .logo {
          width: 150px;
          height: 50px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .company-details {
          text-align: right;
          font-size: 14px;
        }
        .invoice-details {
          margin: 20px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e0e0e0;
          padding: 12px;
          font-size: 14px;
        }
        th {
          background: #f8f8f8;
          font-weight: bold;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
          width: 50%;
          margin-left: auto;
        }
        .totals div {
          padding: 8px 0;
          font-size: 14px;
        }
        .total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #333;
          padding-top: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Company Logo</div>
          <div class="company-details">
            <strong>Your Company Name</strong><br>
            123 Business Street<br>
            City, State 12345<br>
            contact@company.com<br>
            +1 (123) 456-7890
          </div>
        </div>

        <div class="invoice-details">
          <div>
            <h2>Invoice #${invoice.invoiceId}</h2>
            <p>
              Issue Date: ${issueDate}<br>
              Due Date: ${dueDate}
            </p>
          </div>
          <div>
            <strong>Bill To:</strong><br>
            ${invoice.billingAddress.fullName}<br>
            ${invoice.billingAddress.street}<br>
            ${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}<br>
            ${invoice.billingAddress.country}<br>
            ${invoice.billingAddress.phone}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div>Subtotal: ${formatCurrency(invoice.subtotal)}</div>
          <div>Tax: ${formatCurrency(invoice.tax)}</div>
          <div>Shipping: ${formatCurrency(invoice.shippingFee)}</div>
          <div class="total">Total: ${formatCurrency(invoice.totalAmount)}</div>
        </div>

        <div>
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${invoice.paymentStatus.toUpperCase()}</p>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Terms & Conditions: Payment due within 30 days of invoice date.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
