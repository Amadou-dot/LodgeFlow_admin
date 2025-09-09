import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import type { FormData } from './types';
import { countries } from './types';

interface BasicInformationSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

export default function BasicInformationSection({
  formData,
  errors,
  onInputChange,
}: BasicInformationSectionProps) {
  return (
    <div className='space-y-4 w-full'>
      <h3 className='text-lg font-semibold'>Basic Information</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label='Full Name'
          placeholder='Enter full name'
          value={formData.name}
          onValueChange={value => onInputChange('name', value)}
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          isRequired
          name='name'
        />
        <Input
          label='Email'
          placeholder='Enter email address'
          type='email'
          value={formData.email}
          onValueChange={value => onInputChange('email', value)}
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          isRequired
          name='email'
        />
        <Input
          label='Phone'
          placeholder='Enter phone number'
          value={formData.phone}
          onValueChange={value => onInputChange('phone', value)}
          name='phone'
        />
        <Select
          label='Nationality'
          placeholder='Select nationality'
          selectedKeys={formData.nationality ? [formData.nationality] : []}
          onSelectionChange={keys => {
            const selected = Array.from(keys)[0] as string;
            onInputChange('nationality', selected || '');
          }}
          isInvalid={!!errors.nationality}
          errorMessage={errors.nationality}
          isRequired
          name='nationality'
        >
          {countries.map(country => (
            <SelectItem key={country}>{country}</SelectItem>
          ))}
        </Select>
        <Input
          label='National ID'
          placeholder='Enter national ID/passport'
          value={formData.nationalId}
          onValueChange={value => onInputChange('nationalId', value)}
          isInvalid={!!errors.nationalId}
          errorMessage={errors.nationalId}
          isRequired
          name='nationalId'
        />
      </div>
    </div>
  );
}
