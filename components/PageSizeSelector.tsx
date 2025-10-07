'use client';

import { Select, SelectItem } from '@heroui/select';

interface PageSizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
  sizes?: number[];
  className?: string;
}

export default function PageSizeSelector({
  value,
  onChange,
  sizes = [5, 10, 15, 20, 25, 50],
  className = '',
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className='text-sm text-default-600 whitespace-nowrap'>
        Show:
      </span>
      <Select
        selectedKeys={[String(value)]}
        onSelectionChange={(keys: any) => {
          const newSize = parseInt(Array.from(keys)[0] as string, 10);
          onChange(newSize);
        }}
        className='w-20'
        size='sm'
        variant='bordered'
        aria-label="Page size selector"
      >
        {sizes.map((size) => (
          <SelectItem key={String(size)}>
            {size}
          </SelectItem>
        ))}
      </Select>
      <span className='text-sm text-default-600 whitespace-nowrap'>
        per page
      </span>
    </div>
  );
}