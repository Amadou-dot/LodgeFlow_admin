'use client';

import GuestGrid from '@/components/GuestGrid';
import { PlusIcon } from '@/components/icons';
import StandardFilters, { FilterOption } from '@/components/StandardFilters';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@heroui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GuestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

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

  // Check for success message in URL (when coming back from new guest page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === 'true') {
      // You could show a toast notification here
      console.log('Guest created successfully!');
      // Remove the query parameter from URL
      window.history.replaceState({}, '', '/guests');
      // Refresh the guests data
      mutate();
    }
  }, [mutate]);

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
        <Button
          color='primary'
          startContent={<PlusIcon />}
          onPress={() => router.push('/guests/new')}
          className='w-full sm:w-auto'
        >
          Add New Guest
        </Button>
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
