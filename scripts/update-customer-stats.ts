import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '@/lib/mongodb';
import { Booking, Customer } from '@/models';
import type { IBooking } from '@/models/Booking';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function updateAllCustomerStats() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📊 Fetching all bookings...');
    const allBookings = await Booking.find({});
    console.log(`Found ${allBookings.length} bookings`);

    // Group bookings by customer (Clerk user ID)
    const customerBookingsMap = new Map<string, IBooking[]>();

    for (const booking of allBookings) {
      const clerkUserId = booking.customer;
      if (!customerBookingsMap.has(clerkUserId)) {
        customerBookingsMap.set(clerkUserId, []);
      }
      customerBookingsMap.get(clerkUserId)!.push(booking);
    }

    console.log(
      `Found ${customerBookingsMap.size} unique customers with bookings`
    );

    // Update stats for each customer
    let updatedCustomers = 0;
    const customerEntries = Array.from(customerBookingsMap.entries());

    for (const [clerkUserId, customerBookings] of customerEntries) {
      // Filter out cancelled bookings for revenue calculations
      const validBookings = customerBookings.filter(
        (booking: IBooking) => booking.status !== 'cancelled'
      );

      // Calculate statistics
      const totalBookings = customerBookings.length; // Include all bookings for count
      const totalSpent = validBookings.reduce(
        (sum: number, booking: IBooking) => sum + (booking.totalPrice || 0),
        0
      );

      // Find the most recent booking
      const sortedBookings = customerBookings.sort(
        (a: IBooking, b: IBooking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastBookingDate =
        sortedBookings.length > 0 ? sortedBookings[0].createdAt : null;

      // Update customer record
      await Customer.findOneAndUpdate(
        { clerkUserId },
        {
          clerkUserId, // Include this in case we're creating a new record
          totalBookings,
          totalSpent,
          lastBookingDate,
        },
        {
          upsert: true, // Create the record if it doesn't exist
          new: true, // Return the updated document
        }
      );

      updatedCustomers++;
      console.log(
        `✅ Updated stats for customer ${clerkUserId}: ${totalBookings} bookings, $${totalSpent}`
      );
    }

    console.log(
      `🎉 Successfully updated stats for ${updatedCustomers} customers`
    );

    // Verify the updates
    console.log('\n📈 Verifying updated customer stats...');
    const customers = await Customer.find({ totalBookings: { $gt: 0 } });
    console.log(`Found ${customers.length} customers with booking stats`);

    for (const customer of customers) {
      console.log(
        `Customer ${customer.clerkUserId}: ${customer.totalBookings} bookings, $${customer.totalSpent}`
      );
    }
  } catch (error) {
    console.error('❌ Error updating customer stats:', error);
  } finally {
    process.exit(0);
  }
}

updateAllCustomerStats();
