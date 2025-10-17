import { Dining } from '@/types';
import { DiningCard } from './DiningCard';
import { UtensilsCrossed } from 'lucide-react';

interface DiningGridProps {
  dining: Dining[];
  onEdit?: (dining: Dining) => void;
  onDelete?: (id: string) => void;
}

export const DiningGrid = ({ dining, onEdit, onDelete }: DiningGridProps) => {
  if (dining.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='text-default-400 mb-4'>
          <UtensilsCrossed className='w-16 h-16 mx-auto' strokeWidth={1.5} />
        </div>
        <h3 className='text-lg font-medium text-foreground mb-2'>
          No dining items found
        </h3>
        <p className='text-default-500 max-w-md'>
          Get started by adding your first dining menu item or dining
          experience.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-4'>
      {dining.map(item => (
        <DiningCard
          key={item._id}
          dining={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
