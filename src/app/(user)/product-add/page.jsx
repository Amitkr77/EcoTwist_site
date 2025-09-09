// "use client"

// import Script from "next/script";

// export default function Checkout({ orderId, amount, currency }) {
//   const startPayment = () => {
//     const options = {
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       amount: amount.toString(),
//       currency: currency,
//       name: "Your Store",
//       description: "Order Payment",
//       order_id: orderId,
//       handler: async function (response) {
//         // response has razorpay_payment_id, razorpay_order_id, razorpay_signature
//         await fetch("/api/payment/verify", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(response),
//         });
//         alert("Payment successful!");
//       },
//       theme: { color: "#3399cc" },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   return (
//     <>
//       <Script src="https://checkout.razorpay.com/v1/checkout.js" />
//       <button onClick={startPayment} className="px-4 py-2 bg-blue-600 text-white rounded">
//         Pay Now
//       </button>
//     </>
//   );
// }


import AddProductForm from "@/components/AddProduct";
import React from "react";

export default function page() {
  return (
    <div>
      <AddProductForm />
    </div>
  );
}
