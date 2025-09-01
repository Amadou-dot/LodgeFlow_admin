'use client';

import { useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table';
import { Chip } from '@heroui/chip';
import { User } from '@heroui/user';
import { Card, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import type { PopulatedBooking } from '@/types';
import {
  formatBookingDates,
  getStatusColor,
  getStatusLabel,
} from '@/utils/bookingUtils';

interface BookingsTableProps {
  bookings: PopulatedBooking[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (bookingId: number, newStatus: string) => void;
  onViewDetails?: (booking: PopulatedBooking) => void;
  onEdit?: (booking: PopulatedBooking) => void;
  onDelete?: (booking: PopulatedBooking) => void;
}

export default function BookingsTable({
  bookings,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onViewDetails,
  onEdit,
  onDelete,
}: BookingsTableProps) {
  const columns = [
    { key: 'cabin', label: 'Cabin' },
    { key: 'guest', label: 'Guest' },
    { key: 'dates', label: 'Dates' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
    { key: 'actions', label: 'Actions' },
  ];

  // Determine loading state: show loading only if we have no data and are loading
  const loadingState = isLoading && bookings.length === 0 ? 'loading' : 'idle';

  // Mobile Card Component
  const BookingCard = ({ booking }: { booking: PopulatedBooking }) => {
    const guest = booking.guest || booking.customer;
    const checkInDate =
      booking.checkInDate instanceof Date
        ? booking.checkInDate.toISOString()
        : booking.checkInDate;
    const checkOutDate =
      booking.checkOutDate instanceof Date
        ? booking.checkOutDate.toISOString()
        : booking.checkOutDate;

    const { dateRange, timeInfo, showTimeInfo } = formatBookingDates(
      checkInDate,
      checkOutDate,
      booking.numNights,
      booking.status
    );

    return (
      <Card className='mb-4'>
        <CardBody className='p-4'>
          {/* Guest Information */}
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1 min-w-0'>
              <User
                name={guest?.name || 'N/A'}
                description={guest?.email || 'N/A'}
                avatarProps={{
                  name: guest?.name,
                  size: 'sm',
                }}
                classNames={{
                  base: 'justify-start',
                  wrapper: 'min-w-0 flex-1',
                  name: 'text-sm font-medium truncate',
                  description: 'text-xs text-default-500 truncate',
                }}
              />
            </div>
            <div className='flex-shrink-0 ml-3'>
              {renderActionsMenu(booking)}
            </div>
          </div>

          {/* Status Row */}
          <div className='flex items-center justify-between mb-3'>
            <Chip
              color={getStatusColor(booking.status) as any}
              variant='flat'
              size='sm'
              className='text-xs'
            >
              {getStatusLabel(booking.status)}
            </Chip>
          </div>

          {/* Cabin Name */}
          <div className='mb-3'>
            <span className='text-xs text-default-500 uppercase tracking-wider'>
              Cabin
            </span>
            <p className='text-sm font-medium text-foreground truncate'>
              {booking.cabinName || booking.cabin?.name || 'N/A'}
            </p>
          </div>

          {/* Dates */}
          <div className='mb-3'>
            <span className='text-xs text-default-500 uppercase tracking-wider'>
              Stay Period
            </span>
            <div className={booking.status === 'cancelled' ? 'opacity-50' : ''}>
              {showTimeInfo && (
                <p className='text-xs font-medium text-foreground'>
                  {timeInfo}
                </p>
              )}
              <p
                className={`text-xs ${booking.status === 'cancelled' ? 'text-default-400 line-through' : 'text-default-600'}`}
              >
                {dateRange}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div>
            <span className='text-xs text-default-500 uppercase tracking-wider'>
              Total Amount
            </span>
            <div className='flex items-baseline gap-2'>
              <span className='text-sm font-semibold text-foreground'>
                ${booking.totalPrice}
              </span>
              <span className='text-xs text-default-500'>
                (${booking.cabinPrice} × {booking.numNights} night
                {booking.numNights !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  // Actions Menu Component (shared between table and cards)
  const renderActionsMenu = (booking: PopulatedBooking) => {
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
  };

  const renderCell = (booking: PopulatedBooking, columnKey: string) => {
    switch (columnKey) {
      case 'cabin':
        return (
          <div className='font-medium text-foreground truncate'>
            {booking.cabinName || booking.cabin?.name || 'N/A'}
          </div>
        );

      case 'guest':
        const guest = booking.guest || booking.customer;
        return (
          <User
            name={guest?.name || 'N/A'}
            description={guest?.email || 'N/A'}
            avatarProps={{
              name: guest?.name,
              size: 'sm',
            }}
            classNames={{
              base: 'justify-start',
              wrapper: 'min-w-0 flex-1',
              name: 'truncate',
              description: 'truncate',
            }}
          />
        );

      case 'dates':
        const checkInDate =
          booking.checkInDate instanceof Date
            ? booking.checkInDate.toISOString()
            : booking.checkInDate;
        const checkOutDate =
          booking.checkOutDate instanceof Date
            ? booking.checkOutDate.toISOString()
            : booking.checkOutDate;

        const { dateRange, timeInfo, showTimeInfo } = formatBookingDates(
          checkInDate,
          checkOutDate,
          booking.numNights,
          booking.status
        );

        return (
          <div
            className={`min-w-0 ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}
          >
            {showTimeInfo && (
              <div className='text-sm font-medium text-foreground mb-1 truncate'>
                {timeInfo}
              </div>
            )}
            <div
              className={`text-sm truncate ${booking.status === 'cancelled' ? 'text-default-400 line-through' : 'text-default-600'}`}
            >
              {dateRange}
            </div>
          </div>
        );

      case 'status':
        return (
          <Chip
            color={getStatusColor(booking.status) as any}
            variant='flat'
            size='sm'
          >
            {getStatusLabel(booking.status)}
          </Chip>
        );

      case 'amount':
        return (
          <div className='text-right min-w-0'>
            <div className='font-semibold text-foreground truncate'>
              ${booking.totalPrice}
            </div>
            <div className='text-xs text-default-500 truncate'>
              ${booking.cabinPrice} × {booking.numNights} night
              {booking.numNights !== 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'actions':
        return renderActionsMenu(booking);

      default:
        return null;
    }
  };

  return (
    <div className='space-y-4'>
      {/* Mobile Cards Layout (visible on screens smaller than md) */}
      <div className='block md:hidden'>
        {isLoading && bookings.length === 0 ? (
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardBody className='p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-8 h-8 bg-default-200 rounded-full' />
                    <div className='flex-1'>
                      <div className='h-4 bg-default-200 rounded mb-1' />
                      <div className='h-3 bg-default-200 rounded w-2/3' />
                    </div>
                    <div className='w-16 h-6 bg-default-200 rounded' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-3 bg-default-200 rounded w-1/3' />
                    <div className='h-4 bg-default-200 rounded w-2/3' />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className='text-center py-8 text-default-500'>
            No bookings found
          </div>
        ) : (
          <div className='space-y-3'>
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table Layout (visible on md and larger screens) */}
      <div className='hidden md:block'>
        <Table
          aria-label='Bookings table'
          removeWrapper
          classNames={{
            base: 'max-h-[600px] overflow-auto',
            table: 'min-h-[400px] table-fixed w-full',
            thead: '[&>tr]:first:shadow-none',
            tbody: 'divide-y divide-default-200',
            tr: 'group-data-[odd]:bg-default-50 hover:bg-default-100 transition-colors',
            th: 'bg-default-100 text-default-700 font-semibold',
            td: 'py-4 text-default-600 group-data-[selected]:text-default-foreground',
          }}
        >
          <TableHeader columns={columns}>
            {column => (
              <TableColumn
                key={column.key}
                align={column.key === 'amount' ? 'end' : 'start'}
                className={`${column.key === 'actions' ? 'text-center w-20' : ''} ${
                  column.key === 'cabin' ? 'w-[120px]' : ''
                } ${column.key === 'guest' ? 'w-[180px]' : ''} ${
                  column.key === 'dates' ? 'w-[140px]' : ''
                } ${column.key === 'status' ? 'w-[100px]' : ''} ${
                  column.key === 'amount' ? 'w-[120px]' : ''
                }`}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={bookings || []}
            isLoading={isLoading}
            loadingContent={<Spinner label='Loading bookings...' />}
            loadingState={loadingState}
            emptyContent='No bookings found'
          >
            {booking => (
              <TableRow key={booking.id}>
                {columnKey => (
                  <TableCell className='overflow-hidden'>
                    {renderCell(booking, columnKey as string)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-6'>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={onPageChange}
            showControls
            showShadow
            color='primary'
            size='sm'
            className='md:hidden'
          />
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={onPageChange}
            showControls
            showShadow
            color='primary'
            className='hidden md:flex'
          />
        </div>
      )}
    </div>
  );
}
