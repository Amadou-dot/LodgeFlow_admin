import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/models';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function fixCustomerIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📊 Dropping problematic email index...');
    
    try {
      await Customer.collection.dropIndex('email_1');
      console.log('✅ Successfully dropped email_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  email_1 index does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping email_1 index:', error);
      }
    }

    // Also check for any other problematic indexes
    try {
      await Customer.collection.dropIndex('name_text_email_text');
      console.log('✅ Successfully dropped name_text_email_text index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  name_text_email_text index does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping name_text_email_text index:', error);
      }
    }

    // Show remaining indexes
    const indexes = await Customer.collection.getIndexes();
    console.log('\n📋 Remaining indexes on Customer collection:');
    console.log(JSON.stringify(indexes, null, 2));

  } catch (error) {
    console.error('❌ Error fixing customer indexes:', error);
  } finally {
    process.exit(0);
  }
}

fixCustomerIndexes();