'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn, has } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;

    // If user is not signed in, redirect to sign-in page
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check user role - only allow admin and staff
    const isCustomer = has?.({ role: 'org:customer' });
    const isAdmin = has?.({ role: 'org:admin' });
    const isStaff = has?.({ role: 'org:staff' });

    // If user is a customer or doesn't have admin/staff role, redirect to unauthorized
    if (isCustomer || (!isAdmin && !isStaff)) {
      router.push('/unauthorized');
      return;
    }
  }, [isLoaded, isSignedIn, has, router]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Check role before rendering
  const isCustomer = has?.({ role: 'org:customer' });
  const isAdmin = has?.({ role: 'org:admin' });
  const isStaff = has?.({ role: 'org:staff' });

  if (isCustomer || (!isAdmin && !isStaff)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has valid role, show the protected content
  return <>{children}</>;
}