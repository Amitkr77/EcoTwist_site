import Product from '../models/Product.js'
import dbConnect from '../lib/mongodb.js'

const seedData = async () => {
    await dbConnect();

    const products = [
        {
            name: "EcoHaul Organic Cotton Tote Bag",
            bestUse: "Ideal for grocery runs, daily errands, beach trips, and eco-friendly shopping.",
            description: "Crafted from 100% GOTS-certified organic cotton, the EcoHaul Tote is a sustainable, stylish, and sturdy companion for your everyday carry.",
            usage: "Machine washable. Air dry to maintain fabric quality. Avoid bleach.",
            benefits: [
                "100% organic and biodegradable cotton",
                "Reinforced stitching for extra durability",
                "Spacious interior with inside pocket",
                "Lightweight and foldable design"
            ],
            ingredients: "GOTS-certified organic cotton, eco-friendly water-based inks (for prints).",
            categories: ["Bags"],
            tags: ["tote bag", "organic cotton", "eco-friendly", "reusable", "shopping"],
            images: [
                { url: "/products/tote/tote_1.png", alt: "Tote bag front view", isPrimary: true, position: 1 },
                { url: "/products/tote/tote_2.png", alt: "Tote bag on shoulder", position: 2 },
                { url: "/products/tote/tote_3.png", alt: "Interior view of tote", position: 3 },
            ],
            options: [
                { name: "Color", values: ["Natural", "Stone Gray", "Sage Green"] },
                { name: "Size", values: ["Standard", "Oversized"] }
            ],
            variants: [
                {
                    sku: "TOT-ORG-NAT-STD",
                    optionValues: { Color: "Natural", Size: "Standard" },
                    price: 19.99,
                    inventory: { quantity: 400 },
                },
                {
                    sku: "TOT-ORG-GRY-OVR",
                    optionValues: { Color: "Stone Gray", Size: "Oversized" },
                    price: 24.99,
                    inventory: { quantity: 250 },
                },
                {
                    sku: "TOT-ORG-SGE-STD",
                    optionValues: { Color: "Sage Green", Size: "Standard" },
                    price: 21.99,
                    inventory: { quantity: 300 },
                },
            ],
            subscriptionOffer: {
                enabled: false,
                firstOrderDiscountPct: 0,
                recurringDiscountPct: 0,
                interval: null,
                shippingInsured: false,
                cancelAnytime: false,
            },
            faqs: [
                { question: "Is the tote bag machine washable?", answer: "Yes, wash in cold water and air dry to preserve color and durability." },
                { question: "Can it carry heavy items?", answer: "Yes, the tote is double-stitched and holds up to 15kg comfortably." },
                { question: "Does it have inner pockets?", answer: "Yes, it includes a small inner pocket for keys or phone." }
            ],
            seo: { metaTitle: "EcoHaul Organic Cotton Tote Bag", metaDescription: "Reusable organic cotton tote bag for shopping, travel, and everyday use." }
        }
        ,
        {
            name: "PureWrite Bamboo Pencil",
            bestUse: "Perfect for writing, sketching, and doodling. A sustainable pencil that helps you reduce your carbon footprint.",
            description: "PureWrite pencils are made from 100% bamboo, offering a smooth and natural writing experience while being kind to the planet.",
            usage: "Sharpen with a standard pencil sharpener. Keep dry and avoid extreme moisture.",
            benefits: [
                "Made from sustainable bamboo",
                "No plastic or harmful chemicals",
                "Smooth, rich writing experience",
                "Environmentally friendly and biodegradable"
            ],
            ingredients: "100% bamboo wood, non-toxic graphite.",
            categories: ["Stationery"],
            tags: ["pencil", "bamboo", "eco-friendly", "sustainable"],
            images: [
                { url: "/products/pencil/pencil_1.png", alt: "Bamboo pencil close-up", isPrimary: true, position: 1 },
                { url: "/products/pencil/pencil_2.png", alt: "Pencil with sharpener", position: 2 },
                { url: "/products/pencil/pencil_3.png", alt: "Bamboo pencils in holder", position: 3 },
            ],
            options: [
                { name: "Pack Size", values: ["Single", "Set of 5", "Set of 10"] }
            ],
            variants: [
                {
                    sku: "PEN-BAM-SGL",
                    optionValues: { Size: "Single" },
                    price: 1.99,
                    inventory: { quantity: 500 },
                },
                {
                    sku: "PEN-BAM-5PK",
                    optionValues: { Size: "Set of 5" },
                    price: 8.99,
                    inventory: { quantity: 300 },
                },
                {
                    sku: "PEN-BAM-10PK",
                    optionValues: { Size: "Set of 10" },
                    price: 15.99,
                    inventory: { quantity: 200 },
                },
            ],
            subscriptionOffer: {
                enabled: true,
                firstOrderDiscountPct: 15,
                recurringDiscountPct: 10,
                interval: { unit: "month", count: 6 },
                shippingInsured: true,
                cancelAnytime: true,
            },
            faqs: [
                { question: "Is the pencil made of real bamboo?", answer: "Yes, the entire body of the pencil is made from sustainable bamboo." },
                { question: "Are the pencils pre-sharpened?", answer: "No, the pencils are not pre-sharpened." },
                { question: "Can these be used for professional sketching?", answer: "Yes, the graphite is high-quality and suitable for fine details." }
            ],
            seo: { metaTitle: "PureWrite Bamboo Pencil", metaDescription: "Sustainable bamboo pencil with smooth graphite for writing and sketching. Eco-friendly and biodegradable." }
        },
        {
    name: "EcoScribe Biodegradable Pen",
    bestUse: "Ideal for everyday writing, drawing, or signing documents. A sustainable option for all your writing needs.",
    description: "EcoScribe is a smooth-writing pen made with biodegradable materials. The perfect blend of functionality and environmental responsibility.",
    usage: "Keep cap on when not in use to prevent ink from drying out.",
    benefits: [
        "Made from biodegradable plastic",
        "Smooth-flowing ink for effortless writing",
        "Refillable ink cartridge, reducing waste",
        "Available in black, blue, and green ink"
    ],
    ingredients: "Biodegradable plastic, water-based ink.",
    categories: ["Stationery"],
    tags: ["pen", "biodegradable", "refillable", "eco-friendly"],
    images: [
        { url: "/products/pen/pen_1.png", alt: "Pen close-up view", isPrimary: true, position: 1 },
        { url: "/products/pen/pen_2.png", alt: "Pen with ink colors", position: 2 },
        { url: "/products/pen/pen_3.png", alt: "Pen in hand", position: 3 },
    ],
    options: [
        { name: "Ink Color", values: ["Black", "Blue", "Green"] },
        { name: "Pack Size", values: ["Single", "Set of 3"] }
    ],
    variants: [
        {
            sku: "PEN-ECO-BLK-1",
            optionValues: { Color: "Black", Size: "Single" },
            price: 3.99,
            inventory: { quantity: 500 },
        },
        {
            sku: "PEN-ECO-BLU-3",
            optionValues: { Color: "Blue", Size: "Set of 3" },
            price: 9.99,
            inventory: { quantity: 250 },
        },
        {
            sku: "PEN-ECO-GRN-1",
            optionValues: { Color: "Green", Size: "Single" },
            price: 3.99,
            inventory: { quantity: 300 },
        },
    ],
    subscriptionOffer: {
        enabled: true,
        firstOrderDiscountPct: 10,
        recurringDiscountPct: 5,
        interval: { unit: "month", count: 3 },
        shippingInsured: true,
        cancelAnytime: true,
    },
    faqs: [
        { question: "Is the pen refillable?", answer: "Yes, it features a refillable ink cartridge." },
        { question: "Can I recycle the pen?", answer: "Yes, the pen is made from biodegradable plastic and can be recycled." },
        { question: "How long does the ink last?", answer: "The ink lasts for approximately 500-600 meters of writing." }
    ],
    seo: { metaTitle: "EcoScribe Biodegradable Pen", metaDescription: "Sustainable and smooth-writing biodegradable pen for everyday use. Refillable and eco-friendly." }
}


    ];

    try {
        await Product.insertMany(products);
        console.log('Products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
    }
};

// export default async function handler(req, res) {
//     if (req.method === 'POST') {
//         await seedData();
//         return res.status(200).json({ message: 'Seeding completed!' });
//     } else {
//         res.status(405).json({ message: 'Method Not Allowed' });
//     }
// }

seedData();