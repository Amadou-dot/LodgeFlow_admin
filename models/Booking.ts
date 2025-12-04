import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  cabin: mongoose.Types.ObjectId;
  customer: string; // Changed to string to store Clerk user ID
  checkInDate: Date;
  checkOutDate: Date;
  numNights: number;
  numGuests: number;
  status:
    | 'unconfirmed'
    | 'confirmed'
    | 'checked-in'
    | 'checked-out'
    | 'cancelled';
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'online';
  extras: {
    hasBreakfast: boolean;
    breakfastPrice: number;
    hasPets: boolean;
    petFee: number;
    hasParking: boolean;
    parkingFee: number;
    hasEarlyCheckIn: boolean;
    earlyCheckInFee: number;
    hasLateCheckOut: boolean;
    lateCheckOutFee: number;
  };
  observations?: string;
  specialRequests?: string[];
  depositPaid: boolean;
  depositAmount: number;
  remainingAmount: number;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    cabin: {
      type: Schema.Types.ObjectId,
      ref: 'Cabin',
      required: [true, 'Cabin is required'],
    },
    customer: {
      type: String,
      required: [true, 'Customer is required'],
      trim: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function (this: IBooking, checkOutDate: Date) {
          return checkOutDate > this.checkInDate;
        },
        message: 'Check-out date must be after check-in date',
      },
    },
    numNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Number of nights must be at least 1'],
    },
    numGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
    },
    status: {
      type: String,
      enum: [
        'unconfirmed',
        'confirmed',
        'checked-in',
        'checked-out',
        'cancelled',
      ],
      default: 'unconfirmed',
    },
    cabinPrice: {
      type: Number,
      required: [true, 'Cabin price is required'],
      min: [0, 'Cabin price must be positive'],
    },
    extrasPrice: {
      type: Number,
      default: 0,
      min: [0, 'Extras price must be positive'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be positive'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'online'],
    },
    extras: {
      hasBreakfast: { type: Boolean, default: false },
      breakfastPrice: { type: Number, default: 0, min: 0 },
      hasPets: { type: Boolean, default: false },
      petFee: { type: Number, default: 0, min: 0 },
      hasParking: { type: Boolean, default: false },
      parkingFee: { type: Number, default: 0, min: 0 },
      hasEarlyCheckIn: { type: Boolean, default: false },
      earlyCheckInFee: { type: Number, default: 0, min: 0 },
      hasLateCheckOut: { type: Boolean, default: false },
      lateCheckOutFee: { type: Number, default: 0, min: 0 },
    },
    observations: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observations cannot exceed 1000 characters'],
    },
    specialRequests: [
      {
        type: String,
        trim: true,
      },
    ],
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: [0, 'Deposit amount must be positive'],
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Remaining amount must be positive'],
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BookingSchema.index({ cabin: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ checkInDate: 1 });
BookingSchema.index({ checkOutDate: 1 });
BookingSchema.index({ isPaid: 1 });

// Compound index for date range queries
BookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Pre-save middleware to calculate numNights
BookingSchema.pre('save', function (this: IBooking, next) {
  if (this.checkInDate && this.checkOutDate) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.numNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Calculate remaining amount
  this.remainingAmount = this.totalPrice - this.depositAmount;

  next();
});

// Method to check if booking dates overlap with another booking
BookingSchema.methods.overlaps = function (
  this: IBooking,
  otherCheckIn: Date,
  otherCheckOut: Date
) {
  return this.checkInDate < otherCheckOut && this.checkOutDate > otherCheckIn;
};

// Static method to find overlapping bookings
BookingSchema.statics.findOverlapping = function (
  cabinId: mongoose.Types.ObjectId,
  checkInDate: Date,
  checkOutDate: Date,
  excludeBookingId?: mongoose.Types.ObjectId
) {
  interface OverlapQuery {
    cabin: mongoose.Types.ObjectId;
    status: { $nin: string[] };
    $or: Array<{
      checkInDate: { $lt: Date };
      checkOutDate: { $gt: Date };
    }>;
    _id?: { $ne: mongoose.Types.ObjectId };
  }

  const query: OverlapQuery = {
    cabin: cabinId,
    status: { $nin: ['cancelled'] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query);
};

// Virtual for booking duration in a readable format
BookingSchema.virtual('durationText').get(function (this: IBooking) {
  return `${this.numNights} night${this.numNights > 1 ? 's' : ''}`;
});

// Virtual for payment status
BookingSchema.virtual('paymentStatus').get(function (this: IBooking) {
  if (this.isPaid) return 'paid';
  if (this.depositPaid) return 'partial';
  return 'unpaid';
});

// Ensure virtual fields are serialized
BookingSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Booking ||
  mongoose.model<IBooking>('Booking', BookingSchema);
