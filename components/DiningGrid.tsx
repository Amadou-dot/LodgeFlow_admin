import { Dining } from '@/types';
import { DiningCard } from './DiningCard';

interface DiningGridProps {
  dining: Dining[];
  onEdit?: (dining: Dining) => void;
  onDelete?: (id: string) => void;
}

export const DiningGrid = ({ dining, onEdit, onDelete }: DiningGridProps) => {
  if (dining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-default-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No dining items found</h3>
        <p className="text-default-500 max-w-md">
          Get started by adding your first dining menu item or dining experience.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4 lg:gap-4">
      {dining.map((item) => (
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
