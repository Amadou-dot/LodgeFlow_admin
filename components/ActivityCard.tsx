interface Props {
  status:
    | 'unconfirmed'
    | 'confirmed'
    | 'checked-in'
    | 'checked-out'
    | 'cancelled';
  name: string;
  stayDuration: string;
}
import { Button } from '@heroui/button';

export default function ActivityCard({ status, name, stayDuration }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-success-600';
      case 'unconfirmed':
        return 'text-warning-600';
      case 'checked-in':
        return 'text-primary-600';
      case 'checked-out':
        return 'text-default-600';
      case 'cancelled':
        return 'text-danger-600';
      default:
        return 'text-default-600';
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'unconfirmed':
        return { text: 'Confirm', color: 'primary' as const };
      case 'confirmed':
        return { text: 'Check in', color: 'success' as const };
      case 'checked-in':
        return { text: 'Check out', color: 'secondary' as const };
      default:
        return { text: 'View', color: 'default' as const };
    }
  };

  const action = getActionButton(status);

  return (
    <div className='bg-content1 rounded-lg border border-divider p-3'>
      {/* Desktop Layout */}
      <div className='hidden md:flex items-center gap-4'>
        <p className='flex-1 font-medium truncate'>{name}</p>
        <p className={`w-32 capitalize text-center ${getStatusColor(status)}`}>
          {status}
        </p>
        <p className='w-20 text-center'>{stayDuration}</p>
        <Button color={action.color} size='sm' className='w-24 min-w-24'>
          {action.text}
        </Button>
      </div>

      {/* Mobile Layout */}
      <div className='md:hidden space-y-3'>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <p className='font-medium text-sm'>{name}</p>
            <div className='flex items-center gap-4 mt-1'>
              <span className={`text-xs capitalize ${getStatusColor(status)}`}>
                {status}
              </span>
              <span className='text-xs text-default-600'>{stayDuration}</span>
            </div>
          </div>
        </div>
        <Button color={action.color} size='sm' className='w-full'>
          {action.text}
        </Button>
      </div>
    </div>
  );
}
