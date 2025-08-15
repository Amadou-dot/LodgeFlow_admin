import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cabin } from '@/app/api/cabins/route';

interface CabinFilters {
  filter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useCabins(filters: CabinFilters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.filter) queryParams.append('filter', filters.filter);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  return useQuery<Cabin[]>({
    queryKey: ['cabins', filters],
    queryFn: async () => {
      const response = await fetch(`/api/cabins?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cabins');
      }
      return response.json();
    },
  });
}

export function useCreateCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cabin: Omit<Cabin, 'id' | 'created_at'>) => {
      const response = await fetch('/api/cabins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cabin),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create cabin');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabins'] });
    },
  });
}

export function useUpdateCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cabin: Cabin) => {
      const response = await fetch('/api/cabins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cabin),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cabin');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabins'] });
    },
  });
}

export function useDeleteCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cabins?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cabin');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabins'] });
    },
  });
}
