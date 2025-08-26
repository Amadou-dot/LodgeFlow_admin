import { useUpdateExperience, useDeleteExperience } from '@/hooks/useExperiences';
import { Experience } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { useState } from 'react';
import Image from 'next/image';
import EditExperienceForm from './EditExperienceForm';

interface ExperienceGridProps {
  items: Experience[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ExperienceGrid({
  items,
  columns = 3,
  className = '',
}: ExperienceGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {items.map((item, index) => (
        <ExperienceCard key={index} item={item} />
      ))}
    </div>
  );
}

function ExperienceCard({ item }: { item: Experience }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateExperience } = useUpdateExperience();
  const { deleteExperience } = useDeleteExperience();

  // Calculate discount for display
  const originalPrice = item.price * 1.2; // Assuming 20% discount for display
  const hasDiscount = item.isPopular; // Show discount for popular items

  const handleSave = async (updatedExperience: Experience) => {
    if (!item._id) return;

    setIsLoading(true);
    try {
      await updateExperience(item._id, updatedExperience);
      setIsModalOpen(false);
      addToast({
        title: 'Experience Updated',
        description: 'The experience has been successfully updated.',
        color: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error updating experience',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!item._id) return;

    setIsDeleting(true);
    try {
      await deleteExperience(item._id);
      setIsDeleteModalOpen(false);
      addToast({
        title: 'Experience Deleted',
        description: 'The experience has been successfully deleted.',
        color: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error deleting experience',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`${item.isPopular ? 'ring-2 ring-primary' : ''} h-full flex flex-col`}
      shadow={item.isPopular ? 'lg' : 'sm'}>
      
      {/* Image Section */}
      <div className='relative'>
        <Image
          src={item.image || '/placeholder-experience.jpg'}
          alt={item.name}
          width={400}
          height={200}
          className='w-full h-48 object-cover rounded-t-lg'
        />
        {item.isPopular && (
          <Chip
            color='primary'
            variant='solid'
            size='sm'
            className='absolute top-2 right-2'>
            Popular
          </Chip>
        )}
        {item.difficulty && (
          <div className='absolute bottom-2 left-2'>
            <Chip color='secondary' variant='solid' size='sm'>
              {item.difficulty}
            </Chip>
          </div>
        )}
      </div>

      <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
        <div className='flex justify-between items-start w-full mb-2'>
          <h4 className='font-bold text-large'>{item.name}</h4>
        </div>

        {/* Price Section */}
        <div className='flex items-center gap-2 mb-2'>
          {hasDiscount && (
            <span className='line-through text-default-400 text-sm'>
              ${originalPrice}
            </span>
          )}
          <span className='font-bold text-2xl text-green-600'>
            ${item.price}
          </span>
          {item.duration && (
            <span className='text-sm text-default-500'>/{item.duration}</span>
          )}
        </div>

        {/* Metadata Chips */}
        <div className='flex flex-wrap gap-2 mb-3'>
          {item.category && (
            <Chip size='sm' variant='flat' color='secondary'>
              {item.category}
            </Chip>
          )}
          {item.maxParticipants && (
            <Chip size='sm' variant='flat' color='primary'>
              Max {item.maxParticipants} guests
            </Chip>
          )}
        </div>
      </CardHeader>

      <CardBody className='overflow-visible py-2 flex-grow flex flex-col'>
        <p className='text-default-600 mb-4'>{item.description}</p>

        {/* Includes Section */}
        {item.includes && item.includes.length > 0 && (
          <div className='mb-4'>
            <h5 className='font-semibold mb-2 text-sm'>Includes:</h5>
            <ul className='text-sm text-default-600 space-y-1'>
              {item.includes.map((include, index) => (
                <li key={index} className='flex items-center gap-2'>
                  <span className='text-green-500'>✓</span>
                  {include}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Availability */}
        {item.available && item.available.length > 0 && (
          <div className='mb-4'>
            <h5 className='font-semibold mb-2 text-sm'>Availability:</h5>
            <div className='flex flex-wrap gap-1'>
              {item.available.map((avail, index) => (
                <Chip key={index} size='sm' variant='dot' color='success'>
                  {avail}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className='mt-auto'>
          <div className='flex gap-2'>
            <Button
              color='primary'
              className='flex-2'
              onPress={() => setIsModalOpen(true)}>
              Edit
            </Button>
            <Button
              color='danger'
              variant='light'
              className='flex-1'
              onPress={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          size='4xl'
          scrollBehavior='inside'>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  Edit Experience: {item.name}
                </ModalHeader>
                <ModalBody>
                  <EditExperienceForm
                    experience={item}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          size='md'>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  Delete Experience
                </ModalHeader>
                <ModalBody>
                  <p>
                    Are you sure you want to delete <strong>{item.name}</strong>?
                  </p>
                  <p className='text-danger text-sm'>
                    This action cannot be undone.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color='danger'
                    onPress={handleDelete}
                    isLoading={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
