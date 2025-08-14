'use client';

import { faker } from '@faker-js/faker';
import OverviewInfoCard from './OverviewInfoCard';

export default function OverviewInfoCards() {
  // Generate fake data that updates on each render for demo purposes
  const bookingsCount = faker.number.int({ min: 15, max: 85 });
  const cancellationsCount = faker.number.int({ min: 0, max: 8 });
  const revenue = faker.finance.amount({ min: 5000, max: 25000, dec: 0 });
  const customersCount = faker.number.int({ min: 100, max: 500 });

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
      <OverviewInfoCard 
        title='Bookings' 
        description={bookingsCount.toString()} 
        variant='blue' 
      />
      <OverviewInfoCard
        title='Cancellations'
        description={cancellationsCount.toString()}
        variant='orange'
      />
      <OverviewInfoCard 
        title='Revenue' 
        description={`$${revenue}`} 
        variant='green' 
      />
      <OverviewInfoCard 
        title='Customers' 
        description={customersCount.toString()} 
        variant='purple' 
      />
    </div>
  );
}
