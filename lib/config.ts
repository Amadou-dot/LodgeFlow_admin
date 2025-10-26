/**
 * Application-wide configuration constants
 */

/**
 * SWR (Stale-While-Revalidate) Configuration
 */
export const SWR_CONFIG = {
  /** Default deduping interval for most data fetching (5 seconds) */
  DEDUPING_INTERVAL: 5000,
  
  /** Extended deduping interval for less frequently changing data (10 seconds) */
  DEDUPING_INTERVAL_LONG: 10000,
  
  /** Keep previous data while fetching new data */
  KEEP_PREVIOUS_DATA: true,
  
  /** Don't revalidate on window focus by default */
  REVALIDATE_ON_FOCUS: false,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 10,
  
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
  
  /** Request timeout in milliseconds */
  REQUEST_TIMEOUT: 30000,
  
  /** Maximum concurrent Clerk API calls to avoid rate limiting */
  CLERK_CONCURRENT_LIMIT: 3,
} as const;

/**
 * MongoDB Configuration
 */
export const DB_CONFIG = {
  /** Maximum connection pool size */
  MAX_POOL_SIZE: 10,
  
  /** Server selection timeout in milliseconds */
  SERVER_SELECTION_TIMEOUT: 5000,
  
  /** Socket timeout in milliseconds */
  SOCKET_TIMEOUT: 45000,
} as const;

/**
 * Date Format Configuration
 */
export const DATE_FORMAT = {
  /** Standard date format */
  STANDARD: 'MMM dd, yyyy',
  
  /** Date with time format */
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  
  /** ISO date format */
  ISO: 'yyyy-MM-dd',
} as const;

/**
 * Booking Status Configuration
 */
export const BOOKING_STATUS = {
  UNCONFIRMED: 'unconfirmed',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

/**
 * Currency Configuration
 */
export const CURRENCY = {
  DEFAULT: 'USD',
  SYMBOL: '$',
} as const;

/**
 * Loyalty Tier Thresholds
 */
export const LOYALTY_TIERS = {
  DIAMOND: { threshold: 10000, name: 'Diamond', color: 'secondary' },
  GOLD: { threshold: 5000, name: 'Gold', color: 'warning' },
  SILVER: { threshold: 2000, name: 'Silver', color: 'default' },
  BRONZE: { threshold: 0, name: 'Bronze', color: 'primary' },
} as const;
