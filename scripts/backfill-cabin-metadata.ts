import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '../lib/mongodb';
import { Cabin } from '../models';

config({ path: resolve(process.cwd(), '.env.local') });

const CABIN_STATUSES = ['active', 'maintenance', 'inactive'] as const;

type LegacyCabinDoc = {
  _id: unknown;
  status?: unknown;
  images?: unknown;
  extraGuestFee?: unknown;
  amenities?: unknown;
  isAvailable?: unknown;
};

async function backfillCabinMetadata() {
  try {
    console.log('🔄 Starting Cabin metadata backfill...');
    await connectDB();

    const cabins = (await Cabin.collection
      .find(
        {},
        {
          projection: {
            _id: 1,
            status: 1,
            images: 1,
            extraGuestFee: 1,
            amenities: 1,
            isAvailable: 1,
          },
        }
      )
      .toArray()) as LegacyCabinDoc[];

    let initializedStatus = 0;
    let initializedImages = 0;
    let initializedExtraGuestFee = 0;
    let convertedLegacyAmenities = 0;

    const operations = cabins.flatMap(cabin => {
      const updates: Record<string, unknown> = {};

      const hasValidStatus =
        typeof cabin.status === 'string' &&
        CABIN_STATUSES.includes(
          cabin.status as (typeof CABIN_STATUSES)[number]
        );
      if (!hasValidStatus) {
        updates.status =
          typeof cabin.isAvailable === 'boolean'
            ? cabin.isAvailable
              ? 'active'
              : 'inactive'
            : 'active';
        initializedStatus += 1;
      }

      if (cabin.images === undefined || cabin.images === null) {
        updates.images = [];
        initializedImages += 1;
      } else if (typeof cabin.images === 'string') {
        updates.images = [cabin.images];
        initializedImages += 1;
      } else if (!Array.isArray(cabin.images)) {
        updates.images = [];
        initializedImages += 1;
      }

      if (cabin.extraGuestFee === undefined || cabin.extraGuestFee === null) {
        updates.extraGuestFee = 0;
        initializedExtraGuestFee += 1;
      }

      if (
        cabin.amenities &&
        typeof cabin.amenities === 'object' &&
        !Array.isArray(cabin.amenities)
      ) {
        const convertedAmenities = Object.entries(cabin.amenities).flatMap(
          ([name, enabled]) =>
            enabled === true || enabled === 1 || enabled === 'true'
              ? [name]
              : []
        );
        updates.amenities = convertedAmenities;
        convertedLegacyAmenities += 1;
      }

      if (Object.keys(updates).length === 0) {
        return [];
      }

      return [
        {
          updateOne: {
            filter: { _id: cabin._id },
            update: { $set: updates },
          },
        },
      ];
    });

    if (operations.length === 0) {
      console.log('✅ No updates needed. Cabin metadata is already aligned.');
      process.exit(0);
    }

    const result = await Cabin.bulkWrite(operations, { ordered: false });

    console.log('✅ Cabin metadata backfill completed.');
    console.log(`   Scanned cabins: ${cabins.length}`);
    console.log(`   Updated cabins: ${result.modifiedCount}`);
    console.log(`   status initialized: ${initializedStatus}`);
    console.log(`   images normalized: ${initializedImages}`);
    console.log(`   extraGuestFee initialized: ${initializedExtraGuestFee}`);
    console.log(`   amenities converted: ${convertedLegacyAmenities}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Cabin metadata backfill failed:', error);
    process.exit(1);
  }
}

backfillCabinMetadata();
