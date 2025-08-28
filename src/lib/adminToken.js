import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin_jwt_secret_key";

export const generateToken = (admin) => {
    return jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: "1d" })
}

export const verifyToken = (req) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.slpit(" ")[1];
        if (!token) return null;
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null
    }
};