'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Spinner } from '@heroui/spinner';
import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Pagination } from '@heroui/pagination';
import { SearchIcon, PlusIcon } from '@/components/icons';
import { useCustomers } from '@/hooks/useCustomers';
import Link from 'next/link';

export default function GuestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: customers, pagination, isLoading, error } = useCustomers({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getLoyaltyTier = (totalSpent: number) => {
    if (totalSpent >= 10000) return { tier: 'Diamond', color: 'secondary' as const };
    if (totalSpent >= 5000) return { tier: 'Gold', color: 'warning' as const };
    if (totalSpent >= 2000) return { tier: 'Silver', color: 'default' as const };
    return { tier: 'Bronze', color: 'primary' as const };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className='bg-danger-50 border border-danger-200 p-4 rounded-lg'>
          <p className='text-danger-600'>Failed to load guests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Guests</h1>
          <p className="text-default-600 mt-1">
            Manage your hotel guests and their information
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon />}
          className="w-full sm:w-auto"
        >
          Add New Guest
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search guests by name, email, nationality..."
            startContent={<SearchIcon />}
            value={searchTerm}
            onValueChange={handleSearch}
            className="w-full"
            isClearable
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'name' ? 'solid' : 'bordered'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'totalSpent' ? 'solid' : 'bordered'}
            size="sm"
            onClick={() => setSortBy('totalSpent')}
          >
            Spending
          </Button>
          <Button
            variant={sortBy === 'totalBookings' ? 'solid' : 'bordered'}
            size="sm"
            onClick={() => setSortBy('totalBookings')}
          >
            Bookings
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-default-200 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-default-200 rounded animate-pulse" />
                    <div className="h-3 bg-default-200 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Guests Grid */}
      {!isLoading && customers && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {customers.map((customer: any) => {
              const loyalty = getLoyaltyTier(customer.totalSpent || 0);
              
              return (
                <Link key={customer._id} href={`/guests/${customer._id}`}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={getInitials(customer.name)}
                          className="flex-shrink-0"
                          color="primary"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {customer.name}
                          </h3>
                          <p className="text-xs text-default-600 truncate">
                            {customer.email}
                          </p>
                          <p className="text-xs text-default-500 mt-1">
                            {customer.nationality}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-default-600">Bookings:</span>
                          <span className="text-xs font-medium">
                            {customer.totalBookings || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-default-600">Spent:</span>
                          <span className="text-xs font-medium">
                            ${(customer.totalSpent || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-default-600">Status:</span>
                          <Chip
                            size="sm"
                            color={loyalty.color}
                            variant="flat"
                            className="text-xs"
                          >
                            {loyalty.tier}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {customers.length === 0 && (
            <Card className="p-8">
              <CardBody className="text-center">
                <p className="text-default-600 text-lg">No guests found</p>
                <p className="text-default-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first guest to get started'}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={pagination.totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                className="gap-2"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
