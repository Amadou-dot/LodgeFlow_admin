import { Experience } from '@/types';
import { Accordion, AccordionItem } from '@heroui/accordion';
import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { Form } from '@heroui/form';
import { Input, Textarea } from '@heroui/input';
import { NumberInput } from '@heroui/number-input';
import { Select, SelectItem } from '@heroui/select';
import { useState } from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

interface EditExperienceFormProps {
  experience: Experience;
  onSave: (updatedExperience: Experience) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const Container = ({ children }: ContainerProps) => {
  return <div className='grid md:grid-cols-2 w-full gap-6'>{children}</div>;
};

export default function EditExperienceForm({
  experience,
  onSave,
  onCancel,
  isLoading = false,
}: EditExperienceFormProps) {
  const [editedItem, setEditedItem] = useState<Experience>(experience);
  const [isExpanded, setIsExpanded] = useState<Set<string>>(new Set());

  const keys = ['1', '2', '3', '4', '5'];
  const expandAll = () => setIsExpanded(new Set(keys));
  const collapseAll = () => setIsExpanded(new Set());

  const handleInputChange = (field: keyof Experience, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedItem);
  };

  return (
    <Form className='flex flex-col gap-4'>
      <div className='w-full flex justify-end'>
        <Button variant='light' size='sm' color='primary' onPress={collapseAll}>
          Collapse all
        </Button>
        <Button variant='light' size='sm' color='primary' onPress={expandAll}>
          Expand all
        </Button>
      </div>

      <Accordion
        aria-label='Edit Experience Form'
        selectionMode='multiple'
        variant='light'
        selectedKeys={isExpanded}
        onSelectionChange={setIsExpanded as () => void}
      >
        <AccordionItem
          key={keys[0]}
          aria-label='Basic Information'
          title='Basic Information'
        >
          <Container>
            <Input
              label='Experience Title'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.name}
              onValueChange={value => handleInputChange('name', value)}
            />
            <NumberInput
              label='Experience Price'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.price}
              onValueChange={value => handleInputChange('price', value)}
            />
            <Input
              label='Experience Duration'
              labelPlacement='inside'
              radius='sm'
              description='Ex: 2 hours, Half day, Full day'
              value={editedItem.duration || ''}
              onValueChange={value => handleInputChange('duration', value)}
            />
            <Input
              label='Experience Category'
              labelPlacement='inside'
              radius='sm'
              description='Ex: Adventure, Relaxation, Cultural'
              value={editedItem.category || ''}
              onValueChange={value => handleInputChange('category', value)}
            />
            <Select
              label='Difficulty Level'
              labelPlacement='inside'
              radius='sm'
              selectedKeys={
                editedItem.difficulty ? [editedItem.difficulty] : []
              }
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0] as string;
                handleInputChange('difficulty', selectedKey);
              }}
            >
              <SelectItem key='Easy'>Easy</SelectItem>
              <SelectItem key='Moderate'>Moderate</SelectItem>
              <SelectItem key='Challenging'>Challenging</SelectItem>
            </Select>
            <Input
              label='Tags (comma-separated)'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.tags?.join(', ') || ''}
              onValueChange={value =>
                handleInputChange(
                  'tags',
                  value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
                )
              }
            />
            <Input
              label='Experience Location'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.location || ''}
              onValueChange={value => handleInputChange('location', value)}
            />
            <Input
              label='Seasonality'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.seasonality || ''}
              onValueChange={value => handleInputChange('seasonality', value)}
            />
          </Container>
        </AccordionItem>

        <AccordionItem
          key={keys[1]}
          aria-label='Media & Visuals'
          title='Media & Visuals'
        >
          <Container>
            <Input
              label='Experience Image URL'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.image || ''}
              onValueChange={value => handleInputChange('image', value)}
            />
            <Input
              label='Image Gallery URLs (comma-separated)'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.gallery?.join(', ') || ''}
              onValueChange={value =>
                handleInputChange(
                  'gallery',
                  value
                    .split(',')
                    .map(url => url.trim())
                    .filter(url => url)
                )
              }
            />
          </Container>
        </AccordionItem>

        <AccordionItem
          key={keys[2]}
          aria-label='Descriptions'
          title='Descriptions'
        >
          <Container>
            <Textarea
              label='Short Description'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.description}
              onValueChange={value => handleInputChange('description', value)}
              minRows={3}
            />
            <Textarea
              label='Long Description'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.longDescription || ''}
              onValueChange={value =>
                handleInputChange('longDescription', value)
              }
              minRows={3}
            />
            <Input
              label='Experience Highlights (comma-separated)'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.highlights?.join(', ') || ''}
              onValueChange={value =>
                handleInputChange(
                  'highlights',
                  value
                    .split(',')
                    .map(highlight => highlight.trim())
                    .filter(highlight => highlight)
                )
              }
            />
          </Container>
        </AccordionItem>

        <AccordionItem
          key={keys[3]}
          aria-label='Experience Details'
          title='Experience Details'
        >
          <Container>
            <Textarea
              label='Experience Includes (one per line)'
              labelPlacement='inside'
              radius='sm'
              description='Ex: Equipment rental, Professional guide, Lunch'
              value={editedItem.includes?.join('\n') || ''}
              onValueChange={value =>
                handleInputChange(
                  'includes',
                  value.split('\n').filter(line => line.trim())
                )
              }
              minRows={3}
            />
            <Input
              label='What to bring (comma-separated)'
              labelPlacement='inside'
              radius='sm'
              description='Ex: Sunscreen, Water Bottle, Hat'
              value={editedItem.whatToBring?.join(', ') || ''}
              onValueChange={value =>
                handleInputChange(
                  'whatToBring',
                  value
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item)
                )
              }
            />
            <Input
              label='Requirements (comma-separated)'
              labelPlacement='inside'
              radius='sm'
              description='Ex: No pets, Must be 18+, Ability to swim'
              value={editedItem.requirements?.join(', ') || ''}
              onValueChange={value =>
                handleInputChange(
                  'requirements',
                  value
                    .split(',')
                    .map(req => req.trim())
                    .filter(req => req)
                )
              }
            />
            <Textarea
              label='Available Times (one per line)'
              labelPlacement='inside'
              radius='sm'
              description='Ex: Weekends, Weekdays, Mornings'
              value={editedItem.available?.join('\n') || ''}
              onValueChange={value =>
                handleInputChange(
                  'available',
                  value.split('\n').filter(line => line.trim())
                )
              }
              minRows={2}
            />
          </Container>
        </AccordionItem>

        <AccordionItem
          key={keys[4]}
          aria-label='Booking & Policies'
          title='Booking & Policies'
        >
          <Container>
            <Input
              label='Call to Action Text'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.ctaText || ''}
              onValueChange={value => handleInputChange('ctaText', value)}
            />
            <Input
              label='Cancellation Policy'
              labelPlacement='inside'
              radius='sm'
              value={editedItem.cancellationPolicy || ''}
              onValueChange={value =>
                handleInputChange('cancellationPolicy', value)
              }
            />
            <NumberInput
              label='Max Participants'
              labelPlacement='inside'
              min={1}
              radius='sm'
              value={editedItem.maxParticipants || 1}
              onValueChange={value =>
                handleInputChange('maxParticipants', value)
              }
            />
            <NumberInput
              label='Minimum Age'
              labelPlacement='inside'
              min={0}
              radius='sm'
              value={editedItem.minAge || 0}
              onValueChange={value => handleInputChange('minAge', value)}
            />
            <div className='md:col-span-2'>
              <Checkbox
                isSelected={editedItem.isPopular || false}
                onValueChange={value => handleInputChange('isPopular', value)}
              >
                Mark as popular
              </Checkbox>
            </div>
          </Container>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 mt-4'>
        <Button color='danger' variant='light' onPress={onCancel}>
          Cancel
        </Button>
        <Button color='primary' onPress={handleSave} isLoading={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Form>
  );
}
