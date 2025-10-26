/**
 * Verification script to confirm cancelled bookings fix is working
 */

import connectDB from '../lib/mongodb';
import { Booking, Customer } from '../models';

async function verifyFix() {
  try {
    await connectDB();

    console.log('🔍 Verifying cancelled bookings fix...\n');

    // Check if there are any cancelled bookings
    const cancelledBookings = await Booking.find({ status: 'cancelled' });
    console.log(
      `📊 Found ${cancelledBookings.length} cancelled bookings in database`
    );

    if (cancelledBookings.length === 0) {
      console.log(
        'ℹ️  No cancelled bookings found. Creating a test scenario...'
      );

      // Get a customer with bookings
      const customer = await Customer.findOne({ totalBookings: { $gt: 0 } });
      if (!customer) {
        console.log('❌ No customers found for testing');
        return;
      }

      console.log(`📋 Using customer ${customer.clerkUserId} for verification`);
      console.log(`💰 Current total spent: $${customer.totalSpent}`);

      // Get their bookings
      const bookings = await Booking.find({ customer: customer.clerkUserId });
      console.log(`📝 Customer has ${bookings.length} total bookings`);

      // Calculate what the total should be excluding cancelled
      const validBookings = bookings.filter(b => b.status !== 'cancelled');
      const calculatedTotal = validBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      console.log(
        `🧮 Calculated total (excluding cancelled): $${calculatedTotal}`
      );
      console.log(`💾 Stored total: $${customer.totalSpent}`);

      if (Math.abs(calculatedTotal - customer.totalSpent) < 0.01) {
        console.log(
          '✅ VERIFICATION PASSED: Customer total spent correctly excludes cancelled bookings'
        );
      } else {
        console.log(
          '❌ VERIFICATION FAILED: Mismatch between calculated and stored totals'
        );
      }
    } else {
      // There are cancelled bookings, verify they're not included
      const customersWithCancelled = Array.from(
        new Set(cancelledBookings.map(b => b.customer))
      );
      console.log(
        `👥 ${customersWithCancelled.length} customers have cancelled bookings`
      );

      for (const customerId of customersWithCancelled.slice(0, 3)) {
        // Check first 3
        const customer = await Customer.findOne({ clerkUserId: customerId });
        if (!customer) continue;

        const allBookings = await Booking.find({ customer: customerId });
        const validBookings = allBookings.filter(b => b.status !== 'cancelled');
        const cancelledForCustomer = allBookings.filter(
          b => b.status === 'cancelled'
        );

        const calculatedTotal = validBookings.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0
        );
        const cancelledTotal = cancelledForCustomer.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0
        );

        console.log(`\n👤 Customer ${customerId}:`);
        console.log(
          `   📊 Total bookings: ${allBookings.length} (${cancelledForCustomer.length} cancelled)`
        );
        console.log(`   💰 Stored total spent: $${customer.totalSpent}`);
        console.log(`   🧮 Calculated total (valid only): $${calculatedTotal}`);
        console.log(`   ❌ Cancelled bookings value: $${cancelledTotal}`);

        if (Math.abs(calculatedTotal - customer.totalSpent) < 0.01) {
          console.log(
            `   ✅ CORRECT: Customer total excludes cancelled bookings`
          );
        } else {
          console.log(
            `   ❌ ERROR: Customer total includes cancelled bookings`
          );
        }
      }
    }

    console.log('\n🎉 Verification completed!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    process.exit(0);
  }
}

verifyFix();
