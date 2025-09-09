import formidable from "formidable";
import { cloudinary } from "@/utils/cloudinary";
import dbConnect from "@/lib/mongodb";
import { authenticate, authorizeManagers, Roles } from "@/lib/admin-manager-middleware"; 

export const config = {
  api: {
    bodyParser: false,
  },
};

// --- Middleware runner ---
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// --- Upload logic ---
async function uploadHandler(req, res) {
  await dbConnect();

  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  // ✅ Wrap form.parse in a Promise
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const productName = fields.productName?.toString();
  if (!productName) {
    return res.status(400).json({ message: "Missing product name" });
  }

  const fileList = files.file;
  const fileArray = Array.isArray(fileList) ? fileList : [fileList];
  const slugifiedName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const uploadResults = await Promise.all(
      fileArray.map(async (file) => {
        const upload = await cloudinary.uploader.upload(file.filepath, {
          folder: `Product_image/${slugifiedName}`,
        });
        return upload.secure_url;
      })
    );

    // ✅ Finally send response
    return res.status(200).json({
      success: true,
      urls: uploadResults,
    });
  } catch (uploadErr) {
    console.error("Cloudinary upload failed:", uploadErr);
    return res.status(500).json({ message: "Image upload failed" });
  }
}


// --- Final handler with middleware ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Auth check
    await runMiddleware(req, res, authenticate);
    await runMiddleware(req, res, authorizeManagers(Roles.SALES_MANAGER));
  } catch (err) {
    console.error("Middleware error:", err.message || err);
    if (!res.headersSent) {
      return res.status(403).json({ message: "Access denied" });
    }
    return;
  }

  return uploadHandler(req, res);
}
