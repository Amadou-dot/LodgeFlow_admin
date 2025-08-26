"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { SearchIcon } from "@/components/icons";
import { useCustomers } from "@/hooks/useCustomers";
import GuestGrid from "@/components/GuestGrid";
import AddGuestModal from "@/components/AddGuestModal";

export default function GuestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    data: customers,
    pagination,
    isLoading,
    error,
    mutate,
  } = useCustomers({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleGuestAdded = () => {
    mutate(); // Refresh the guest list after adding a new guest
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="bg-danger-50 border border-danger-200 p-4 rounded-lg">
          <p className="text-danger-600">Failed to load guests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Guests</h1>
          <p className="text-default-600 mt-1">
            Manage your hotel guests and their information
          </p>
        </div>
        <AddGuestModal onGuestAdded={handleGuestAdded} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search guests by name, email, nationality..."
            startContent={<SearchIcon />}
            value={searchTerm}
            onValueChange={handleSearch}
            className="w-full"
            isClearable
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "name" ? "solid" : "bordered"}
            size="sm"
            onPress={() => setSortBy("name")}
          >
            Name
          </Button>
          <Button
            variant={sortBy === "totalSpent" ? "solid" : "bordered"}
            size="sm"
            onPress={() => setSortBy("totalSpent")}
          >
            Spending
          </Button>
          <Button
            variant={sortBy === "totalBookings" ? "solid" : "bordered"}
            size="sm"
            onPress={() => setSortBy("totalBookings")}
          >
            Bookings
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            size="sm"
            onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Guest Grid Component */}
      <GuestGrid
        customers={customers || []}
        pagination={pagination}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
