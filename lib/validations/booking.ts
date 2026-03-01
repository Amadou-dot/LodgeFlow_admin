import { z } from 'zod';

/**
 * Booking extras schema
 */
const bookingExtrasSchema = z.object({
  hasBreakfast: z.boolean().optional().default(false),
  breakfastPrice: z.number().min(0).optional().default(0),
  hasPets: z.boolean().optional().default(false),
  petFee: z.number().min(0).optional().default(0),
  hasParking: z.boolean().optional().default(false),
  parkingFee: z.number().min(0).optional().default(0),
  hasEarlyCheckIn: z.boolean().optional().default(false),
  earlyCheckInFee: z.number().min(0).optional().default(0),
  hasLateCheckOut: z.boolean().optional().default(false),
  lateCheckOutFee: z.number().min(0).optional().default(0),
});

/**
 * Booking status enum
 */
export const bookingStatusSchema = z.enum([
  'unconfirmed',
  'confirmed',
  'checked-in',
  'checked-out',
  'cancelled',
]);

/**
 * Payment method enum
 */
export const paymentMethodSchema = z.enum([
  'cash',
  'card',
  'bank-transfer',
  'online',
]);

/**
 * Create booking request schema
 */
export const createBookingSchema = z
  .object({
    cabin: z.string().min(1, 'Cabin is required'),
    customer: z.string().min(1, 'Customer is required'),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    numGuests: z.number().int().min(1, 'At least 1 guest required').max(50),
    numNights: z.number().int().min(1).optional(),
    status: bookingStatusSchema.optional().default('unconfirmed'),
    cabinPrice: z.number().min(0).optional(),
    extrasPrice: z.number().min(0).optional().default(0),
    totalPrice: z.number().min(0).optional(),
    isPaid: z.boolean().optional().default(false),
    paymentMethod: paymentMethodSchema.optional(),
    depositPaid: z.boolean().optional().default(false),
    depositAmount: z.number().min(0).optional().default(0),
    remainingAmount: z.number().min(0).optional(),
    extras: bookingExtrasSchema.optional(),
    observations: z.string().max(1000).optional(),
  })
  .refine(data => data.checkOutDate > data.checkInDate, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOutDate'],
  });

/**
 * Update booking request schema (all fields optional except _id)
 */
export const updateBookingSchema = z
  .object({
    _id: z.string().min(1, 'Booking ID is required'),
    cabin: z.string().min(1).optional(),
    customer: z.string().min(1).optional(),
    checkInDate: z.coerce.date().optional(),
    checkOutDate: z.coerce.date().optional(),
    numGuests: z.number().int().min(1).max(50).optional(),
    numNights: z.number().int().min(1).optional(),
    status: bookingStatusSchema.optional(),
    cabinPrice: z.number().min(0).optional(),
    extrasPrice: z.number().min(0).optional(),
    totalPrice: z.number().min(0).optional(),
    isPaid: z.boolean().optional(),
    paymentMethod: paymentMethodSchema.optional(),
    depositPaid: z.boolean().optional(),
    depositAmount: z.number().min(0).optional(),
    remainingAmount: z.number().min(0).optional(),
    extras: bookingExtrasSchema.optional(),
    observations: z.string().max(1000).optional(),
  })
  .refine(
    data => {
      if (data.checkInDate && data.checkOutDate) {
        return data.checkOutDate > data.checkInDate;
      }
      return true;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate'],
    }
  );

/**
 * Record payment schema (for PATCH /api/bookings/[id])
 */
export const recordPaymentSchema = z.object({
  paymentMethod: paymentMethodSchema,
  amountPaid: z.number().positive('Payment amount must be positive'),
  notes: z.string().max(500).optional(),
});

/**
 * Booking PATCH request schema
 */
export const patchBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  recordPayment: recordPaymentSchema.optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type PatchBookingInput = z.infer<typeof patchBookingSchema>;
