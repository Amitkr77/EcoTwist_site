// pages/api/products/[id].js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, data: product });
    }

    if (req.method === 'PUT') {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
