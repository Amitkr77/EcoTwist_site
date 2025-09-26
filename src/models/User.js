import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema({
  profilePicture: {
    type: String,
    trim: true,
    default: 'https://picsum.photos/200',
  },
  cloudinaryId: { type: String, select: false },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    index: true,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
    required: true,
  },
  // address: [addressSchema],
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number'],
    sparse: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  otp: {
    type: String,
    trim: true,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null
  }
  ,
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1, createdAt: -1 });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

userSchema.virtual('wishlist', {
  ref: 'Wishlist',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('cart', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('address', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'userId',
});

// Virtual for orders (with proper deep population)
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId',

});

// Synchronous virtual for total orders count (approximation)
userSchema.virtual('totalOrders').get(function () {
  // This is an approximation - for exact count, use a separate query
  return this.orders ? this.orders.length : 0;
});

// Remove async virtuals and replace with static methods
userSchema.statics.getTotalSpent = async function (userId) {
  const orders = await this.model('Order').aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  return orders[0]?.total || 0;
};

userSchema.statics.getLatestOrder = async function (userId) {
  return await this.model('Order').findOne({ userId })
    .sort({ createdAt: -1 })
    .populate('invoice')
    .populate('items.productId');
};

userSchema.statics.getOrderStats = async function (userId) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' },
        orders: { $push: '$_id' }
      }
    },
    { $sort: { '_id': -1 } },
    { $limit: 6 }
  ];

  return await this.model('Order').aggregate(pipeline);
};

// // Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static Method to Update Profile Picture
userSchema.statics.updateProfilePicture = async function (userId, file) {
  const user = await this.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.cloudinaryId) {
    await cloudinary.uploader.destroy(user.cloudinaryId); 
  }

  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const dataUri = `data:${file.type};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: "users" });

  user.profilePicture = result.secure_url;
  user.cloudinaryId = result.public_id;
  await user.save();
  return user;
};

// Avoid model overwrite during hot reloads in dev
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

