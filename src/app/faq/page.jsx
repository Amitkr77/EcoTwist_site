export default function FAQ() {
  const faqs = [
    {
      category: "General Questions",
      questions: [
        {
          q: "What is Ecotwist Innovtions Private Limited?",
          a: "Ecotwist Innovtions is a company based in Patna, Bihar, focused on providing high-quality, eco-friendly products. Our mission is to promote sustainability by offering innovative and responsible alternatives to everyday items."
        },
        {
          q: "Where are your offices located?",
          a: "Our registered address is Near Euro Kids Play School, Mahavir Colony, Beur, Patna 800002. Our main office is located at B-Hub, 5th Floor, A Block, Mauryalok Complex, Patna 800001."
        },
        {
          q: "How can I contact customer support?",
          a: "You can reach us at support@ecotwist.in. We aim to respond within 24–48 business hours."
        },
      ],
    },
    {
      category: "Orders and Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, Net Banking, UPI, and COD on eligible orders."
        },
        {
          q: "How can I track my order?",
          a: "Once dispatched, you’ll receive an email with a tracking number and link to the courier’s website."
        },
        {
          q: "Can I change or cancel my order?",
          a: "Yes, only if it has not yet been dispatched. Please contact support@ecotwist.in with your order number."
        },
      ],
    },
    {
      category: "Custom Orders & Bulk Inquiries",
      questions: [
        {
          q: "Can I place a custom order or buy in bulk?",
          a: "Yes, we welcome custom and bulk orders for events, corporate gifting, and retail."
        },
        {
          q: "How do I get a quote for a custom or bulk order?",
          a: "Send details (product, quantity, customization, timeline) to support@ecotwist.in. We’ll review and share a detailed quote."
        },
        {
          q: "What is the process and timeline for custom orders?",
          a: "After finalizing design and payment, we provide an estimated production/delivery timeline depending on order size."
        },
        {
          q: "Are custom orders eligible for returns?",
          a: "Custom/personalized items are not eligible for returns unless defective or damaged upon delivery."
        },
      ],
    },
    {
      category: "Sustainability & Vision",
      questions: [
        {
          q: "What are your products made of?",
          a: "They are crafted from recycled materials like plastic bottles, textiles, paper, bamboo, and other eco-friendly resources."
        },
        {
          q: "How do your products help the environment?",
          a: "They reduce demand for virgin resources, minimize landfill waste, and lower carbon footprint."
        },
        {
          q: "How does Ecotwist’s vision align with UN SDGs?",
          a: "Our mission aligns with Goal 12 (Responsible Consumption), Goal 13 (Climate Action), and Goals 14 & 15 (Life Below Water & On Land)."
        },
      ],
    },
    {
      category: "Shipping and Delivery",
      questions: [
        {
          q: "How long does standard delivery take?",
          a: "5–7 business days from dispatch. Times may vary depending on location/logistics."
        },
        {
          q: "Do you deliver pan-India?",
          a: "Yes, we deliver across India. Enter your pin code at checkout to confirm availability."
        },
      ],
    },
    {
      category: "Returns and Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "7-day return policy for damaged, defective, or incorrect items. Must be unused, in original packaging, with tags intact."
        },
        {
          q: "How do I request a refund?",
          a: "Email support@ecotwist.in with your order number and issue details (with photos if damaged)."
        },
        {
          q: "When will I receive my refund?",
          a: "After inspection, approved refunds are processed within 7–10 business days to your original payment method."
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 text-slate-700">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions (FAQ)</h1>
      <p className="mb-10">
        Here are some of the most common questions we receive. If you can't find what you’re looking for, 
        please contact us at{" "}
        <a href="mailto:support@ecotwist.in" className="text-teal-600 underline">
          support@ecotwist.in
        </a>.
      </p>

      {faqs.map((section, idx) => (
        <div key={idx} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{section.category}</h2>
          <div className="space-y-6">
            {section.questions.map((item, qIdx) => (
              <div key={qIdx} className="border-b pb-4">
                <p className="font-medium text-lg mb-1">Q: {item.q}</p>
                <p className="text-slate-600">A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
