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
  try {
    await dbConnect();  // Ensure DB connection

    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });

    // ✅ Wrap form.parse in a Promise to handle errors
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable parsing error:", err); // Log the error for debugging
          return reject(new Error("Error parsing the form data"));
        }
        resolve({ fields, files });
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

    const uploadResults = await Promise.all(
      fileArray.map(async (file) => {
        try {
          const upload = await cloudinary.uploader.upload(file.filepath, {
            folder: `Product_image/${slugifiedName}`,
          });
          return upload.secure_url;
        } catch (uploadErr) {
          console.error("Cloudinary upload failed for file:", file, uploadErr); // Detailed error log
          throw new Error(`Cloudinary upload failed for file: ${file.originalFilename}`);
        }
      })
    );

    // ✅ Return the uploaded file URLs
    return res.status(200).json({
      success: true,
      urls: uploadResults,
    });
  } catch (err) {
    console.error("Error in uploadHandler:", err); // Log the overall error
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }
}

// --- Final handler with middleware ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Authentication and authorization commented out for now
    // await runMiddleware(req, res, authenticate);
    // await runMiddleware(req, res, authorizeManagers(Roles.SALES_MANAGER));

  } catch (err) {
    console.error("Middleware error:", err.message || err);  // More detailed error logging for middleware
    if (!res.headersSent) {
      return res.status(403).json({ message: "Access denied" });
    }
    return;
  }

  return uploadHandler(req, res);
}
