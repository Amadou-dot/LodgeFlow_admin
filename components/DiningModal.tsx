'use client';

import { useCreateDining, useUpdateDining } from '@/hooks/useDining';
import { Dining } from '@/types';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { addToast } from '@heroui/toast';
import Image from 'next/image';
import { getCategoryColor, getMealTypeColor } from './DiningCard';
import { DiningForm } from './DiningForm';

interface DiningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dining?: Dining | null;
  mode: 'view' | 'create' | 'edit';
  onEdit?: (dining: Dining) => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const DiningModal = ({
  isOpen,
  onClose,
  dining,
  mode,
  onEdit,
}: DiningModalProps) => {
  const createDining = useCreateDining();
  const updateDining = useUpdateDining();

  const isViewMode = mode === 'view';
  const isLoading = createDining.isPending || updateDining.isPending;

  const handleSubmit = async (data: Partial<Dining>) => {
    try {
      if (mode === 'create') {
        await createDining.mutateAsync(data);
      } else if (mode === 'edit' && dining?._id) {
        await updateDining.mutateAsync({ ...data, _id: dining._id });
      }
      onClose();
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger',
      });
    }
  };

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
            {mode === 'view' && `${dining?.name} - Details`}
            {mode === 'create' && 'Add New Dining Item'}
            {mode === 'edit' && `Edit ${dining?.name}`}
          </h2>
          {!isViewMode && (
            <p className='text-sm text-default-600'>
              {mode === 'create'
                ? 'Create a new dining menu item or experience.'
                : 'Update the dining item details below.'}
            </p>
          )}
        </ModalHeader>

        <ModalBody>
          {isViewMode && dining ? (
            <div className='space-y-5'>
              {/* Hero Image */}
              <Image
                src={dining.image}
                alt={dining.name}
                width={800}
                height={300}
                className='w-full h-56 object-cover rounded-lg'
              />

              {/* Quick Info Boxes */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                <div className='bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-primary-600 dark:text-primary-400'>
                    Type
                  </p>
                  <p className='text-lg font-bold text-primary-700 dark:text-primary-300 capitalize'>
                    {dining.type}
                  </p>
                </div>
                <div className='bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-success-600 dark:text-success-400'>
                    Price
                  </p>
                  <p className='text-lg font-bold text-success-700 dark:text-success-300'>
                    ${dining.price}
                  </p>
                </div>
                <div className='bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-warning-600 dark:text-warning-400'>
                    Meal Type
                  </p>
                  <p className='text-lg font-bold text-warning-700 dark:text-warning-300 capitalize'>
                    {dining.mealType}
                  </p>
                </div>
                <div className='bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-secondary-600 dark:text-secondary-400'>
                    Category
                  </p>
                  <p className='text-lg font-bold text-secondary-700 dark:text-secondary-300 capitalize'>
                    {dining.category.replace('-', ' ')}
                  </p>
                </div>
              </div>

              {/* Description */}
              {dining.description && (
                <div>
                  <h4 className='text-sm font-semibold text-default-500 mb-2'>
                    Description
                  </h4>
                  <p className='text-default-700'>{dining.description}</p>
                </div>
              )}

              {/* Serving Details */}
              <div>
                <h4 className='text-sm font-semibold text-default-500 mb-2'>
                  Serving Details
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                  <div className='text-sm'>
                    <span className='text-default-400'>Time: </span>
                    <span className='text-default-700'>
                      {formatTime(dining.servingTime.start)} -{' '}
                      {formatTime(dining.servingTime.end)}
                    </span>
                  </div>
                  <div className='text-sm'>
                    <span className='text-default-400'>Capacity: </span>
                    <span className='text-default-700'>
                      {dining.minPeople === dining.maxPeople
                        ? `${dining.maxPeople} person${dining.maxPeople > 1 ? 's' : ''}`
                        : `${dining.minPeople}-${dining.maxPeople} people`}
                    </span>
                  </div>
                  {dining.duration && (
                    <div className='text-sm'>
                      <span className='text-default-400'>Duration: </span>
                      <span className='text-default-700'>
                        {dining.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dietary */}
              {dining.dietary && dining.dietary.length > 0 && (
                <div>
                  <h4 className='text-sm font-semibold text-default-500 mb-2'>
                    Dietary
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {dining.dietary.map(diet => (
                      <Chip key={diet} color='success' variant='flat' size='sm'>
                        {diet}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {dining.ingredients && dining.ingredients.length > 0 && (
                <div>
                  <h4 className='text-sm font-semibold text-default-500 mb-2'>
                    Ingredients
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {dining.ingredients.map(ingredient => (
                      <Chip
                        key={ingredient}
                        color='default'
                        variant='flat'
                        size='sm'
                      >
                        {ingredient}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {dining.tags && dining.tags.length > 0 && (
                <div>
                  <h4 className='text-sm font-semibold text-default-500 mb-2'>
                    Tags
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {dining.tags.map(tag => (
                      <Chip
                        key={tag}
                        color='primary'
                        variant='bordered'
                        size='sm'
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability & Popularity */}
              <div className='flex gap-2'>
                <Chip
                  color={dining.isAvailable ? 'success' : 'default'}
                  variant='flat'
                >
                  {dining.isAvailable ? 'Available' : 'Unavailable'}
                </Chip>
                {dining.isPopular && (
                  <Chip color='danger' variant='flat'>
                    Popular
                  </Chip>
                )}
                {dining.mealType && (
                  <Chip
                    color={getMealTypeColor(dining.mealType)}
                    variant='flat'
                  >
                    {dining.mealType}
                  </Chip>
                )}
                {dining.category && (
                  <Chip
                    color={getCategoryColor(dining.category)}
                    variant='flat'
                  >
                    {dining.category.replace('-', ' ')}
                  </Chip>
                )}
              </div>
            </div>
          ) : (
            <DiningForm
              dining={dining || undefined}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          )}
        </ModalBody>

        {isViewMode && (
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              Close
            </Button>
            {onEdit && dining && (
              <Button
                color='primary'
                variant='bordered'
                onPress={() => onEdit(dining)}
              >
                Edit Dining Item
              </Button>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
