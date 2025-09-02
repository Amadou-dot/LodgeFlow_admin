'use client';

import BookingsFilters, {
  type BookingsFiltersData as BookingsFiltersType,
} from '@/components/BookingsFilters';
import BookingsTable from '@/components/BookingsTable';
import { PlusIcon } from '@/components/icons';
import {
  useBookings,
  useDeleteBooking,
  useUpdateBooking,
} from '@/hooks/useBookings';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { PopulatedBooking } from '@/types';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingsFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const {
    data: bookingsData,
    isLoading,
    error,
    mutate,
  } = useBookings({
    page: currentPage,
    limit: pageSize,
    ...filters,
  });

  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // Check for success message in URL (when coming back from new booking page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === 'true') {
      // You could show a toast notification here
      console.log('Booking created successfully!');
      // Remove the query parameter from URL
      window.history.replaceState({}, '', '/bookings');
      // Refresh the bookings data
      mutate();
    }
  }, [mutate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: BookingsFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    const booking = bookingsData?.bookings.find(b => b.id === bookingId);
    if (booking) {
      try {
        await updateBooking.mutateAsync({
          _id: booking._id,
          status: newStatus as any,
        });
        // Manually revalidate SWR data
        mutate();
      } catch (error) {
        console.error('Error updating booking status:', error);
      }
    }
  };

  // const handleViewDetails = (booking: PopulatedBooking) => {
  //   router.push(`/bookings/${booking._id}`);
  // };

  // const handleEdit = (booking: PopulatedBooking) => {
  //   router.push(`/bookings/${booking._id}/edit`);
  // };

  const handleDelete = async (booking: PopulatedBooking) => {
    const guest = booking.guest || booking.customer;
    showConfirm({
      title: 'Delete Booking',
      message: `Are you sure you want to delete the booking for ${guest?.name || 'this guest'}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'danger',
      onConfirm: async () => {
        try {
          await deleteBooking.mutateAsync(booking._id);
          // Manually revalidate SWR data
          mutate();
        } catch (error) {
          console.error('Error deleting booking:', error);
        }
      },
      isLoading: deleteBooking.isPending,
    });
  };

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='bg-danger-50 border-danger-200'>
          <CardBody>
            <p className='text-danger'>
              Error loading bookings: {error.message}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Bookings</h1>
          <p className='text-default-600 mt-1'>
            Manage cabin reservations and guest check-ins
          </p>
        </div>
        <Button
          color='primary'
          startContent={<PlusIcon />}
          onPress={() => router.push('/bookings/new')}
          className='w-full sm:w-auto'
        >
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <div className='mb-8'>
        <BookingsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          totalCount={
            bookingsData?.pagination.totalBookings ||
            bookingsData?.bookings?.length ||
            0
          }
        />
      </div>

      {/* Bookings Table */}
      <div className='bg-content1 rounded-lg shadow-sm border border-default-200 p-6'>
        <BookingsTable
          bookings={bookingsData?.bookings || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={bookingsData?.pagination.totalPages || 1}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          onViewDetails={booking => router.push(`/bookings/${booking._id}`)}
          onEdit={booking => router.push(`/bookings/${booking._id}/edit`)}
          onDelete={handleDelete}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
}
