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
import { ReactNode } from 'react';

interface ModalProps {
  resourceId: string;
  resourceName: string;
  note?: string;
  onDelete:
    | UseMutationResult<any, Error, string, unknown>
    | (() => Promise<void>);
  onResourceDeleted?: () => void;
  itemName?: string;
  children?: ReactNode; // Custom trigger button
  isOpen?: boolean; // For external control
  onOpenChange?: (open: boolean) => void; // For external control
  buttonProps?: {
    className?: string;
    color?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger';
    variant?:
      | 'solid'
      | 'bordered'
      | 'light'
      | 'flat'
      | 'faded'
      | 'shadow'
      | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    startContent?: ReactNode;
    disabled?: boolean;
  };
}

export default function DeletionModal({
  resourceId,
  resourceName,
  note,
  onDelete,
  onResourceDeleted,
  itemName,
  children,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  buttonProps = {},
}: ModalProps) {
  const internalDisclosure = useDisclosure();

  // Use external control if provided, otherwise use internal
  const isOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalDisclosure.isOpen;
  const onOpenChange = externalOnOpenChange || internalDisclosure.onOpenChange;
  const onOpen = internalDisclosure.onOpen;

  const handleDelete = async () => {
    if (!resourceId) {
      console.error('No resource ID provided');
      return;
    }

    console.log('Attempting to delete resource:', resourceId);

    try {
      let result;
      if (typeof onDelete === 'function') {
        // Handle simple async function
        result = await onDelete();
      } else {
        // Handle React Query mutation
        result = await onDelete.mutateAsync(resourceId);
      }
      console.log('Delete successful:', result);

      onOpenChange(false); // Close modal
      onResourceDeleted?.(); // Refresh resource list
      addToast({
        title: `${resourceName} Deleted`,
        description: `The ${resourceName.toLowerCase()} has been successfully deleted.`,
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
        title: `Error deleting ${resourceName.toLowerCase()}`,
        description: errorMessage,
        color: 'danger',
      });
    }
  };

  const defaultButtonProps = {
    className: 'w-full sm:w-auto',
    color: 'danger' as const,
    startContent: <TrashIcon />,
    variant: 'light' as const,
    ...buttonProps,
  };

  const isDeleting = typeof onDelete !== 'function' && onDelete.isPending;

  return (
    <>
      {/* Render custom trigger or default button */}
      {children ? (
        <div onClick={onOpen} className='cursor-pointer'>
          {children}
        </div>
      ) : (
        <Button {...defaultButtonProps} onPress={onOpen}>
          Delete
        </Button>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='md'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Delete {resourceName}
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete {resourceName.toLowerCase()}
                  {itemName && (
                    <>
                      : <strong>{itemName}</strong>
                    </>
                  )}
                  ?
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
                  isLoading={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
