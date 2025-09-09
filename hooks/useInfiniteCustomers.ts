import type { Customer } from '@/types';
import { useEffect, useState } from 'react';

// Custom hook for infinite scrolling customers
export function useInfiniteCustomers() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20; // Items per page

  const loadCustomers = async (currentPage: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/customers?page=${currentPage}&limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        const newCustomers = result.data || [];
        setHasMore(result.pagination?.hasNextPage || false);

        if (currentPage === 1) {
          setAllCustomers(newCustomers);
        } else {
          // Ensure no duplicates when infinite scrolling
          setAllCustomers(prev => {
            const existingIds = new Set(
              prev.map((customer: Customer) => customer._id)
            );
            const uniqueNewCustomers = newCustomers.filter(
              (customer: Customer) => !existingIds.has(customer._id)
            );
            return [...prev, ...uniqueNewCustomers];
          });
        }
      }
    } catch (error) {
      // Handle error silently for production
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  const onLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCustomers(nextPage);
  };

  return {
    customers: allCustomers,
    hasMore,
    isLoading,
    onLoadMore,
  };
}
