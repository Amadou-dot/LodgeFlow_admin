'use client';

import useSWR from 'swr';
import { useMutation } from '@tanstack/react-query';
import type { Customer, CustomersFilters, PaginationMeta } from '@/types';

interface CustomersResponse {
  customers: Customer[];
  pagination: PaginationMeta;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch customers');
  }
  return res.json();
}).then((result) => {
  // Handle new API response format
  if (result.success) {
    return {
      customers: result.data,
      pagination: result.pagination,
    };
  }
  throw new Error(result.error || 'Failed to fetch customers');
});

// Fetch customers with filters and pagination using SWR
export const useCustomers = (filters: CustomersFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data, error, isLoading, mutate } = useSWR<CustomersResponse>(
    `/api/customers?${params.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    data: data?.customers || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
};

// Fetch single customer
export const useCustomer = (id: string) => {
  const { data, error, isLoading } = useSWR<any>(
    id ? `/api/customers/${id}` : null,
    (url: string) => fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch customer');
      }
      return res.json();
    }).then((result) => {
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch customer');
    }),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
};

// Create customer
export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: async (customer: any) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }
      
      const result = await response.json();
      return result.success ? result.data : result;
    },
  });
};

// Update customer
export const useUpdateCustomer = () => {
  return useMutation({
    mutationFn: async (customer: any) => {
      const response = await fetch(`/api/customers/${customer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update customer');
      }
      
      const result = await response.json();
      return result.success ? result.data : result;
    },
  });
};

// Delete customer
export const useDeleteCustomer = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete customer');
      }
      
      const result = await response.json();
      return result.success ? result : result;
    },
  });
};
