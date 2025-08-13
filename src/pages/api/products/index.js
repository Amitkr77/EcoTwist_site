// pages/api/products/index.js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === 'GET') {
      const products = await Product.find({});
      return res.status(200).json({ success: true, data: products });
    }

    if (req.method === 'POST') {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, data: product });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
