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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error('Error fetching customer extended data:', error);
    throw new Error('Failed to fetch customer extended data');
  }
}
