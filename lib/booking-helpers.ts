import type { IBooking } from '@/models/Booking';
import type { ClerkUser } from '@/types';
import type { Document } from 'mongoose';
import { getClerkUser } from './clerk-users';

type BookingDocument = (Document & IBooking) | IBooking;

interface PopulatedBooking extends Omit<IBooking, 'customer'> {
  customer: ClerkUser | null;
}

interface PopulateResult {
  booking: PopulatedBooking;
  clerkError: boolean;
}

/**
 * Populates booking data with customer information from Clerk.
 * Returns a clerkError flag when customer data could not be fetched
 * due to transient errors (rate limits, server errors, network issues),
 * so callers can surface a warning to the user.
 */
export async function populateBookingWithClerkCustomer(
  booking: BookingDocument
): Promise<PopulateResult> {
  const bookingObj =
    typeof booking.toObject === 'function' ? booking.toObject() : booking;

  if (!booking.customer) {
    return {
      booking: { ...bookingObj, customer: null } as PopulatedBooking,
      clerkError: false,
    };
  }

  try {
    const customer = await getClerkUser(booking.customer);
    return {
      booking: {
        ...bookingObj,
        customer: customer || null,
      } as PopulatedBooking,
      clerkError: false,
    };
  } catch (error) {
    console.error('Error fetching customer for booking:', error);
    return {
      booking: { ...bookingObj, customer: null } as PopulatedBooking,
      clerkError: true,
    };
  }
}

/**
 * Populates multiple bookings with customer information from Clerk.
 * Returns the populated bookings and the count of Clerk fetch errors.
 */
export async function populateBookingsWithClerkCustomers(
  bookings: BookingDocument[]
): Promise<{ bookings: PopulatedBooking[]; clerkErrors: number }> {
  const results = await Promise.all(
    bookings.map(populateBookingWithClerkCustomer)
  );
  return {
    bookings: results.map(r => r.booking),
    clerkErrors: results.filter(r => r.clerkError).length,
  };
}
