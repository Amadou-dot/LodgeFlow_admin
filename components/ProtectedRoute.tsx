'use client';

import { useAuth } from '@clerk/nextjs';
import { Spinner } from '@heroui/spinner';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className='flex flex-col items-center justify-center h-full text-center'>
          <h1 className='text-2xl font-bold mb-4'>Authentication Required</h1>
          <p className='text-gray-600'>Please sign in to access this page.</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
