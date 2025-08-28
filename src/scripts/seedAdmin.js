import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js'; // Import the correct Admin model

dotenv.config({ path: '.env' });

const { MONGODB_URI } = process.env;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined. Please check your .env.local file.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user '${ADMIN_EMAIL}' already exists. Skipping creation.`);
    } else {
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      // Create the admin user based on the schema
      const adminUser = new Admin({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        permissions: {
          manageAdmins: true,
          manageVendors: true,
          manageCustomers: true,
          manageProducts: true,
          manageOrders: true,
          managePayments: true,
          viewReports: true,
          systemSettings: true,
        },
        isActive: true, // Set active by default
        failedLoginAttempts: 0, // Initialize failed attempts to 0
      });

      await adminUser.save();
      console.log(`✅ Admin user '${ADMIN_EMAIL}' created successfully.`);
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();
