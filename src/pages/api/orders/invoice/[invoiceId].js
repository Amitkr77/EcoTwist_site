// pages/api/order/invoice/[invoiceId].js

import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';


export default async function handler(req, res) {
  const {
    query: { invoiceId },
    method,
  } = req;

  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const invoice = await Invoice.findOne({ invoiceId });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
