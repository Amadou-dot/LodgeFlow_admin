import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Textarea } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Chip } from '@heroui/chip';
import { Dining } from '@/types';

interface DiningFormProps {
  dining?: Partial<Dining>;
  onSubmit: (data: Partial<Dining>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DiningForm = ({ dining, onSubmit, onCancel, isLoading = false }: DiningFormProps) => {
  const [formData, setFormData] = useState<Partial<Dining>>({
    name: '',
    description: '',
    type: 'menu',
    mealType: 'lunch',
    price: 0,
    servingTime: { start: '09:00', end: '17:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    subCategory: '',
    image: '',
    gallery: [],
    ingredients: [],
    allergens: [],
    dietary: [],
    beverages: [],
    includes: [],
    duration: '',
    location: '',
    specialRequirements: [],
    isPopular: false,
    isAvailable: true,
    seasonality: '',
    tags: [],
    ...dining,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentAllergen, setCurrentAllergen] = useState('');
  const [currentInclude, setCurrentInclude] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dining) {
      setFormData({ ...formData, ...dining });
    }
  }, [dining]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.image?.trim()) {
      newErrors.image = 'Image URL is required';
    }
    if (!formData.servingTime?.start || !formData.servingTime?.end) {
      newErrors.servingTime = 'Serving time is required';
    }
    if (!formData.maxPeople || formData.maxPeople <= 0) {
      newErrors.maxPeople = 'Max people must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const addIngredient = () => {
    if (currentIngredient.trim() && !formData.ingredients?.includes(currentIngredient.trim())) {
      setFormData({
        ...formData,
        ingredients: [...(formData.ingredients || []), currentIngredient.trim()],
      });
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients?.filter(i => i !== ingredient) || [],
    });
  };

  const addAllergen = () => {
    if (currentAllergen.trim() && !formData.allergens?.includes(currentAllergen.trim())) {
      setFormData({
        ...formData,
        allergens: [...(formData.allergens || []), currentAllergen.trim()],
      });
      setCurrentAllergen('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens?.filter(a => a !== allergen) || [],
    });
  };

  const addInclude = () => {
    if (currentInclude.trim() && !formData.includes?.includes(currentInclude.trim())) {
      setFormData({
        ...formData,
        includes: [...(formData.includes || []), currentInclude.trim()],
      });
      setCurrentInclude('');
    }
  };

  const removeInclude = (include: string) => {
    setFormData({
      ...formData,
      includes: formData.includes?.filter(i => i !== include) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          placeholder="Enter dining item name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          isRequired
          errorMessage={errors.name}
          isInvalid={!!errors.name}
        />
        
        <Input
          label="Price"
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
          startContent="$"
          value={formData.price?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          isRequired
          errorMessage={errors.price}
          isInvalid={!!errors.price}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="Describe this dining item"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        isRequired
        errorMessage={errors.description}
        isInvalid={!!errors.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type"
          placeholder="Select type"
          selectedKeys={formData.type ? [formData.type] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, type: selected as 'menu' | 'experience' });
          }}
          isRequired
        >
          <SelectItem key="menu">Regular Menu</SelectItem>
          <SelectItem key="experience">Dining Experience</SelectItem>
        </Select>

        <Select
          label="Meal Type"
          placeholder="Select meal type"
          selectedKeys={formData.mealType ? [formData.mealType] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, mealType: selected as any });
          }}
          isRequired
        >
          <SelectItem key="breakfast">Breakfast</SelectItem>
          <SelectItem key="lunch">Lunch</SelectItem>
          <SelectItem key="dinner">Dinner</SelectItem>
          <SelectItem key="all-day">All Day</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          placeholder="Select category"
          selectedKeys={formData.category ? [formData.category] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, category: selected as any });
          }}
          isRequired
        >
          <SelectItem key="regular">Regular Food</SelectItem>
          <SelectItem key="craft-beer">Craft Beer</SelectItem>
          <SelectItem key="wine">Wine</SelectItem>
          <SelectItem key="spirits">Spirits</SelectItem>
          <SelectItem key="non-alcoholic">Non-Alcoholic</SelectItem>
        </Select>

        <Input
          label="Sub Category"
          placeholder="e.g., IPA, Lager, etc."
          value={formData.subCategory || ''}
          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Serving Start Time"
          placeholder="09:00"
          type="time"
          value={formData.servingTime?.start || ''}
          onChange={(e) => setFormData({
            ...formData,
            servingTime: { ...formData.servingTime!, start: e.target.value }
          })}
          isRequired
          errorMessage={errors.servingTime}
          isInvalid={!!errors.servingTime}
        />

        <Input
          label="Serving End Time"
          placeholder="17:00"
          type="time"
          value={formData.servingTime?.end || ''}
          onChange={(e) => setFormData({
            ...formData,
            servingTime: { ...formData.servingTime!, end: e.target.value }
          })}
          isRequired
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Min People"
          placeholder="1"
          type="number"
          min="1"
          value={formData.minPeople?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, minPeople: parseInt(e.target.value) || 1 })}
        />

        <Input
          label="Max People"
          placeholder="1"
          type="number"
          min="1"
          value={formData.maxPeople?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, maxPeople: parseInt(e.target.value) || 1 })}
          isRequired
          errorMessage={errors.maxPeople}
          isInvalid={!!errors.maxPeople}
        />
      </div>

      <Input
        label="Image URL"
        placeholder="https://example.com/image.jpg"
        value={formData.image || ''}
        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        isRequired
        errorMessage={errors.image}
        isInvalid={!!errors.image}
      />

      {formData.type === 'experience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Duration"
            placeholder="e.g., 2 hours"
            value={formData.duration || ''}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />

          <Input
            label="Location"
            placeholder="e.g., Main Dining Room"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add a tag"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            size="sm"
          />
          <Button size="sm" onPress={addTag} variant="bordered">Add</Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {formData.tags?.map((tag) => (
            <Chip key={tag} onClose={() => removeTag(tag)} variant="flat">
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium mb-2">Ingredients</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add an ingredient"
            value={currentIngredient}
            onChange={(e) => setCurrentIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
            size="sm"
          />
          <Button size="sm" onPress={addIngredient} variant="bordered">Add</Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {formData.ingredients?.map((ingredient) => (
            <Chip key={ingredient} onClose={() => removeIngredient(ingredient)} variant="flat">
              {ingredient}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Switch
            isSelected={formData.isPopular}
            onValueChange={(checked) => setFormData({ ...formData, isPopular: checked })}
          >
            Popular Item
          </Switch>
          
          <Switch
            isSelected={formData.isAvailable}
            onValueChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
          >
            Available
          </Switch>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          className="flex-1"
        >
          {dining?._id ? 'Update' : 'Create'} Dining Item
        </Button>
        <Button
          type="button"
          variant="bordered"
          onPress={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
