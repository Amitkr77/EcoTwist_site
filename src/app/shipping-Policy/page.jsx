import React from "react";
import Footer from "@/components/Footer";

export default function ShippingPolicyPage() {
  return (
    <div>
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8 lg:px-24">
      <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 sm:p-12">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">Shipping Policy</h1>
          <p className="mt-2 text-sm text-slate-600">Everything you need to know about processing, delivery and tracking.</p>
        </header>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium">Processing &amp; Shipping: Your Order's Journey</h2>
            <p className="mt-2 text-slate-700">We know how exciting it is to get your hands on your new products — we’re just as eager to get them to you! As soon as you place your order, our dedicated team gets to work.</p>
            <ul className="mt-3 list-disc list-inside text-slate-700 space-y-1">
              <li>Standard orders are typically processed and packed within <strong>1–2 business days</strong>.</li>
              <li>Custom orders may take <strong>3–7 business days</strong> depending on type and quantity.</li>
            </ul>
            <p className="mt-3 text-slate-700">Once your package is ready, it usually arrives within <strong>3–7 business days</strong> for standard deliveries across India. These are estimates — see the Disclaimer below for details.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Shipping Charges: Keeping it Simple</h2>
            <p className="mt-2 text-slate-700">We believe in making things as straightforward as possible. We offer <strong>free shipping</strong> on all prepaid orders of <strong>₹199 and above</strong>. For orders below that amount, applicable shipping charges will be shown at checkout.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Tracking Your Package</h2>
            <p className="mt-2 text-slate-700">As soon as your package is dispatched, we’ll send you a tracking number via email or WhatsApp. Use that number with the carrier to follow your order in real time.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Undelivered Shipments</h2>
            <p className="mt-2 text-slate-700">Sometimes shipments are returned to us due to an incorrect address or because the carrier couldn't reach you. If that happens, we will contact you to arrange redelivery. Please note that additional shipping charges may apply for reshipment.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Contact Information</h2>
            <p className="mt-2 text-slate-700">If you have any questions or concerns about shipping, please reach out to our support team — we’re happy to help.</p>
            <p className="mt-2 text-sm"><a href="mailto:support@ecotwist.in" className="underline">support@ecotwist.in</a></p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Disclaimer</h2>
            <p className="mt-2 text-slate-700">Please be aware that delivery times are estimates and may be affected by factors outside our control, such as carrier delays, severe weather, public holidays, or other unforeseen events. We appreciate your understanding.</p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-medium">Quick FAQs</h3>
            <dl className="mt-3 space-y-3 text-slate-700">
              <div>
                <dt className="font-medium">When will I get my tracking number?</dt>
                <dd className="mt-1">You’ll receive a tracking number via email or WhatsApp as soon as your order is dispatched.</dd>
              </div>

              <div>
                <dt className="font-medium">My address was entered incorrectly — what should I do?</dt>
                <dd className="mt-1">Contact support immediately at <a href="mailto:support@ecotwist.in" className="underline">support@ecotwist.in</a>. If the shipment is returned, additional charges may apply for reshipment.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* <footer className="mt-8 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</footer> */}
      </article>
      
    </main>
    <Footer/>
    </div>
  );
}
