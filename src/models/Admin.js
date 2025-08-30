import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        // Basic Info
        name: {
            type: String,
              required: true,
            trim: true,
        },
        avatar: { type: String ,default : null},

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        isEmailVerified: { type: Boolean, default: false },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        phone: {
            type: String,
            required: false,
            match: [/^\+?[1-9]\d{9,14}$/, "Invalid phone number"],
        },
        isPhoneVerified: { type: Boolean, default: false },


        // Role & Permissions
        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        },
        permissions: {
            manageAdmins: { type: Boolean, default: true },
            manageVendors: { type: Boolean, default: true },
            manageCustomers: { type: Boolean, default: true },
            manageProducts: { type: Boolean, default: true },
            manageOrders: { type: Boolean, default: true },
            managePayments: { type: Boolean, default: true },
            viewReports: { type: Boolean, default: true },
            systemSettings: { type: Boolean, default: true },
        },

        // Security
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },

        // Activity Tracking
        activityLogs: [
            {
                action: { type: String }, // e.g. "Created Admin", "Deleted Product"
                timestamp: { type: Date, default: Date.now },
                ipAddress: { type: String },
            },
        ],

        // Metadata
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },

    { timestamps: true }
);

// Check if the model already exists to prevent overwriting
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
