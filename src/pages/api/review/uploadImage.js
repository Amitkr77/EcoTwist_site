import formidable from "formidable";
import { cloudinary } from "@/utils/cloudinary";
import { verifyToken } from "@/lib/adminToken";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; 
  const decoded = verifyToken(token); 



  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload failed" });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "review_photos",
      });

      return res.status(200).json({
        success: true,
        url: result.secure_url,
      });
    } catch (uploadErr) {
      console.error("Cloudinary error:", uploadErr);
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }
  });
}
