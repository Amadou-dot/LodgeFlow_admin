'use client';

import { Button } from '@heroui/button';
import { useState } from 'react';

export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  // This will trigger the error boundary
  if (shouldThrow) {
    throw new Error('This is a test error to showcase the error component!');
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-md mx-auto text-center'>
        <h1 className='text-2xl font-bold mb-4'>Error Component Test</h1>
        <p className='text-default-600 mb-6'>
          Click the button below to trigger an error and see the error component
          in action.
        </p>

        <Button
          color='danger'
          variant='solid'
          onPress={() => setShouldThrow(true)}
          className='w-full'
        >
          🧨 Trigger Test Error
        </Button>

        <p className='text-xs text-default-400 mt-4'>
          This will demonstrate how the error boundary catches and displays
          errors.
        </p>
      </div>
    </div>
  );
}
