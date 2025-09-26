// pages/api/address/[id].js
import dbConnect from '@/lib/mongodb';
import authMiddleware from '@/lib/authMiddleware';
import Address from '@/models/Address';

export default async function handler(req, res) {
  await dbConnect();

  const user = await authMiddleware(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const userId = user.userId;

  if (req.method === 'PUT') {
    try {
      const updated = await Address.findOneAndUpdate(
        { _id: id, userId: user._id },
        req.body,
        { new: true }
      );

      if (!updated) return res.status(404).json({ error: 'Address not found' });

      // Optional: unset other default addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: user._id, _id: { $ne: updated._id } },
          { $set: { isDefault: false } }
        );
      }

      return res.status(200).json({ message: 'Address updated', address: updated });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
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

  if (req.method === 'DELETE') {
    const deleted = await Address.findOneAndDelete({ _id: id, userId: user.userId });
    if (!deleted) return res.status(404).json({ error: 'Address not found' });

    return res.status(200).json({ message: 'Address deleted', id });
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
