# 🌿 EcoTwist – Smart & Sustainable E-Commerce Platform  

EcoTwist is a full-stack **e-commerce platform** focused on **eco-friendly products** like smart switches, sensors, and hubs.  
It serves both **B2C** (direct customers) and **B2B** (bulk buyers, distributors, businesses), providing a scalable solution with modern features.  

---

## 🚀 Project Goals
- Build a **sustainable marketplace** for eco-friendly products.  
- Provide **smooth user experience** with responsive UI and animations.  
- Enable **bulk orders, custom pricing, and business analytics** for B2B users.  
- Support **secure payments, order tracking, and impact monitoring**.  

---

## 🛠️ Tech Stack
**Frontend:**  
- [Next.js](https://nextjs.org/) – React framework for SSR & routing  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling  
- [ShadCN UI](https://ui.shadcn.com/) – Prebuilt components  
- [Framer Motion / GSAP] – Animations  

**Backend:**  
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) – REST APIs  
- [MongoDB](https://www.mongodb.com/) – Database  
- [JWT Authentication](https://jwt.io/) – Secure login/session  

**Integrations:**  
- **Stripe / Razorpay** – Payment gateway  
- **Twilio** – SMS/notification services  
- **CRM Integration** – For B2B order & customer management  

---

## ✨ Features
- 🛒 **Product Listings** with categories & filters  
- 📦 **Cart & Checkout** flow  
- 👤 **User Accounts** with wishlist & order history  
- 🏢 **B2B Features** – Bulk orders, custom pricing, analytics  
- 📰 **Blog & News Section** for eco-tips and updates  
- 💚 **Impact Tracking** – Track environmental impact of purchases  
- 🔐 **Secure Authentication** – JWT-based login & role management  

---

## 📂 Project Structure
```
src/
│── app/                # Frontend (Next.js with App Router)
│── pages/              # API routes (Next.js backend)
│── components/         # UI components (Tailwind + ShadCN)
│── models/             # MongoDB schemas
│── lib/                # Utilities (dbConnect, auth, etc.)
│── public/             # Static assets (images, icons, etc.)
│── styles/             # Global styles
│── package.json        # Dependencies & scripts
```

---

## ⚡ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Amitkr77/EcoTwist_site.git
cd EcoTwist_site
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongo_db_connection
JWT_SECRET=your_jwt_secret
STRIPE_SECRET=your_stripe_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run the development server
```bash
npm run dev
```
Now open [http://localhost:3000](http://localhost:3000) in your browser 🚀  

---


## 🤝 Contributing
Contributions are welcome!  
1. Fork the project  
2. Create your feature branch (`git checkout -b feature/new-feature`)  
3. Commit changes (`git commit -m 'Added new feature'`)  
4. Push to branch (`git push origin feature/new-feature`)  
5. Open a Pull Request  

---

## 📜 License
This project is licensed under the **MIT License** – free to use and modify.  

---

## 🌱 About Ecotwist
Ecotwist is more than a store – it’s a movement towards **smart, sustainable living**.  
By choosing Ecotwist, you’re not only buying eco-friendly products but also **contributing to a greener planet**.  
