'use client';

import { useCreateBooking } from '@/hooks/useBookings';
import { useCabins } from '@/hooks/useCabins';
import { useInfiniteCustomers } from '@/hooks/useInfiniteCustomers';
import { useSettings } from '@/hooks/useSettings';
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
import {
  BookingFormData,
  BookingFormProps,
  PriceBreakdown as PriceBreakdownType,
} from './BookingForm/types';

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { customers, isLoading, searchCustomers } = useInfiniteCustomers();
  const { data: cabins } = useCabins();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const createBooking = useCreateBooking();
  const [specialRequestInput, setSpecialRequestInput] = useState('');

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

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev: BookingFormData) => ({ ...prev, [field]: value }));
  };

  const handleAddSpecialRequest = () => {
    if (specialRequestInput.trim()) {
      setFormData((prev: BookingFormData) => ({
        ...prev,
        specialRequests: [...prev.specialRequests, specialRequestInput.trim()],
      }));
      setSpecialRequestInput('');
    }
  };

  const handleRemoveSpecialRequest = (index: number) => {
    setFormData((prev: BookingFormData) => ({
      ...prev,
      specialRequests: prev.specialRequests.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
    }).format(amount);
  };

  const numNights =
    formData.checkInDate && formData.checkOutDate
      ? Math.ceil(
          (new Date(formData.checkOutDate).getTime() -
            new Date(formData.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Calculate price breakdown
  const priceBreakdown: PriceBreakdownType = (() => {
    if (!formData.checkInDate || !formData.checkOutDate || !formData.cabin) {
      return {
        cabinPrice: 0,
        breakfastPrice: 0,
        petFee: 0,
        parkingFee: 0,
        earlyCheckInFee: 0,
        lateCheckOutFee: 0,
        extrasPrice: 0,
        totalPrice: 0,
        depositAmount: 0,
      };
    }

    // Base cabin price calculation - should get from selected cabin
    const selectedCabin = cabins?.find(
      cabin => cabin._id.toString() === formData.cabin
    );
    const baseCabinPrice = selectedCabin?.price || 150;
    const cabinPrice = baseCabinPrice * numNights;

    const breakfastPrice = formData.hasBreakfast
      ? (settings?.breakfastPrice || 15) * formData.numGuests * numNights
      : 0;
    const petFee = formData.hasPets ? settings?.petFee || 25 : 0;
    const parkingFee = formData.hasParking ? settings?.parkingFee || 10 : 0;
    const earlyCheckInFee = formData.hasEarlyCheckIn
      ? settings?.earlyCheckInFee || 30
      : 0;
    const lateCheckOutFee = formData.hasLateCheckOut
      ? settings?.lateCheckOutFee || 30
      : 0;

    const extrasPrice =
      breakfastPrice + petFee + parkingFee + earlyCheckInFee + lateCheckOutFee;
    const totalPrice = cabinPrice + extrasPrice;
    const depositAmount = settings?.requireDeposit
      ? (totalPrice * (settings.depositPercentage || 30)) / 100
      : 0;

    return {
      cabinPrice,
      breakfastPrice,
      petFee,
      parkingFee,
      earlyCheckInFee,
      lateCheckOutFee,
      extrasPrice,
      totalPrice,
      depositAmount,
    };
  })();

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

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    try {
      const bookingData = {
        cabinId: formData.cabin,
        customerId: formData.customer,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        numGuests: formData.numGuests,
        totalPrice: priceBreakdown.totalPrice,
        status: 'unconfirmed',
        paymentMethod: formData.paymentMethod,
        isPaid: formData.isPaid,
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

  if (settingsLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <CabinSelection
        formData={formData}
        onInputChange={handleInputChange}
        priceBreakdown={priceBreakdown}
        cabins={cabins || []}
        formatCurrency={formatCurrency}
      />

      <CustomerSelection
        customersLoading={isLoading}
        formData={formData}
        onInputChange={handleInputChange}
        customers={customers}
        priceBreakdown={priceBreakdown}
        onSearchChange={handleCustomerSearch}
      />

      <BookingDatesGuests
        formData={formData}
        onInputChange={handleInputChange}
        priceBreakdown={priceBreakdown}
        numNights={numNights}
      />

      <BookingExtras
        formData={formData}
        onInputChange={handleInputChange}
        settings={settings}
        priceBreakdown={priceBreakdown}
        formatCurrency={formatCurrency}
      />

      <SpecialRequests
        formData={formData}
        onInputChange={handleInputChange}
        specialRequestInput={specialRequestInput}
        onSpecialRequestInputChange={setSpecialRequestInput}
        onAddSpecialRequest={handleAddSpecialRequest}
        onRemoveSpecialRequest={handleRemoveSpecialRequest}
        priceBreakdown={priceBreakdown}
      />

      <PaymentInformation
        formData={formData}
        onInputChange={handleInputChange}
        settings={settings}
        priceBreakdown={priceBreakdown}
      />

      <PriceBreakdown
        priceBreakdown={priceBreakdown}
        numNights={numNights}
        settings={settings}
      />

      <FormActions onCancel={onCancel} isLoading={createBooking.isPending} />
    </form>
  );
}
