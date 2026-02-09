'use client';

import { useCreateCabin, useUpdateCabin } from '@/hooks/useCabins';
import type { Cabin } from '@/types';
import { isImageUrl } from '@/utils/utilityFunctions';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Input, Textarea } from '@heroui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { addToast } from '@heroui/toast';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabin?: Cabin | null;
  mode: 'view' | 'create' | 'edit';
  onEdit?: (cabin: Cabin) => void;
}

export default function CabinModal({
  isOpen,
  onClose,
  cabin,
  mode,
  onEdit,
}: CabinModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    capacity: 0,
    price: 0,
    discount: 0,
    description: '',
    amenities: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [isValidImage, setIsValidImage] = useState(false);
  const createCabin = useCreateCabin();
  const updateCabin = useUpdateCabin();

  useEffect(() => {
    if (cabin && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: cabin.name,
        image: cabin.image,
        capacity: cabin.capacity,
        price: cabin.price,
        discount: cabin.discount,
        description: cabin.description,
        amenities: cabin.amenities,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        image: '',
        capacity: 0,
        price: 0,
        discount: 0,
        description: '',
        amenities: [],
      });
    }
  }, [cabin, mode, isOpen]);

  // Validate image URL whenever it changes
  useEffect(() => {
    const validateImage = async () => {
      if (formData.image.trim()) {
        try {
          const isValid = await isImageUrl(formData.image);
          setIsValidImage(isValid);
        } catch {
          setIsValidImage(false);
        }
      } else {
        setIsValidImage(false);
      }
    };

    validateImage();
  }, [formData.image]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await createCabin.mutateAsync(formData);
      } else if (mode === 'edit' && cabin) {
        await updateCabin.mutateAsync({
          ...cabin,
          ...formData,
          _id: cabin._id.toString(),
        });
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

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove),
    }));
  };

  const isViewMode = mode === 'view';
  const isLoading = createCabin.isPending || updateCabin.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          {mode === 'view' && `${cabin?.name} - Details`}
          {mode === 'create' && 'Add New Cabin'}
          {mode === 'edit' && `Edit ${cabin?.name}`}
        </ModalHeader>

        <ModalBody>
          {isViewMode ? (
            <div className='space-y-5'>
              {/* Hero Image */}
              {isValidImage && (
                <Image
                  src={formData.image}
                  alt={formData.name}
                  width={600}
                  height={300}
                  className='w-full h-56 object-cover rounded-lg'
                />
              )}

              {/* Quick Info Row */}
              <div className='grid grid-cols-3 gap-3'>
                <div className='bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-primary-600 dark:text-primary-400'>Capacity</p>
                  <p className='text-lg font-bold text-primary-700 dark:text-primary-300'>
                    {formData.capacity} guests
                  </p>
                </div>
                <div className='bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-success-600 dark:text-success-400'>Price/Night</p>
                  <p className='text-lg font-bold text-success-700 dark:text-success-300'>${formData.price}</p>
                </div>
                <div className='bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700/40 rounded-lg p-3 text-center'>
                  <p className='text-xs text-warning-600 dark:text-warning-400'>Discount</p>
                  <p className='text-lg font-bold text-warning-700 dark:text-warning-300'>
                    {formData.discount > 0 ? `$${formData.discount}` : '-'}
                  </p>
                </div>
              </div>

              {/* Effective Price */}
              {formData.discount > 0 && (
                <div className='bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700/50 rounded-lg p-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl font-bold text-success'>
                      ${formData.price - formData.discount}
                    </span>
                    <span className='text-default-500 line-through'>
                      ${formData.price}
                    </span>
                    <span className='text-sm text-default-400'>per night</span>
                  </div>
                </div>
              )}

              {/* Description */}
              {formData.description && (
                <div>
                  <h4 className='text-sm font-semibold text-default-500 mb-2'>
                    Description
                  </h4>
                  <p className='text-default-700'>{formData.description}</p>
                </div>
              )}

              {/* Amenities */}
              <div>
                <h4 className='text-sm font-semibold text-default-500 mb-2'>
                  Amenities
                </h4>
                {formData.amenities.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {formData.amenities.map(amenity => (
                      <Chip
                        key={amenity}
                        color='primary'
                        variant='flat'
                      >
                        {amenity}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <p className='text-default-400 text-sm'>
                    No amenities listed
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Image */}
              <div>
                <label className='text-sm font-medium'>Cabin Image</label>
                {isValidImage && (
                  <div className='mt-2 mb-3'>
                    <Image
                      src={formData.image}
                      alt='Cabin preview'
                      width={400}
                      height={250}
                      className='w-full h-48 object-cover rounded-lg'
                    />
                  </div>
                )}
                <Input
                  type='url'
                  placeholder='Enter image URL'
                  value={formData.image}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, image: e.target.value }))
                  }
                />
              </div>

              {/* Basic Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  label='Cabin Name'
                  placeholder='Enter cabin name'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />

                <Input
                  label='Capacity'
                  type='number'
                  placeholder='Number of guests'
                  value={formData.capacity.toString()}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      capacity: parseInt(e.target.value) || 0,
                    }))
                  }
                  min='1'
                  max='12'
                />
              </div>

              {/* Pricing */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  label='Price per Night'
                  type='number'
                  placeholder='Enter price'
                  value={formData.price.toString()}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      price: parseInt(e.target.value) || 0,
                    }))
                  }
                  startContent='$'
                  min='0'
                />

                <Input
                  label='Discount'
                  type='number'
                  placeholder='Enter discount'
                  value={formData.discount.toString()}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      discount: parseInt(e.target.value) || 0,
                    }))
                  }
                  startContent='$'
                  min='0'
                />
              </div>

              {/* Description */}
              <Textarea
                label='Description'
                placeholder='Enter cabin description'
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                minRows={3}
              />

              {/* Amenities */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Amenities
                </label>

                <div className='flex gap-2 mb-3'>
                  <Input
                    placeholder='Add amenity'
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addAmenity()}
                    className='flex-1'
                  />
                  <Button
                    color='primary'
                    onPress={addAmenity}
                    isDisabled={!newAmenity.trim()}
                  >
                    Add
                  </Button>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {formData.amenities.map(amenity => (
                    <Chip
                      key={amenity}
                      color='primary'
                      variant='flat'
                      onClose={() => removeAmenity(amenity)}
                    >
                      {amenity}
                    </Chip>
                  ))}
                  {formData.amenities.length === 0 && (
                    <span className='text-default-400 text-sm'>
                      No amenities added
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color='default' variant='light' onPress={onClose}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>

          {isViewMode && onEdit && cabin && (
            <Button
              color='primary'
              variant='bordered'
              onPress={() => onEdit(cabin)}
            >
              Edit Cabin
            </Button>
          )}

          {!isViewMode && (
            <Button
              color='primary'
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={!formData.name.trim() || !formData.image.trim()}
            >
              {mode === 'create' ? 'Create Cabin' : 'Save Changes'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
