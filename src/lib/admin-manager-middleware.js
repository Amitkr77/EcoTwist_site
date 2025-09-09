import jwt from 'jsonwebtoken';
// import { Roles } from './roles'; // If you save roles separately

export const Roles = {
  ADMIN: 'admin',
  SALES_MANAGER: 'manager:sales',
  MARKETING_MANAGER: 'manager:marketing',
  FINANCE_MANAGER: 'manager:finance',
};


const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_secret';
const MANAGER_JWT_SECRET = process.env.MANAGER_JWT_SECRET || 'manager_secret';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  // Try admin token
  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (payload.role === Roles.ADMIN) {
      req.user = { id: payload.id, role: Roles.ADMIN };
      return next();
    }
  } catch {}

  // Try manager token
  try {
    const payload = jwt.verify(token, MANAGER_JWT_SECRET);
    const validManagerRoles = Object.values(Roles).filter(role => role.startsWith('manager:'));

    if (!validManagerRoles.includes(payload.role)) {
      return res.status(403).json({ message: 'Forbidden: Invalid manager role' });
    }

    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {}

  return res.status(401).json({ message: 'Unauthorized: Invalid token' });
}

export function authorizeManagers(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No role found' });
    }

    // Admin always has access
    if (userRole === Roles.ADMIN || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: Access denied' });
  };
}

