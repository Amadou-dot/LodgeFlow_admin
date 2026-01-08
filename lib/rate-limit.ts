/**
 * Simple in-memory rate limiter
 *
 * For production, consider using:
 * - @upstash/ratelimit with @upstash/redis for distributed rate limiting
 * - Redis-based solutions for multi-instance deployments
 *
 * This implementation is suitable for:
 * - Development environments
 * - Single-instance deployments
 * - Low-traffic applications
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limit records
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  /** Standard mutation endpoints (create, update, delete) */
  MUTATION: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute

  /** Email sending endpoints (stricter to prevent spam) */
  EMAIL: { limit: 5, windowMs: 60 * 1000 }, // 5 emails per minute

  /** Customer creation (prevent mass account creation) */
  CUSTOMER_CREATE: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute

  /** Booking creation */
  BOOKING_CREATE: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute

  /** Authentication-related endpoints */
  AUTH: { limit: 10, windowMs: 60 * 1000 }, // 10 attempts per minute
} as const;

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the rate limit (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.MUTATION
): RateLimitResult {
  cleanupExpiredRecords();

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newRecord);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // Check if limit exceeded
  if (record.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment counter
  record.count++;

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Create a rate limit key from user ID and endpoint
 */
export function createRateLimitKey(
  userId: string | undefined,
  endpoint: string
): string {
  return `${userId || 'anonymous'}:${endpoint}`;
}

/**
 * Reset rate limit for a specific identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing counter
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.MUTATION
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      resetTime: now + config.windowMs,
    };
  }

  return {
    success: record.count < config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - record.count),
    resetTime: record.resetTime,
  };
}
