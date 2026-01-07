import { z } from 'zod';

/**
 * Difficulty enum
 */
export const difficultySchema = z.enum(['easy', 'moderate', 'challenging', 'expert']);

/**
 * Create experience request schema
 */
export const createExperienceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  duration: z.string().min(1, 'Duration is required').max(50),
  price: z.number().min(0, 'Price cannot be negative'),
  difficulty: difficultySchema,
  maxParticipants: z.number().int().min(1).max(100),
  image: z.string().url('Invalid image URL').optional(),
  category: z.string().min(1, 'Category is required').max(50),
  included: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  isAvailable: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

/**
 * Update experience request schema
 */
export const updateExperienceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  duration: z.string().min(1).max(50).optional(),
  price: z.number().min(0).optional(),
  difficulty: difficultySchema.optional(),
  maxParticipants: z.number().int().min(1).max(100).optional(),
  image: z.string().url().optional(),
  category: z.string().min(1).max(50).optional(),
  included: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
