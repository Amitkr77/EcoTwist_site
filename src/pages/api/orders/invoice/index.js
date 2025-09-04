// pages/api/order/invoice/index.js

import { verifyToken } from '@/lib/adminToken';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';


export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
   const decoded = verifyToken(req);
  
      if (!decoded || decoded.role !== "admin")
        return res.status(401).json({ message: "Unauthorized" });

  try {
    await dbConnect();

    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('All invoices fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
