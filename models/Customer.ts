import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nationality: string;
  nationalId: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    smokingPreference: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
  };
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please provide a valid phone number',
      },
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true,
    },
    nationalId: {
      type: String,
      required: [true, 'National ID is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Za-z0-9]{5,20}$/.test(v);
        },
        message: 'National ID must be 5-20 alphanumeric characters',
      },
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
          },
          message: 'Please provide a valid emergency contact phone number',
        },
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters'],
      },
    },
    preferences: {
      smokingPreference: {
        type: String,
        enum: ['smoking', 'non-smoking', 'no-preference'],
        default: 'no-preference',
      },
      dietaryRestrictions: [
        {
          type: String,
          trim: true,
        },
      ],
      accessibilityNeeds: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, 'Total bookings cannot be negative'],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative'],
    },
    lastBookingDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: email index is already created by unique: true
CustomerSchema.index({ nationality: 1 });
CustomerSchema.index({ totalBookings: -1 });
CustomerSchema.index({ lastBookingDate: -1 });
CustomerSchema.index({ name: 'text', email: 'text' });

// Virtual for customer loyalty tier
CustomerSchema.virtual('loyaltyTier').get(function (this: ICustomer) {
  if (this.totalBookings >= 10) return 'platinum';
  if (this.totalBookings >= 5) return 'gold';
  if (this.totalBookings >= 2) return 'silver';
  return 'bronze';
});

// Virtual for full address
CustomerSchema.virtual('fullAddress').get(function (this: ICustomer) {
  if (!this.address) return '';
  const { street, city, state, country, zipCode } = this.address;
  return [street, city, state, country, zipCode].filter(Boolean).join(', ');
});

// Ensure virtual fields are serialized
CustomerSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', CustomerSchema);
