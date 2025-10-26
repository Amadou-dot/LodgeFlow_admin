/**
 * Check if a user has an authorized role (admin or staff)
 * @param has - Clerk's has() function from auth()
 * @returns true if user has admin or staff role, false otherwise
 */
export function hasAuthorizedRole(has: ((params: { role: string }) => boolean) | undefined): boolean {
  if (!has) return false;
  
  const isAdmin = has({ role: 'org:admin' });
  const isStaff = has({ role: 'org:staff' });
  
  return isAdmin || isStaff;
}
