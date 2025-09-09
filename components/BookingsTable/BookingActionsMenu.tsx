'use client';

import type { PopulatedBooking } from '@/types';
import { Button } from '@heroui/button';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';

interface BookingActionsMenuProps {
  booking: PopulatedBooking;
  onStatusChange?: (bookingId: number, newStatus: string) => void;
  onViewDetails?: (booking: PopulatedBooking) => void;
  onEdit?: (booking: PopulatedBooking) => void;
  onDelete?: (booking: PopulatedBooking) => void;
}

export default function BookingActionsMenu({
  booking,
  onStatusChange,
  onViewDetails,
  onEdit,
  onDelete,
}: BookingActionsMenuProps) {
  const menuItems = [];

  if (onViewDetails) {
    menuItems.push(
      <DropdownItem key='view' onPress={() => onViewDetails(booking)}>
        View Details
      </DropdownItem>
    );
  }

  if (onEdit && booking.status === 'unconfirmed') {
    menuItems.push(
      <DropdownItem key='edit' onPress={() => onEdit(booking)}>
        Edit Booking
      </DropdownItem>
    );
  }

  if (onStatusChange && booking.status === 'unconfirmed') {
    menuItems.push(
      <DropdownItem
        key='checkin'
        onPress={() => onStatusChange(booking.id, 'checked-in')}
      >
        Check In
      </DropdownItem>
    );
  }

  if (onStatusChange && booking.status === 'checked-in') {
    menuItems.push(
      <DropdownItem
        key='checkout'
        onPress={() => onStatusChange(booking.id, 'checked-out')}
      >
        Check Out
      </DropdownItem>
    );
  }

  if (onStatusChange && booking.status === 'unconfirmed') {
    menuItems.push(
      <DropdownItem
        key='cancel'
        className='text-danger'
        color='danger'
        onPress={() => onStatusChange(booking.id, 'cancelled')}
      >
        Cancel Booking
      </DropdownItem>
    );
  }

  if (onDelete) {
    menuItems.push(
      <DropdownItem
        key='delete'
        className='text-danger'
        color='danger'
        onPress={() => onDelete(booking)}
      >
        Delete Booking
      </DropdownItem>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant='light' size='sm'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 5v.01M12 12v.01M12 19v.01'
            />
          </svg>
        </Button>
      </DropdownTrigger>
      <DropdownMenu>{menuItems}</DropdownMenu>
    </Dropdown>
  );
}
