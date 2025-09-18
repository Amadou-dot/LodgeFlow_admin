'use client';

import { PlusIcon } from '@/components/icons';
import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal';
import BookingForm from './BookingForm';

interface AddBookingModalProps {
  onBookingAdded?: () => void;
}

export default function AddBookingModal({
  onBookingAdded,
}: AddBookingModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSuccess = () => {
    onClose();
    onBookingAdded?.();
  };

  return (
    <>
      <Button
        color='primary'
        startContent={<PlusIcon size={18} />}
        onPress={onOpen}
        className='w-full sm:w-auto'
      >
        New Booking
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='5xl'
        scrollBehavior='inside'
        isDismissable={false}
        backdrop='opaque'
        shouldBlockScroll={true}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <h2 className='text-xl font-bold'>Create New Booking</h2>
            <p className='text-sm text-default-600'>
              Fill in the details to create a new booking
            </p>
          </ModalHeader>
          <ModalBody className='pb-6'>
            <BookingForm onSuccess={handleSuccess} onCancel={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
