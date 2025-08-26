import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';

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
}

export const DiningFilters = ({
  type,
  mealType,
  category,
  isAvailable,
  onTypeChange,
  onMealTypeChange,
  onCategoryChange,
  onAvailabilityChange,
  onClearFilters,
}: DiningFiltersProps) => {
  const activeFiltersCount = [type, mealType, category, isAvailable !== null].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 p-4 bg-content1 rounded-lg shadow-sm border border-divider">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Chip color="primary" variant="flat" size="sm">
              {activeFiltersCount} active
            </Chip>
            <Button
              variant="light"
              color="danger"
              size="sm"
              onPress={onClearFilters}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Type"
          placeholder="All types"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onTypeChange(selected || '');
          }}
          size="sm"
        >
          <SelectItem key="menu">
            Regular Menu
          </SelectItem>
          <SelectItem key="experience">
            Dining Experience
          </SelectItem>
        </Select>

        <Select
          label="Meal Type"
          placeholder="All meals"
          selectedKeys={mealType ? [mealType] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onMealTypeChange(selected || '');
          }}
          size="sm"
        >
          <SelectItem key="breakfast">
            Breakfast
          </SelectItem>
          <SelectItem key="lunch">
            Lunch
          </SelectItem>
          <SelectItem key="dinner">
            Dinner
          </SelectItem>
          <SelectItem key="all-day">
            All Day
          </SelectItem>
        </Select>

        <Select
          label="Category"
          placeholder="All categories"
          selectedKeys={category ? [category] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onCategoryChange(selected || '');
          }}
          size="sm"
        >
          <SelectItem key="regular">
            Regular Food
          </SelectItem>
          <SelectItem key="craft-beer">
            Craft Beer
          </SelectItem>
          <SelectItem key="wine">
            Wine
          </SelectItem>
          <SelectItem key="spirits">
            Spirits
          </SelectItem>
          <SelectItem key="non-alcoholic">
            Non-Alcoholic
          </SelectItem>
        </Select>

        <Select
          label="Availability"
          placeholder="All items"
          selectedKeys={isAvailable !== null ? [isAvailable.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (!selected) {
              onAvailabilityChange(null);
            } else {
              onAvailabilityChange(selected === 'true');
            }
          }}
          size="sm"
        >
          <SelectItem key="true">
            Available
          </SelectItem>
          <SelectItem key="false">
            Unavailable
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};
