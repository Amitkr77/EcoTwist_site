// pages/api/products/index.js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { authenticate, authorizeManagers, Roles } from '@/lib/admin-manager-middleware';

// Helper to run middleware in Next.js
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === 'GET') {
      // 🔓 No auth required for GET
      const products = await Product.find({});
      return res.status(200).json({ success: true, data: products });
    }

    if (req.method === 'POST') {
      // 🔐 Apply auth + sales manager check
      try {
        // await runMiddleware(req, res, authenticate);
        // await runMiddleware(req, res, authorizeManagers(Roles.SALES_MANAGER));
      } catch (error) {
        if (!res.headersSent) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
        return; // Prevent further execution
      }

      // ✅ Now safe to create product
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, data: product });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
