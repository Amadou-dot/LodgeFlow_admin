type HasFunction = (params: { role: string }) => boolean;

/**
 * Check if a user has an authorized role (admin)
 * @param has - Clerk's has() function from auth()
 * @returns true if user has admin role, false otherwise
 */
export function hasAuthorizedRole(has: HasFunction | undefined): boolean {
  if (!has) return false;

  return has({ role: 'org:admin' });
}

/**
 * Authorized role constants for reuse
 */
export const AUTHORIZED_ROLES = {
  ADMIN: 'org:admin',
  CUSTOMER: 'org:customer',
} as const;

export type AuthorizedRole =
  (typeof AUTHORIZED_ROLES)[keyof typeof AUTHORIZED_ROLES];
