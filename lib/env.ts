/**
 * Environment Variable Validation
 *
 * This module validates that all required environment variables are present
 * and properly formatted at application startup. Import this module early
 * in your application to catch configuration errors immediately.
 *
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env';
 *
 * // Use typed env variables
 * const uri = env.MONGODB_URI;
 * ```
 */

/**
 * Environment variable configuration schema
 */
interface EnvConfig {
  // Required - Core functionality
  MONGODB_URI: string;

  // Required - Authentication (Clerk)
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;

  // Required - Email (Resend)
  RESEND_API_KEY: string;

  // Optional - Cron jobs
  CRON_SECRET?: string;

  // Optional - Rate limiting
  CLERK_API_CONCURRENT_LIMIT?: number;

  // Runtime
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validation error for environment variables
 */
class EnvValidationError extends Error {
  constructor(missing: string[]) {
    super(
      `Missing required environment variables:\n${missing
        .map(v => `  - ${v}`)
        .join('\n')}\n\nPlease check your .env.local file.`
    );
    this.name = 'EnvValidationError';
  }
}

/**
 * Get required environment variable or throw
 */
function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptional(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get optional number environment variable
 */
function getOptionalNumber(key: string): number | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) {
    console.warn(`Environment variable ${key} is not a valid number: ${value}`);
    return undefined;
  }
  return num;
}

/**
 * Validate all required environment variables at once
 * Returns list of missing variables
 */
function validateRequired(keys: string[]): string[] {
  return keys.filter(key => !process.env[key]);
}

/**
 * Validated environment configuration
 *
 * Use this for type-safe access to environment variables.
 * Will throw on first access if required variables are missing.
 */
function createEnv(): EnvConfig {
  // Check all required variables at once for better error messages
  const requiredKeys = [
    'MONGODB_URI',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'RESEND_API_KEY',
  ];

  const missing = validateRequired(requiredKeys);

  // In development/test, we can be more lenient
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new EnvValidationError(missing);
  } else if (missing.length > 0) {
    console.warn(
      `[env] Missing environment variables (non-production): ${missing.join(', ')}`
    );
  }

  return {
    // Required
    MONGODB_URI: getRequired('MONGODB_URI'),
    CLERK_SECRET_KEY: getRequired('CLERK_SECRET_KEY'),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getRequired('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    RESEND_API_KEY: getRequired('RESEND_API_KEY'),

    // Optional
    CRON_SECRET: getOptional('CRON_SECRET'),
    CLERK_API_CONCURRENT_LIMIT: getOptionalNumber('CLERK_API_CONCURRENT_LIMIT'),

    // Runtime
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  };
}

/**
 * Type-safe environment configuration
 *
 * Access environment variables with full type safety:
 * ```typescript
 * import { env } from '@/lib/env';
 *
 * // TypeScript knows this is a string
 * const mongoUri = env.MONGODB_URI;
 *
 * // TypeScript knows this might be undefined
 * const cronSecret = env.CRON_SECRET;
 * ```
 */
export const env = createEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
