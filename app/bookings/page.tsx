'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { PlusIcon } from '@/components/icons';
import BookingsTable from '@/components/BookingsTable';
import BookingsFilters, { type BookingsFilters as BookingsFiltersType } from '@/components/BookingsFilters';
import { useBookings, useUpdateBooking, useDeleteBooking } from '@/hooks/useBookings';
import type { PopulatedBooking } from '@/types';

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingsFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: bookingsData, isLoading, error, mutate } = useBookings({
    page: currentPage,
    limit: pageSize,
    ...filters,
  });

  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

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

  const handleViewDetails = (booking: PopulatedBooking) => {
    // TODO: Implement booking details modal
    console.log('View details for booking:', booking._id);
  };

  const handleEdit = (booking: PopulatedBooking) => {
    // TODO: Implement booking edit modal
    console.log('Edit booking:', booking._id);
  };

  const handleDelete = async (booking: PopulatedBooking) => {
    const guest = booking.guest || booking.customer;
    if (confirm(`Are you sure you want to delete the booking for ${guest?.name || 'this guest'}? This action cannot be undone.`)) {
      try {
        await deleteBooking.mutateAsync(booking._id);
        // Manually revalidate SWR data
        mutate();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-danger-50 border-danger-200">
          <CardBody>
            <p className="text-danger">Error loading bookings: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-default-600 mt-1">
            Manage cabin reservations and guest check-ins
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={18} />}
          className="w-full sm:w-auto"
        >
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <BookingsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          totalCount={bookingsData?.pagination.totalBookings}
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-content1 rounded-lg shadow-sm border border-default-200 p-6">
        <BookingsTable
          bookings={bookingsData?.bookings || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={bookingsData?.pagination.totalPages || 1}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
