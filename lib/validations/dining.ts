import { z } from 'zod';

/**
 * Time format regex (HH:MM)
 */
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Serving time schema
 */
const servingTimeSchema = z.object({
  start: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
  end: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
});

/**
 * Dining type enum
 */
export const diningTypeSchema = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'beverage',
  'dessert',
]);

/**
 * Meal type enum
 */
export const mealTypeSchema = z.enum([
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'regular',
]);

/**
 * Create dining item request schema
 */
export const createDiningSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  type: diningTypeSchema,
  mealType: mealTypeSchema,
  category: z.string().min(1, 'Category is required').max(50),
  price: z.number().positive('Price must be positive'),
  servingTime: servingTimeSchema,
  maxPeople: z.number().int().min(1).max(100),
  image: z.string().url('Invalid image URL'),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional().default(true),
  isPopular: z.boolean().optional().default(false),
});

/**
 * Update dining item request schema
 */
export const updateDiningSchema = z.object({
  _id: z.string().min(1, 'Dining item ID is required'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  type: diningTypeSchema.optional(),
  mealType: mealTypeSchema.optional(),
  category: z.string().min(1).max(50).optional(),
  price: z.number().positive().optional(),
  servingTime: servingTimeSchema.optional(),
  maxPeople: z.number().int().min(1).max(100).optional(),
  image: z.string().url().optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
});

export type CreateDiningInput = z.infer<typeof createDiningSchema>;
export type UpdateDiningInput = z.infer<typeof updateDiningSchema>;
