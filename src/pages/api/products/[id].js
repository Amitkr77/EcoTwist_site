// pages/api/products/[id].js
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

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, data: product });
    }

    if (req.method === "PUT") {
      try {
        const existing = await Product.findById(id);
        if (!existing) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }

        // Optionally check for SKU duplication manually here
        const incomingSKUs = req.body.variants.map((v) => v.sku);
        const duplicates = await Product.find({
          _id: { $ne: id }, // Exclude current product
          "variants.sku": { $in: incomingSKUs },
        });

        if (duplicates.length > 0) {
          return res.status(400).json({
            success: false,
            message: "One or more SKUs already exist in other products.",
            duplicates: duplicates.map((p) => p._id),
          });
        }

        // Assign updated fields
        Object.assign(existing, req.body);
        await existing.save();

        return res.status(200).json({ success: true, data: existing });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Server error", error });
      }
    }

     if (req.method === "DELETE") {
       try {
         const deleted = await Product.findByIdAndDelete(id);
         if (!deleted)
           return res
             .status(404)
             .json({ success: false, message: "Product not found" });

         return res
           .status(200)
           .json({ success: true, message: "Product deleted" });
       } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
       }
     } else {
       return res
         .status(405)
         .json({ success: false, message: `Method ${req.method} not allowed` });
     }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
