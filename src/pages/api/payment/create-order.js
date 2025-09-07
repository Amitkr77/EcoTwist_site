import authMiddleware from "@/lib/authMiddleware";
import { razorpay } from "@/lib/razorpay";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });


    const { amount, currency = "INR", orderId } = req.body;
    // amount in paise (e.g. ₹500 = 50000)

    const options = {
      amount: amount,
      currency,
      receipt: orderId || `order_rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment order creation failed" });
  }
}

