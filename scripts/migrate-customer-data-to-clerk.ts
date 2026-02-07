/**
 * Migration script: Copy extended customer data from MongoDB to Clerk metadata
 *
 * This script reads all Customer documents from MongoDB and writes their
 * extended data fields into Clerk user metadata:
 *   - publicMetadata: nationality, preferences
 *   - privateMetadata: nationalId, address, emergencyContact
 *
 * Stats fields (totalBookings, totalSpent, lastBookingDate) are NOT migrated
 * because they are now computed on demand from the Booking collection.
 *
 * Usage: pnpm tsx scripts/migrate-customer-data-to-clerk.ts
 */

import { createClerkClient } from '@clerk/backend';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!CLERK_SECRET_KEY || !MONGODB_URI) {
  console.error(
    'Missing required environment variables: CLERK_SECRET_KEY, MONGODB_URI'
  );
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

// Inline the Customer schema to avoid Next.js import issues
const CustomerSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true },
    nationality: String,
    nationalId: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    emergencyContact: {
      firstName: String,
      lastName: String,
      phone: String,
      relationship: String,
    },
    preferences: {
      smokingPreference: String,
      dietaryRestrictions: [String],
      accessibilityNeeds: [String],
    },
    totalBookings: Number,
    totalSpent: Number,
    lastBookingDate: Date,
  },
  { timestamps: true }
);

const CustomerModel =
  mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

const MIN_INTERVAL_MS = 150; // Respect Clerk rate limits

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to MongoDB.');

  const customers = await CustomerModel.find({});
  console.log(`Found ${customers.length} customer records to migrate.\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const customer of customers) {
    const clerkUserId = customer.clerkUserId;

    // Build metadata payloads
    const publicMetadata: Record<string, unknown> = {};
    const privateMetadata: Record<string, unknown> = {};

    if (customer.nationality) publicMetadata.nationality = customer.nationality;
    if (customer.preferences) {
      const prefs = customer.preferences.toObject
        ? customer.preferences.toObject()
        : customer.preferences;
      // Only include if there's actual data
      if (
        prefs.smokingPreference ||
        prefs.dietaryRestrictions?.length ||
        prefs.accessibilityNeeds?.length
      ) {
        publicMetadata.preferences = prefs;
      }
    }

    if (customer.nationalId) privateMetadata.nationalId = customer.nationalId;
    if (customer.address) {
      const addr = customer.address.toObject
        ? customer.address.toObject()
        : customer.address;
      if (
        addr.street ||
        addr.city ||
        addr.state ||
        addr.country ||
        addr.zipCode
      ) {
        privateMetadata.address = addr;
      }
    }
    if (customer.emergencyContact) {
      const ec = customer.emergencyContact.toObject
        ? customer.emergencyContact.toObject()
        : customer.emergencyContact;
      if (ec.firstName || ec.lastName || ec.phone || ec.relationship) {
        privateMetadata.emergencyContact = ec;
      }
    }

    // Skip if there's no extended data to migrate
    if (
      Object.keys(publicMetadata).length === 0 &&
      Object.keys(privateMetadata).length === 0
    ) {
      console.log(`  SKIP ${clerkUserId} — no extended data`);
      skipCount++;
      continue;
    }

    try {
      await sleep(MIN_INTERVAL_MS);
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata,
        privateMetadata,
      });
      console.log(
        `  OK   ${clerkUserId} — public: ${Object.keys(publicMetadata).join(', ') || '(none)'}, private: ${Object.keys(privateMetadata).join(', ') || '(none)'}`
      );
      successCount++;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      // Handle rate limiting with retry
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 429
      ) {
        console.log(
          `  RATE LIMITED for ${clerkUserId}, waiting 2s and retrying...`
        );
        await sleep(2000);
        try {
          await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata,
            privateMetadata,
          });
          console.log(`  OK   ${clerkUserId} (retry succeeded)`);
          successCount++;
          continue;
        } catch (retryError) {
          console.error(
            `  FAIL ${clerkUserId} — retry also failed: ${retryError instanceof Error ? retryError.message : String(retryError)}`
          );
          errorCount++;
          continue;
        }
      }

      console.error(`  FAIL ${clerkUserId} — ${message}`);
      errorCount++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Errors:  ${errorCount}`);
  console.log(`  Total:   ${customers.length}`);

  await mongoose.disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
