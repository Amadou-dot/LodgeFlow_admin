import { useQuery } from '@tanstack/react-query';
import type { Activity } from '@/app/api/activities/route';
import type { DurationData } from '@/app/api/durations/route';
import type { SalesData } from '@/app/api/sales/route';

// Overview/Stats hook
export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await fetch('/api/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch overview data');
      }
      return response.json();
    },
  });
}

// Activities hook
export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });
}

// Sales data hook
export function useSalesData() {
  return useQuery<SalesData[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await fetch('/api/sales');
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      return response.json();
    },
  });
}

// Duration distribution hook
export function useDurationData() {
  return useQuery<DurationData[]>({
    queryKey: ['durations'],
    queryFn: async () => {
      const response = await fetch('/api/durations');
      if (!response.ok) {
        throw new Error('Failed to fetch duration data');
      }
      return response.json();
    },
  });
}
