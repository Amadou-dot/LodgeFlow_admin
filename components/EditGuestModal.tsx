'use client';

import { Modal, ModalContent, ModalBody, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { EditIcon } from '@/components/icons';
import AddGuestForm from './AddGuestForm';

interface EditGuestModalProps {
  guestData: any;
  onGuestUpdated?: () => void;
}

export default function EditGuestModal({
  guestData,
  onGuestUpdated,
}: EditGuestModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSuccess = () => {
    onOpenChange(); // Close modal
    onGuestUpdated?.(); // Refresh the guest data
  };

  return (
    <>
      <Button
        color='primary'
        startContent={<EditIcon />}
        variant='bordered'
        onPress={onOpen}
        className='w-full sm:w-auto'
      >
        Edit Guest
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size='3xl'
        scrollBehavior='inside'
        backdrop='transparent'
      >
        <ModalContent>
          {onClose => (
            <ModalBody>
              <AddGuestForm
                initialData={guestData}
                onSuccess={handleSuccess}
                onCancel={onClose}
                isEditing={true}
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
