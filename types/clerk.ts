// Clerk User Types based on the provided API response structure

export interface ClerkEmailAddress {
  id: string;
  object: 'email_address';
  email_address: string;
  reserved: boolean;
  verification: {
    object: string;
    status: 'verified' | 'unverified';
    strategy: string;
    attempts: number | null;
    expire_at: number | null;
  };
  linked_to: Array<{
    type: string;
    id: string;
  }>;
  matches_sso_connection: boolean;
  created_at: number;
  updated_at: number;
}

export interface ClerkExternalAccount {
  object: 'external_account';
  id: string;
  provider: string;
  identification_id: string;
  provider_user_id: string;
  approved_scopes: string;
  email_address: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  image_url: string;
  username: string;
  phone_number: string;
  public_metadata: Record<string, any>;
  label: string | null;
  created_at: number;
  updated_at: number;
  verification: {
    object: string;
    status: 'verified' | 'unverified';
    strategy: string;
    attempts: number | null;
    expire_at: number | null;
  };
}

export interface ClerkUser {
  id: string;
  object: 'user';
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  has_image: boolean;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: any[];
  web3_wallets: any[];
  passkeys: any[];
  external_accounts: ClerkExternalAccount[];
  saml_accounts: any[];
  enterprise_accounts: any[];
  public_metadata: Record<string, any>;
  private_metadata: Record<string, any>;
  unsafe_metadata: Record<string, any>;
  external_id: string | null;
  last_sign_in_at: number | null;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number;
  created_at: number;
  updated_at: number;
  delete_self_enabled: boolean;
  create_organization_enabled: boolean;
  last_active_at: number;
  mfa_enabled_at: number | null;
  mfa_disabled_at: number | null;
  legal_accepted_at: number | null;
  profile_image_url: string;
  password_last_updated_at?: number;
}

// Extended customer data that we store in our database
export interface CustomerExtendedData {
  clerkUserId: string; // Reference to Clerk user ID
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
    firstName: string;
    lastName: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    smokingPreference: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
  };
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Combined customer type that merges Clerk user with our extended data
export interface Customer {
  // Clerk user data
  id: string; // Clerk user ID
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string; // Computed from first_name + last_name
  email: string; // Primary email address
  phone?: string; // Primary phone number
  image_url: string;
  has_image: boolean;
  created_at: Date;
  updated_at: Date;
  last_sign_in_at: Date | null;
  last_active_at: Date;

  // Clerk status fields
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;

  // Our extended data (optional, may not exist for all users)
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
    firstName: string;
    lastName: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    smokingPreference: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
  };
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: Date;

  // Recent bookings data (populated from API)
  recentBookings?: Array<{
    _id: string;
    cabin?: {
      name: string;
      image?: string;
    };
    checkInDate: string | Date;
    checkOutDate: string | Date;
    numNights: number;
    status:
      | 'unconfirmed'
      | 'confirmed'
      | 'checked-in'
      | 'checked-out'
      | 'cancelled';
    totalPrice: number;
  }>;

  // Computed properties
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  fullAddress?: string;
}

// Response type for Clerk's getUserList API
export interface ClerkUserListResponse {
  data: ClerkUser[];
  totalCount: number;
}

// Parameters for fetching users from Clerk
export interface ClerkUserListParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  emailAddress?: string[];
  phoneNumber?: string[];
  userId?: string[];
  query?: string;
}
