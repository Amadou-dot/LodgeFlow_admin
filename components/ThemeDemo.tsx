'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Link } from '@heroui/link';

export function ThemeDemo() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-content2 rounded w-3/4 mb-4'></div>
          <div className='h-3 bg-content2 rounded w-1/2'></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>🎨 Clerk Theme Integration</h3>
        <Chip
          color={isSignedIn ? 'success' : 'warning'}
          variant='flat'
          size='sm'
        >
          {isSignedIn ? 'Authenticated' : 'Not Authenticated'}
        </Chip>
      </div>

      <Divider />

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-foreground-600'>Theme Status:</span>
          <Chip color='primary' variant='flat' size='sm'>
            Dynamic
          </Chip>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm text-foreground-600'>Auth Provider:</span>
          <Chip color='secondary' variant='flat' size='sm'>
            Clerk
          </Chip>
        </div>

        {isSignedIn && user && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-foreground-600'>User:</span>
            <span className='text-sm font-medium'>
              {user.firstName} {user.lastName}
            </span>
          </div>
        )}
      </div>

      <Divider />

      <div className='space-y-2'>
        <p className='text-sm text-foreground-600'>
          ✅ Clerk uses built-in dark theme when app is dark
          <br />
          ✅ Clerk uses default light theme when app is light
          <br />✅ Simple and automatic theme switching
        </p>

        {!isSignedIn && (
          <div className='flex gap-2 pt-2'>
            <Button
              as={Link}
              href='/sign-in'
              color='primary'
              size='sm'
              className='flex-1'
            >
              Test Sign In
            </Button>
            <Button
              as={Link}
              href='/sign-up'
              color='secondary'
              variant='bordered'
              size='sm'
              className='flex-1'
            >
              Test Sign Up
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
