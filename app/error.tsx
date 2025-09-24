'use client';

import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { useEffect } from 'react';

// Error Icon Component
const ErrorIcon = () => (
  <svg
    className='w-16 h-16 text-danger-500 mx-auto mb-4'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
    />
  </svg>
);

// Refresh Icon Component
const RefreshIcon = () => (
  <svg
    className='w-4 h-4'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    />
  </svg>
);

// Home Icon Component
const HomeIcon = () => (
  <svg
    className='w-4 h-4'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    />
  </svg>
);

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
     
    console.error('Application Error:', error);
  }, [error]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardBody className='text-center p-8'>
          <ErrorIcon />

          <h1 className='text-2xl font-bold text-foreground mb-2'>
            Oops! Something went wrong
          </h1>

          <p className='text-default-600 mb-6 leading-relaxed'>
            We encountered an unexpected error. Don't worry, our team has been
            notified and we're working to fix it.
          </p>

          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <Card className='mb-6 bg-danger-50 border border-danger-200'>
              <CardBody className='p-4'>
                <h3 className='text-sm font-semibold text-danger-800 mb-2'>
                  Error Details (Development Only)
                </h3>
                <p className='text-xs text-danger-700 font-mono text-left break-all'>
                  {error.message}
                </p>
              </CardBody>
            </Card>
          )}

          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              color='primary'
              variant='solid'
              onPress={reset}
              startContent={<RefreshIcon />}
              className='flex-1'
            >
              Try Again
            </Button>

            <Button
              color='default'
              variant='bordered'
              onPress={handleGoHome}
              startContent={<HomeIcon />}
              className='flex-1'
            >
              Go Home
            </Button>
          </div>

          <p className='text-xs text-default-400 mt-6'>
            Error ID: {Date.now().toString(36)}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
