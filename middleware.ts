import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/',
  '/unauthorized(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without any checks
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - require authentication
  const { has, redirectToSignIn, sessionClaims } = await auth();

  // Check if user is authenticated
  if (!sessionClaims) {
    return redirectToSignIn();
  }

  // Check user's role - reject customers
  const isCustomer = has({ role: 'org:customer' });
  const isAdmin = has({ role: 'org:admin' });
  const isStaff = has({ role: 'org:staff' });

  // If user has customer role, redirect them to unauthorized page
  if (isCustomer) {
    const unauthorizedUrl = new URL('/unauthorized', req.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Only allow admin and staff roles to access the application
  if (!isAdmin && !isStaff) {
    const unauthorizedUrl = new URL('/unauthorized', req.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // User has valid role (admin or staff), allow access
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
