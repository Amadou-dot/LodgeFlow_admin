'use client';

import type { Cabin } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import { EditIcon, TrashIcon, VerticalDotsIcon } from './icons';

interface CabinCardProps {
  cabin: Cabin;
  onView?: (cabin: Cabin) => void;
  onEdit: (cabin: Cabin) => void;
  onDelete: (cabin: Cabin) => void;
}

export default function CabinCard({
  cabin,
  onView,
  onEdit,
  onDelete,
}: CabinCardProps) {
  const discountedPrice = cabin.price - cabin.discount;

  return (
    <Card
      shadow='sm'
      className='w-full transition-shadow hover:shadow-md'
    >
      <CardBody
        className='p-0 cursor-pointer'
        onClick={() => onView?.(cabin)}
      >
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
              className='absolute top-2 right-2'
            >
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
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  onClick={e => e.stopPropagation()}
                >
                  <VerticalDotsIcon size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Cabin actions'>
                {onView ? (
                  <DropdownItem
                    key='view'
                    startContent={<Eye className='w-4 h-4' />}
                    onPress={() => onView(cabin)}
                  >
                    View Details
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  key='edit'
                  startContent={<EditIcon size={16} />}
                  onPress={() => onEdit(cabin)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key='delete'
                  className='text-danger'
                  color='danger'
                  startContent={<TrashIcon size={16} />}
                  onPress={() => onDelete(cabin)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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

          {cabin.description && (
            <p className='text-sm text-default-500 line-clamp-2 mb-3'>
              {cabin.description}
            </p>
          )}

          <div className='flex flex-wrap gap-1'>
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
    </Card>
  );
}
