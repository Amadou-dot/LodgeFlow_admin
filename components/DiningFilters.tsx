'use client';

import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import StandardFilters, { FilterOption } from './StandardFilters';

interface DiningFiltersProps {
  type: string;
  mealType: string;
  category: string;
  isAvailable: boolean | null;
  onTypeChange: (type: string) => void;
  onMealTypeChange: (mealType: string) => void;
  onCategoryChange: (category: string) => void;
  onAvailabilityChange: (isAvailable: boolean | null) => void;
  onClearFilters: () => void;
  totalCount?: number;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

export default function DiningFilters({
  type,
  mealType,
  category,
  isAvailable,
  onTypeChange,
  onMealTypeChange,
  onCategoryChange,
  onAvailabilityChange,
  onClearFilters,
  totalCount,
  searchTerm = '',
  onSearchChange = () => {},
}: DiningFiltersProps) {
  const sortOptions: FilterOption[] = [
    { key: 'name', label: 'Name', value: 'name' },
    { key: 'price', label: 'Price', value: 'price' },
    { key: 'type', label: 'Type', value: 'type' },
  ];

  const hasActiveFilters =
    [type, mealType, category, isAvailable !== null].filter(Boolean).length > 0;

  const additionalFilters = (
    <>
      <Select
        placeholder='All types'
        selectedKeys={type ? [type] : []}
        onSelectionChange={keys => {
          const selected = Array.from(keys)[0] as string;
          onTypeChange(selected || '');
        }}
        className='w-36'
        size='sm'
        variant='bordered'
      >
        <SelectItem key='menu'>Regular Menu</SelectItem>
        <SelectItem key='experience'>Dining Experience</SelectItem>
      </Select>

      <Select
        placeholder='All meals'
        selectedKeys={mealType ? [mealType] : []}
        onSelectionChange={keys => {
          const selected = Array.from(keys)[0] as string;
          onMealTypeChange(selected || '');
        }}
        className='w-36'
        size='sm'
        variant='bordered'
      >
        <SelectItem key='breakfast'>Breakfast</SelectItem>
        <SelectItem key='lunch'>Lunch</SelectItem>
        <SelectItem key='dinner'>Dinner</SelectItem>
        <SelectItem key='all-day'>All Day</SelectItem>
      </Select>

      <Select
        placeholder='All categories'
        selectedKeys={category ? [category] : []}
        onSelectionChange={keys => {
          const selected = Array.from(keys)[0] as string;
          onCategoryChange(selected || '');
        }}
        className='w-36'
        size='sm'
        variant='bordered'
      >
        <SelectItem key='regular'>Regular Food</SelectItem>
        <SelectItem key='craft-beer'>Craft Beer</SelectItem>
        <SelectItem key='wine'>Wine</SelectItem>
        <SelectItem key='spirits'>Spirits</SelectItem>
        <SelectItem key='non-alcoholic'>Non-Alcoholic</SelectItem>
      </Select>

      <Select
        placeholder='All items'
        selectedKeys={isAvailable !== null ? [isAvailable.toString()] : []}
        onSelectionChange={keys => {
          const selected = Array.from(keys)[0] as string;
          if (!selected) {
            onAvailabilityChange(null);
          } else {
            onAvailabilityChange(selected === 'true');
          }
        }}
        className='w-36'
        size='sm'
        variant='bordered'
      >
        <SelectItem key='true'>Available</SelectItem>
        <SelectItem key='false'>Unavailable</SelectItem>
      </Select>

      {hasActiveFilters && (
        <Button
          color='default'
          variant='light'
          onPress={onClearFilters}
          size='sm'
        >
          Clear
        </Button>
      )}
    </>
  );

  return (
    <StandardFilters
      searchPlaceholder='Search dining items...'
      searchValue={searchTerm}
      onSearchChange={onSearchChange}
      sortOptions={sortOptions}
      currentSort='name'
      onSortChange={() => {}} // Dining doesn't seem to have sorting implemented
      sortOrder='asc'
      onSortOrderChange={() => {}} // Dining doesn't seem to have sorting implemented
      additionalFilters={additionalFilters}
      totalCount={totalCount}
      itemName='item'
    />
  );
}
