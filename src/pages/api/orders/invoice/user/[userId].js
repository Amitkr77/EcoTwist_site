// pages/api/order/invoice/user/[userId].js

import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export default async function handler(req, res) {
  const {
    query: { userId },
    method,
  } = req;

  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('User invoices fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
