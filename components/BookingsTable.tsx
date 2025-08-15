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
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import type { Booking } from '@/app/api/bookings/route';
import { formatBookingDates, getStatusColor, getStatusLabel } from '@/utils/bookingUtils';

interface BookingsTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (bookingId: number, newStatus: string) => void;
  onViewDetails?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
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
  const loadingState = isLoading && bookings.length === 0 ? "loading" : "idle";

  const renderCell = (booking: Booking, columnKey: string) => {
    switch (columnKey) {
      case 'cabin':
        return (
          <div className="font-medium text-foreground">
            {booking.cabinName}
          </div>
        );

      case 'guest':
        return (
          <User
            name={booking.guest.name}
            description={booking.guest.email}
            avatarProps={{
              name: booking.guest.name,
              size: 'sm',
            }}
          />
        );

      case 'dates':
        const { dateRange, timeInfo, showTimeInfo } = formatBookingDates(
          booking.checkInDate,
          booking.checkOutDate,
          booking.numNights,
          booking.status
        );

        return (
          <div className={booking.status === 'cancelled' ? 'opacity-50' : ''}>
            {showTimeInfo && (
              <div className="text-sm font-medium text-foreground mb-1">
                {timeInfo}
              </div>
            )}
            <div className={`text-sm ${booking.status === 'cancelled' ? 'text-default-400 line-through' : 'text-default-600'}`}>
              {dateRange}
            </div>
          </div>
        );

      case 'status':
        return (
          <Chip
            color={getStatusColor(booking.status) as any}
            variant="flat"
            size="sm"
          >
            {getStatusLabel(booking.status)}
          </Chip>
        );

      case 'amount':
        return (
          <div className="text-right">
            <div className="font-semibold text-foreground">
              ${booking.totalPrice}
            </div>
            <div className="text-xs text-default-500">
              ${booking.cabinPrice} × {booking.numNights} night{booking.numNights !== 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'actions':
        const menuItems = [];

        if (onViewDetails) {
          menuItems.push(
            <DropdownItem key="view" onPress={() => onViewDetails(booking)}>
              View Details
            </DropdownItem>
          );
        }

        if (onEdit && booking.status === 'unconfirmed') {
          menuItems.push(
            <DropdownItem key="edit" onPress={() => onEdit(booking)}>
              Edit Booking
            </DropdownItem>
          );
        }

        if (onStatusChange && booking.status === 'unconfirmed') {
          menuItems.push(
            <DropdownItem key="checkin" onPress={() => onStatusChange(booking.id, 'checked-in')}>
              Check In
            </DropdownItem>
          );
        }

        if (onStatusChange && booking.status === 'checked-in') {
          menuItems.push(
            <DropdownItem key="checkout" onPress={() => onStatusChange(booking.id, 'checked-out')}>
              Check Out
            </DropdownItem>
          );
        }

        if (onStatusChange && booking.status === 'unconfirmed') {
          menuItems.push(
            <DropdownItem
              key="cancel"
              className="text-danger"
              color="danger"
              onPress={() => onStatusChange(booking.id, 'cancelled')}
            >
              Cancel Booking
            </DropdownItem>
          );
        }

        if (onDelete) {
          menuItems.push(
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onPress={() => onDelete(booking)}
            >
              Delete Booking
            </DropdownItem>
          );
        }

        return (
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {menuItems}
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Table
        aria-label="Bookings table"
        removeWrapper
        classNames={{
          base: "max-h-[600px] overflow-auto",
          table: "min-h-[400px]",
          thead: "[&>tr]:first:shadow-none",
          tbody: "divide-y divide-default-200",
          tr: "group-data-[odd]:bg-default-50 hover:bg-default-100 transition-colors",
          th: "bg-default-100 text-default-700 font-semibold",
          td: "py-4 text-default-600 group-data-[selected]:text-default-foreground",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === 'amount' ? 'end' : 'start'}
              className={column.key === 'actions' ? 'text-center' : ''}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={bookings || []}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading bookings..." />}
          loadingState={loadingState}
          emptyContent="No bookings found"
        >
          {(booking) => (
            <TableRow key={booking.id}>
              {(columnKey) => (
                <TableCell>{renderCell(booking, columnKey as string)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={onPageChange}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}
    </div>
  );
}
