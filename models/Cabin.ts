import mongoose, { Document, Schema } from 'mongoose';

export interface ICabin extends Document {
  _id: string;
  name: string;
  image: string;
  capacity: number;
  price: number;
  discount: number;
  description: string;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CabinSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Cabin name is required'],
      trim: true,
      maxlength: [100, 'Cabin name cannot exceed 100 characters'],
    },
    image: {
      type: String,
      required: [true, 'Cabin image is required'],
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid image URL',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be positive'],
      validate: {
        validator: function(this: ICabin, discount: number) {
          return discount < this.price;
        },
        message: 'Discount cannot be greater than or equal to the price',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    amenities: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CabinSchema.index({ capacity: 1 });
CabinSchema.index({ price: 1 });
CabinSchema.index({ name: 'text', description: 'text' });

// Virtual for discounted price
CabinSchema.virtual('discountedPrice').get(function(this: ICabin) {
  return this.price - this.discount;
});

// Ensure virtual fields are serialized
CabinSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Cabin || mongoose.model<ICabin>('Cabin', CabinSchema);
