'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { useCreateBooking } from '@/hooks/useBookings';
import { useCabins } from '@/hooks/useCabins';
import { useCustomers } from '@/hooks/useCustomers';
import { useSettings } from '@/hooks/useSettings';
import type { Cabin, Customer } from '@/types';

interface BookingFormData {
  cabin: string;
  customer: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  hasBreakfast: boolean;
  hasPets: boolean;
  hasParking: boolean;
  hasEarlyCheckIn: boolean;
  hasLateCheckOut: boolean;
  observations: string;
  specialRequests: string[];
  paymentMethod: string;
  isPaid: boolean;
  depositPaid: boolean;
}

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    cabin: '',
    customer: '',
    checkInDate: '',
    checkOutDate: '',
    numGuests: 1,
    hasBreakfast: false,
    hasPets: false,
    hasParking: false,
    hasEarlyCheckIn: false,
    hasLateCheckOut: false,
    observations: '',
    specialRequests: [],
    paymentMethod: '',
    isPaid: false,
    depositPaid: false,
  });

  const [specialRequestInput, setSpecialRequestInput] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState({
    cabinPrice: 0,
    breakfastPrice: 0,
    petFee: 0,
    parkingFee: 0,
    earlyCheckInFee: 0,
    lateCheckOutFee: 0,
    extrasPrice: 0,
    totalPrice: 0,
    depositAmount: 0,
  });

  const createBooking = useCreateBooking();
  const { data: cabins } = useCabins();
  const { data: customers } = useCustomers({ limit: 100 }); // Get more customers for selection
  const { data: settings } = useSettings();

  const selectedCabin = cabins?.find(cabin => cabin._id === formData.cabin);

  // Calculate number of nights
  const numNights =
    formData.checkInDate && formData.checkOutDate
      ? Math.ceil(
          (new Date(formData.checkOutDate).getTime() -
            new Date(formData.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    if (!selectedCabin || !settings || numNights <= 0) {
      setPriceBreakdown({
        cabinPrice: 0,
        breakfastPrice: 0,
        petFee: 0,
        parkingFee: 0,
        earlyCheckInFee: 0,
        lateCheckOutFee: 0,
        extrasPrice: 0,
        totalPrice: 0,
        depositAmount: 0,
      });
      return;
    }

    const discountedPrice =
      selectedCabin.discount > 0
        ? selectedCabin.price - selectedCabin.discount
        : selectedCabin.price;
    const cabinPrice = discountedPrice * numNights;

    const breakfastPrice = formData.hasBreakfast
      ? settings.breakfastPrice * formData.numGuests * numNights
      : 0;

    const petFee = formData.hasPets ? settings.petFee * numNights : 0;

    const parkingFee =
      formData.hasParking && !settings.parkingIncluded
        ? settings.parkingFee * numNights
        : 0;

    const earlyCheckInFee = formData.hasEarlyCheckIn
      ? settings.earlyCheckInFee
      : 0;
    const lateCheckOutFee = formData.hasLateCheckOut
      ? settings.lateCheckOutFee
      : 0;

    const extrasPrice =
      breakfastPrice + petFee + parkingFee + earlyCheckInFee + lateCheckOutFee;
    const totalPrice = cabinPrice + extrasPrice;
    const depositAmount = settings.requireDeposit
      ? Math.round(totalPrice * (settings.depositPercentage / 100))
      : 0;

    setPriceBreakdown({
      cabinPrice,
      breakfastPrice,
      petFee,
      parkingFee,
      earlyCheckInFee,
      lateCheckOutFee,
      extrasPrice,
      totalPrice,
      depositAmount,
    });
  }, [
    selectedCabin,
    settings,
    numNights,
    formData.hasBreakfast,
    formData.hasPets,
    formData.hasParking,
    formData.hasEarlyCheckIn,
    formData.hasLateCheckOut,
    formData.numGuests,
  ]);

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialRequest = () => {
    if (specialRequestInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specialRequests: [...prev.specialRequests, specialRequestInput.trim()],
      }));
      setSpecialRequestInput('');
    }
  };

  const removeSpecialRequest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.cabin) errors.push('Please select a cabin');
    if (!formData.customer) errors.push('Please select a customer');
    if (!formData.checkInDate) errors.push('Please select check-in date');
    if (!formData.checkOutDate) errors.push('Please select check-out date');
    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      errors.push('Check-out date must be after check-in date');
    }
    if (formData.numGuests < 1)
      errors.push('Number of guests must be at least 1');
    if (selectedCabin && formData.numGuests > selectedCabin.capacity) {
      errors.push(
        `Number of guests cannot exceed cabin capacity (${selectedCabin.capacity})`
      );
    }
    if (settings && numNights < settings.minBookingLength) {
      errors.push(
        `Minimum booking length is ${settings.minBookingLength} nights`
      );
    }
    if (settings && numNights > settings.maxBookingLength) {
      errors.push(
        `Maximum booking length is ${settings.maxBookingLength} nights`
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const bookingData = {
        cabin: formData.cabin,
        customer: formData.customer,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        numNights,
        numGuests: formData.numGuests,
        status: 'unconfirmed' as const,
        cabinPrice:
          selectedCabin!.discount > 0
            ? selectedCabin!.price - selectedCabin!.discount
            : selectedCabin!.price,
        extrasPrice: priceBreakdown.extrasPrice,
        totalPrice: priceBreakdown.totalPrice,
        isPaid: formData.isPaid,
        paymentMethod: formData.paymentMethod || undefined,
        extras: {
          hasBreakfast: formData.hasBreakfast,
          breakfastPrice: priceBreakdown.breakfastPrice,
          hasPets: formData.hasPets,
          petFee: priceBreakdown.petFee,
          hasParking: formData.hasParking,
          parkingFee: priceBreakdown.parkingFee,
          hasEarlyCheckIn: formData.hasEarlyCheckIn,
          earlyCheckInFee: priceBreakdown.earlyCheckInFee,
          hasLateCheckOut: formData.hasLateCheckOut,
          lateCheckOutFee: priceBreakdown.lateCheckOutFee,
        },
        observations: formData.observations || undefined,
        specialRequests: formData.specialRequests,
        depositPaid: formData.depositPaid,
        depositAmount: priceBreakdown.depositAmount,
        remainingAmount:
          priceBreakdown.totalPrice -
          (formData.depositPaid ? priceBreakdown.depositAmount : 0),
      };

      await createBooking.mutateAsync(bookingData as any);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Booking Details</h3>
        </CardHeader>
        <CardBody className='space-y-4'>
          {/* Cabin Selection */}
          <Select
            label='Select Cabin'
            placeholder='Choose a cabin'
            selectedKeys={formData.cabin ? [formData.cabin] : []}
            onSelectionChange={keys =>
              handleInputChange('cabin', Array.from(keys)[0] as string)
            }
            isRequired
          >
            {(cabins || []).map(cabin => (
              <SelectItem key={cabin._id}>
                {cabin.name} - {formatCurrency(cabin.price)}/night (Capacity:{' '}
                {cabin.capacity})
                {cabin.discount > 0 &&
                  ` - ${formatCurrency(cabin.discount)} discount`}
              </SelectItem>
            ))}
          </Select>

          {/* Customer Selection */}
          <Select
            label='Select Customer'
            placeholder='Choose a customer'
            selectedKeys={formData.customer ? [formData.customer] : []}
            onSelectionChange={keys =>
              handleInputChange('customer', Array.from(keys)[0] as string)
            }
            isRequired
          >
            {(customers || []).map(customer => (
              <SelectItem key={customer._id}>
                {customer.name} - {customer.email}
              </SelectItem>
            ))}
          </Select>

          {/* Date Selection */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              type='date'
              label='Check-in Date'
              value={formData.checkInDate}
              onChange={e => handleInputChange('checkInDate', e.target.value)}
              isRequired
            />
            <Input
              type='date'
              label='Check-out Date'
              value={formData.checkOutDate}
              onChange={e => handleInputChange('checkOutDate', e.target.value)}
              isRequired
            />
          </div>

          {/* Number of Guests */}
          <Input
            type='number'
            label='Number of Guests'
            value={formData.numGuests.toString()}
            onChange={e =>
              handleInputChange('numGuests', parseInt(e.target.value) || 1)
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
        </CardBody>
      </Card>

      {/* Extras */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Extras & Services</h3>
        </CardHeader>
        <CardBody className='space-y-4'>
          <div className='space-y-4'>
            <Switch
              isSelected={formData.hasBreakfast}
              onValueChange={checked =>
                handleInputChange('hasBreakfast', checked)
              }
            >
              Include Breakfast ({formatCurrency(settings?.breakfastPrice || 0)}
              /person/night)
            </Switch>

            {settings?.allowPets && (
              <Switch
                isSelected={formData.hasPets}
                onValueChange={checked => handleInputChange('hasPets', checked)}
              >
                Pets ({formatCurrency(settings.petFee)}/night)
              </Switch>
            )}

            {!settings?.parkingIncluded && (
              <Switch
                isSelected={formData.hasParking}
                onValueChange={checked =>
                  handleInputChange('hasParking', checked)
                }
              >
                Parking ({formatCurrency(settings?.parkingFee || 0)}/night)
              </Switch>
            )}

            <Switch
              isSelected={formData.hasEarlyCheckIn}
              onValueChange={checked =>
                handleInputChange('hasEarlyCheckIn', checked)
              }
            >
              Early Check-in ({formatCurrency(settings?.earlyCheckInFee || 0)})
            </Switch>

            <Switch
              isSelected={formData.hasLateCheckOut}
              onValueChange={checked =>
                handleInputChange('hasLateCheckOut', checked)
              }
            >
              Late Check-out ({formatCurrency(settings?.lateCheckOutFee || 0)})
            </Switch>
          </div>
        </CardBody>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Special Requests</h3>
        </CardHeader>
        <CardBody className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Add a special request'
              value={specialRequestInput}
              onChange={e => setSpecialRequestInput(e.target.value)}
              className='flex-1'
            />
            <Button onClick={addSpecialRequest} variant='bordered'>
              Add
            </Button>
          </div>

          {formData.specialRequests.length > 0 && (
            <div className='space-y-2'>
              {formData.specialRequests.map((request, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-default-100 p-2 rounded'
                >
                  <span>{request}</span>
                  <Button
                    size='sm'
                    color='danger'
                    variant='light'
                    onClick={() => removeSpecialRequest(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Input
            label='Observations'
            placeholder='Any additional notes or observations for staff'
            value={formData.observations}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange('observations', e.target.value)
            }
          />
        </CardBody>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Payment Information</h3>
        </CardHeader>
        <CardBody className='space-y-4'>
          <Select
            label='Payment Method'
            placeholder='Select payment method'
            selectedKeys={
              formData.paymentMethod ? [formData.paymentMethod] : []
            }
            onSelectionChange={keys =>
              handleInputChange('paymentMethod', Array.from(keys)[0] as string)
            }
          >
            <SelectItem key='cash'>Cash</SelectItem>
            <SelectItem key='card'>Card</SelectItem>
            <SelectItem key='bank-transfer'>Bank Transfer</SelectItem>
            <SelectItem key='online'>Online</SelectItem>
          </Select>

          <Switch
            isSelected={formData.isPaid}
            onValueChange={checked => handleInputChange('isPaid', checked)}
          >
            Mark as Paid
          </Switch>

          {settings?.requireDeposit && (
            <Switch
              isSelected={formData.depositPaid}
              onValueChange={checked =>
                handleInputChange('depositPaid', checked)
              }
            >
              Deposit Paid ({formatCurrency(priceBreakdown.depositAmount)})
            </Switch>
          )}
        </CardBody>
      </Card>

      {/* Price Breakdown */}
      {priceBreakdown.totalPrice > 0 && (
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Price Breakdown</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Cabin ({numNights} nights)</span>
                <span>{formatCurrency(priceBreakdown.cabinPrice)}</span>
              </div>

              {priceBreakdown.breakfastPrice > 0 && (
                <div className='flex justify-between text-sm'>
                  <span>Breakfast</span>
                  <span>{formatCurrency(priceBreakdown.breakfastPrice)}</span>
                </div>
              )}

              {priceBreakdown.petFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span>Pet Fee</span>
                  <span>{formatCurrency(priceBreakdown.petFee)}</span>
                </div>
              )}

              {priceBreakdown.parkingFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span>Parking</span>
                  <span>{formatCurrency(priceBreakdown.parkingFee)}</span>
                </div>
              )}

              {priceBreakdown.earlyCheckInFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span>Early Check-in</span>
                  <span>{formatCurrency(priceBreakdown.earlyCheckInFee)}</span>
                </div>
              )}

              {priceBreakdown.lateCheckOutFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span>Late Check-out</span>
                  <span>{formatCurrency(priceBreakdown.lateCheckOutFee)}</span>
                </div>
              )}

              <Divider />
              <div className='flex justify-between font-semibold'>
                <span>Total</span>
                <span>{formatCurrency(priceBreakdown.totalPrice)}</span>
              </div>

              {settings?.requireDeposit && (
                <>
                  <div className='flex justify-between text-sm'>
                    <span>Deposit ({settings.depositPercentage}%)</span>
                    <span>{formatCurrency(priceBreakdown.depositAmount)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Remaining</span>
                    <span>
                      {formatCurrency(
                        priceBreakdown.totalPrice - priceBreakdown.depositAmount
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Form Actions */}
      <div className='flex gap-4 justify-end'>
        {onCancel && (
          <Button variant='bordered' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          color='primary'
          isLoading={createBooking.isPending}
        >
          Create Booking
        </Button>
      </div>
    </form>
  );
}
