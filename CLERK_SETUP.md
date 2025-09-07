# Clerk Authentication Setup

This guide will help you set up Clerk authentication in your LodgeFlow application.

## Prerequisites

- A Clerk account (sign up at [clerk.com](https://clerk.com))
- Your LodgeFlow application

## Setup Instructions

### 1. Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create Application"
3. Choose your preferred sign-in methods
4. Name your application (e.g., "LodgeFlow Admin")

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. In your Clerk Dashboard, go to [API Keys](https://dashboard.clerk.com/last-active?path=api-keys)

3. Copy your keys and update `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

### 3. Configure Clerk Dashboard

In your Clerk Dashboard, configure the following URLs:

**Paths:**
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in URL: `/`
- After sign-up URL: `/`

### 4. Start Your Application

```bash
pnpm dev
```

Your application will now be protected by Clerk authentication!

## 🎨 Theme Integration

The Clerk authentication UI automatically matches your application's theme with a simple approach:

✅ **Automatic Theme Switching**: Uses Clerk's built-in `dark` theme when your app is dark
✅ **Default Light Theme**: Uses Clerk's default styling when your app is light
✅ **Zero Configuration**: No complex theme setup required
✅ **Instant Switching**: Seamless transitions when you toggle themes

**How it works:**
```typescript
// When app is dark → use Clerk's dark theme
// When app is light → use Clerk's default theme
const clerkTheme = resolvedTheme === 'dark' ? dark : undefined;
```

For more details, see [`CLERK_THEME.md`](./CLERK_THEME.md).

## Features Included

✅ **Middleware Protection**: All routes except sign-in/sign-up are protected
✅ **Custom Auth Pages**: Branded sign-in and sign-up pages
✅ **Navigation Integration**: User button in navbar with sign-in/out
✅ **Server Helpers**: Authentication utilities for API routes
✅ **Client Helpers**: React components for protected routes

## Authentication Helpers

### Server-side (API Routes & Server Components)

```typescript
import { requireAuth, getAuth } from '@/lib/auth';

// Require authentication (redirects if not authenticated)
export async function GET() {
  const { userId } = await requireAuth();
  // Your protected API logic here
}

// Optional authentication check
export async function POST() {
  const auth = await getAuth();
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Your logic here
}
```

### Client-side (React Components)

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### Using Clerk Hooks

```typescript
import { useAuth, useUser } from '@clerk/nextjs';

function MyComponent() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return <div>Hello {user?.firstName}!</div>;
}
```

## Testing

1. Visit your application at `http://localhost:3000`
2. You should be redirected to sign-in if not authenticated
3. Create a test account using the sign-up form
4. Verify you can access the dashboard after signing in
5. Test the user button in the navbar (top right)

## Troubleshooting

**Issue**: "Invalid publishable key"
- **Solution**: Check that your environment variables are correctly set and the dev server is restarted

**Issue**: Infinite redirect loop
- **Solution**: Verify your middleware configuration and public routes

**Issue**: Styling issues with auth forms
- **Solution**: Check that Tailwind CSS is properly configured

## Security Notes

- ✅ Environment variables are properly excluded from git
- ✅ All routes are protected by default
- ✅ Only sign-in/sign-up pages are public
- ✅ Middleware enforces authentication on all requests

For more advanced configuration, see the [Clerk Documentation](https://clerk.com/docs).
