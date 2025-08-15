'use client';

import { useState } from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { SearchIcon } from '@/components/icons';

export interface BookingsFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BookingsFiltersProps {
  filters: BookingsFilters;
  onFiltersChange: (filters: BookingsFilters) => void;
  onReset: () => void;
  totalCount?: number;
}

export default function BookingsFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  totalCount 
}: BookingsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleFilterChange = (key: keyof BookingsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleSearchSubmit = () => {
    onFiltersChange({
      ...filters,
      search: searchValue || undefined,
    });
  };

  const handleSearchClear = () => {
    setSearchValue('');
    onFiltersChange({
      ...filters,
      search: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by cabin, guest name, or email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
          startContent={<SearchIcon size={18} />}
          className="flex-1"
          isClearable
          onClear={handleSearchClear}
        />
        <Button
          color="primary"
          onPress={handleSearchSubmit}
          isDisabled={searchValue === filters.search}
        >
          Search
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Status Filter */}
        <Select
          label="Status"
          placeholder="All statuses"
          selectedKeys={filters.status ? [filters.status] : []}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('status', value);
          }}
          className="w-48"
          size="sm"
        >
          <SelectItem key="all">All Bookings</SelectItem>
          <SelectItem key="unconfirmed">Unconfirmed</SelectItem>
          <SelectItem key="checked-in">Checked In</SelectItem>
          <SelectItem key="checked-out">Checked Out</SelectItem>
          <SelectItem key="cancelled">Cancelled</SelectItem>
        </Select>

        {/* Sort By */}
        <Select
          label="Sort by"
          placeholder="Recent first"
          selectedKeys={filters.sortBy ? [filters.sortBy] : ['created_at']}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('sortBy', value);
          }}
          className="w-40"
          size="sm"
        >
          <SelectItem key="created_at">Recent</SelectItem>
          <SelectItem key="checkInDate">Check-in Date</SelectItem>
          <SelectItem key="totalPrice">Amount</SelectItem>
          <SelectItem key="guestName">Guest Name</SelectItem>
          <SelectItem key="cabinName">Cabin Name</SelectItem>
        </Select>

        {/* Sort Order */}
        <Select
          label="Order"
          placeholder="Desc"
          selectedKeys={filters.sortOrder ? [filters.sortOrder] : ['desc']}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('sortOrder', value);
          }}
          className="w-28"
          size="sm"
        >
          <SelectItem key="desc">↓</SelectItem>
          <SelectItem key="asc">↑</SelectItem>
        </Select>

        {/* Results Count */}
        {totalCount !== undefined && (
          <div className="text-sm text-default-600 px-2 py-1">
            {totalCount} booking{totalCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            color="default"
            variant="bordered"
            onPress={onReset}
            size="sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-default-600">
          Showing results for: {' '}
          {filters.search && <span className="font-medium">"{filters.search}"</span>}
          {filters.status && filters.status !== 'all' && <span className="font-medium">{filters.status} bookings</span>}
          {filters.sortBy && <span className="font-medium">sorted by {filters.sortBy}</span>}
          {(filters.search || (filters.status && filters.status !== 'all') || filters.sortBy) && ' • '}
        </div>
      )}
    </div>
  );
}
