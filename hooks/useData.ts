import { useQuery } from "@tanstack/react-query";

// Overview/Stats hook - now uses MongoDB dashboard API
export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch overview data");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch overview data");
      }

      // Transform the data to match the expected format
      const { overview } = result.data;
      return {
        bookings: overview.totalBookings,
        revenue: overview.totalRevenue,
        customers: overview.totalCustomers,
        cancellations: 0, // We'll calculate this from bookings if needed
      };
    },
  });
}

// Activities hook - uses recent bookings from dashboard API
export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch activities data");
      }

      // Transform recent activity data
      const { recentActivity } = result.data;
      return recentActivity.slice(0, 4).map((booking: any) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: booking.id,
          name: booking.customerName,
          status: booking.status,
          stayDuration: `${nights} night${nights === 1 ? "" : "s"}`,
        };
      });
    },
  });
}

// Sales data hook - uses revenue chart data from dashboard API
export function useSalesData() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch sales data");
      }

      // Transform revenue chart data
      const { charts } = result.data;
      return charts.revenue.map((item: any) => ({
        date: item.week,
        sales: item.revenue,
        bookings: item.bookings,
      }));
    },
  });
}

// Duration distribution hook - we'll need to create this from booking data
export function useDurationData() {
  return useQuery({
    queryKey: ["durations"],
    queryFn: async () => {
      const response = await fetch("/api/bookings?limit=100"); // Get more bookings for duration analysis
      if (!response.ok) {
        throw new Error("Failed to fetch duration data");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch duration data");
      }

      // Analyze booking durations
      const bookings = result.data;
      const durationCounts: { [key: string]: number } = {};

      bookings.forEach((booking: any) => {
        const nights = booking.numNights;
        let category;
        if (nights <= 2) category = "1-2 nights";
        else if (nights <= 4) category = "3-4 nights";
        else if (nights <= 7) category = "5-7 nights";
        else if (nights <= 14) category = "8-14 nights";
        else category = "15+ nights";

        durationCounts[category] = (durationCounts[category] || 0) + 1;
      });

      // Convert to chart format
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
      return Object.entries(durationCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));
    },
  });
}
