'use client';

import type { Customer } from '@/types';
import { Avatar } from '@heroui/avatar';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Pagination } from '@heroui/pagination';
import Link from 'next/link';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GuestGridProps {
  customers: Customer[];
  pagination?: PaginationData;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function GuestGrid({
  customers,
  pagination,
  isLoading,
  currentPage,
  onPageChange,
}: GuestGridProps) {
  const getLoyaltyTier = (totalSpent: number) => {
    if (totalSpent >= 10000)
      return { tier: 'Diamond', color: 'secondary' as const };
    if (totalSpent >= 5000) return { tier: 'Gold', color: 'warning' as const };
    if (totalSpent >= 2000)
      return { tier: 'Silver', color: 'default' as const };
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

  // Loading State
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className='p-4'>
            <CardBody className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-default-200 rounded-full animate-pulse' />
                <div className='space-y-2 flex-1'>
                  <div className='h-4 bg-default-200 rounded animate-pulse' />
                  <div className='h-3 bg-default-200 rounded w-2/3 animate-pulse' />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  // Empty State
  if (!customers || customers.length === 0) {
    return (
      <Card className='p-8'>
        <CardBody className='text-center'>
          <p className='text-default-600 text-lg'>No guests found</p>
          <p className='text-default-400 text-sm mt-1'>
            Try adjusting your search terms or add your first guest to get
            started
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {/* Guests Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'>
        {customers.map(customer => {
          const loyalty = getLoyaltyTier(customer.totalSpent || 0);

          return (
            <Link key={customer._id} href={`/guests/${customer._id}`}>
              <Card className='hover:shadow-lg transition-all duration-200 cursor-pointer h-full'>
                <CardBody className='p-4'>
                  <div className='flex items-start gap-3'>
                    <Avatar
                      name={getInitials(customer.name)}
                      src={customer.profileImage}
                      className='flex-shrink-0'
                      color='primary'
                    />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-sm truncate'>
                        {customer.name}
                      </h3>
                      <p className='text-xs text-default-600 truncate'>
                        {customer.email}
                      </p>
                      <p className='text-xs text-default-500 mt-1'>
                        {customer.nationality}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4 space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-default-600'>
                        Bookings:
                      </span>
                      <span className='text-xs font-medium'>
                        {customer.totalBookings || 0}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-default-600'>Spent:</span>
                      <span className='text-xs font-medium'>
                        ${(customer.totalSpent || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-default-600'>Status:</span>
                      <Chip
                        size='sm'
                        color={loyalty.color}
                        variant='flat'
                        className='text-xs'
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center'>
          <Pagination
            total={pagination.totalPages}
            page={currentPage}
            onChange={onPageChange}
            showControls
            className='gap-2'
          />
        </div>
      )}
    </>
  );
}
