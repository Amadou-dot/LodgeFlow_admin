import {
  populateBookingWithClerkCustomer,
  populateBookingsWithClerkCustomers,
} from '@/lib/booking-helpers';

// Mock clerk-users
const mockGetClerkUser = jest.fn();
jest.mock('@/lib/clerk-users', () => ({
  getClerkUser: (...args: any[]) => mockGetClerkUser(...args),
}));

// Mock Clerk SDK (needed since clerk-users imports it)
jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: jest.fn(),
}));

describe('booking-helpers', () => {
  beforeEach(() => {
    mockGetClerkUser.mockReset();
  });

  describe('populateBookingWithClerkCustomer', () => {
    it('populates booking with customer data', async () => {
      const mockCustomer = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockGetClerkUser.mockResolvedValue(mockCustomer);

      const booking = {
        _id: 'booking_1',
        customer: 'user_123',
        cabin: 'cabin_1',
        totalPrice: 500,
      };

      const result = await populateBookingWithClerkCustomer(booking as any);

      expect(result.booking.customer).toEqual(mockCustomer);
      expect(result.clerkError).toBe(false);
      expect(mockGetClerkUser).toHaveBeenCalledWith('user_123');
    });

    it('returns null customer when booking has no customer', async () => {
      const booking = {
        _id: 'booking_1',
        customer: '',
        cabin: 'cabin_1',
      };

      const result = await populateBookingWithClerkCustomer(booking as any);

      expect(result.booking.customer).toBeNull();
      expect(result.clerkError).toBe(false);
      expect(mockGetClerkUser).not.toHaveBeenCalled();
    });

    it('returns null customer when getClerkUser returns null (404)', async () => {
      mockGetClerkUser.mockResolvedValue(null);

      const booking = {
        _id: 'booking_1',
        customer: 'user_deleted',
        cabin: 'cabin_1',
      };

      const result = await populateBookingWithClerkCustomer(booking as any);

      expect(result.booking.customer).toBeNull();
      expect(result.clerkError).toBe(false);
    });

    it('sets clerkError when getClerkUser throws', async () => {
      mockGetClerkUser.mockRejectedValue(new Error('Clerk API error'));

      const booking = {
        _id: 'booking_1',
        customer: 'user_123',
        cabin: 'cabin_1',
      };

      const result = await populateBookingWithClerkCustomer(booking as any);

      expect(result.booking.customer).toBeNull();
      expect(result.clerkError).toBe(true);
    });

    it('calls toObject when booking is a Mongoose document', async () => {
      mockGetClerkUser.mockResolvedValue({ id: 'user_123', name: 'John' });

      const toObject = jest.fn().mockReturnValue({
        _id: 'booking_1',
        customer: 'user_123',
        cabin: 'cabin_1',
      });

      const booking = {
        _id: 'booking_1',
        customer: 'user_123',
        cabin: 'cabin_1',
        toObject,
      };

      await populateBookingWithClerkCustomer(booking as any);

      expect(toObject).toHaveBeenCalled();
    });
  });

  describe('populateBookingsWithClerkCustomers', () => {
    it('populates multiple bookings', async () => {
      mockGetClerkUser
        .mockResolvedValueOnce({ id: 'user_1', name: 'Alice' })
        .mockResolvedValueOnce({ id: 'user_2', name: 'Bob' });

      const bookings = [
        { _id: 'b1', customer: 'user_1', cabin: 'c1' },
        { _id: 'b2', customer: 'user_2', cabin: 'c2' },
      ];

      const result = await populateBookingsWithClerkCustomers(
        bookings as any
      );

      expect(result.bookings).toHaveLength(2);
      expect(result.bookings[0].customer).toEqual({
        id: 'user_1',
        name: 'Alice',
      });
      expect(result.bookings[1].customer).toEqual({
        id: 'user_2',
        name: 'Bob',
      });
      expect(result.clerkErrors).toBe(0);
    });

    it('counts clerk errors correctly', async () => {
      mockGetClerkUser
        .mockResolvedValueOnce({ id: 'user_1', name: 'Alice' })
        .mockRejectedValueOnce(new Error('Clerk down'))
        .mockRejectedValueOnce(new Error('Rate limited'));

      const bookings = [
        { _id: 'b1', customer: 'user_1', cabin: 'c1' },
        { _id: 'b2', customer: 'user_2', cabin: 'c2' },
        { _id: 'b3', customer: 'user_3', cabin: 'c3' },
      ];

      const result = await populateBookingsWithClerkCustomers(
        bookings as any
      );

      expect(result.bookings).toHaveLength(3);
      expect(result.clerkErrors).toBe(2);
    });

    it('handles empty bookings array', async () => {
      const result = await populateBookingsWithClerkCustomers([]);

      expect(result.bookings).toHaveLength(0);
      expect(result.clerkErrors).toBe(0);
    });
  });
});
