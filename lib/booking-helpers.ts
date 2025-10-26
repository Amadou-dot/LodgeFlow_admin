import type { IBooking } from '@/models/Booking';
import type { ClerkUser } from '@/types';
import type { Document } from 'mongoose';
import { getClerkUser } from './clerk-users';

type BookingDocument = (Document & IBooking) | IBooking;

interface PopulatedBooking extends Omit<IBooking, 'customer'> {
  customer: ClerkUser | null;
}

/**
 * Populates booking data with customer information from Clerk
 */
export async function populateBookingWithClerkCustomer(
  booking: BookingDocument
): Promise<PopulatedBooking> {
  if (!booking.customer) {
    return {
      ...(typeof booking.toObject === 'function'
        ? booking.toObject()
        : booking),
      customer: null,
    } as PopulatedBooking;
  }

  try {
    const customer = await getClerkUser(booking.customer);
    return {
      ...(typeof booking.toObject === 'function'
        ? booking.toObject()
        : booking),
      customer: customer || null,
    } as PopulatedBooking;
  } catch (error) {
    console.error('Error fetching customer for booking:', error);
    return {
      ...(typeof booking.toObject === 'function'
        ? booking.toObject()
        : booking),
      customer: null,
    } as PopulatedBooking;
  }
}

/**
 * Populates multiple bookings with customer information from Clerk
 */
export async function populateBookingsWithClerkCustomers(
  bookings: BookingDocument[]
): Promise<PopulatedBooking[]> {
  return Promise.all(bookings.map(populateBookingWithClerkCustomer));
}
