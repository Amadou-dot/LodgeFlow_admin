'use client';

import { useState } from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { SearchIcon } from './icons';
import type { CabinFilters } from '@/types';

interface CabinFiltersProps {
  filters: CabinFilters;
  onFiltersChange: (filters: CabinFilters) => void;
  onReset: () => void;
}

export default function CabinFilters({ filters, onFiltersChange, onReset }: CabinFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleFilterChange = (key: keyof CabinFilters, value: string) => {
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
          placeholder="Search cabins..."
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
      <div className="flex flex-wrap gap-3">
        {/* Capacity Filter */}
        <Select
          label="Capacity"
          placeholder="All capacities"
          selectedKeys={filters.capacity ? [filters.capacity] : []}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('capacity', value);
          }}
          className="w-40"
          size="sm"
        >
          <SelectItem key="small">
            Small (1-3)
          </SelectItem>
          <SelectItem key="medium">
            Medium (4-7)
          </SelectItem>
          <SelectItem key="large">
            Large (8+)
          </SelectItem>
        </Select>

        {/* Discount Filter */}
        <Select
          label="Discount"
          placeholder="All cabins"
          selectedKeys={filters.discount ? [filters.discount] : []}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('discount', value);
          }}
          className="w-40"
          size="sm"
        >
          <SelectItem key="with">
            With Discount
          </SelectItem>
          <SelectItem key="without">
            No Discount
          </SelectItem>
        </Select>

        {/* Sort By */}
        <Select
          label="Sort by"
          placeholder="Default"
          selectedKeys={filters.sortBy ? [filters.sortBy] : []}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('sortBy', value);
          }}
          className="w-36"
          size="sm"
        >
          <SelectItem key="name">
            Name
          </SelectItem>
          <SelectItem key="price">
            Price
          </SelectItem>
          <SelectItem key="capacity">
            Capacity
          </SelectItem>
        </Select>

        {/* Sort Order */}
        <Select
          label="Order"
          placeholder="Asc"
          selectedKeys={filters.sortOrder ? [filters.sortOrder] : ['asc']}
          onSelectionChange={(keys: any) => {
            const value = Array.from(keys)[0] as string;
            handleFilterChange('sortOrder', value);
          }}
          className="w-28"
          size="sm"
        >
          <SelectItem key="asc">
            A-Z
          </SelectItem>
          <SelectItem key="desc">
            Z-A
          </SelectItem>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            color="default"
            variant="bordered"
            onPress={onReset}
            size="sm"
            className="self-end"
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
          {filters.capacity && <span className="font-medium">{filters.capacity} capacity</span>}
          {filters.discount && <span className="font-medium">{filters.discount} discount</span>}
          {filters.sortBy && <span className="font-medium">sorted by {filters.sortBy}</span>}
          {(filters.search || filters.capacity || filters.discount || filters.sortBy) && ' • '}
        </div>
      )}
    </div>
  );
}
