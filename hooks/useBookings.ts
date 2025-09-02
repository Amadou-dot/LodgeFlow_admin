'use client';

import type { Booking, BookingsFilters, PopulatedBooking } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSWR from 'swr';

interface BookingsResponse {
  bookings: PopulatedBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Fetcher function for SWR
const fetcher = (url: string): Promise<BookingsResponse> =>
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return res.json();
    })
    .then(result => {
      // Handle new API response format
      if (result.success) {
        return {
          bookings: result.data as PopulatedBooking[],
          pagination: result.pagination,
        };
      }
      throw new Error(result.error || 'Failed to fetch bookings');
    });

// Fetch bookings with filters and pagination using SWR
export const useBookings = (filters: BookingsFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data, error, isLoading, mutate } = useSWR<BookingsResponse>(
    `/api/bookings?${params.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate, // For manual revalidation
  };
};

// Fetch a single booking by ID
export const useBooking = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<PopulatedBooking>(
    id ? `/api/bookings/${id}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      const result = await response.json();
      if (result.success) {
        return result.data as PopulatedBooking;
      }
      throw new Error(result.error || 'Failed to fetch booking');
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
// Create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: Partial<Booking>): Promise<Booking> => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate React Query cache and revalidate SWR
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Note: SWR will be revalidated automatically on focus or manually via mutate
    },
  });
};

// Update an existing booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updateData: Partial<Booking> & { _id: string }
    ): Promise<PopulatedBooking> => {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      const result = await response.json();
      return result.success ? result.data : result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Delete a booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string): Promise<void> => {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
