'use client';

import CabinCard from '@/components/CabinCard';
import CabinFilters from '@/components/CabinFilters';
import CabinModal from '@/components/CabinModal';
import { PlusIcon } from '@/components/icons';
import { useCabins, useDeleteCabin } from '@/hooks/useCabins';
import type { Cabin, CabinFilters as CabinFiltersType } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { useState } from 'react';

export default function CabinsPage() {
  const [filters, setFilters] = useState<CabinFiltersType>({});
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>(
    'view'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cabinToDelete, setCabinToDelete] = useState<Cabin | null>(null);

  const { data: cabins, isLoading, error } = useCabins(filters);
  const deleteCabin = useDeleteCabin();

  const handleCreateCabin = () => {
    setSelectedCabin(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewCabin = (cabin: Cabin) => {
    setSelectedCabin(cabin);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditCabin = (cabin: Cabin) => {
    setSelectedCabin(cabin);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCabin = (cabin: Cabin) => {
    setCabinToDelete(cabin);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCabin(null);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='bg-danger-50 border-danger-200'>
          <CardBody>
            <p className='text-danger'>Error loading cabins: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Cabins</h1>
          <p className='text-default-600 mt-1'>
            Manage your cabin inventory and pricing
          </p>
        </div>
        <Button
          color='primary'
          startContent={<PlusIcon size={18} />}
          onPress={handleCreateCabin}
          className='w-full sm:w-auto'>
          Add New Cabin
        </Button>
      </div>

      {/* Filters */}
      <div className='mb-8'>
        <CabinFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
          totalCount={cabins?.length || 0}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center items-center py-12'>
          <Spinner size='lg' label='Loading cabins...' />
        </div>
      )}

      {/* Cabins Grid */}
      {!isLoading && cabins && (
        <>
          {cabins.length === 0 ? (
            <Card className='bg-default-50'>
              <CardBody className='text-center py-12'>
                <p className='text-default-600 text-lg mb-4'>
                  {Object.keys(filters).length > 0
                    ? 'No cabins match your current filters'
                    : 'No cabins available'}
                </p>
                {Object.keys(filters).length > 0 ? (
                  <Button
                    color='default'
                    variant='bordered'
                    onPress={handleResetFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    color='primary'
                    onPress={handleCreateCabin}
                    startContent={<PlusIcon size={18} />}>
                    Create Your First Cabin
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Cabins Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {cabins.map(cabin => (
                  <CabinCard
                    key={cabin.id}
                    cabin={cabin}
                    onView={() => handleViewCabin(cabin)}
                    onEdit={() => handleEditCabin(cabin)}
                    onDelete={() => handleDeleteCabin(cabin)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modal */}
      <CabinModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cabin={selectedCabin}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {cabinToDelete && (
        <Modal isOpen={true} onClose={() => setCabinToDelete(null)} size='md'>
          <ModalContent>
            {(onClose: () => void) => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  Delete Cabin
                </ModalHeader>
                <ModalBody>
                  <p>
                    Are you sure you want to delete cabin:{' '}
                    <strong>{cabinToDelete.name}</strong>?
                  </p>
                  <p className='text-danger text-sm'>
                    This action cannot be undone.
                  </p>
                  <p className='text-warning text-sm mt-2'>
                    Note: Cabins with active bookings cannot be deleted.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color='danger'
                    onPress={async () => {
                      try {
                        await deleteCabin.mutateAsync(cabinToDelete.id);
                        onClose();
                        setCabinToDelete(null);
                      } catch (error) {
                        console.error('Error deleting cabin:', error);
                      }
                    }}
                    isLoading={deleteCabin.isPending}>
                    {deleteCabin.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
