'use client';

import { EditIcon } from '@/components/icons';
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

  const handleSuccess = () => {
    onClose();
    onBookingUpdated?.();
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
      {trigger ? <div onClick={onOpen}>{trigger}</div> : defaultTrigger}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='2xl'
        scrollBehavior='inside'
        backdrop='opaque'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <h2 className='text-xl font-bold'>Edit Booking</h2>
            <p className='text-sm text-default-600'>
              Booking editing functionality coming soon...
            </p>
          </ModalHeader>
          <ModalBody>
            <div className='text-center py-8'>
              <p className='text-default-500 mb-4'>
                The booking edit feature is currently under development.
              </p>
              <p className='text-sm text-default-400'>
                For now, you can view and manage booking status through the
                Quick Actions.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
