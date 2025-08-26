import { useDeleteCustomer } from '@/hooks/useCustomers';
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
import { TrashIcon } from './icons';

export default function DeleteCustomerBtn({
  customerId,
  customerName,
  onCustomerDeleted,
}: {
  customerId: string;
  customerName: string;
  onCustomerDeleted?: () => void;
}) {
  const deleteCustomerMutation = useDeleteCustomer();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDelete = async () => {
    if (!customerId) {
      console.error('No customer ID provided');
      return;
    }

    console.log('Attempting to delete customer:', customerId);

    try {
      const result = await deleteCustomerMutation.mutateAsync(customerId);
      console.log('Delete successful:', result);
      
      onOpenChange(); // Close modal
      onCustomerDeleted?.(); // Refresh customer list
      addToast({
        title: 'Customer Deleted',
        description: 'The customer has been successfully deleted.',
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
                Delete Customer
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete{' '}
                  <strong>{customerName}</strong>?
                </p>
                <p className='text-danger text-sm'>
                  This action cannot be undone.
                </p>
                <p className='text-warning text-sm mt-2'>
                  Note: Customers with existing bookings cannot be deleted.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  onPress={() => {
                    console.log('Delete button clicked');
                    handleDelete();
                  }}
                  isLoading={deleteCustomerMutation.isPending}>
                  {deleteCustomerMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
