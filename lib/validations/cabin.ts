import { z } from 'zod';

const cabinStatusSchema = z.enum(['active', 'maintenance', 'inactive']);
const imageUrlSchema = z.string().url('Invalid image URL');

/**
 * Create cabin request schema
 */
export const createCabinSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    image: imageUrlSchema,
    images: z.array(imageUrlSchema).optional().default([]),
    status: cabinStatusSchema.optional().default('active'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').max(20),
    price: z.number().min(0, 'Price must be positive'),
    discount: z.number().min(0).optional().default(0),
    description: z.string().min(1, 'Description is required').max(1000),
    amenities: z.array(z.string().min(1)).optional().default([]),
    bedrooms: z.number().int().min(1).optional(),
    bathrooms: z.number().int().min(1).optional(),
    size: z.number().int().min(1).optional(),
    minNights: z.number().int().min(1).optional(),
    extraGuestFee: z.number().min(0).optional().default(0),
  })
  .refine(data => data.discount <= data.price, {
    message: 'Discount cannot exceed the cabin price',
    path: ['discount'],
  });

/**
 * Update cabin request schema
 */
export const updateCabinSchema = z
  .object({
    _id: z.string().min(1, 'Cabin ID is required'),
    name: z.string().min(1).max(100).optional(),
    image: imageUrlSchema.optional(),
    images: z.array(imageUrlSchema).optional(),
    status: cabinStatusSchema.optional(),
    capacity: z.number().int().min(1).max(20).optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    description: z.string().min(1).max(1000).optional(),
    amenities: z.array(z.string().min(1)).optional(),
    bedrooms: z.number().int().min(1).optional(),
    bathrooms: z.number().int().min(1).optional(),
    size: z.number().int().min(1).optional(),
    minNights: z.number().int().min(1).optional(),
    extraGuestFee: z.number().min(0).optional(),
  })
  .refine(
    data => {
      if (data.discount !== undefined && data.price !== undefined) {
        return data.discount <= data.price;
      }
      return true;
    },
    {
      message: 'Discount cannot exceed the cabin price',
      path: ['discount'],
    }
  );

export type CreateCabinInput = z.infer<typeof createCabinSchema>;
export type UpdateCabinInput = z.infer<typeof updateCabinSchema>;
