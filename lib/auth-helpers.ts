type HasFunction = (params: { role: string }) => boolean;

/**
 * Check if a user has an authorized role (admin or staff)
 * @param has - Clerk's has() function from auth()
 * @returns true if user has admin or staff role, false otherwise
 */
export function hasAuthorizedRole(has: HasFunction | undefined): boolean {
  if (!has) return false;

  const isAdmin = has({ role: 'org:admin' });
  const isStaff = has({ role: 'org:staff' });

  return isAdmin || isStaff;
}

/**
 * Authorized role constants for reuse
 */
export const AUTHORIZED_ROLES = {
  ADMIN: 'org:admin',
  STAFF: 'org:staff',
  CUSTOMER: 'org:customer',
} as const;

export type AuthorizedRole =
  (typeof AUTHORIZED_ROLES)[keyof typeof AUTHORIZED_ROLES];
