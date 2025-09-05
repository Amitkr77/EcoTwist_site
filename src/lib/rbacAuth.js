import jwt from 'jsonwebtoken';

const USER_JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin_jwt_secret_key";

export async function authenticate(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token' });
    return null;
  }

  // Try user token first
  try {
    const userPayload = jwt.verify(token, USER_JWT_SECRET);
    // Attach role for user by default
    return { id: userPayload.id, role: userPayload.role || 'user' };
  } catch {
    // If user token fails, try admin token
    try {
      const adminPayload = jwt.verify(token, ADMIN_JWT_SECRET);
      return { id: adminPayload.id, role: adminPayload.role || 'admin' };
    } catch {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return null;
    }
  }
}
