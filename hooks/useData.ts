import { useQuery } from '@tanstack/react-query';

// Overview/Stats hook - now uses MongoDB dashboard API
export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch overview data');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch overview data');
      }

      // Transform the data to match the expected format
      const { overview } = result.data;

      return {
        bookings: overview.totalBookings,
        revenue: overview.totalRevenue,
        customers: overview.totalCustomers,
        cancellations: overview.totalCancellations || 0,
      };
    },
  });
}

// Activities hook - uses recent bookings from dashboard API
export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch activities data');
      }

      // Transform recent activity data
      const { recentActivity } = result.data;
      return recentActivity.slice(0, 4).map((booking: any) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: booking.id,
          name: booking.customerName,
          status: booking.status,
          stayDuration: `${nights} night${nights === 1 ? '' : 's'}`,
        };
      });
    },
  });
}

// Sales data hook - uses the dedicated sales API endpoint
export function useSalesData() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await fetch('/api/sales');
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const data = await response.json();

      // Data is already in the correct format from the sales API
      return data;
    },
  });
}

// Duration distribution hook - uses actual booking data
export function useDurationData() {
  return useQuery({
    queryKey: ['durations'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch duration data');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch duration data');
      }

      // Get booking data from recent activity and analyze durations
      const recentActivity = result.data.recentActivity;
      const durationCounts: { [key: string]: number } = {};

      // Also fetch more complete booking data for better duration analysis
      const bookingsResponse = await fetch('/api/bookings?limit=100');
      let allBookings = [];

      if (bookingsResponse.ok) {
        const bookingsResult = await bookingsResponse.json();
        if (bookingsResult.success) {
          allBookings = bookingsResult.data;
        }
      }

      // Use all bookings if available, otherwise fall back to recent activity
      const bookingsToAnalyze =
        allBookings.length > 0 ? allBookings : recentActivity;

      bookingsToAnalyze.forEach((booking: any) => {
        let nights;

        // Calculate nights from dates if numNights is not available
        if (booking.numNights) {
          nights = booking.numNights;
        } else if (booking.checkInDate && booking.checkOutDate) {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else {
          return; // Skip if we can't determine duration
        }

        let category;
        if (nights <= 2) {
          category = '1-2 nights';
        } else if (nights <= 4) {
          category = '3-4 nights';
        } else if (nights <= 7) {
          category = '5-7 nights';
        } else if (nights <= 14) {
          category = '8-14 nights';
        } else {
          category = '15+ nights';
        }

        durationCounts[category] = (durationCounts[category] || 0) + 1;
      });

      // Convert to chart format with colors
      const colors = [
        '#3b82f6', // blue
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
      ];

      const categories = [
        '1-2 nights',
        '3-4 nights',
        '5-7 nights',
        '8-14 nights',
        '15+ nights',
      ];

      return categories
        .map((category, index) => ({
          name: category,
          value: durationCounts[category] || 0,
          color: colors[index],
        }))
        .filter(item => item.value > 0); // Only include categories with data
    },
  });
}
