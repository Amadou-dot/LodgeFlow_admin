import { useState, useEffect } from 'react';
import { Dining } from '@/types';

interface UseDiningOptions {
  type?: 'menu' | 'experience';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  category?: 'regular' | 'craft-beer' | 'wine' | 'spirits' | 'non-alcoholic';
  isAvailable?: boolean;
}

interface UseDiningReturn {
  dining: Dining[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDining: (diningData: Partial<Dining>) => Promise<Dining | null>;
  updateDining: (id: string, diningData: Partial<Dining>) => Promise<Dining | null>;
  deleteDining: (id: string) => Promise<boolean>;
}

export const useDining = (options: UseDiningOptions = {}): UseDiningReturn => {
  const [dining, setDining] = useState<Dining[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = (params: UseDiningOptions) => {
    const searchParams = new URLSearchParams();
    
    if (params.type) searchParams.append('type', params.type);
    if (params.mealType) searchParams.append('mealType', params.mealType);
    if (params.category) searchParams.append('category', params.category);
    if (params.isAvailable !== undefined) searchParams.append('isAvailable', params.isAvailable.toString());
    
    return searchParams.toString();
  };

  const fetchDining = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(options);
      const response = await fetch(`/api/dining?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDining(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch dining items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dining:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDining = async (diningData: Partial<Dining>): Promise<Dining | null> => {
    try {
      setError(null);
      
      const response = await fetch('/api/dining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diningData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchDining(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create dining item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating dining:', err);
      return null;
    }
  };

  const updateDining = async (id: string, diningData: Partial<Dining>): Promise<Dining | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/dining/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diningData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchDining(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update dining item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating dining:', err);
      return null;
    }
  };

  const deleteDining = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/dining/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchDining(); // Refresh the list
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete dining item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting dining:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchDining();
  }, [options.type, options.mealType, options.category, options.isAvailable]);

  return {
    dining,
    loading,
    error,
    refetch: fetchDining,
    createDining,
    updateDining,
    deleteDining,
  };
};
