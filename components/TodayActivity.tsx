'use client';

import { faker } from '@faker-js/faker';
import ActivityCard from './ActivityCard';

export default function TodayActivity() {
  // Generate fake activity data
  const generateActivities = () => {
    const activities = [];
    const activityCount = faker.number.int({ min: 4, max: 4 });
    
    for (let i = 0; i < activityCount; i++) {
      activities.push({
        id: i,
        status: faker.helpers.arrayElement(['arriving', 'departing']) as 'arriving' | 'departing',
        name: faker.person.fullName(),
        stayDuration: faker.number.int({ min: 1, max: 14 })
      });
    }
    
    return activities;
  };

  const activities = generateActivities();

  return (
    <div className='bg-content1 p-4 md:p-6 rounded-lg border border-divider h-auto md:h-96 flex flex-col'>
      <p className='font-bold text-lg md:text-xl mb-4'>Today's Activity</p>
      
      {/* Column Headers - Hidden on mobile */}
      <div className='hidden md:flex items-center gap-4 p-3 bg-default-100 rounded-lg mb-3 border border-divider'>
        <p className='flex-1 font-semibold text-sm text-default-700'>Guest Name</p>
        <p className='w-24 text-center font-semibold text-sm text-default-700'>Status</p>
        <p className='w-16 text-center font-semibold text-sm text-default-700'>Duration</p>
        <p className='w-24 text-center font-semibold text-sm text-default-700'>Action</p>
      </div>

      <div className='flex-1 flex flex-col md:justify-between space-y-2 md:space-y-0'>
        {activities.map((activity) => (
          <ActivityCard 
            key={activity.id}
            status={activity.status}
            name={activity.name}
            stayDuration={activity.stayDuration}
          />
        ))}
      </div>
    </div>
  );
}
