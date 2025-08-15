'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { Card, CardBody } from '@heroui/card';
import { PlusIcon } from '@/components/icons';
import CabinCard from '@/components/CabinCard';
import CabinModal from '@/components/CabinModal';
import CabinFilters from '@/components/CabinFilters';
import type { CabinFilters as CabinFiltersType } from '@/types';
import { useCabins, useDeleteCabin } from '@/hooks/useCabins';
import type { Cabin } from '@/types';

export default function CabinsPage() {
  const [filters, setFilters] = useState<CabinFiltersType>({});
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDeleteCabin = async (cabin: Cabin) => {
    if (confirm(`Are you sure you want to delete "${cabin.name}"? This action cannot be undone.`)) {
      try {
        await deleteCabin.mutateAsync(cabin.id);
      } catch (error) {
        console.error('Error deleting cabin:', error);
      }
    }
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
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-danger-50 border-danger-200">
          <CardBody>
            <p className="text-danger">Error loading cabins: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cabins</h1>
          <p className="text-default-600 mt-1">
            Manage your cabin inventory and pricing
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={18} />}
          onPress={handleCreateCabin}
          className="w-full sm:w-auto"
        >
          Add New Cabin
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <CabinFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Cabins Grid */}
      {!isLoading && cabins && (
        <>
          {cabins.length === 0 ? (
            <Card className="bg-default-50">
              <CardBody className="text-center py-12">
                <p className="text-default-600 text-lg mb-4">
                  {Object.keys(filters).length > 0 
                    ? 'No cabins match your current filters'
                    : 'No cabins available'
                  }
                </p>
                {Object.keys(filters).length > 0 ? (
                  <Button
                    color="default"
                    variant="bordered"
                    onPress={handleResetFilters}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    onPress={handleCreateCabin}
                    startContent={<PlusIcon size={18} />}
                  >
                    Create Your First Cabin
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-default-600">
                  Showing {cabins.length} cabin{cabins.length !== 1 ? 's' : ''}
                  {Object.keys(filters).length > 0 && ' matching your filters'}
                </p>
              </div>

              {/* Cabins Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cabins.map((cabin) => (
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
    </div>
  );
}