'use client';

import type { BookingFormData } from '@/hooks/useBookingForm';
import { Card, CardBody, CardHeader } from '@heroui/card';
import {
  BookingDatesGuests,
  BookingExtras,
  CabinSelection,
  CustomerSelection,
  PaymentInformation,
  PriceBreakdown,
  SpecialRequests,
} from './BookingForm/index';

interface BookingFormFieldsProps {
  // Hook return values passed from parent
  formData: any;
  specialRequestInput: string;
  priceBreakdown: any;
  selectedCabin: any;
  numNights: number;
  cabins: any[];
  customers: any[];
  customersLoading: boolean;
  settings: any;
  scrollerRef: any;
  isCustomerOpen: boolean;
  setIsCustomerOpen: (open: boolean) => void;
  handleInputChange: (field: keyof BookingFormData, value: any) => void;
  handleCustomerSearch: (searchValue: string) => void;
  addSpecialRequest: () => void;
  removeSpecialRequest: (index: number) => void;
  setSpecialRequestInput: (value: string) => void;
  formatCurrency: (amount: number) => string;
  showPayment?: boolean;
  showPricing?: boolean;
}

export default function BookingFormFields({
  formData,
  specialRequestInput,
  priceBreakdown,
  selectedCabin,
  numNights,
  cabins,
  customers,
  customersLoading,
  settings,
  scrollerRef,
  isCustomerOpen,
  setIsCustomerOpen,
  handleInputChange,
  handleCustomerSearch,
  addSpecialRequest,
  removeSpecialRequest,
  setSpecialRequestInput,
  formatCurrency,
  showPayment = true,
  showPricing = true,
}: BookingFormFieldsProps) {
  return (
    <div className='space-y-6'>
      {/* Cabin Selection */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Cabin Selection</h3>
        </CardHeader>
        <CardBody>
          <CabinSelection
            formData={formData}
            onInputChange={handleInputChange}
            cabins={cabins}
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

      {/* Payment Information */}
      {showPayment && (
        <PaymentInformation
          formData={formData}
          onInputChange={handleInputChange}
          settings={settings}
          priceBreakdown={priceBreakdown}
        />
      )}

      {/* Price Breakdown */}
      {showPricing && (
        <PriceBreakdown
          priceBreakdown={priceBreakdown}
          numNights={numNights}
          settings={settings}
        />
      )}
    </div>
  );
}
