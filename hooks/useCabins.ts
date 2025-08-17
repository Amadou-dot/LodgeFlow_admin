import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Cabin,
  CabinFilters,
  CreateCabinData,
  UpdateCabinData,
} from "@/types";

export function useCabins(filters: CabinFilters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.filter) queryParams.append("filter", filters.filter);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.capacity) queryParams.append("capacity", filters.capacity);
  if (filters.discount) queryParams.append("discount", filters.discount);
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  return useQuery<Cabin[]>({
    queryKey: ["cabins", filters],
    queryFn: async () => {
      const response = await fetch(`/api/cabins?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cabins");
      }
      const result = await response.json();
      return result.success ? result.data : result; // Handle both old and new format
    },
  });
}

export function useCreateCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cabin: CreateCabinData) => {
      const response = await fetch("/api/cabins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cabin),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create cabin");
      }

      const result = await response.json();
      return result.success ? result.data : result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
  });
}

export function useUpdateCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cabin: UpdateCabinData) => {
      const response = await fetch(`/api/cabins/${cabin._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cabin),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cabin");
      }

      const result = await response.json();
      return result.success ? result.data : result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
  });
}

export function useDeleteCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cabins/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete cabin");
      }

      const result = await response.json();
      return result.success ? result : result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
  });
}
