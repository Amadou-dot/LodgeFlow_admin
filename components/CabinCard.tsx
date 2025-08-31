'use client';

import type { Cabin } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import Image from 'next/image';

interface CabinCardProps {
  cabin: Cabin;
  onEdit: (cabin: Cabin) => void;
  onView: (cabin: Cabin) => void;
  onDelete: (cabin: Cabin) => void;
}

export default function CabinCard({
  cabin,
  onEdit,
  onView,
  onDelete,
}: CabinCardProps) {
  const discountedPrice = cabin.price - cabin.discount;

  return (
    <Card className='w-full'>
      <CardBody className='p-0'>
        <div className='relative'>
          <Image
            src={cabin.image}
            alt={cabin.name}
            width={400}
            height={250}
            className='w-full h-48 object-cover rounded-t-lg'
          />
          {cabin.discount > 0 && (
            <Chip
              color='danger'
              variant='solid'
              size='sm'
              className='absolute top-2 right-2'>
              ${cabin.discount} off
            </Chip>
          )}
          <div className='absolute bottom-2 left-2'>
            <Chip color='primary' variant='solid' size='sm'>
              {cabin.capacity} guests
            </Chip>
          </div>
        </div>

        <div className='p-4'>
          <div className='flex justify-between items-start mb-2'>
            <h3 className='text-lg font-semibold'>{cabin.name}</h3>
          </div>

          <div className='flex items-center gap-2 mb-3'>
            {cabin.discount > 0 ? (
              <>
                <span className='text-xl font-bold text-success'>
                  ${discountedPrice}
                </span>
                <span className='text-sm text-default-500 line-through'>
                  ${cabin.price}
                </span>
                <span className='text-xs text-default-400'>per night</span>
              </>
            ) : (
              <>
                <span className='text-xl font-bold'>${cabin.price}</span>
                <span className='text-xs text-default-400'>per night</span>
              </>
            )}
          </div>

          <div className='flex flex-wrap gap-1 mb-3'>
            {cabin.amenities.slice(0, 3).map(amenity => (
              <Chip key={amenity} size='sm' variant='flat' color='default'>
                {amenity}
              </Chip>
            ))}
            {cabin.amenities.length > 3 && (
              <Chip size='sm' variant='flat' color='default'>
                +{cabin.amenities.length - 3} more
              </Chip>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className='pt-0 px-4 pb-4'>
        <div className='flex gap-2 w-full'>
          <Button
            color='primary'
            className='flex-1'
            onPress={() => onEdit(cabin)}>
            Edit
          </Button>
          <Button
            color='danger'
            variant='light'
            className='flex-1'
            onPress={() => onDelete(cabin)}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
