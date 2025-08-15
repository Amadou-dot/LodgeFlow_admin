'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking } from '@/app/api/bookings/route';

interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface BookingsFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return res.json();
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
    mutationFn: async (booking: Booking): Promise<Booking> => {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      return response.json();
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
    mutationFn: async (bookingId: number): Promise<void> => {
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
