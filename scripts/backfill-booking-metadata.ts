/**
 * Backfill Booking Metadata
 *
 * Initializes new metadata fields on existing bookings to align the admin
 * dashboard schema with the customer portal.
 *
 * Changes made:
 *   1. Sets `refundStatus` to 'none' on bookings where it is missing
 *   2. Normalizes `remainingAmount` to `max(0, totalPrice - depositAmount)`
 *      — skipped for bookings with `isPaid: true` to avoid reversing paid state
 *   3. Backfills `cancelledAt` from `updatedAt` on cancelled bookings that lack it
 *      — WARNING: these are approximations, not authoritative cancellation times
 *
 * Safety:
 *   - Idempotent: safe to run repeatedly
 *   - Uses `bulkWrite({ ordered: false })` so partial failures do not abort the run
 *   - Inspects `writeErrors` and exits non-zero if any documents fail
 *   - Supports `--dry-run` flag to preview changes without writing
 *
 * Run after deploying the new Booking schema fields and before any client code
 * that reads `refundStatus`, `cancelledAt`, or `remainingAmount`.
 *
 * Usage:
 *   pnpm backfill:booking-metadata            # apply changes
 *   pnpm backfill:booking-metadata --dry-run   # preview only
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '../lib/mongodb';
import { Booking } from '../models';

config({ path: resolve(process.cwd(), '.env.local') });

const isDryRun = process.argv.includes('--dry-run');

async function backfillBookingMetadata() {
  try {
    if (isDryRun) {
      console.log('🔍 DRY RUN — no changes will be written.\n');
    }
    console.log('🔄 Starting Booking metadata backfill...');
    await connectDB();

    const bookings = await Booking.find(
      {},
      '_id totalPrice depositAmount remainingAmount status cancelledAt updatedAt refundStatus isPaid'
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

      // Skip remainingAmount normalization for paid bookings to avoid reversing paid state
      if (!booking.isPaid) {
        const normalizedRemaining = Math.max(
          0,
          booking.totalPrice - (booking.depositAmount ?? 0)
        );
        if (booking.remainingAmount !== normalizedRemaining) {
          updates.remainingAmount = normalizedRemaining;
          normalizedRemainingAmount += 1;
        }
      }

      if (booking.status === 'cancelled' && !booking.cancelledAt) {
        // updatedAt is an approximation — may not reflect actual cancellation time
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

    console.log(`   Scanned bookings: ${bookings.length}`);
    console.log(`   Operations planned: ${operations.length}`);
    console.log(`   refundStatus to initialize: ${initializedRefundStatus}`);
    console.log(
      `   remainingAmount to normalize: ${normalizedRemainingAmount}`
    );
    console.log(
      `   cancelledAt to backfill (approx): ${backfilledCancelledAt}`
    );

    if (operations.length === 0) {
      console.log(
        '\n✅ No updates needed. Booking metadata is already aligned.'
      );
      process.exit(0);
    }

    if (isDryRun) {
      console.log('\n🔍 DRY RUN complete. No changes were written.');
      process.exit(0);
    }

    const result = await Booking.bulkWrite(operations, { ordered: false });

    console.log(`\n✅ Booking metadata backfill completed.`);
    console.log(`   Updated bookings: ${result.modifiedCount}`);

    // Check for per-document write failures (writeErrors exists at runtime
    // with { ordered: false } but is not in the MongoDB driver's type defs)
    if ('writeErrors' in result) {
      const writeErrors = result.writeErrors as unknown[];
      if (writeErrors.length > 0) {
        console.error(
          `\n❌ ${writeErrors.length} write error(s) encountered:`
        );
        for (const err of writeErrors) {
          console.error(`   ${JSON.stringify(err)}`);
        }
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Booking metadata backfill failed:', error);
    process.exit(1);
  }
}

backfillBookingMetadata();
