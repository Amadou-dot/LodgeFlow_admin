'use client';

import { Experience } from '@/types';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('Failed to fetch experiences');
    }
    return res.json();
  });

// Fetch app experiences using SWR
export const useExperiences = () => {
  const { data, error, isLoading, mutate } = useSWR<Experience[]>(
    '/api/experiences',
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
