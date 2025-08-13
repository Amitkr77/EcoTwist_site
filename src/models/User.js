import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const addressSchema = new Schema({
  street: { type: String, trim: true, maxlength: [100, 'Street cannot exceed 100 characters'] },
  city: { type: String, trim: true, maxlength: [50, 'City cannot exceed 50 characters'] },
  state: { type: String, trim: true, maxlength: [50, 'State cannot exceed 50 characters'] },
  country: { type: String, trim: true, maxlength: [50, 'Country cannot exceed 50 characters'] },
  postalCode: { type: String, trim: true, match: [/^\d{5,6}$/, 'Invalid postal code format'] },
  isDefault: { type: Boolean, default: false },
}, { _id: false });

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: Schema.Types.ObjectId, ref: 'Variant' },
  quantity: { type: Number, min: 1, max: 100, default: 1 },
}, { _id: false });

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
  address: [addressSchema],
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number'],
    sparse: true,
  },
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    index: true,
  }],
  cart: [cartItemSchema],
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
  refreshToken: {
    type: String,
    select: false,
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
    await cloudinary.uploader.destroy(user.cloudinaryId); // Remove old image
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
