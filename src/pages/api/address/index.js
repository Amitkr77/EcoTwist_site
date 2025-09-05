// pages/api/address/index.js
import dbConnect from '@/lib/mongodb';
import authMiddleware from '@/lib/authMiddleware';
import Address from '@/models/Address';

export default async function handler(req, res) {
  await dbConnect();

  const user = await authMiddleware(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = user.userId;

  if (req.method === 'GET') {
    const addresses = await Address.find({ userId });
    return res.status(200).json({ addresses });
  }

  if (req.method === 'POST') {
    try {
      const newAddress = await Address.create({ ...req.body, userId });

      // Optional: unset other default addresses
      if (newAddress.isDefault) {
        await Address.updateMany(
          { userId, _id: { $ne: newAddress._id } },
          { $set: { isDefault: false } }
        );
      }

      return res.status(201).json({ message: 'Address created', address: newAddress });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
