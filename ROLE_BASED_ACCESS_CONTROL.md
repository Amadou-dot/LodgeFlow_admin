# Role-Based Access Control (RBAC) Implementation

## Overview
This application implements role-based access control using Clerk to restrict access based on user roles. Only users with `org:admin` or `org:staff` roles can access the application. Users with the `org:customer` role are denied access.

## Roles Configuration

The following roles are configured in Clerk:

- **`org:admin`** - Full administrative access to the application
- **`org:staff`** - Staff member access to the application
- **`org:customer`** - Customer role (ACCESS DENIED to this application)

## Implementation Details

### 1. Auth Helper Function (`lib/auth-helpers.ts`)

A centralized helper function for role checking to avoid code duplication:

```typescript
export function hasAuthorizedRole(has: ((params: { role: string }) => boolean) | undefined): boolean {
  if (!has) return false;
  
  const isAdmin = has({ role: 'org:admin' });
  const isStaff = has({ role: 'org:staff' });
  
  return isAdmin || isStaff;
}
```

**Benefits:**
- Single source of truth for role authorization logic
- Easy to maintain and update
- Consistent behavior across middleware and client components
- Type-safe with proper TypeScript support

### 2. Middleware-Level Protection (`middleware.ts`)

The primary access control is implemented at the middleware level, which runs before any page or API route is accessed:

**How it works:**
1. Public routes (sign-in, sign-up, unauthorized, webhooks) are allowed without checks
2. For all other routes, the middleware checks if the user is authenticated
3. If authenticated, it uses `hasAuthorizedRole()` to verify the user has either `org:admin` or `org:staff` role
4. Users without authorized roles (including customers) are redirected to `/unauthorized`
5. Only users with `org:admin` or `org:staff` roles can proceed

**Key features:**
- Runs on every request (except public routes)
- Prevents unauthorized access before any page loads
- Handles both authentication and authorization
- Uses centralized helper function for consistency
- No need to explicitly check for customer role - any non-admin/non-staff role is rejected

### 3. Client-Side Protection (`AuthGuard` component)

An additional layer of protection is provided by the `AuthGuard` component for enhanced security:

**How it works:**
1. Checks if authentication is loaded
2. Verifies the user is signed in
3. Uses `hasAuthorizedRole()` helper to check if user has valid role
4. Redirects unauthorized users to `/unauthorized`
5. Shows appropriate loading states during checks

**Benefits:**
- Provides immediate feedback to users
- Prevents unauthorized UI rendering
- Works in conjunction with middleware for defense in depth
- Uses same authorization logic as middleware (via shared helper)

### 4. Unauthorized Page (`/unauthorized`)

A dedicated page for users who are denied access:

**Features:**
- Clear messaging explaining why access was denied
- Guidance to contact system administrators
- Sign-out button to allow users to sign in with different credentials
- Professional, user-friendly design

## Setting Up Roles in Clerk

### Step 1: Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to "Organization Settings" → "Roles"

### Step 2: Create Roles
Create the following roles with these exact keys:
- Key: `org:admin`, Name: "Administrator"
- Key: `org:staff`, Name: "Staff Member"
- Key: `org:customer`, Name: "Customer"

### Step 3: Assign Roles to Users
1. Go to "Users" in the Clerk Dashboard
2. Select a user
3. Under "Organization Memberships", assign the appropriate role
4. Save changes

## Testing the Implementation

### Test Case 1: Admin Access
1. Sign in with a user who has the `org:admin` role
2. Expected: User should be able to access all dashboard pages

### Test Case 2: Staff Access
1. Sign in with a user who has the `org:staff` role
2. Expected: User should be able to access all dashboard pages

### Test Case 3: Customer Rejection
1. Sign in with a user who has the `org:customer` role
2. Expected: User should be immediately redirected to `/unauthorized` page
3. User should see "Access Denied" message
4. User should be able to sign out

### Test Case 4: No Role
1. Sign in with a user who has no organization role assigned
2. Expected: User should be redirected to `/unauthorized` page

## Security Considerations

### Defense in Depth
This implementation uses multiple layers of security:
1. **Auth Helper** - Centralized, reusable role checking logic
2. **Middleware** - Server-side check before route access
3. **AuthGuard** - Client-side check for UI protection
4. **Clerk's built-in protection** - Session and token validation

### Why Multiple Layers?
- **Auth Helper**: Ensures consistency and maintainability
- **Middleware**: Prevents unauthorized server requests and API access
- **AuthGuard**: Provides immediate UI feedback and prevents unauthorized component rendering
- **Clerk**: Ensures session validity and role integrity

### Best Practices Followed
✅ DRY principle - Single helper function for role checking
✅ Server-side authorization (middleware)
✅ Client-side authorization (AuthGuard)
✅ Explicit role checking using Clerk's `has()` method
✅ Graceful error handling with dedicated unauthorized page
✅ Clear user feedback and messaging
✅ Proper redirect flows
✅ No redundant role checks (any non-admin/non-staff is rejected)

## API Route Protection

All API routes are automatically protected by the middleware. For additional API-specific checks, you can use the `hasAuthorizedRole` helper with Clerk's `auth()`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { hasAuthorizedRole } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  const { has } = await auth();
  
  // Check for authorized roles
  if (!hasAuthorizedRole(has)) {
    return new Response('Unauthorized', { status: 403 });
  }
  
  // Your API logic here
}
```

## Troubleshooting

### Issue: Users with correct roles are being denied access
**Solution:** 
- Verify the role keys in Clerk match exactly: `org:admin`, `org:staff`, `org:customer`
- Check that users have been assigned roles in their organization membership
- Ensure the organization is properly set up in Clerk

### Issue: Middleware not running
**Solution:**
- Verify `middleware.ts` is in the root directory
- Check the `matcher` configuration in `middleware.ts`
- Ensure `@clerk/nextjs/server` is properly installed

### Issue: Role checking returns undefined
**Solution:**
- User might not be part of an organization
- Roles must be organization-specific (prefix with `org:`)
- Verify the user's session is properly loaded

## Additional Resources

- [Clerk Role-Based Access Control Documentation](https://clerk.com/docs/organizations/roles-permissions)
- [Clerk Middleware Documentation](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Maintenance

### Adding New Roles
1. Create the role in Clerk Dashboard with `org:` prefix
2. Update `hasAuthorizedRole()` in `lib/auth-helpers.ts` to include the new role
3. The change will automatically apply to both middleware and AuthGuard
4. Update this documentation

### Modifying Access Rules
To change which roles have access:
1. Update the `hasAuthorizedRole()` function in `lib/auth-helpers.ts`
2. The change will automatically propagate to all usage points
3. Test thoroughly before deploying to production
4. Document the changes

### Code Maintenance Benefits
- **Single point of change**: Update role logic in one place
- **Consistency**: Same logic applies everywhere
- **Testability**: Easy to unit test the helper function
- **Type safety**: TypeScript ensures correct usage

## Summary

This implementation provides robust role-based access control that:
- ✅ Denies access to users with `org:customer` role
- ✅ Grants access to users with `org:admin` or `org:staff` roles
- ✅ Uses multiple security layers for defense in depth
- ✅ Provides clear user feedback
- ✅ Follows Clerk and Next.js best practices
- ✅ Is maintainable and well-documented
