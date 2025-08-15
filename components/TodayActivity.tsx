'use client';

import ActivityCard from './ActivityCard';
import { useActivities } from '@/hooks/useData';

export default function TodayActivity() {
  const { data: activities, isLoading, error } = useActivities();

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
        {isLoading && (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-default-100 p-3 rounded-lg animate-pulse">
                <div className="h-4 bg-default-200 rounded"></div>
              </div>
            ))}
          </>
        )}
        
        {error && (
          <div className='bg-danger-50 border border-danger-200 p-4 rounded-lg'>
            <p className='text-danger-600 text-sm'>Failed to load activities</p>
          </div>
        )}
        
        {activities && activities.map((activity) => (
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
