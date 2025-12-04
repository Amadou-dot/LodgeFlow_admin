import type { Cabin } from '@/types';
import { DateRangePicker } from '@heroui/date-picker';
import { Input } from '@heroui/input';
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
  type CalendarDate,
  type DateValue,
} from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import useSWR from 'swr';
import { BookingFormFieldProps } from './types';

interface BookingDatesGuestsProps extends BookingFormFieldProps {
  selectedCabin?: Cabin;
  numNights: number;
}

interface UnavailableDateRange {
  start: string;
  end: string;
}

interface AvailabilityData {
  cabinId: string;
  unavailableDates: UnavailableDateRange[];
  queryRange: {
    start: string;
    end: string;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookingDatesGuests({
  formData,
  onInputChange,
  selectedCabin,
  numNights,
}: BookingDatesGuestsProps) {
  // Fetch unavailable dates for the selected cabin
  const { data: availabilityData, error } = useSWR<{
    success: boolean;
    data: AvailabilityData;
  }>(
    selectedCabin?.id ? `/api/cabins/${selectedCabin.id}/availability` : null,
    fetcher
  );

  // Convert string dates to CalendarDate objects for the DateRangePicker
  const dateRange: RangeValue<CalendarDate> | null =
    formData.checkInDate && formData.checkOutDate
      ? {
          start: parseDate(formData.checkInDate),
          end: parseDate(formData.checkOutDate),
        }
      : null;

  // Handle date range changes from the DateRangePicker
  const handleDateRangeChange = (value: RangeValue<CalendarDate> | null) => {
    if (value) {
      onInputChange('checkInDate', value.start.toString());
      if (value.end) {
        onInputChange('checkOutDate', value.end.toString());
      }
    } else {
      onInputChange('checkInDate', '');
      onInputChange('checkOutDate', '');
    }
  };

  // Get today's date to prevent past date selection
  const todayDate = today(getLocalTimeZone());

  // Create a function to check if a date is unavailable
  const isDateUnavailable = (date: DateValue) => {
    if (!availabilityData?.success || !availabilityData.data.unavailableDates) {
      return false;
    }

    // Convert the date to CalendarDate if it's not already
    const calendarDate = 'calendar' in date ? toCalendarDate(date) : date;

    return availabilityData.data.unavailableDates.some(range => {
      const startDate = parseDate(range.start);
      const endDate = parseDate(range.end);
      return (
        calendarDate.compare(startDate) >= 0 &&
        calendarDate.compare(endDate) < 0
      );
    });
  };

  return (
    <>
      {/* Date Range Selection */}
      <div
        className='relative'
        style={{
          position: 'relative',
          zIndex: 1000,
          isolation: 'isolate',
        }}
        onSubmit={e => e.preventDefault()}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onFocus={e => e.stopPropagation()}
        onBlur={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <DateRangePicker
          label='Stay Duration'
          value={dateRange}
          onChange={handleDateRangeChange}
          minValue={todayDate}
          showMonthAndYearPickers
          visibleMonths={2}
          calendarWidth={400}
          description={
            selectedCabin
              ? 'Select your check-in and check-out dates. Unavailable dates are marked.'
              : 'Please select a cabin first to see availability'
          }
          isDateUnavailable={selectedCabin ? isDateUnavailable : undefined}
          isDisabled={!selectedCabin}
          errorMessage={error ? 'Failed to load availability data' : undefined}
          autoFocus={false}
          className='w-full'
          classNames={{
            base: 'w-full',
            calendar: 'z-[9999]',
            popoverContent: 'z-[9999]',
          }}
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

      {/* Availability Info */}
      {selectedCabin && availabilityData?.success && (
        <div className='text-xs text-default-500'>
          {availabilityData.data.unavailableDates.length > 0 ? (
            <>Unavailable dates are shown in red and cannot be selected.</>
          ) : (
            <>All dates in the next 6 months are available for booking.</>
          )}
        </div>
      )}
    </>
  );
}
