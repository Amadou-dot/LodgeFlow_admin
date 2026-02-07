'use client';

import type { Experience, ExperienceFilters } from '@/types';
import useSWR from 'swr';

// Fetcher function for SWR - extracts data from wrapped API response
const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('Failed to fetch experiences');
    }
    return res.json().then(result => {
      if (result.success) {
        return result.data;
      }
      throw new Error('Failed to fetch experiences');
    });
  });

// Fetch app experiences using SWR
export const useExperiences = (filters: ExperienceFilters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.search) queryParams.append('search', filters.search);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const queryString = queryParams.toString();
  const url = `/api/experiences${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<Experience[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate, // For manual revalidation
  };
};

export const useCreateExperience = () => {
  const { mutate } = useExperiences();

  const createExperience = async (
    data: Omit<Experience, '_id' | 'createdAt' | 'updatedAt'>
  ) => {
    const response = await fetch('/api/experiences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create experience');
    }

    const newExperience = await response.json();

    // Optimistically update the cache
    mutate();

    return newExperience;
  };

  return {
    createExperience,
  };
};

export const useUpdateExperience = () => {
  const { mutate } = useExperiences();

  const updateExperience = async (id: string, data: Partial<Experience>) => {
    const response = await fetch(`/api/experiences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update experience');
    }

    // Revalidate the SWR cache
    mutate();

    return response.json();
  };

  return {
    updateExperience,
  };
};

export const useDeleteExperience = () => {
  const { mutate } = useExperiences();

  const deleteExperience = async (id: string) => {
    const response = await fetch(`/api/experiences/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete experience');
    }

    // Revalidate the SWR cache
    mutate();

    return response.json();
  };

  return {
    deleteExperience,
  };
};
