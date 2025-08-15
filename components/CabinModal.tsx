'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Chip } from '@heroui/chip';
import Image from 'next/image';
import type { Cabin } from '@/types';
import { useCreateCabin, useUpdateCabin } from '@/hooks/useCabins';

interface CabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabin?: Cabin | null;
  mode: 'view' | 'create' | 'edit';
}

export default function CabinModal({ isOpen, onClose, cabin, mode }: CabinModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    capacity: 2,
    price: 150,
    discount: 0,
    description: '',
    amenities: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');
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
        image: 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=300&auto=format&fit=crop',
        capacity: 2,
        price: 150,
        discount: 0,
        description: '',
        amenities: [],
      });
    }
  }, [cabin, mode, isOpen]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await createCabin.mutateAsync(formData);
      } else if (mode === 'edit' && cabin) {
        await updateCabin.mutateAsync({ ...cabin, ...formData });
      }
      onClose();
    } catch (error) {
      console.error('Error saving cabin:', error);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const isViewMode = mode === 'view';
  const isLoading = createCabin.isPending || updateCabin.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {mode === 'view' && `${cabin?.name} - Details`}
          {mode === 'create' && 'Add New Cabin'}
          {mode === 'edit' && `Edit ${cabin?.name}`}
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Image */}
            <div>
              <label className="text-sm font-medium">Cabin Image</label>
              {formData.image && (
                <div className="mt-2 mb-3">
                  <Image
                    src={formData.image}
                    alt="Cabin preview"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              {!isViewMode && (
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cabin Name"
                placeholder="Enter cabin name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                isReadOnly={isViewMode}
              />
              
              <Input
                label="Capacity"
                type="number"
                placeholder="Number of guests"
                value={formData.capacity.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                isReadOnly={isViewMode}
                min="1"
                max="12"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price per Night"
                type="number"
                placeholder="Enter price"
                value={formData.price.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                isReadOnly={isViewMode}
                startContent="$"
                min="0"
              />
              
              <Input
                label="Discount"
                type="number"
                placeholder="Enter discount"
                value={formData.discount.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                isReadOnly={isViewMode}
                startContent="$"
                min="0"
              />
            </div>

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Enter cabin description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              isReadOnly={isViewMode}
              minRows={3}
            />

            {/* Amenities */}
            <div>
              <label className="text-sm font-medium mb-2 block">Amenities</label>
              
              {!isViewMode && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add amenity"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    onPress={addAmenity}
                    isDisabled={!newAmenity.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    color="primary"
                    variant="flat"
                    onClose={!isViewMode ? () => removeAmenity(amenity) : undefined}
                  >
                    {amenity}
                  </Chip>
                ))}
                {formData.amenities.length === 0 && (
                  <span className="text-default-400 text-sm">No amenities added</span>
                )}
              </div>
            </div>

            {/* Pricing Summary for View Mode */}
            {isViewMode && (
              <div className="bg-default-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Pricing</h4>
                <div className="flex items-center gap-2">
                  {formData.discount > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-success">
                        ${formData.price - formData.discount}
                      </span>
                      <span className="text-lg text-default-500 line-through">
                        ${formData.price}
                      </span>
                      <span className="text-sm text-default-400">per night</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">
                        ${formData.price}
                      </span>
                      <span className="text-sm text-default-400">per night</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          
          {!isViewMode && (
            <Button
              color="primary"
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
