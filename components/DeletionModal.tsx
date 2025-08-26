import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { UseMutationResult } from '@tanstack/react-query';
import { TrashIcon } from './icons';

interface ModalProps {
  resourceId: string;
  resourceName: string;
  note?: string;
  onDelete: UseMutationResult<any, Error, string, unknown>;
  onResourceDeleted?: () => void;
  itemName?: string;
}
export default function DeletionModal({
  resourceId,
  resourceName,
  note,
  onDelete,
  onResourceDeleted,
  itemName
}: ModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDelete = async () => {
    if (!resourceId) {
      console.error('No resource ID provided');
      return;
    }

    console.log('Attempting to delete resource:', resourceId);

    try {
      const result = await onDelete.mutateAsync(resourceId);
      console.log('Delete successful:', result);

      onOpenChange(); // Close modal
      onResourceDeleted?.(); // Refresh resource list
      addToast({
        title: 'Resource Deleted',
        description: 'The resource has been successfully deleted.',
        color: 'success',
      });
    } catch (error: any) {
      console.error('Delete error:', error);

      // Handle specific error messages from the API
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        title: 'Error deleting customer',
        description: errorMessage,
        color: 'danger',
      });
    }
  };

  return (
    <>
      <Button
        className='w-full sm:w-auto'
        color='danger'
        startContent={<TrashIcon />}
        variant='light'
        onPress={onOpen}>
        Delete
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='md'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Delete {resourceName}
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete {resourceName}:{' '}
                  <strong>{itemName}</strong>?
                </p>
                <p className='text-danger text-sm'>
                  This action cannot be undone.
                </p>
                {note && (
                  <p className='text-warning text-sm mt-2'>Note: {note}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  onPress={handleDelete}
                  isLoading={onDelete.isPending}>
                  {onDelete.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
