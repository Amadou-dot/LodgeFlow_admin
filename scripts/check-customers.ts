import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/models';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkCustomerCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📊 Checking Customer collection...');
    const allCustomers = await Customer.find({});
    console.log(`Found ${allCustomers.length} customers in MongoDB`);

    // Show first few customers
    for (const customer of allCustomers.slice(0, 5)) {
      console.log(
        `Customer: ${customer.clerkUserId || 'NO_CLERK_ID'}, totalBookings: ${customer.totalBookings}, totalSpent: ${customer.totalSpent}`
      );
    }

    // Check for any customers without clerkUserId
    const customersWithoutClerkId = await Customer.find({
      clerkUserId: { $exists: false },
    });
    console.log(
      `\nCustomers without clerkUserId: ${customersWithoutClerkId.length}`
    );

    // Check indexes
    const indexes = await Customer.collection.getIndexes();
    console.log('\nIndexes on Customer collection:');
    console.log(JSON.stringify(indexes, null, 2));
  } catch (error) {
    console.error('❌ Error checking customer collection:', error);
  } finally {
    process.exit(0);
  }
}

checkCustomerCollection();
