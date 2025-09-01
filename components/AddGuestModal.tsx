'use client';

import { Modal, ModalContent, ModalBody, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { PlusIcon } from '@/components/icons';
import AddGuestForm from './AddGuestForm';

interface AddGuestModalProps {
  onGuestAdded?: () => void;
}

export default function AddGuestModal({ onGuestAdded }: AddGuestModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSuccess = () => {
    onOpenChange(); // Close modal
    onGuestAdded?.(); // Refresh the guest list
  };

  return (
    <>
      <Button
        color='primary'
        startContent={<PlusIcon />}
        onPress={onOpen}
        className='w-full sm:w-auto'>
        Add New Guest
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size='3xl'
        scrollBehavior='inside'
        // backdrop="opaque"
      >
        <ModalContent>
          {onClose => (
            <ModalBody>
              <AddGuestForm onSuccess={handleSuccess} onCancel={onClose} />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
