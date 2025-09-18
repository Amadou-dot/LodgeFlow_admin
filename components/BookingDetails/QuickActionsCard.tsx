import { useBookingByEmail, useRecordPayment } from '@/hooks/useBookings';
import { useCabin } from '@/hooks/useCabins';
import { useSendConfirmationEmail } from '@/hooks/useSendEmail';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { useDisclosure } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { useState } from 'react';
import RecordPaymentModal, { PaymentData } from '../RecordPaymentModal';

interface QuickActionsCardProps {
  status: string;
  isPaid: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  actionLoading: string | null;
  firstName: string;
  email: string;
  bookingId: string;
  totalPrice: number;
  remainingAmount: number;
  onPaymentRecorded?: () => void;
}

export default function QuickActionsCard({
  status,
  isPaid,
  onCheckIn,
  onCheckOut,
  actionLoading,
  firstName,
  email,
  bookingId,
  totalPrice,
  remainingAmount,
  onPaymentRecorded,
}: QuickActionsCardProps) {
  const { sendConfirmationEmail } = useSendConfirmationEmail();
  const recordPaymentMutation = useRecordPayment();
  const {
    isOpen: isPaymentModalOpen,
    onOpen: onPaymentModalOpen,
    onClose: onPaymentModalClose,
  } = useDisclosure();
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { data: bookingData, isLoading: bookingLoading } =
    useBookingByEmail(email);
  const { data: cabinData, isLoading: cabinLoading } = useCabin(
    bookingData?.cabin?._id || bookingData?.cabin?.toString() || ''
  );

  const handleSendConfirmation = async () => {
    if (!bookingData || !cabinData) {
      addToast({
        color: 'danger',
        description: 'Booking or cabin data not available',
      });
      return;
    }

    try {
      await sendConfirmationEmail(firstName, email, bookingData, cabinData);
      addToast({
        color: 'success',
        description: 'Confirmation email sent successfully',
      });
    } catch (error) {
      addToast({
        color: 'danger',
        description: `Email Failed to send: ${(error as Error).message}`,
      });
    }
  };

  const handleRecordPayment = async (paymentData: PaymentData) => {
    setPaymentLoading(true);
    try {
      await recordPaymentMutation.mutateAsync({
        bookingId,
        ...paymentData,
      });

      addToast({
        color: 'success',
        description: 'Payment recorded successfully',
      });

      // Call the callback to refresh booking data
      onPaymentRecorded?.();
    } catch (error) {
      addToast({
        color: 'danger',
        description: `Failed to record payment: ${(error as Error).message}`,
      });
      throw error; // Re-throw to keep modal open
    } finally {
      setPaymentLoading(false);
    }
  };

  const isDataLoading = bookingLoading || cabinLoading;

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
          <Button
            color='warning'
            variant='flat'
            fullWidth
            onPress={onPaymentModalOpen}
            isDisabled={actionLoading !== null || paymentLoading}
          >
            Record Payment
          </Button>
        )}
        <Button
          variant='flat'
          fullWidth
          onPress={handleSendConfirmation}
          isDisabled={isDataLoading}
        >
          Send Confirmation Email
        </Button>
        <Button variant='flat' fullWidth>
          Print Booking Details
        </Button>
      </CardBody>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={onPaymentModalClose}
        onRecordPayment={handleRecordPayment}
        totalAmount={totalPrice}
        remainingAmount={remainingAmount}
        bookingId={bookingId}
        guestName={firstName}
      />
    </Card>
  );
}
