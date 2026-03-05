import { z } from 'zod';

/**
 * Create cabin request schema
 */
export const createCabinSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').max(20),
    price: z.number().positive('Price must be positive'),
    discount: z.number().min(0).optional().default(0),
    image: z.string().url('Invalid image URL').optional(),
    amenities: z.array(z.string().trim().min(1)).optional().default([]),
    isAvailable: z.boolean().optional().default(true),
  })
  .refine(data => !data.discount || data.discount < data.price, {
    message: 'Discount cannot be greater than or equal to the price',
    path: ['discount'],
  });

/**
 * Update cabin request schema
 */
export const updateCabinSchema = z
  .object({
    _id: z.string().min(1, 'Cabin ID is required'),
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    capacity: z.number().int().min(1).max(20).optional(),
    price: z.number().positive().optional(),
    discount: z.number().min(0).optional(),
    image: z.string().url().optional(),
    amenities: z.array(z.string().trim().min(1)).optional().default([]),
    isAvailable: z.boolean().optional(),
  })
  .refine(
    data => {
      if (data.discount !== undefined && data.price !== undefined) {
        return data.discount < data.price;
      }
      return true;
    },
    {
      message: 'Discount cannot be greater than or equal to the price',
      path: ['discount'],
    }
  );

export type CreateCabinInput = z.infer<typeof createCabinSchema>;
export type UpdateCabinInput = z.infer<typeof updateCabinSchema>;
