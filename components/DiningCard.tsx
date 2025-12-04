import { Dining } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import Image from 'next/image';
import { useState } from 'react';
import DeletionModal from './DeletionModal';
import { EditIcon } from './icons';
import { Clock } from 'lucide-react';

interface DiningCardProps {
  dining: Dining;
  onEdit?: (dining: Dining) => void;
  onDelete?: (id: string) => void;
}

export const DiningCard = ({ dining, onEdit, onDelete }: DiningCardProps) => {
  const [_isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || !dining._id) {
      return;
    }
    setIsLoading(true);
    await onDelete(dining._id);
    setIsLoading(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(dining);
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'warning';
      case 'lunch':
        return 'primary';
      case 'dinner':
        return 'secondary';
      case 'all-day':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'craft-beer':
        return 'warning';
      case 'wine':
        return 'danger';
      case 'spirits':
        return 'secondary';
      case 'non-alcoholic':
        return 'success';
      default:
        return 'primary';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className='w-full max-w-[400px] shadow-md hover:shadow-lg transition-shadow'>
      <CardBody className='p-0'>
        <div className='relative'>
          <Image
            src={dining.image}
            alt={dining.name}
            className='w-full h-48 object-cover'
            width={400}
            height={192}
          />
          <div className='absolute top-2 left-2 flex gap-1 flex-wrap'>
            <Chip
              color={getMealTypeColor(dining.mealType)}
              variant='solid'
              size='sm'
              className='text-white'
            >
              {dining.mealType}
            </Chip>
            {dining.type === 'experience' && (
              <Chip
                color='default'
                variant='solid'
                size='sm'
                className='text-white bg-black/50'
              >
                Experience
              </Chip>
            )}
            {dining.isPopular && (
              <Chip
                color='danger'
                variant='solid'
                size='sm'
                className='text-white'
              >
                Popular
              </Chip>
            )}
          </div>
          {!dining.isAvailable && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Chip
                color='default'
                variant='solid'
                size='lg'
                className='text-white'
              >
                Unavailable
              </Chip>
            </div>
          )}
        </div>

        <div className='p-4'>
          <div className='flex justify-between items-start mb-2'>
            <h3 className='text-lg font-semibold line-clamp-2'>
              {dining.name}
            </h3>
            <span className='text-lg font-bold text-primary ml-2'>
              ${dining.price}
            </span>
          </div>

          <p className='text-sm text-default-600 line-clamp-2 mb-3'>
            {dining.description}
          </p>

          <div className='flex items-center gap-2 mb-2'>
            <Clock className='w-4 h-4 text-default-500' />
            <span className='text-sm text-default-600'>
              {formatTime(dining.servingTime.start)} -{' '}
              {formatTime(dining.servingTime.end)}
            </span>
          </div>

          <div className='flex gap-2 mb-3 flex-wrap'>
            <Chip
              color={getCategoryColor(dining.category)}
              variant='flat'
              size='sm'
            >
              {dining.category.replace('-', ' ')}
            </Chip>
            {dining.subCategory && (
              <Chip color='default' variant='flat' size='sm'>
                {dining.subCategory}
              </Chip>
            )}
          </div>

          <div className='flex justify-between items-center text-sm text-default-600'>
            <span>
              {dining.minPeople === dining.maxPeople
                ? `${dining.maxPeople} person${dining.maxPeople > 1 ? 's' : ''}`
                : `${dining.minPeople}-${dining.maxPeople} people`}
            </span>
            {dining.duration && <span>{dining.duration}</span>}
          </div>

          {dining.beverages && dining.beverages.length > 0 && (
            <div className='mt-3'>
              <p className='text-sm font-medium mb-1'>Includes beverages:</p>
              <div className='flex gap-1 flex-wrap'>
                {dining.beverages.slice(0, 3).map((beverage, index) => (
                  <Chip
                    key={index}
                    color='default'
                    variant='bordered'
                    size='sm'
                  >
                    {beverage.name}
                  </Chip>
                ))}
                {dining.beverages.length > 3 && (
                  <Chip color='default' variant='bordered' size='sm'>
                    +{dining.beverages.length - 3} more
                  </Chip>
                )}
              </div>
            </div>
          )}

          {dining.dietary && dining.dietary.length > 0 && (
            <div className='mt-2'>
              <div className='flex gap-1 flex-wrap'>
                {dining.dietary.map(diet => (
                  <Chip key={diet} color='success' variant='dot' size='sm'>
                    {diet}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>

      <CardFooter className='pt-0 px-4 pb-4'>
        <div className='flex gap-2 w-full'>
          <Button
            variant='solid'
            color='primary'
            startContent={<EditIcon />}
            onPress={handleEdit}
            className='flex-1'
            size='sm'
          >
            Edit
          </Button>
          {onDelete && dining._id && (
            <DeletionModal
              resourceId={dining._id}
              resourceName='Dining Item'
              itemName={dining.name}
              onDelete={handleDelete}
              buttonProps={{
                variant: 'light',
                color: 'danger',
                size: 'sm',
                className: 'flex-1',
              }}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
