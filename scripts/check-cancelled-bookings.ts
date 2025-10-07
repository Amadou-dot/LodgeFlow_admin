import { config } from 'dotenv';
import { resolve } from 'path';
import { Booking, connectDB } from '../models';
async function checkCancelledBookings() {
  config({ path: resolve(process.cwd(), '.env.local') });
  try {
    await connectDB();
    // Check for cancelled bookings
    const cancelledBookings = await Booking.find({ status: 'cancelled' });
    console.log(`Found ${cancelledBookings.length} cancelled bookings`);

    if (cancelledBookings.length > 0) {
      console.log('Cancelled bookings details:');
      cancelledBookings.forEach(booking => {
        console.log(
          `  Customer: ${booking.customer}, Amount: $${booking.totalPrice}, Status: ${booking.status}`
        );
      });

      // Check if any customer has cancelled bookings
      const customersWithCancelled = Array.from(
        new Set(cancelledBookings.map(b => b.customer))
      );
      console.log(
        `\nCustomers with cancelled bookings: ${customersWithCancelled.join(', ')}`
      );
    } else {
      console.log('No cancelled bookings found in the database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCancelledBookings();
