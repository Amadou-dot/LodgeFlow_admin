'use client';

import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/icons';
import { useBooking } from '@/hooks/useBookings';
import {
  formatBookingDates,
  getStatusColor,
  getStatusLabel,
} from '@/utils/bookingUtils';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import { User } from '@heroui/user';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id?.toString();

  if (!bookingId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-danger'>Invalid Booking ID</h1>
          <Button
            color='primary'
            variant='flat'
            startContent={<ArrowLeftIcon className='w-4 h-4' />}
            onPress={() => router.push('/bookings')}
            className='mt-4'
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const { data: booking, error, isLoading } = useBooking(bookingId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner size='lg' label='Loading booking details...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-danger mb-2'>
            Error Loading Booking
          </h1>
          <p className='text-default-500 mb-4'>{error.message}</p>
          <Button
            color='primary'
            variant='flat'
            startContent={<ArrowLeftIcon className='w-4 h-4' />}
            onPress={() => router.push('/bookings')}
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-warning'>Booking Not Found</h1>
          <Button
            color='primary'
            variant='flat'
            startContent={<ArrowLeftIcon className='w-4 h-4' />}
            onPress={() => router.push('/bookings')}
            className='mt-4'
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const { dateRange, timeInfo } = formatBookingDates(
    booking.checkInDate.toString(),
    booking.checkOutDate.toString(),
    booking.numNights,
    booking.status
  );

  return (
    <div className='container mx-auto px-4 py-6 max-w-6xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button
            isIconOnly
            variant='flat'
            onPress={() => router.back()}
            aria-label='Go back'
          >
            <ArrowLeftIcon className='w-4 h-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Booking Details</h1>
            <p className='text-default-500'>Booking ID: {booking._id}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          {booking.status !== 'cancelled' && (
            <Button
              color='primary'
              variant='flat'
              startContent={<EditIcon className='w-4 h-4' />}
            >
              Edit Booking
            </Button>
          )}
          <Button
            color='danger'
            variant='flat'
            startContent={<TrashIcon className='w-4 h-4' />}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Status & Dates */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Booking Status & Dates</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Chip
                  color={getStatusColor(booking.status)}
                  variant='flat'
                  size='lg'
                >
                  {getStatusLabel(booking.status)}
                </Chip>
                {booking.isPaid && (
                  <Chip color='success' variant='flat'>
                    Paid
                  </Chip>
                )}
                {booking.depositPaid && !booking.isPaid && (
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
                    {format(
                      new Date(booking.checkInDate),
                      'EEEE, MMMM dd, yyyy'
                    )}
                  </p>
                  {booking.checkInTime && (
                    <p className='text-xs text-default-500'>
                      Checked in:{' '}
                      {format(new Date(booking.checkInTime), 'h:mm a')}
                    </p>
                  )}
                </div>
                <div>
                  <span className='text-default-500'>Check-out:</span>
                  <p className='font-medium'>
                    {format(
                      new Date(booking.checkOutDate),
                      'EEEE, MMMM dd, yyyy'
                    )}
                  </p>
                  {booking.checkOutTime && (
                    <p className='text-xs text-default-500'>
                      Checked out:{' '}
                      {format(new Date(booking.checkOutTime), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Guest Information</h2>
            </CardHeader>
            <CardBody>
              {booking.customer ? (
                <>
                  <User
                    name={booking.customer.name || 'Unknown Guest'}
                    description={booking.customer.email || 'No email provided'}
                    avatarProps={{
                      src: booking.customer.profileImage,
                      name: booking.customer.name
                        ? booking.customer.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .substring(0, 2)
                        : 'UG',
                      className: 'bg-primary text-white',
                    }}
                  />
                  <Divider className='my-4' />
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-default-500'>Phone:</span>
                      <p className='font-medium'>
                        {booking.customer.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className='text-default-500'>Nationality:</span>
                      <p className='font-medium'>
                        {booking.customer.nationality || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className='text-default-500'>Guests:</span>
                      <p className='font-medium'>
                        {booking.numGuests} guest
                        {booking.numGuests !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <span className='text-default-500'>Nights:</span>
                      <p className='font-medium'>
                        {booking.numNights} night
                        {booking.numNights !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-center py-4'>
                  <p className='text-default-500'>
                    Guest information not available
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cabin Information */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Cabin Information</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 rounded-lg bg-default-100 flex items-center justify-center'>
                  {booking.cabin.image ? (
                    <img
                      src={booking.cabin.image}
                      alt={booking.cabin.name}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <span className='text-2xl'>🏡</span>
                  )}
                </div>
                <div>
                  <h3 className='font-semibold'>{booking.cabin.name}</h3>
                  <p className='text-sm text-default-500'>
                    Capacity: {booking.cabin.capacity} guests
                  </p>
                  <p className='text-sm text-default-500'>
                    ${booking.cabinPrice} per night
                  </p>
                </div>
              </div>
              {booking.cabin.description && (
                <p className='text-sm text-default-600'>
                  {booking.cabin.description}
                </p>
              )}
            </CardBody>
          </Card>

          {/* Extras & Amenities */}
          {(booking.extras.hasBreakfast ||
            booking.extras.hasPets ||
            booking.extras.hasParking ||
            booking.extras.hasEarlyCheckIn ||
            booking.extras.hasLateCheckOut) && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold'>Extras & Add-ons</h2>
              </CardHeader>
              <CardBody>
                <div className='space-y-2'>
                  {booking.extras.hasBreakfast && (
                    <div className='flex justify-between items-center'>
                      <span>Breakfast</span>
                      <span className='font-medium'>
                        ${booking.extras.breakfastPrice}
                      </span>
                    </div>
                  )}
                  {booking.extras.hasPets && (
                    <div className='flex justify-between items-center'>
                      <span>Pet Fee</span>
                      <span className='font-medium'>
                        ${booking.extras.petFee}
                      </span>
                    </div>
                  )}
                  {booking.extras.hasParking && (
                    <div className='flex justify-between items-center'>
                      <span>Parking</span>
                      <span className='font-medium'>
                        ${booking.extras.parkingFee}
                      </span>
                    </div>
                  )}
                  {booking.extras.hasEarlyCheckIn && (
                    <div className='flex justify-between items-center'>
                      <span>Early Check-in</span>
                      <span className='font-medium'>
                        ${booking.extras.earlyCheckInFee}
                      </span>
                    </div>
                  )}
                  {booking.extras.hasLateCheckOut && (
                    <div className='flex justify-between items-center'>
                      <span>Late Check-out</span>
                      <span className='font-medium'>
                        ${booking.extras.lateCheckOutFee}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notes & Observations */}
          {(booking.observations || booking.specialRequests?.length) && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold'>
                  Notes & Special Requests
                </h2>
              </CardHeader>
              <CardBody className='space-y-4'>
                {booking.observations && (
                  <div>
                    <h4 className='font-medium text-sm text-default-600 mb-1'>
                      Observations:
                    </h4>
                    <p className='text-sm'>{booking.observations}</p>
                  </div>
                )}
                {booking.specialRequests?.length && (
                  <div>
                    <h4 className='font-medium text-sm text-default-600 mb-1'>
                      Special Requests:
                    </h4>
                    <ul className='text-sm space-y-1'>
                      {booking.specialRequests.map((request, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='text-primary'>•</span>
                          <span>{request}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Payment Summary</h2>
            </CardHeader>
            <CardBody className='space-y-3'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Cabin ({booking.numNights} nights)</span>
                  <span>${booking.cabinPrice * booking.numNights}</span>
                </div>
                {booking.extrasPrice > 0 && (
                  <div className='flex justify-between'>
                    <span>Extras</span>
                    <span>${booking.extrasPrice}</span>
                  </div>
                )}
                <Divider />
                <div className='flex justify-between font-semibold'>
                  <span>Total</span>
                  <span>${booking.totalPrice}</span>
                </div>
              </div>

              <Divider />

              <div className='space-y-2 text-sm'>
                {booking.depositPaid && (
                  <div className='flex justify-between text-success'>
                    <span>Deposit Paid</span>
                    <span>${booking.depositAmount}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span>Remaining</span>
                  <span
                    className={
                      booking.remainingAmount > 0
                        ? 'text-warning'
                        : 'text-success'
                    }
                  >
                    ${booking.remainingAmount}
                  </span>
                </div>
              </div>

              {booking.paymentMethod && (
                <div className='pt-2'>
                  <span className='text-xs text-default-500'>
                    Payment Method:
                  </span>
                  <p className='text-sm font-medium capitalize'>
                    {booking.paymentMethod.replace('-', ' ')}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Quick Actions</h2>
            </CardHeader>
            <CardBody className='space-y-2'>
              {booking.status === 'confirmed' && (
                <Button color='success' variant='flat' fullWidth>
                  Check In Guest
                </Button>
              )}
              {booking.status === 'checked-in' && (
                <Button color='primary' variant='flat' fullWidth>
                  Check Out Guest
                </Button>
              )}
              {!booking.isPaid && (
                <Button color='warning' variant='flat' fullWidth>
                  Record Payment
                </Button>
              )}
              <Button variant='flat' fullWidth>
                Send Confirmation Email
              </Button>
              <Button variant='flat' fullWidth>
                Print Booking Details
              </Button>
            </CardBody>
          </Card>

          {/* Booking History */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Booking History</h2>
            </CardHeader>
            <CardBody>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-default-500'>Created</span>
                  <span>
                    {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-default-500'>Last Updated</span>
                  <span>
                    {format(new Date(booking.updatedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
