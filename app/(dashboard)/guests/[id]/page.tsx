'use client';

import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table';
import { useParams, useRouter } from 'next/navigation';

import AddBookingModal from '@/components/AddBookingModal';
import DeletionModal from '@/components/DeletionModal';
import EditGuestModal from '@/components/EditGuestModal';
import { ArrowLeftIcon } from '@/components/icons';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import {
  getInitials,
  getLoyaltyTier,
  getStatusColor,
} from '@/utils/utilityFunctions';

export default function GuestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { data: customer, isLoading, error, mutate } = useCustomer(customerId);
  const deleteCustomerMutation = useDeleteCustomer();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='flex justify-center items-center h-64'>
          <Spinner size='lg' label='Loading guest details...' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='bg-danger-50 border border-danger-200 p-4 rounded-lg'>
          <p className='text-danger-600'>Failed to load guest details</p>
          <Button
            className='mt-2'
            variant='light'
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='bg-warning-50 border border-warning-200 p-4 rounded-lg'>
          <p className='text-warning-600'>Guest not found</p>
          <Button
            className='mt-2'
            variant='light'
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const loyalty = getLoyaltyTier(customer.stats?.totalRevenue || 0);

  return (
    <div className='container mx-auto p-4 md:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <Button isIconOnly variant='light' onPress={() => router.back()}>
            <ArrowLeftIcon />
          </Button>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>Guest Details</h1>
            <p className='text-default-600 mt-1'>{customer.name}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <EditGuestModal
            guestData={customer}
            onGuestUpdated={() => mutate()}
          />
          <DeletionModal
            resourceId={customer._id}
            resourceName='Customer'
            itemName={customer.name}
            onDelete={deleteCustomerMutation}
            note='Customers with active bookings cannot be deleted.'
            onResourceDeleted={() => router.push('/guests')}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Guest Information */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader className='flex gap-3'>
              <Avatar
                className='w-16 h-16 text-large'
                color='primary'
                name={getInitials(customer.name)}
              />
              <div className='flex flex-col'>
                <p className='text-lg font-semibold'>{customer.name}</p>
                <p className='text-small text-default-600'>{customer.email}</p>
                <Chip
                  className='mt-2 w-fit'
                  color={loyalty.color}
                  size='sm'
                  variant='flat'
                >
                  {loyalty.tier} Member
                </Chip>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className='space-y-4'>
              <div>
                <h4 className='font-semibold text-sm mb-2'>
                  Contact Information
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-default-600'>Phone:</span>
                    <span>{customer.phone || 'Not provided'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-default-600'>Nationality:</span>
                    <span>{customer.nationality}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-default-600'>National ID:</span>
                    <span className='font-mono text-xs'>
                      {customer.nationalId}
                    </span>
                  </div>
                </div>
              </div>

              {customer.address && (
                <div>
                  <h4 className='font-semibold text-sm mb-2'>Address</h4>
                  <div className='text-sm text-default-600'>
                    <p>{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state}
                    </p>
                    <p>
                      {customer.address.country} {customer.address.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {customer.emergencyContact && (
                <div>
                  <h4 className='font-semibold text-sm mb-2'>
                    Emergency Contact
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-default-600'>Name:</span>
                      <span>{customer.emergencyContact.name}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-default-600'>Phone:</span>
                      <span>{customer.emergencyContact.phone}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-default-600'>Relationship:</span>
                      <span className='capitalize'>
                        {customer.emergencyContact.relationship}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {customer.preferences && (
                <div>
                  <h4 className='font-semibold text-sm mb-2'>Preferences</h4>
                  <div className='space-y-2'>
                    {customer.preferences.smokingPreference && (
                      <Chip color='default' size='sm' variant='flat'>
                        {customer.preferences.smokingPreference.replace(
                          '-',
                          ' '
                        )}
                      </Chip>
                    )}
                    {customer.preferences.dietaryRestrictions?.map(
                      (restriction: string, index: number) => (
                        <Chip
                          key={index}
                          color='warning'
                          size='sm'
                          variant='flat'
                        >
                          {restriction}
                        </Chip>
                      )
                    )}
                    {customer.preferences.accessibilityNeeds?.map(
                      (need: string, index: number) => (
                        <Chip
                          key={index}
                          color='primary'
                          size='sm'
                          variant='flat'
                        >
                          {need.replace('-', ' ')}
                        </Chip>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Statistics and Bookings */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Statistics */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardBody className='text-center'>
                <p className='text-2xl font-bold text-primary'>
                  {customer.stats?.totalBookings || 0}
                </p>
                <p className='text-sm text-default-600'>Total Bookings</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className='text-center'>
                <p className='text-2xl font-bold text-success'>
                  {customer.stats?.completedBookings || 0}
                </p>
                <p className='text-sm text-default-600'>Completed Stays</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className='text-center'>
                <p className='text-2xl font-bold text-warning'>
                  ${(customer.stats?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className='text-sm text-default-600'>Total Spent</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className='text-center'>
                <p className='text-2xl font-bold text-secondary'>
                  {Math.round(customer.stats?.averageStayLength || 0)}
                </p>
                <p className='text-sm text-default-600'>Avg. Stay (nights)</p>
              </CardBody>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Recent Bookings</h3>
              <AddBookingModal onBookingAdded={() => mutate()} />
            </CardHeader>
            <CardBody>
              {customer.recentBookings && customer.recentBookings.length > 0 ? (
                <Table aria-label='Recent bookings'>
                  <TableHeader>
                    <TableColumn>CABIN</TableColumn>
                    <TableColumn>DATES</TableColumn>
                    <TableColumn>NIGHTS</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {customer.recentBookings.map((booking: any) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {booking.cabin?.image && (
                              <img
                                alt={booking.cabin.name}
                                className='w-8 h-8 rounded object-cover'
                                src={booking.cabin.image}
                              />
                            )}
                            <span className='font-medium'>
                              {booking.cabin?.name || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <p>{formatDate(booking.checkInDate)}</p>
                            <p className='text-default-600'>
                              to {formatDate(booking.checkOutDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.numNights}</TableCell>
                        <TableCell>
                          <Chip
                            color={getStatusColor(booking.status) as any}
                            size='sm'
                            variant='flat'
                          >
                            {booking.status}
                          </Chip>
                        </TableCell>
                        <TableCell className='font-medium'>
                          ${booking.totalPrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-default-600'>No bookings found</p>
                  {/* <AddBookingModal onBookingAdded={() => mutate()} /> */}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
