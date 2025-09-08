import React from "react";

export default function ReturnRefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Return and Refund Policy
        </h1>

        <p className="mb-4">
          <strong>Ecotwist Innovtions Private Limited</strong>
        </p>
        <p className="mb-2">
          <strong>Registered Address:</strong> Near Euro Kids Play School,
          Mahavir Colony, Beur, Patna 800002 (Bihar)
        </p>
        <p className="mb-2">
          <strong>Office Address:</strong> B-Hub, 5th Floor, A Block, Mauryalok
          Complex, Patna 800001 (Bihar)
        </p>
        <p className="mb-2">
          <strong>CIN:</strong> U16292BR2025PTC074427
        </p>
        <p className="mb-2">
          <strong>Website:</strong>{" "}
          <a
            href="https://ecotwist.in"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ecotwist.in
          </a>
        </p>
        <p className="mb-6">
          <strong>Effective Date:</strong> August 28, 2025
        </p>

        {/* Sections */}
        <Section
          title="Our Commitment to Quality and Your Satisfaction"
          content={`At Ecotwist Innovtions Private Limited, we are dedicated to offering high-quality, sustainable products that meet and exceed your expectations. We understand that on rare occasions, a product may not be what you envisioned. This detailed Return and Refund Policy is designed to be a transparent and fair guide, ensuring your peace of mind while shopping with us. This policy is governed by the principles of the Consumer Protection Act, 2019, and all other applicable laws in India, guaranteeing your rights as a consumer.`}
        />

        <Section
          title="Right to Return: Conditions and Timeframes"
          content={`You have the right to request a return for a product purchased from our website within a specific window and under certain conditions. We require all return requests to be initiated within seven (7) calendar days from the date your product was delivered. This is verified by the delivery date recorded by our shipping partner.`}
        />
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Condition of the Product:</strong> The item must be returned
            in its original, unused state with all tags, labels, accessories,
            and protective packaging intact.
          </li>
          <li>
            <strong>Proof of Purchase:</strong> You must provide the original
            sales invoice or the unique order number associated with your
            purchase.
          </li>
        </ul>

        <Section
          title="Valid Reasons for Initiating a Return"
          content="We will accept returns for the following legitimate reasons:"
        />
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Damaged or Defective Product:</strong> Product is physically
            damaged, broken, or has a manufacturing defect.
          </li>
          <li>
            <strong>Incorrect Product Delivered:</strong> Wrong model, size,
            color, or other specifications.
          </li>
          <li>
            <strong>Product Not as Described:</strong> Actual features differ
            materially from description/images on website.
          </li>
        </ul>

        <Section
          title="Products Excluded from Our Return Policy"
          content="Certain products cannot be returned unless defective or damaged upon delivery:"
        />
        <ul className="list-disc pl-6 mb-6">
          <li>Used or Altered Products</li>
          <li>Custom or Personalized Items</li>
          <li>Perishable Goods</li>
          <li>Final Sale Items</li>
          <li>Digital Goods (e-books, software, gift cards)</li>
        </ul>

        <Section
          title="The Step-by-Step Return Process"
          content="To ensure a smooth and timely return, please follow these steps:"
        />
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>
            <strong>Initiate Contact:</strong> Email{" "}
            <a
              href="mailto:support@ecotwist.in"
              className="text-blue-600 hover:underline"
            >
              support@ecotwist.in
            </a>{" "}
            within 7 days with subject line “Return Request - Order #[Your Order
            Number]”.
          </li>
          <li>
            <strong>Provide Necessary Information:</strong> Include product
            name, quantity, reason for return, and attach clear photos/videos.
          </li>
          <li>
            <strong>Receive RA Number:</strong> Once approved, you’ll receive a
            Return Authorization number and instructions.
          </li>
          <li>
            <strong>Ship the Product:</strong> Free reverse pickup will be
            arranged. If unavailable, self-ship and we’ll reimburse shipping
            costs.
          </li>
        </ol>

        <Section
          title="Our Refund Procedure"
          content="Once we receive your returned item, we will conduct a thorough quality check and inspection:"
        />
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Inspection and Approval:</strong> Done within 48 business
            hours of receipt.
          </li>
          <li>
            <strong>Refund Processing:</strong> Refund to original payment
            method (excluding shipping fees unless error on our part).
          </li>
          <li>
            <strong>Timeline:</strong> Up to 7 business days for refund to
            reflect. COD orders refunded via bank transfer.
          </li>
        </ul>

        <Section
          title="Order Cancellation"
          content="You may cancel your order before dispatch by emailing support@ecotwist.in. Orders already shipped cannot be cancelled and must follow the return process."
        />

        <Section
          title="Contact Information"
          content="For any further questions, concerns, or clarifications regarding this policy, please contact:"
        />
        <p className="mb-6">
          <strong>Email:</strong>{" "}
          <a
            href="mailto:support@ecotwist.in"
            className="text-blue-600 hover:underline"
          >
            support@ecotwist.in
          </a>
        </p>

        <p className="text-sm text-gray-600 italic">
          Disclaimer: This policy is a binding agreement between you and Ecotwist
          Innovtions Private Limited. We reserve the right to amend or update
          this policy at any time. Changes will be posted on our website, and
          continued use of our services will be deemed as acceptance.
        </p>
      </div>
    </div>
  );
}

// Reusable Section Component
function Section({ title, content }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p>{content}</p>
    </div>
  );
}
