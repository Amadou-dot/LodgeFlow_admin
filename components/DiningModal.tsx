import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Dining } from '@/types';
import { DiningForm } from './DiningForm';

interface DiningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dining?: Partial<Dining>;
  onSubmit: (data: Partial<Dining>) => Promise<void>;
  isLoading?: boolean;
}

export const DiningModal = ({
  isOpen,
  onClose,
  dining,
  onSubmit,
  isLoading = false,
}: DiningModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='5xl'
      scrollBehavior='inside'
      classNames={{
        base: 'max-h-[90vh]',
        body: 'p-6',
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 px-6 pt-6 pb-2'>
          <h2 className='text-2xl font-bold'>
            {dining?._id ? 'Edit Dining Item' : 'Add New Dining Item'}
          </h2>
          <p className='text-sm text-default-600'>
            {dining?._id
              ? 'Update the dining item details below.'
              : 'Create a new dining menu item or experience.'}
          </p>
        </ModalHeader>
        <ModalBody>
          <DiningForm
            dining={dining}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
