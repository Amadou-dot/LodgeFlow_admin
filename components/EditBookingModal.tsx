'use client';

import { EditIcon } from '@/components/icons';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useUpdateBooking } from '@/hooks/useBookings';
import type { PopulatedBooking } from '@/types';
import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal';
import BookingFormFields from './BookingFormFields';

interface EditBookingModalProps {
  booking: PopulatedBooking;
  onBookingUpdated?: () => void;
  trigger?: React.ReactNode;
}

export default function EditBookingModal({
  booking,
  onBookingUpdated,
  trigger,
}: EditBookingModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateBooking = useUpdateBooking();

  // Use the booking form hook with initial booking data
  const bookingFormHook = useBookingForm(booking);
  const { validateForm, buildBookingData } = bookingFormHook;

  const handleSuccess = () => {
    onClose();
    onBookingUpdated?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const bookingData = {
        ...buildBookingData(),
        _id: booking._id,
        status: booking.status, // Preserve existing status
      };

      await updateBooking.mutateAsync(bookingData as any);
      handleSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleUpdateClick = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const bookingData = {
        ...buildBookingData(),
        _id: booking._id,
        status: booking.status, // Preserve existing status
      };

      await updateBooking.mutateAsync(bookingData as any);
      handleSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const defaultTrigger = (
    <Button
      color='primary'
      variant='flat'
      startContent={<EditIcon className='w-4 h-4' />}
      onPress={onOpen}
    >
      Edit Booking
    </Button>
  );

  return (
    <>
      {trigger ? (
        <span onClick={onOpen} style={{ cursor: 'pointer' }}>
          {trigger}
        </span>
      ) : (
        defaultTrigger
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='5xl'
        scrollBehavior='inside'
        isDismissable={false}
        shouldBlockScroll={true}
        backdrop='opaque'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1 px-6 py-4'>
            <h2 className='text-xl font-bold'>Edit Booking</h2>
            <p className='text-sm text-default-600'>
              Update booking details for{' '}
              {typeof booking.customer === 'string'
                ? booking.customer
                : booking.customer.name}
            </p>
          </ModalHeader>

          <ModalBody className='px-6'>
            <div className='space-y-6'>
              <BookingFormFields
                formData={bookingFormHook.formData}
                specialRequestInput={bookingFormHook.specialRequestInput}
                priceBreakdown={bookingFormHook.priceBreakdown}
                selectedCabin={bookingFormHook.selectedCabin}
                numNights={bookingFormHook.numNights}
                cabins={bookingFormHook.cabins}
                customers={bookingFormHook.customers}
                customersLoading={bookingFormHook.customersLoading}
                settings={bookingFormHook.settings}
                scrollerRef={bookingFormHook.scrollerRef}
                isCustomerOpen={bookingFormHook.isCustomerOpen}
                setIsCustomerOpen={bookingFormHook.setIsCustomerOpen}
                handleInputChange={bookingFormHook.handleInputChange}
                handleCustomerSearch={bookingFormHook.handleCustomerSearch}
                addSpecialRequest={bookingFormHook.addSpecialRequest}
                removeSpecialRequest={bookingFormHook.removeSpecialRequest}
                setSpecialRequestInput={bookingFormHook.setSpecialRequestInput}
                formatCurrency={bookingFormHook.formatCurrency}
                showPayment={true}
                showPricing={true}
              />
            </div>
          </ModalBody>

          <ModalFooter className='px-6 py-4'>
            <Button
              variant='light'
              onPress={onClose}
              isDisabled={updateBooking.isPending}
              type='button'
            >
              Cancel
            </Button>
            <Button
              color='primary'
              onPress={handleUpdateClick}
              isLoading={updateBooking.isPending}
              type='button'
            >
              {updateBooking.isPending ? 'Updating...' : 'Update Booking'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
