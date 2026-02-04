import {
  createBookingSchema,
  updateBookingSchema,
  recordPaymentSchema,
  patchBookingSchema,
  bookingStatusSchema,
  paymentMethodSchema,
} from '@/lib/validations/booking';

describe('Booking Validation Schemas', () => {
  describe('bookingStatusSchema', () => {
    it('accepts valid status values', () => {
      const validStatuses = ['unconfirmed', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
      validStatuses.forEach(status => {
        expect(bookingStatusSchema.safeParse(status).success).toBe(true);
      });
    });

    it('rejects invalid status values', () => {
      const result = bookingStatusSchema.safeParse('invalid-status');
      expect(result.success).toBe(false);
    });
  });

  describe('paymentMethodSchema', () => {
    it('accepts valid payment methods', () => {
      const validMethods = ['cash', 'card', 'bank-transfer', 'online'];
      validMethods.forEach(method => {
        expect(paymentMethodSchema.safeParse(method).success).toBe(true);
      });
    });

    it('rejects invalid payment methods', () => {
      const result = paymentMethodSchema.safeParse('crypto');
      expect(result.success).toBe(false);
    });
  });

  describe('createBookingSchema', () => {
    const validBooking = {
      cabin: '65a1b2c3d4e5f6a7b8c9d0e1',
      customer: 'user_123abc',
      checkInDate: '2024-02-01',
      checkOutDate: '2024-02-05',
      numGuests: 2,
    };

    it('accepts valid booking data', () => {
      const result = createBookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it('applies default values', () => {
      const result = createBookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('unconfirmed');
        expect(result.data.isPaid).toBe(false);
        expect(result.data.depositPaid).toBe(false);
        expect(result.data.depositAmount).toBe(0);
        expect(result.data.extrasPrice).toBe(0);
      }
    });

    it('rejects missing cabin', () => {
      const { cabin: _cabin, ...bookingWithoutCabin } = validBooking;
      const result = createBookingSchema.safeParse(bookingWithoutCabin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('cabin');
      }
    });

    it('rejects missing customer', () => {
      const { customer: _customer, ...bookingWithoutCustomer } = validBooking;
      const result = createBookingSchema.safeParse(bookingWithoutCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('customer');
      }
    });

    it('rejects checkOutDate before checkInDate', () => {
      const invalidBooking = {
        ...validBooking,
        checkInDate: '2024-02-10',
        checkOutDate: '2024-02-05',
      };
      const result = createBookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Check-out date must be after check-in date');
      }
    });

    it('rejects checkOutDate equal to checkInDate', () => {
      const invalidBooking = {
        ...validBooking,
        checkInDate: '2024-02-05',
        checkOutDate: '2024-02-05',
      };
      const result = createBookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('rejects numGuests less than 1', () => {
      const invalidBooking = { ...validBooking, numGuests: 0 };
      const result = createBookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('rejects numGuests greater than 20', () => {
      const invalidBooking = { ...validBooking, numGuests: 21 };
      const result = createBookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('accepts valid extras', () => {
      const bookingWithExtras = {
        ...validBooking,
        extras: {
          hasBreakfast: true,
          breakfastPrice: 15,
          hasPets: false,
        },
      };
      const result = createBookingSchema.safeParse(bookingWithExtras);
      expect(result.success).toBe(true);
    });

    it('accepts observations up to 1000 characters', () => {
      const bookingWithObservations = {
        ...validBooking,
        observations: 'A'.repeat(1000),
      };
      const result = createBookingSchema.safeParse(bookingWithObservations);
      expect(result.success).toBe(true);
    });

    it('rejects observations over 1000 characters', () => {
      const bookingWithObservations = {
        ...validBooking,
        observations: 'A'.repeat(1001),
      };
      const result = createBookingSchema.safeParse(bookingWithObservations);
      expect(result.success).toBe(false);
    });

    it('coerces date strings to Date objects', () => {
      const result = createBookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkInDate).toBeInstanceOf(Date);
        expect(result.data.checkOutDate).toBeInstanceOf(Date);
      }
    });

    it('accepts negative-free prices', () => {
      const booking = {
        ...validBooking,
        cabinPrice: 100,
        totalPrice: 500,
      };
      const result = createBookingSchema.safeParse(booking);
      expect(result.success).toBe(true);
    });

    it('rejects negative cabinPrice', () => {
      const booking = { ...validBooking, cabinPrice: -10 };
      const result = createBookingSchema.safeParse(booking);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingSchema', () => {
    it('requires _id field', () => {
      const result = updateBookingSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('_id');
      }
    });

    it('accepts valid update with only _id', () => {
      const result = updateBookingSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial updates', () => {
      const result = updateBookingSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        status: 'confirmed',
        numGuests: 4,
      });
      expect(result.success).toBe(true);
    });

    it('validates status enum on update', () => {
      const result = updateBookingSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('recordPaymentSchema', () => {
    it('accepts valid payment record', () => {
      const result = recordPaymentSchema.safeParse({
        paymentMethod: 'card',
        amountPaid: 500,
      });
      expect(result.success).toBe(true);
    });

    it('accepts payment with notes', () => {
      const result = recordPaymentSchema.safeParse({
        paymentMethod: 'cash',
        amountPaid: 100,
        notes: 'Deposit payment',
      });
      expect(result.success).toBe(true);
    });

    it('rejects zero amount', () => {
      const result = recordPaymentSchema.safeParse({
        paymentMethod: 'card',
        amountPaid: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative amount', () => {
      const result = recordPaymentSchema.safeParse({
        paymentMethod: 'card',
        amountPaid: -50,
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing paymentMethod', () => {
      const result = recordPaymentSchema.safeParse({
        amountPaid: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects notes over 500 characters', () => {
      const result = recordPaymentSchema.safeParse({
        paymentMethod: 'card',
        amountPaid: 100,
        notes: 'A'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('patchBookingSchema', () => {
    it('accepts status only', () => {
      const result = patchBookingSchema.safeParse({
        status: 'checked-in',
      });
      expect(result.success).toBe(true);
    });

    it('accepts recordPayment only', () => {
      const result = patchBookingSchema.safeParse({
        recordPayment: {
          paymentMethod: 'card',
          amountPaid: 500,
        },
      });
      expect(result.success).toBe(true);
    });

    it('accepts both status and recordPayment', () => {
      const result = patchBookingSchema.safeParse({
        status: 'checked-in',
        recordPayment: {
          paymentMethod: 'card',
          amountPaid: 500,
        },
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = patchBookingSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
