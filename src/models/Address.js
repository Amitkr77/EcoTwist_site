import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, trim: true }, 
  street: { type: String, trim: true, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 50 },
  state: { type: String, trim: true, maxlength: 50 },
  country: { type: String, trim: true, maxlength: 50 },
  postalCode: {
    type: String,
    trim: true,
    match: [/^\d{5,6}$/, 'Invalid postal code format'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{10,15}$/, 'Invalid phone number'],
  },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
