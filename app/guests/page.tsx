'use client';

import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import GuestGrid from '@/components/GuestGrid';
import AddGuestModal from '@/components/AddGuestModal';
import StandardFilters, { FilterOption } from '@/components/StandardFilters';

export default function GuestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    data: customers,
    pagination,
    isLoading,
    error,
    mutate,
  } = useCustomers({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const sortOptions: FilterOption[] = [
    { key: 'name', label: 'Name', value: 'name' },
    { key: 'totalSpent', label: 'Spending', value: 'totalSpent' },
    { key: 'totalBookings', label: 'Bookings', value: 'totalBookings' },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleGuestAdded = () => {
    mutate(); // Refresh the guest list after adding a new guest
  };

  if (error) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='bg-danger-50 border border-danger-200 p-4 rounded-lg'>
          <p className='text-danger-600'>Failed to load guests</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Guests</h1>
          <p className='text-default-600 mt-1'>
            Manage your hotel guests and their information
          </p>
        </div>
        <AddGuestModal onGuestAdded={handleGuestAdded} />
      </div>

      {/* Search and Filters */}
      <div className='mb-6'>
        <StandardFilters
          searchPlaceholder='Search guests by name, email, nationality...'
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          sortOptions={sortOptions}
          currentSort={sortBy}
          onSortChange={handleSortChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
          totalCount={
            (pagination as any)?.totalCustomers || customers?.length || 0
          }
          itemName='guest'
        />
      </div>

      {/* Guest Grid Component */}
      <GuestGrid
        customers={customers || []}
        pagination={pagination}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
