'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useDisclosure } from '@heroui/modal';
import Title from '@/components/Title';
import { DiningGrid } from '@/components/DiningGrid';
import { DiningFilters } from '@/components/DiningFilters';
import { DiningModal } from '@/components/DiningModal';
import { PlusIcon } from '@/components/icons';
import { useDining } from '@/hooks/useDining';
import { Dining } from '@/types';

export default function DiningPage() {
  const [selectedDining, setSelectedDining] = useState<Partial<Dining> | undefined>();
  const [filters, setFilters] = useState<{
    type: 'menu' | 'experience' | '';
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'all-day' | '';
    category: 'regular' | 'craft-beer' | 'wine' | 'spirits' | 'non-alcoholic' | '';
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
  };
  
  const { dining, loading, error, createDining, updateDining, deleteDining } = useDining(diningFilters);

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
    setFilters({
      type: '',
      mealType: '',
      category: '',
      isAvailable: null,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dining items</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onPress={() => window.location.reload()} variant="bordered">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Title title="Dining Management" />
          <p className="text-gray-600 mt-2">
            Manage your restaurant menu items and dining experiences
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon />}
          onPress={handleAddDining}
          size="lg"
        >
          Add Dining Item
        </Button>
      </div>

      <DiningFilters
        type={filters.type}
        mealType={filters.mealType}
        category={filters.category}
        isAvailable={filters.isAvailable}
        onTypeChange={(type) => setFilters({ ...filters, type: type as any })}
        onMealTypeChange={(mealType) => setFilters({ ...filters, mealType: mealType as any })}
        onCategoryChange={(category) => setFilters({ ...filters, category: category as any })}
        onAvailabilityChange={(isAvailable) => setFilters({ ...filters, isAvailable })}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Spinner size="lg" color="primary" />
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
