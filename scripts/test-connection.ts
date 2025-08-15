import connectDB from '../lib/mongodb';

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    await connectDB();
    console.log('✅ MongoDB connection successful!');
    console.log('📋 Database setup ready');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('\n💡 Make sure you have:');
    console.log('1. MongoDB installed and running locally, OR');
    console.log('2. A valid MongoDB Atlas connection string in .env.local');
    console.log('\nCurrent MONGODB_URI:', process.env.MONGODB_URI || 'Not set');
  }
}

testConnection();
