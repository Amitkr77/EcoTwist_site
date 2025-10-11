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
      // Fetch the latest document
      const existing = await Product.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // Check for SKU duplication
      const incomingSKUs = req.body.variants?.map((v) => v.sku) || [];
      if (incomingSKUs.length > 0) {
        const duplicates = await Product.find({
          _id: { $ne: id },
          "variants.sku": { $in: incomingSKUs },
        });
        if (duplicates.length > 0) {
          return res.status(400).json({
            success: false,
            message: "One or more SKUs already exist in other products.",
            duplicates: duplicates.map((p) => p._id),
          });
        }
      }

      // Apply specific updates instead of Object.assign
      const { variants, ...otherUpdates } = req.body;
      if (variants) {
        existing.variants = variants.map((v) => ({
          ...v,
          optionValues: new Map(Object.entries(v.optionValues || {})),
        })); // Handle Map conversion for variants.optionValues
      }
      Object.assign(existing, otherUpdates); // Update other fields
      existing.updatedAt = new Date(); // Ensure updatedAt is set

      // Save with retry on VersionError
      let retries = 3;
      while (retries > 0) {
        try {
          await existing.save();
          return res.status(200).json({ success: true, data: existing });
        } catch (error) {
          if (error.name === "VersionError" && retries > 1) {
            retries--;
            // Refetch the document and reapply updates
            const refreshed = await Product.findById(id);
            if (!refreshed) {
              return res.status(404).json({ success: false, message: "Product not found" });
            }
            Object.assign(refreshed, otherUpdates);
            if (variants) {
              refreshed.variants = variants.map((v) => ({
                ...v,
                optionValues: new Map(Object.entries(v.optionValues || {})),
              }));
            }
            refreshed.updatedAt = new Date();
            existing = refreshed;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.name === "VersionError") {
        return res.status(409).json({
          success: false,
          message: "The product was modified by another process. Please refresh and try again.",
        });
      }
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
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
