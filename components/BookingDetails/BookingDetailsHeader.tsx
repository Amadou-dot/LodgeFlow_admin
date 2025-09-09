import DeletionModal from '@/components/DeletionModal';
import EditBookingModal from '@/components/EditBookingModal';
import { ArrowLeftIcon, TrashIcon } from '@/components/icons';
import type { PopulatedBooking } from '@/types';
import { Button } from '@heroui/button';
import { UseMutationResult } from '@tanstack/react-query';

interface BookingDetailsHeaderProps {
  booking: PopulatedBooking;
  onBack: () => void;
  onBookingUpdated: () => void;
  onDeleteSuccess: () => void;
  deleteMutation: UseMutationResult<void, Error, string, unknown>;
  isCancelable: boolean;
}

export default function BookingDetailsHeader({
  booking,
  onBack,
  onBookingUpdated,
  onDeleteSuccess,
  deleteMutation,
  isCancelable,
}: BookingDetailsHeaderProps) {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center gap-4'>
        <Button isIconOnly variant='flat' onPress={onBack} aria-label='Go back'>
          <ArrowLeftIcon className='w-4 h-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Booking Details</h1>
          <p className='text-default-500'>Booking ID: {booking._id}</p>
        </div>
      </div>
      <div className='flex gap-2'>
        {isCancelable && (
          <EditBookingModal
            booking={booking}
            onBookingUpdated={onBookingUpdated}
          />
        )}
        <DeletionModal
          resourceId={booking._id}
          resourceName={`booking for ${booking.customer?.name || 'Unknown Guest'}`}
          onDelete={deleteMutation}
          onResourceDeleted={onDeleteSuccess}
          itemName='booking'
          buttonProps={{
            color: 'danger',
            variant: 'flat',
            startContent: <TrashIcon className='w-4 h-4' />,
          }}
        />
      </div>
    </div>
  );
}
