import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';

interface QuickActionsCardProps {
  status: string;
  isPaid: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  actionLoading: string | null;
}

export default function QuickActionsCard({
  status,
  isPaid,
  onCheckIn,
  onCheckOut,
  actionLoading,
}: QuickActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className='text-lg font-semibold'>Quick Actions</h2>
      </CardHeader>
      <CardBody className='space-y-2'>
        {status === 'confirmed' && (
          <Button
            color='success'
            variant='flat'
            fullWidth
            onPress={onCheckIn}
            isLoading={actionLoading === 'check-in'}
            isDisabled={actionLoading !== null}
          >
            Check In Guest
          </Button>
        )}
        {status === 'checked-in' && (
          <Button
            color='primary'
            variant='flat'
            fullWidth
            onPress={onCheckOut}
            isLoading={actionLoading === 'check-out'}
            isDisabled={actionLoading !== null}
          >
            Check Out Guest
          </Button>
        )}
        {!isPaid && (
          <Button color='warning' variant='flat' fullWidth>
            Record Payment
          </Button>
        )}
        <Button variant='flat' fullWidth>
          Send Confirmation Email
        </Button>
        <Button variant='flat' fullWidth>
          Print Booking Details
        </Button>
      </CardBody>
    </Card>
  );
}
