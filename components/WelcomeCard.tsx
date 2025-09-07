'use client';

import { useUser } from '@clerk/nextjs';
import { Card } from '@heroui/card';
import { Spinner } from '@heroui/spinner';

export function WelcomeCard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Card className='p-6 flex items-center justify-center'>
        <Spinner size='sm' />
      </Card>
    );
  }

  return (
    <Card className='p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20'>
      <h2 className='text-2xl font-bold mb-2'>
        Welcome back, {user?.firstName || 'User'}! 👋
      </h2>
      <p className='text-foreground-600'>
        Ready to manage your lodge operations?
      </p>
    </Card>
  );
}
