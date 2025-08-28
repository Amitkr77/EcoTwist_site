import formidable from "formidable";
import { cloudinary } from "@/utils/cloudinary";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { verifyToken } from "@/lib/adminToken";


export const config = {
    api: {
        bodyParser: false, // Required for file uploads
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "File upload error" });
        }

        const file = files.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        try {
            const upload = await cloudinary.uploader.upload(file.filepath, {
                folder: "admins",
            });

            const admin = await Admin.findById(decoded.id);
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            admin.avatar = upload.secure_url;
            await admin.save();

            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                avatar: upload.secure_url,
            });
        } catch (uploadErr) {
            console.error(uploadErr);
            return res.status(500).json({ message: "Cloudinary upload failed" });
        }
    });
}
