// @deprecated - This model is kept for the migration script (scripts/migrate-customer-data-to-clerk.ts).
// Extended customer data is now stored in Clerk user metadata (publicMetadata + privateMetadata).
// Do not use this model for new code.
import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  clerkUserId: string;
  nationality?: string;
  nationalId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    firstName: string;
    lastName: string;
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
    clerkUserId: {
      type: String,
      required: [true, 'Clerk User ID is required'],
      unique: true,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^[A-Za-z0-9]{5,20}$/.test(v);
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
      firstName: {
        type: String,
        trim: true,
        maxlength: [
          50,
          'Emergency contact first name cannot exceed 50 characters',
        ],
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [
          50,
          'Emergency contact last name cannot exceed 50 characters',
        ],
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return !v || /^[+]?[1-9][\d]{0,15}$/.test(v);
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

CustomerSchema.index({ nationality: 1 });
CustomerSchema.index({ totalBookings: -1 });
CustomerSchema.index({ lastBookingDate: -1 });

CustomerSchema.virtual('loyaltyTier').get(function (this: ICustomer) {
  if (this.totalBookings >= 10) return 'platinum';
  if (this.totalBookings >= 5) return 'gold';
  if (this.totalBookings >= 2) return 'silver';
  return 'bronze';
});

CustomerSchema.virtual('fullAddress').get(function (this: ICustomer) {
  if (!this.address) return '';
  const { street, city, state, country, zipCode } = this.address;
  return [street, city, state, country, zipCode].filter(Boolean).join(', ');
});

CustomerSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', CustomerSchema);
