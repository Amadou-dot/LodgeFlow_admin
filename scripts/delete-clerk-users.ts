import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import { createInterface } from 'readline';
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

const BATCH_SIZE = 3; // Match CLERK_CONCURRENT_LIMIT from config

interface ClerkUserInfo {
  id: string;
  emailAddress: string;
  firstName: string | null;
  lastName: string | null;
}

function askConfirmation(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function getAllClerkUsers(): Promise<ClerkUserInfo[]> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY environment variable is not set');
  }

  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const allUsers: ClerkUserInfo[] = [];
  let offset = 0;
  const limit = 100;

  console.log('📋 Fetching all users from Clerk...');

  while (true) {
    const response = await client.users.getUserList({ limit, offset });

    const users = response.data.map(user => ({
      id: user.id,
      emailAddress:
        user.emailAddresses.find(
          email => email.id === user.primaryEmailAddressId
        )?.emailAddress || 'No email',
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    allUsers.push(...users);

    if (response.data.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Found ${allUsers.length} users in Clerk`);
  return allUsers;
}

async function deleteClerkUsers(): Promise<number> {
  const users = await getAllClerkUsers();

  if (users.length === 0) {
    console.log('⚠️  No users found to delete');
    return 0;
  }

  // List users
  console.log('\n👥 Users to delete:');
  users.forEach((user, index) => {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name';
    console.log(
      `${index + 1}. ${name} (${user.emailAddress}) - ID: ${user.id}`
    );
  });

  // Confirm before proceeding
  const confirmed = await askConfirmation(
    `\n⚠️  Are you sure you want to delete ALL ${users.length} users? This cannot be undone. (y/N): `
  );

  if (!confirmed) {
    console.log('❌ Deletion cancelled');
    return 0;
  }

  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  let deleted = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async user => {
        try {
          await client.users.deleteUser(user.id);
          deleted++;
        } catch (error) {
          console.warn(`⚠️ Failed to delete user ${user.id} (${user.emailAddress}):`, error);
        }
      })
    );

    if (deleted > 0 && deleted % 10 === 0) {
      console.log(`🗑️  Deleted ${deleted}/${users.length} users...`);
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < users.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n✅ Successfully deleted ${deleted}/${users.length} users`);
  return deleted;
}

// Export the function for use in other scripts
export { deleteClerkUsers };

// Run the script if executed directly
if (require.main === module) {
  (async () => {
    try {
      await deleteClerkUsers();
    } catch (error) {
      console.error('❌ Script failed:', error);
      process.exit(1);
    }
  })();
}
