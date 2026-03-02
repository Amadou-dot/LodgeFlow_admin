import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '../lib/mongodb';
import { Booking } from '../models';

config({ path: resolve(process.cwd(), '.env.local') });

async function backfillBookingMetadata() {
  try {
    console.log('🔄 Starting Booking metadata backfill...');
    await connectDB();

    const bookings = await Booking.find(
      {},
      '_id totalPrice depositAmount remainingAmount status cancelledAt updatedAt refundStatus'
    );

    let initializedRefundStatus = 0;
    let normalizedRemainingAmount = 0;
    let backfilledCancelledAt = 0;

    const operations = bookings.flatMap(booking => {
      const updates: Record<string, unknown> = {};

      if (!booking.refundStatus) {
        updates.refundStatus = 'none';
        initializedRefundStatus += 1;
      }

      const normalizedRemaining = Math.max(
        0,
        booking.totalPrice - (booking.depositAmount ?? 0)
      );
      if (booking.remainingAmount !== normalizedRemaining) {
        updates.remainingAmount = normalizedRemaining;
        normalizedRemainingAmount += 1;
      }

      if (booking.status === 'cancelled' && !booking.cancelledAt) {
        updates.cancelledAt = booking.updatedAt;
        backfilledCancelledAt += 1;
      }

      if (Object.keys(updates).length === 0) {
        return [];
      }

      return [
        {
          updateOne: {
            filter: { _id: booking._id },
            update: { $set: updates },
          },
        },
      ];
    });

    if (operations.length === 0) {
      console.log('✅ No updates needed. Booking metadata is already aligned.');
      process.exit(0);
    }

    const result = await Booking.bulkWrite(operations, { ordered: false });

    console.log('✅ Booking metadata backfill completed.');
    console.log(`   Scanned bookings: ${bookings.length}`);
    console.log(`   Updated bookings: ${result.modifiedCount}`);
    console.log(`   refundStatus initialized: ${initializedRefundStatus}`);
    console.log(`   remainingAmount normalized: ${normalizedRemainingAmount}`);
    console.log(`   cancelledAt backfilled: ${backfilledCancelledAt}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Booking metadata backfill failed:', error);
    process.exit(1);
  }
}

backfillBookingMetadata();
