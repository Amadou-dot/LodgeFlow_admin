import { useSendConfirmationEmail } from '@/hooks/useSendEmail';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { addToast } from '@heroui/toast';

interface QuickActionsCardProps {
  status: string;
  isPaid: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  actionLoading: string | null;
  firstName: string;
  email: string;
}

export default function QuickActionsCard({
  status,
  isPaid,
  onCheckIn,
  onCheckOut,
  actionLoading,
  firstName,
  email,
}: QuickActionsCardProps) {
  const { sendConfirmationEmail } = useSendConfirmationEmail();

  const handleSendConfirmation = async () => {
    try {
      await sendConfirmationEmail(firstName, email);
      addToast({
        color: 'success',
        description: 'Confirmation email sent successfully',
      });
    } catch (error) {
      addToast({
        color: 'danger',
        description: 'Failed to send confirmation email',
      });
    }
  };

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
        <Button variant='flat' fullWidth onPress={handleSendConfirmation}>
          Send Confirmation Email
        </Button>
        <Button variant='flat' fullWidth>
          Print Booking Details
        </Button>
      </CardBody>
    </Card>
  );
}
