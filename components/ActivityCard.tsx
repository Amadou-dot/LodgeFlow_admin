interface Props {
  status: 'arriving' | 'departing';
  name: string;
  stayDuration: number;
}
import { Button } from '@heroui/button';

export default function ActivityCard({ status, name, stayDuration }: Props) {
  return (
    <div className='bg-content1 rounded-lg border border-divider p-3'>
      {/* Desktop Layout */}
      <div className='hidden md:flex items-center gap-4'>
        <p className='flex-1 font-medium truncate'>{name}</p>
        <p className='w-24 capitalize text-center'>{status}</p>
        <p className='w-16 text-center'>{stayDuration} days</p>
        <Button 
          color='secondary' 
          size='sm'
          className='w-24 min-w-24'
        >
          {status === 'arriving' ? 'Check in' : 'Check out'}
        </Button>
      </div>

      {/* Mobile Layout */}
      <div className='md:hidden space-y-3'>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <p className='font-medium text-sm'>{name}</p>
            <div className='flex items-center gap-4 mt-1'>
              <span className='text-xs text-default-600 capitalize'>{status}</span>
              <span className='text-xs text-default-600'>{stayDuration} days</span>
            </div>
          </div>
        </div>
        <Button 
          color='secondary' 
          size='sm'
          className='w-full'
        >
          {status === 'arriving' ? 'Check in' : 'Check out'}
        </Button>
      </div>
    </div>
  );
}
