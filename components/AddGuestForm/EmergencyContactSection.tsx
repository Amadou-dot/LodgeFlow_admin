import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import type { FormData } from './types';
import { relationships } from './types';

interface EmergencyContactSectionProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export default function EmergencyContactSection({
  formData,
  onInputChange,
}: EmergencyContactSectionProps) {
  return (
    <div className='space-y-4 w-full'>
      <h3 className='text-lg font-semibold'>Emergency Contact</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label='Contact Name'
          placeholder='Enter contact name'
          value={formData.emergencyContact.name}
          onValueChange={value => onInputChange('emergencyContact.name', value)}
        />
        <Input
          label='Contact Phone'
          placeholder='Enter contact phone'
          value={formData.emergencyContact.phone}
          onValueChange={value =>
            onInputChange('emergencyContact.phone', value)
          }
        />
        <Select
          label='Relationship'
          placeholder='Select relationship'
          selectedKeys={
            formData.emergencyContact.relationship
              ? [formData.emergencyContact.relationship]
              : []
          }
          onSelectionChange={keys => {
            const selected = Array.from(keys)[0] as string;
            onInputChange('emergencyContact.relationship', selected || '');
          }}
        >
          {relationships.map(relationship => (
            <SelectItem key={relationship}>{relationship}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
