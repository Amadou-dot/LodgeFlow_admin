'use client';

import { useCreateBooking } from '@/hooks/useBookings';
import { useCabins } from '@/hooks/useCabins';
import { useInfiniteCustomers } from '@/hooks/useInfiniteCustomers';
import { useSettings } from '@/hooks/useSettings';
import type { Customer } from '@/types';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { useInfiniteScroll } from '@heroui/use-infinite-scroll';
import { useEffect, useState } from 'react';
import {
  BookingDatesGuests,
  BookingExtras,
  CabinSelection,
  CustomerSelection,
  FormActions,
  PaymentInformation,
  PriceBreakdown,
  SpecialRequests,
} from './BookingForm/index';

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
  const {
    customers,
    hasMore,
    isLoading: customersLoading,
    onLoadMore,
    searchCustomers,
  } = useInfiniteCustomers();
  const { data: settings } = useSettings();

  // Infinite scroll setup for customers
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [, scrollerRef] = useInfiniteScroll({
    hasMore,
    isEnabled: isCustomerOpen,
    shouldUseLoader: false,
    onLoadMore,
  });

  // Debounced search for customers
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleCustomerSearch = (searchValue: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchCustomers(searchValue);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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
      // eslint-disable-next-line no-console
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
      {/* Cabin Selection */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Cabin Selection</h3>
        </CardHeader>
        <CardBody>
          <CabinSelection
            formData={formData}
            onInputChange={handleInputChange}
            cabins={cabins || []}
            formatCurrency={formatCurrency}
          />
        </CardBody>
      </Card>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Customer Selection</h3>
        </CardHeader>
        <CardBody>
          <CustomerSelection
            formData={formData}
            onInputChange={handleInputChange}
            customers={customers}
            customersLoading={customersLoading}
            scrollerRef={scrollerRef}
            onOpenChange={setIsCustomerOpen}
            onSearchChange={handleCustomerSearch}
          />
        </CardBody>
      </Card>

      {/* Booking Dates & Guests */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Booking Details</h3>
        </CardHeader>
        <CardBody className='space-y-4'>
          <BookingDatesGuests
            formData={formData}
            onInputChange={handleInputChange}
            selectedCabin={selectedCabin}
            numNights={numNights}
          />
        </CardBody>
      </Card>

      {/* Extras */}
      <BookingExtras
        formData={formData}
        onInputChange={handleInputChange}
        settings={settings}
        priceBreakdown={priceBreakdown}
        formatCurrency={formatCurrency}
      />

      {/* Special Requests */}
      <SpecialRequests
        formData={formData}
        onInputChange={handleInputChange}
        specialRequestInput={specialRequestInput}
        onSpecialRequestInputChange={setSpecialRequestInput}
        onAddSpecialRequest={addSpecialRequest}
        onRemoveSpecialRequest={removeSpecialRequest}
      />

      {/* Payment */}
      <PaymentInformation
        formData={formData}
        onInputChange={handleInputChange}
        settings={settings}
        priceBreakdown={priceBreakdown}
      />

      {/* Price Breakdown */}
      <PriceBreakdown
        priceBreakdown={priceBreakdown}
        numNights={numNights}
        settings={settings}
      />

      {/* Form Actions */}
      <FormActions onCancel={onCancel} isLoading={createBooking.isPending} />
    </form>
  );
}
