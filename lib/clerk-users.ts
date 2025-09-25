import CustomerModel from '@/models/Customer';
import { ClerkUserListParams, Customer, CustomerExtendedData } from '@/types';
import { clerkClient, User } from '@clerk/nextjs/server';
import connectDB from './mongodb';

/**
 * Service functions for interacting with Clerk users and combining with our extended data
 */

/**
 * Converts Clerk user data to our Customer format
 */
export function convertClerkUserToCustomer(
  clerkUser: User,
  extendedData?: CustomerExtendedData
): Customer {
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

  // Calculate loyalty tier
  const totalBookings = extendedData?.totalBookings || 0;
  let loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
  if (totalBookings >= 10) loyaltyTier = 'platinum';
  else if (totalBookings >= 5) loyaltyTier = 'gold';
  else if (totalBookings >= 2) loyaltyTier = 'silver';

  // Build full address
  let fullAddress = '';
  if (extendedData?.address) {
    const { street, city, state, country, zipCode } = extendedData.address;
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
    // Clerk does not currently provide lockout expiration information in the User object
    lockout_expires_in_seconds: null,

    // Extended data (with defaults)
    nationality: extendedData?.nationality,
    nationalId: extendedData?.nationalId,
    address: extendedData?.address,
    emergencyContact: extendedData?.emergencyContact,
    preferences: extendedData?.preferences,
    totalBookings: extendedData?.totalBookings || 0,
    totalSpent: extendedData?.totalSpent || 0,
    lastBookingDate: extendedData?.lastBookingDate,

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
    // Fetch users from Clerk
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: params.limit || 10,
      offset: params.offset || 0,
      orderBy: (params.orderBy as any) || '-created_at',
      emailAddress: params.emailAddress,
      phoneNumber: params.phoneNumber,
      userId: params.userId,
      query: params.query,
    });

    // Get extended data for all users
    await connectDB();
    const clerkUserIds = response.data.map((user: User) => user.id);
    const extendedDataList = await CustomerModel.find({
      clerkUserId: { $in: clerkUserIds },
    });

    // Create a map for quick lookup
    const extendedDataMap = new Map<string, CustomerExtendedData>();
    extendedDataList.forEach(data => {
      extendedDataMap.set(data.clerkUserId, data);
    });

    // Convert Clerk users to our Customer format
    const customers = response.data.map((clerkUser: User) => {
      const extendedData = extendedDataMap.get(clerkUser.id);
      return convertClerkUserToCustomer(clerkUser, extendedData);
    });

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
  try {
    // Fetch user from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Get extended data from our database
    await connectDB();
    const extendedData = await CustomerModel.findOne({ clerkUserId: userId });

    return convertClerkUserToCustomer(clerkUser, extendedData);
  } catch (error: any) {
     
    console.error('Error fetching user from Clerk:', error);
    if (error?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user from Clerk');
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
 * Create or update extended customer data in our database
 */
export async function upsertCustomerExtendedData(
  clerkUserId: string,
  data: Partial<
    Omit<CustomerExtendedData, 'clerkUserId' | 'createdAt' | 'updatedAt'>
  >
): Promise<CustomerExtendedData> {
  try {
    await connectDB();
    const extendedData = await CustomerModel.findOneAndUpdate(
      { clerkUserId },
      { ...data, clerkUserId },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    return extendedData;
  } catch (error) {
     
    console.error('Error upserting customer extended data:', error);
    throw new Error('Failed to update customer extended data');
  }
}

/**
 * Get extended customer data from our database
 */
export async function getCustomerExtendedData(
  clerkUserId: string
): Promise<CustomerExtendedData | null> {
  try {
    await connectDB();
    return await CustomerModel.findOne({ clerkUserId });
  } catch (error) {
     
    console.error('Error fetching customer extended data:', error);
    throw new Error('Failed to fetch customer extended data');
  }
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

    const createParams: any = {
      emailAddress: [userData.email],
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };

    // Add optional fields if provided
    if (userData.phone) {
      createParams.phoneNumber = [userData.phone];
    }

    if (userData.username) {
      createParams.username = userData.username;
    }

    const clerkUser = await client.users.createUser(createParams);
    return clerkUser;
  } catch (error: any) {
     
    console.error('Error creating user in Clerk:', error);

    // Handle specific Clerk errors
    if (error?.errors) {
      const errorMessages = error.errors
        .map((err: any) => err.message)
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

    const updateParams: any = {};

    // Only include fields that are provided
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
  } catch (error: any) {
     
    console.error('Error updating user in Clerk:', error);

    // Handle specific Clerk errors
    if (error?.errors) {
      const errorMessages = error.errors
        .map((err: any) => err.message)
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
  } catch (error: any) {
     
    console.error('Error deleting user from Clerk:', error);

    if (error?.status === 404) {
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
  } catch (error: any) {
     
    console.error('Error locking user in Clerk:', error);

    if (error?.status === 404) {
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
  } catch (error: any) {
     
    console.error('Error unlocking user in Clerk:', error);

    if (error?.status === 404) {
      throw new Error('User not found');
    }

    throw new Error('Failed to unlock user in Clerk');
  }
}

/**
 * Create a complete customer (Clerk user + extended data)
 */
export async function createCompleteCustomer(userData: {
  // Required Clerk fields
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;

  // Extended data fields
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

    // 2. Create extended data in our database
    const extendedDataToSave: any = {
      clerkUserId: clerkUser.id,
    };

    // Add optional extended data fields if provided
    if (userData.nationality)
      extendedDataToSave.nationality = userData.nationality;
    if (userData.nationalId)
      extendedDataToSave.nationalId = userData.nationalId;
    if (userData.address) extendedDataToSave.address = userData.address;
    if (userData.emergencyContact)
      extendedDataToSave.emergencyContact = userData.emergencyContact;
    if (userData.preferences)
      extendedDataToSave.preferences = userData.preferences;

    const extendedData = await upsertCustomerExtendedData(
      clerkUser.id,
      extendedDataToSave
    );

    // 3. Return combined customer object
    return convertClerkUserToCustomer(clerkUser, extendedData);
  } catch (error) {
     
    console.error('Error creating complete customer:', error);
    throw error; // Re-throw to preserve the original error message
  }
}

/**
 * Delete a complete customer (Clerk user + extended data)
 */
export async function deleteCompleteCustomer(
  clerkUserId: string
): Promise<void> {
  try {
    // 1. Delete extended data from our database first
    await connectDB();
    await CustomerModel.findOneAndDelete({ clerkUserId });

    // 2. Delete user from Clerk
    await deleteClerkUser(clerkUserId);
  } catch (error) {
     
    console.error('Error deleting complete customer:', error);
    throw error; // Re-throw to preserve the original error message
  }
}

/**
 * Update a complete customer (Clerk user + extended data)
 */
export async function updateCompleteCustomer(
  clerkUserId: string,
  userData: {
    // Clerk fields that can be updated
    firstName?: string;
    lastName?: string;
    username?: string;

    // Extended data fields
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
    // 1. Update user in Clerk (only if Clerk-related fields are provided)
    let clerkUser;
    const clerkUpdateFields = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
    };

    // Check if any Clerk fields need updating
    const hasClerkUpdates = Object.values(clerkUpdateFields).some(
      value => value !== undefined
    );

    if (hasClerkUpdates) {
      clerkUser = await updateClerkUser(clerkUserId, clerkUpdateFields);
    } else {
      // Get current Clerk user if no updates needed
      const client = await clerkClient();
      clerkUser = await client.users.getUser(clerkUserId);
    }

    // 2. Update extended data in our database
    const extendedDataToUpdate: any = {};

    // Add optional extended data fields if provided
    if (userData.nationality !== undefined)
      extendedDataToUpdate.nationality = userData.nationality;
    if (userData.nationalId !== undefined)
      extendedDataToUpdate.nationalId = userData.nationalId;
    if (userData.address !== undefined)
      extendedDataToUpdate.address = userData.address;
    if (userData.emergencyContact !== undefined)
      extendedDataToUpdate.emergencyContact = userData.emergencyContact;
    if (userData.preferences !== undefined)
      extendedDataToUpdate.preferences = userData.preferences;

    let extendedData;
    if (Object.keys(extendedDataToUpdate).length > 0) {
      extendedData = await upsertCustomerExtendedData(
        clerkUserId,
        extendedDataToUpdate
      );
    } else {
      extendedData = await getCustomerExtendedData(clerkUserId);
    }

    // 3. Return updated combined customer object
    if (!clerkUser) {
      throw new Error('Failed to get updated user data');
    }

    return convertClerkUserToCustomer(clerkUser, extendedData || undefined);
  } catch (error) {
     
    console.error('Error updating complete customer:', error);
    throw error; // Re-throw to preserve the original error message
  }
}
