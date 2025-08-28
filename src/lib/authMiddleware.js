import jwt from 'jsonwebtoken';

export default async function authMiddleware(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token' });
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id }; 
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
        return null;
    }
}
