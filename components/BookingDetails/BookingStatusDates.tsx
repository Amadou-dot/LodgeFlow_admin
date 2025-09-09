import { getStatusColor, getStatusLabel } from '@/utils/bookingUtils';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { format } from 'date-fns';

interface BookingStatusDatesProps {
  status: string;
  isPaid: boolean;
  depositPaid: boolean;
  checkInDate: string;
  checkOutDate: string;
  numNights: number;
  checkInTime?: string;
  checkOutTime?: string;
  dateRange: string;
  timeInfo: string;
}

export default function BookingStatusDates({
  status,
  isPaid,
  depositPaid,
  checkInDate,
  checkOutDate,
  checkInTime,
  checkOutTime,
  dateRange,
  timeInfo,
}: BookingStatusDatesProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className='text-lg font-semibold'>Booking Status & Dates</h2>
      </CardHeader>
      <CardBody className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Chip color={getStatusColor(status)} variant='flat' size='lg'>
            {getStatusLabel(status)}
          </Chip>
          {isPaid && (
            <Chip color='success' variant='flat'>
              Paid
            </Chip>
          )}
          {depositPaid && !isPaid && (
            <Chip color='warning' variant='flat'>
              Deposit Paid
            </Chip>
          )}
        </div>
        <div>
          <p className='font-medium'>{dateRange}</p>
          <p className='text-sm text-default-500'>{timeInfo}</p>
        </div>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-default-500'>Check-in:</span>
            <p className='font-medium'>
              {format(new Date(checkInDate), 'EEEE, MMMM dd, yyyy')}
            </p>
            {checkInTime && (
              <p className='text-xs text-default-500'>
                Checked in: {format(new Date(checkInTime), 'h:mm a')}
              </p>
            )}
          </div>
          <div>
            <span className='text-default-500'>Check-out:</span>
            <p className='font-medium'>
              {format(new Date(checkOutDate), 'EEEE, MMMM dd, yyyy')}
            </p>
            {checkOutTime && (
              <p className='text-xs text-default-500'>
                Checked out: {format(new Date(checkOutTime), 'h:mm a')}
              </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
