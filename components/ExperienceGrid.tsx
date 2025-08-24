import { useUpdateExperience } from '@/hooks/useExperiences';
import { Experience } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
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
import { useState } from 'react';
import Image from 'next/image';

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
  const [editedItem, setEditedItem] = useState<Experience>(item);
  const [isLoading, setIsLoading] = useState(false);
  const { updateExperience } = useUpdateExperience();

  // Calculate discount for display
  const originalPrice = item.price * 1.2; // Assuming 20% discount for display
  const hasDiscount = item.isPopular; // Show discount for popular items

  const handleSave = async () => {
    if (!item._id) return;

    setIsLoading(true);
    try {
      await updateExperience(item._id, editedItem);
      setIsModalOpen(false);
    } catch (error) {
      addToast({
        title: 'Error updating experience',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Experience, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card
      className={`${item.isPopular ? 'ring-2 ring-primary' : ''}`}
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

      <CardBody className='overflow-visible py-2'>
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

        <Button
          color='primary'
          className='w-full mt-4'
          onPress={() => setIsModalOpen(true)}>
          Edit
        </Button>

        {/* Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          size='2xl'
          scrollBehavior='inside'>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  Edit Experience
                </ModalHeader>
                <ModalBody>
                  <div className='space-y-4'>
                    <Input
                      label='Name'
                      value={editedItem.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                    />

                    <Input
                      label='Image URL'
                      value={editedItem.image || ''}
                      onChange={e => handleInputChange('image', e.target.value)}
                      placeholder='https://example.com/image.jpg'
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <Input
                        label='Price'
                        type='number'
                        value={editedItem.price.toString()}
                        onChange={e =>
                          handleInputChange(
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <Input
                        label='Duration'
                        value={editedItem.duration || ''}
                        onChange={e =>
                          handleInputChange('duration', e.target.value)
                        }
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <Input
                        label='Max Participants'
                        type='number'
                        value={editedItem.maxParticipants?.toString() || ''}
                        onChange={e =>
                          handleInputChange(
                            'maxParticipants',
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                      <Input
                        label='Min Age'
                        type='number'
                        value={editedItem.minAge?.toString() || ''}
                        onChange={e =>
                          handleInputChange(
                            'minAge',
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>

                    <Textarea
                      label='Description'
                      value={editedItem.description}
                      onChange={e =>
                        handleInputChange('description', e.target.value)
                      }
                      minRows={3}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <Input
                        label='Difficulty'
                        value={editedItem.difficulty || ''}
                        onChange={e =>
                          handleInputChange('difficulty', e.target.value)
                        }
                      />
                      <Input
                        label='Category'
                        value={editedItem.category || ''}
                        onChange={e =>
                          handleInputChange('category', e.target.value)
                        }
                      />
                    </div>

                    <Textarea
                      label='Includes (one per line)'
                      value={editedItem.includes?.join('\n') || ''}
                      onChange={e =>
                        handleInputChange(
                          'includes',
                          e.target.value.split('\n').filter(line => line.trim())
                        )
                      }
                      minRows={3}
                      placeholder='Equipment rental&#10;Professional guide&#10;Lunch included'
                    />

                    <Textarea
                      label='Availability (one per line)'
                      value={editedItem.available?.join('\n') || ''}
                      onChange={e =>
                        handleInputChange(
                          'available',
                          e.target.value.split('\n').filter(line => line.trim())
                        )
                      }
                      minRows={2}
                      placeholder='Monday-Friday&#10;Weekends'
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color='danger' variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color='primary' onPress={handleSave}>
                    Save Changes
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
