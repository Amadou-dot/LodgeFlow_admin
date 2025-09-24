import { getClerkUser } from './clerk-users';

/**
 * Populates booking data with customer information from Clerk
 */
export async function populateBookingWithClerkCustomer(booking: any) {
  if (!booking.customer) return booking;

  try {
    const customer = await getClerkUser(booking.customer);
    return {
      ...(booking.toObject ? booking.toObject() : booking),
      customer: customer || null,
    };
  } catch (error) {
     
    console.error('Error fetching customer for booking:', error);
    return {
      ...(booking.toObject ? booking.toObject() : booking),
      customer: null,
    };
  }
}

/**
 * Populates multiple bookings with customer information from Clerk
 */
export async function populateBookingsWithClerkCustomers(bookings: any[]) {
  return Promise.all(bookings.map(populateBookingWithClerkCustomer));
}
