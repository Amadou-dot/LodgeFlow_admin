import type { Cabin } from '@/types';
import { Input } from '@heroui/input';
import { BookingFormFieldProps } from './types';

interface BookingDatesGuestsProps extends BookingFormFieldProps {
  selectedCabin?: Cabin;
  numNights: number;
}

export default function BookingDatesGuests({
  formData,
  onInputChange,
  selectedCabin,
  numNights,
}: BookingDatesGuestsProps) {
  return (
    <>
      {/* Date Selection */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          type='date'
          label='Check-in Date'
          value={formData.checkInDate}
          onChange={e => onInputChange('checkInDate', e.target.value)}
          isRequired
        />
        <Input
          type='date'
          label='Check-out Date'
          value={formData.checkOutDate}
          onChange={e => onInputChange('checkOutDate', e.target.value)}
          isRequired
        />
      </div>

      {/* Number of Guests */}
      <Input
        type='number'
        label='Number of Guests'
        value={formData.numGuests.toString()}
        onChange={e =>
          onInputChange('numGuests', parseInt(e.target.value) || 1)
        }
        min={1}
        max={selectedCabin?.capacity || 10}
        isRequired
      />

      {numNights > 0 && (
        <div className='text-sm text-default-600'>
          Duration: {numNights} night{numNights !== 1 ? 's' : ''}
        </div>
      )}
    </>
  );
}
