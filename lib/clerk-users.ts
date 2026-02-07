import type {
  ClerkUserListParams,
  Customer,
  CustomerPrivateMetadata,
  CustomerPublicMetadata,
} from '@/types';
import { clerkClient, User } from '@clerk/nextjs/server';

// In-memory cache for Clerk user data
const userCache = new Map<
  string,
  { data: Customer | null; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

/**
 * Simple cache management
 */
function getCachedUser(userId: string): Customer | null | undefined {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return undefined; // Not in cache or expired
}

function setCachedUser(userId: string, user: Customer | null): void {
  userCache.set(userId, { data: user, timestamp: Date.now() });
}

/**
 * Invalidate cache for a specific user
 */
function invalidateCache(userId: string): void {
  userCache.delete(userId);
}

/**
 * Rate limiting helper with exponential backoff
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

/**
 * Retry mechanism with exponential backoff for rate limited requests
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 429 &&
        attempt < maxRetries
      ) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(
          `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error; // Re-throw if not rate limited or max retries exceeded
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Extract extended data from Clerk user metadata
 */
function extractMetadata(clerkUser: User): {
  publicMeta: CustomerPublicMetadata;
  privateMeta: CustomerPrivateMetadata;
} {
  const publicMeta = (clerkUser.publicMetadata || {}) as CustomerPublicMetadata;
  const privateMeta = (clerkUser.privateMetadata ||
    {}) as CustomerPrivateMetadata;
  return { publicMeta, privateMeta };
}

/**
 * Converts Clerk user data to our Customer format.
 * Extended data is read from Clerk metadata (publicMetadata + privateMetadata).
 */
export function convertClerkUserToCustomer(clerkUser: User): Customer {
  // Get primary email address
  const primaryEmail = clerkUser.emailAddresses.find(
    email => email.id === clerkUser.primaryEmailAddressId
  );

  // Get primary phone number (if available)
  const primaryPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber;

  // Build full name from first and last name
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.username ||
    'Unknown User';

  // Extract metadata
  const { publicMeta, privateMeta } = extractMetadata(clerkUser);

  // totalBookings/totalSpent are computed on demand from Booking collection,
  // default to 0 here since they aren't stored in Clerk metadata
  const totalBookings = 0;
  const loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

  // Build full address from privateMetadata
  let fullAddress = '';
  if (privateMeta.address) {
    const { street, city, state, country, zipCode } = privateMeta.address;
    fullAddress = [street, city, state, country, zipCode]
      .filter(Boolean)
      .join(', ');
  }

  return {
    // Clerk user data
    id: clerkUser.id,
    username: clerkUser.username,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    name,
    email: primaryEmail?.emailAddress || '',
    phone: primaryPhone,
    image_url: clerkUser.imageUrl,
    has_image: clerkUser.hasImage,
    created_at: new Date(clerkUser.createdAt),
    updated_at: new Date(clerkUser.updatedAt),
    last_sign_in_at: clerkUser.lastSignInAt
      ? new Date(clerkUser.lastSignInAt)
      : null,
    last_active_at: new Date(clerkUser.lastActiveAt || clerkUser.createdAt),

    // Clerk status fields
    banned: clerkUser.banned,
    locked: clerkUser.locked,
    lockout_expires_in_seconds: null,

    // Extended data from Clerk metadata
    nationality: publicMeta.nationality,
    nationalId: privateMeta.nationalId,
    address: privateMeta.address,
    emergencyContact: privateMeta.emergencyContact,
    preferences: publicMeta.preferences,

    // Computed on demand — default to 0 here
    totalBookings,
    totalSpent: 0,
    lastBookingDate: undefined,

    // Computed properties
    loyaltyTier,
    fullAddress,
  };
}

/**
 * Get a list of users from Clerk with pagination and filtering
 */
export async function getClerkUsers(params: ClerkUserListParams = {}): Promise<{
  data: Customer[];
  totalCount: number;
}> {
  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: params.limit || 10,
      offset: params.offset || 0,
      orderBy: (params.orderBy || '-created_at') as
        | '+created_at'
        | '-created_at'
        | '+updated_at'
        | '-updated_at'
        | '+email_address'
        | '-email_address'
        | '+phone_number'
        | '-phone_number'
        | '+username'
        | '-username'
        | '+first_name'
        | '-first_name'
        | '+last_name'
        | '-last_name',
      emailAddress: params.emailAddress,
      phoneNumber: params.phoneNumber,
      userId: params.userId,
      query: params.query,
    });

    // Convert Clerk users to our Customer format (metadata is already on the user object)
    const customers = response.data.map((clerkUser: User) =>
      convertClerkUserToCustomer(clerkUser)
    );

    return {
      data: customers,
      totalCount: response.totalCount,
    };
  } catch (error) {
    console.error('Error fetching users from Clerk:', error);
    throw new Error('Failed to fetch users from Clerk');
  }
}

/**
 * Get a single user from Clerk by ID
 */
export async function getClerkUser(userId: string): Promise<Customer | null> {
  // Check cache first
  const cachedUser = getCachedUser(userId);
  if (cachedUser !== undefined) {
    return cachedUser;
  }

  try {
    const customer = await retryWithBackoff(async () => {
      await waitForRateLimit();

      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      return convertClerkUserToCustomer(clerkUser);
    });

    // Cache the result
    setCachedUser(userId, customer);

    return customer;
  } catch (error: unknown) {
    console.error('Error fetching user from Clerk:', error);

    // Handle different types of errors gracefully
    if (error && typeof error === 'object') {
      const typedError = error as {
        status?: number;
        errors?: Array<{ code?: string }>;
      };

      if (
        typedError.status === 404 ||
        typedError.errors?.[0]?.code === 'resource_not_found'
      ) {
        setCachedUser(userId, null);
        return null;
      }

      if (typedError.status === 429) {
        console.warn(
          'Rate limited by Clerk API after retries, returning null for user:',
          userId
        );
        return null;
      }

      if (typedError.status && typedError.status >= 500) {
        console.warn('Clerk server error, returning null for user:', userId);
        return null;
      }
    }

    console.warn('Unknown Clerk error, returning null for user:', userId);
    return null;
  }
}

/**
 * Get total count of users from Clerk
 */
export async function getClerkUserCount(): Promise<number> {
  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: 1,
      offset: 0,
    });
    return response.totalCount;
  } catch (error) {
    console.error('Error fetching user count from Clerk:', error);
    throw new Error('Failed to fetch user count from Clerk');
  }
}

/**
 * Search users from Clerk with query
 */
export async function searchClerkUsers(
  query: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ data: Customer[]; totalCount: number }> {
  return getClerkUsers({
    query,
    limit,
    offset,
    orderBy: '-created_at',
  });
}

/**
 * Batch fetch multiple Clerk users with optimized caching
 */
export async function getClerkUsersBatch(
  userIds: string[]
): Promise<Map<string, Customer | null>> {
  const results = new Map<string, Customer | null>();
  const uncachedIds: string[] = [];

  // Check cache first for all IDs
  for (const userId of userIds) {
    const cached = getCachedUser(userId);
    if (cached !== undefined) {
      results.set(userId, cached);
    } else {
      uncachedIds.push(userId);
    }
  }

  if (uncachedIds.length === 0) {
    return results;
  }

  // Fetch Clerk users in batches with concurrency limit
  const CONCURRENT_LIMIT = Number(process.env.CLERK_API_CONCURRENT_LIMIT) || 3;
  const chunks: string[][] = [];

  for (let i = 0; i < uncachedIds.length; i += CONCURRENT_LIMIT) {
    chunks.push(uncachedIds.slice(i, i + CONCURRENT_LIMIT));
  }

  for (const chunk of chunks) {
    const clerkResults = await Promise.all(
      chunk.map(async userId => {
        try {
          await waitForRateLimit();
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(userId);
          const customer = convertClerkUserToCustomer(clerkUser);

          setCachedUser(userId, customer);
          return { userId, customer };
        } catch (error: unknown) {
          console.error(`Error fetching user ${userId}:`, error);

          if (
            error &&
            typeof error === 'object' &&
            'status' in error &&
            (error.status === 404 || error.status === 429)
          ) {
            setCachedUser(userId, null);
          }

          return { userId, customer: null };
        }
      })
    );

    for (const { userId, customer } of clerkResults) {
      results.set(userId, customer);
    }
  }

  return results;
}

/**
 * Create a new user in Clerk with required fields
 */
export async function createClerkUser(userData: {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}): Promise<User> {
  try {
    const client = await clerkClient();

    interface ClerkCreateUserParams {
      emailAddress: string[];
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string[];
      username?: string;
    }

    const createParams: ClerkCreateUserParams = {
      emailAddress: [userData.email],
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };

    if (userData.phone) {
      createParams.phoneNumber = [userData.phone];
    }

    if (userData.username) {
      createParams.username = userData.username;
    }

    const clerkUser = await client.users.createUser(createParams);
    return clerkUser;
  } catch (error: unknown) {
    console.error('Error creating user in Clerk:', error);

    if (error && typeof error === 'object' && 'errors' in error) {
      const clerkError = error as { errors: Array<{ message: string }> };
      const errorMessages = clerkError.errors
        .map(err => err.message)
        .join(', ');
      throw new Error(`Failed to create user: ${errorMessages}`);
    }

    throw new Error('Failed to create user in Clerk');
  }
}

/**
 * Update a user in Clerk
 */
export async function updateClerkUser(
  userId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    username?: string;
  }
): Promise<User> {
  try {
    const client = await clerkClient();

    interface ClerkUpdateUserParams {
      firstName?: string;
      lastName?: string;
      username?: string;
    }

    const updateParams: ClerkUpdateUserParams = {};

    if (userData.firstName !== undefined) {
      updateParams.firstName = userData.firstName;
    }
    if (userData.lastName !== undefined) {
      updateParams.lastName = userData.lastName;
    }
    if (userData.username !== undefined) {
      updateParams.username = userData.username;
    }

    const clerkUser = await client.users.updateUser(userId, updateParams);
    return clerkUser;
  } catch (error: unknown) {
    console.error('Error updating user in Clerk:', error);

    if (error && typeof error === 'object' && 'errors' in error) {
      const clerkError = error as { errors: Array<{ message: string }> };
      const errorMessages = clerkError.errors
        .map(err => err.message)
        .join(', ');
      throw new Error(`Failed to update user: ${errorMessages}`);
    }

    throw new Error('Failed to update user in Clerk');
  }
}

/**
 * Delete a user from Clerk
 */
export async function deleteClerkUser(userId: string): Promise<User> {
  try {
    const client = await clerkClient();
    const deletedUser = await client.users.deleteUser(userId);
    return deletedUser;
  } catch (error: unknown) {
    console.error('Error deleting user from Clerk:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      throw new Error('User not found');
    }

    throw new Error('Failed to delete user from Clerk');
  }
}

/**
 * Lock a user in Clerk (prevent them from signing in)
 */
export async function lockClerkUser(userId: string): Promise<User> {
  try {
    const client = await clerkClient();
    const lockedUser = await client.users.lockUser(userId);
    return lockedUser;
  } catch (error: unknown) {
    console.error('Error locking user in Clerk:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      throw new Error('User not found');
    }

    throw new Error('Failed to lock user in Clerk');
  }
}

/**
 * Unlock a user in Clerk (allow them to sign in again)
 */
export async function unlockClerkUser(userId: string): Promise<User> {
  try {
    const client = await clerkClient();
    const unlockedUser = await client.users.unlockUser(userId);
    return unlockedUser;
  } catch (error: unknown) {
    console.error('Error unlocking user in Clerk:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      throw new Error('User not found');
    }

    throw new Error('Failed to unlock user in Clerk');
  }
}

/**
 * Create a complete customer (Clerk user + metadata)
 */
export async function createCompleteCustomer(userData: {
  // Required Clerk fields
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;

  // Extended data fields (stored in Clerk metadata)
  nationality?: string;
  nationalId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    relationship?: string;
  };
  preferences?: {
    smokingPreference?: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
  };
}): Promise<Customer> {
  try {
    // 1. Create user in Clerk
    const clerkUser = await createClerkUser({
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
    });

    // 2. Store extended data in Clerk metadata
    const publicMetadata: CustomerPublicMetadata = {};
    const privateMetadata: CustomerPrivateMetadata = {};

    if (userData.nationality) publicMetadata.nationality = userData.nationality;
    if (userData.preferences)
      publicMetadata.preferences =
        userData.preferences as CustomerPublicMetadata['preferences'];

    if (userData.nationalId) privateMetadata.nationalId = userData.nationalId;
    if (userData.address) privateMetadata.address = userData.address;
    if (userData.emergencyContact)
      privateMetadata.emergencyContact =
        userData.emergencyContact as CustomerPrivateMetadata['emergencyContact'];

    const client = await clerkClient();
    const updatedUser = await client.users.updateUserMetadata(clerkUser.id, {
      publicMetadata,
      privateMetadata,
    });

    // 3. Return combined customer object
    return convertClerkUserToCustomer(updatedUser);
  } catch (error) {
    console.error('Error creating complete customer:', error);
    throw error;
  }
}

/**
 * Delete a complete customer (Clerk user only — no more MongoDB)
 */
export async function deleteCompleteCustomer(
  clerkUserId: string
): Promise<void> {
  try {
    await deleteClerkUser(clerkUserId);
    invalidateCache(clerkUserId);
  } catch (error) {
    console.error('Error deleting complete customer:', error);
    throw error;
  }
}

/**
 * Update a complete customer (Clerk user + metadata)
 */
export async function updateCompleteCustomer(
  clerkUserId: string,
  userData: {
    // Clerk fields that can be updated
    firstName?: string;
    lastName?: string;
    username?: string;

    // Extended data fields (stored in Clerk metadata)
    nationality?: string;
    nationalId?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    emergencyContact?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      relationship?: string;
    };
    preferences?: {
      smokingPreference?: 'smoking' | 'non-smoking' | 'no-preference';
      dietaryRestrictions?: string[];
      accessibilityNeeds?: string[];
    };
  }
): Promise<Customer> {
  try {
    const client = await clerkClient();

    // 1. Update user in Clerk (only if Clerk-related fields are provided)
    let clerkUser;
    const clerkUpdateFields = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
    };

    const hasClerkUpdates = Object.values(clerkUpdateFields).some(
      value => value !== undefined
    );

    if (hasClerkUpdates) {
      clerkUser = await updateClerkUser(clerkUserId, clerkUpdateFields);
    } else {
      clerkUser = await client.users.getUser(clerkUserId);
    }

    // 2. Update extended data in Clerk metadata
    const publicMetadata: Partial<CustomerPublicMetadata> = {};
    const privateMetadata: Partial<CustomerPrivateMetadata> = {};
    let hasMetadataUpdates = false;

    if (userData.nationality !== undefined) {
      publicMetadata.nationality = userData.nationality;
      hasMetadataUpdates = true;
    }
    if (userData.preferences !== undefined) {
      publicMetadata.preferences =
        userData.preferences as CustomerPublicMetadata['preferences'];
      hasMetadataUpdates = true;
    }

    if (userData.nationalId !== undefined) {
      privateMetadata.nationalId = userData.nationalId;
      hasMetadataUpdates = true;
    }
    if (userData.address !== undefined) {
      privateMetadata.address = userData.address;
      hasMetadataUpdates = true;
    }
    if (userData.emergencyContact !== undefined) {
      privateMetadata.emergencyContact =
        userData.emergencyContact as CustomerPrivateMetadata['emergencyContact'];
      hasMetadataUpdates = true;
    }

    if (hasMetadataUpdates) {
      clerkUser = await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata,
        privateMetadata,
      });
    }

    // Invalidate cache
    invalidateCache(clerkUserId);

    // 3. Return updated combined customer object
    if (!clerkUser) {
      throw new Error('Failed to get updated user data');
    }

    return convertClerkUserToCustomer(clerkUser);
  } catch (error) {
    console.error('Error updating complete customer:', error);
    throw error;
  }
}
