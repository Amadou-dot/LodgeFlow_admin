import { createClerkClient } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify environment variables are loaded
console.log('🔧 Environment check:');
console.log('- CLERK_SECRET_KEY present:', !!process.env.CLERK_SECRET_KEY);
console.log(
  '- CLERK_SECRET_KEY starts with sk_:',
  process.env.CLERK_SECRET_KEY?.startsWith('sk_')
);

interface ClerkUserData {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

async function createClerkUsers(count: number = 50): Promise<ClerkUserData[]> {
  try {
    console.log(`👤 Creating ${count} users in Clerk...`);

    // Verify the secret key is available
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }

    const createdUsers: ClerkUserData[] = [];
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      const password = faker.internet.password({ length: 12, memorable: true });

      try {
        // Create user in Clerk (without phone number - not enabled in Clerk Dashboard)
        const user = await client.users.createUser({
          emailAddress: [email],
          firstName: firstName,
          lastName: lastName,
          password: password,
        });

        createdUsers.push({
          id: user.id,
          emailAddress: email,
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: user.imageUrl,
        });

        if ((i + 1) % 10 === 0) {
          console.log(`✅ Created ${i + 1}/${count} users...`);
        }
      } catch (userError) {
        console.warn(`⚠️ Failed to create user ${i + 1}: ${email}`, userError);
        continue;
      }
    }

    console.log(
      `✅ Successfully created ${createdUsers.length} users in Clerk`
    );
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating Clerk users:', error);
    throw error;
  }
}

// Function to create sample bookings using Clerk user IDs
async function createSampleBookings(clerkUsers: ClerkUserData[]) {
  console.log('📝 Sample booking creation would go here...');
  console.log(`Using ${clerkUsers.length} Clerk users for bookings`);

  // Note: This would integrate with the existing seed.ts booking creation logic
  // but instead of customer._id, we'd use the Clerk user ID

  return clerkUsers.map(user => ({
    clerkUserId: user.id,
    email: user.emailAddress,
    name: `${user.firstName} ${user.lastName}`,
  }));
}

// Export the function for use in other scripts
export { createClerkUsers, createSampleBookings };

// Run creation if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      const users = await createClerkUsers(50); // Create 50 users
      const sampleBookings = await createSampleBookings(users);

      console.log('\n📋 Created users summary:');
      console.log(`Total users: ${users.length}`);
      console.log(`Sample bookings prepared: ${sampleBookings.length}`);

      // Optionally save user data to a JSON file for reference
      const fs = await import('fs/promises');
      await fs.writeFile(
        'clerk-users.json',
        JSON.stringify(users, null, 2),
        'utf-8'
      );
      console.log('💾 User data saved to clerk-users.json');
    } catch (error) {
      console.error('❌ Script failed:', error);
      process.exit(1);
    }
  })();
}
