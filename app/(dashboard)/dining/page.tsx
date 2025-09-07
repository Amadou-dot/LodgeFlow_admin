'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useDisclosure } from '@heroui/modal';
import { DiningGrid } from '@/components/DiningGrid';
import DiningFilters from '@/components/DiningFilters';
import { DiningModal } from '@/components/DiningModal';
import { PlusIcon } from '@/components/icons';
import { useDining } from '@/hooks/useDining';
import { Dining } from '@/types';

export default function DiningPage() {
  const [selectedDining, setSelectedDining] = useState<
    Partial<Dining> | undefined
  >();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    type: 'menu' | 'experience' | '';
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'all-day' | '';
    category:
      | 'regular'
      | 'craft-beer'
      | 'wine'
      | 'spirits'
      | 'non-alcoholic'
      | '';
    isAvailable: boolean | null;
  }>({
    type: '',
    mealType: '',
    category: '',
    isAvailable: null,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Transform filters for the hook
  const diningFilters = {
    type: filters.type || undefined,
    mealType: filters.mealType || undefined,
    category: filters.category || undefined,
    isAvailable: filters.isAvailable ?? undefined,
    search: searchTerm || undefined,
  };

  const { dining, loading, error, createDining, updateDining, deleteDining } =
    useDining(diningFilters);

  const handleAddDining = () => {
    setSelectedDining(undefined);
    onOpen();
  };

  const handleEditDining = (dining: Dining) => {
    setSelectedDining(dining);
    onOpen();
  };

  const handleDeleteDining = async (id: string) => {
    const success = await deleteDining(id);
    if (success) {
      console.log('Dining item deleted successfully');
    } else {
      console.error('Failed to delete dining item');
    }
  };

  const handleSubmitDining = async (data: Partial<Dining>) => {
    try {
      if (selectedDining?._id) {
        await updateDining(selectedDining._id, data);
        console.log('Dining item updated successfully');
      } else {
        await createDining(data);
        console.log('Dining item created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save dining item');
      console.error('Error saving dining:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      mealType: '',
      category: '',
      isAvailable: null,
    });
  };

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-danger-50 border border-danger-200 p-4 rounded-lg'>
          <p className='text-danger-600'>Error loading dining items: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Dining Management</h1>
          <p className='text-default-600 mt-1'>
            Manage your restaurant menu items and dining experiences
          </p>
        </div>
        <Button
          color='primary'
          startContent={<PlusIcon />}
          onPress={handleAddDining}
          className='w-full sm:w-auto'
        >
          Add Dining Item
        </Button>
      </div>

      {/* Filters */}
      <div className='mb-8'>
        <DiningFilters
          type={filters.type}
          mealType={filters.mealType}
          category={filters.category}
          isAvailable={filters.isAvailable}
          onTypeChange={(type: string) =>
            setFilters({ ...filters, type: type as any })
          }
          onMealTypeChange={(mealType: string) =>
            setFilters({ ...filters, mealType: mealType as any })
          }
          onCategoryChange={(category: string) =>
            setFilters({ ...filters, category: category as any })
          }
          onAvailabilityChange={(isAvailable: boolean | null) =>
            setFilters({ ...filters, isAvailable })
          }
          onClearFilters={handleClearFilters}
          totalCount={dining?.length || 0}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex justify-center items-center min-h-[300px]'>
          <Spinner size='lg' color='primary' />
        </div>
      ) : (
        <DiningGrid
          dining={dining}
          onEdit={handleEditDining}
          onDelete={handleDeleteDining}
        />
      )}

      <DiningModal
        isOpen={isOpen}
        onClose={onClose}
        dining={selectedDining}
        onSubmit={handleSubmitDining}
      />
    </div>
  );
}
