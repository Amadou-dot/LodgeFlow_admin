import type { FilterQuery, SortOrder } from 'mongoose';
import type { IBooking } from '@/models/Booking';
import type { ICabin } from '@/models/Cabin';
import type { IDining } from '@/models/Dining';

// ============================================================================
// API Input Types (for mutations - accept string IDs)
// ============================================================================

/**
 * Input type for creating a booking via API
 * Uses string IDs instead of ObjectIds since the API handles conversion
 */
export interface CreateBookingInput {
  cabin: string;
  customer: string;
  checkInDate: Date;
  checkOutDate: Date;
  numGuests: number;
  numNights: number;
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  status?: IBooking['status'];
  paymentMethod?: string;
  isPaid?: boolean;
  depositPaid?: boolean;
  depositAmount?: number;
  remainingAmount?: number;
  extras?: IBooking['extras'];
  observations?: string;
  specialRequests?: string[];
}

/**
 * Input type for updating a booking via API
 */
export interface UpdateBookingInput {
  _id: string;
  cabin?: string;
  customer?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  numGuests?: number;
  numNights?: number;
  cabinPrice?: number;
  extrasPrice?: number;
  totalPrice?: number;
  status?: IBooking['status'];
  paymentMethod?: string;
  isPaid?: boolean;
  depositPaid?: boolean;
  depositAmount?: number;
  remainingAmount?: number;
  extras?: IBooking['extras'];
  observations?: string;
  specialRequests?: string[];
}

// ============================================================================
// MongoDB Query Filter Types
// ============================================================================

/**
 * Query filter for Cabin collection
 */
export type CabinQueryFilter = FilterQuery<ICabin>;

/**
 * Query filter for Booking collection
 */
export type BookingQueryFilter = FilterQuery<IBooking>;

/**
 * Query filter for Dining collection
 */
export type DiningQueryFilter = FilterQuery<IDining>;

// ============================================================================
// MongoDB Sort Types
// ============================================================================

/**
 * Generic MongoDB sort order type
 * Keys are field names, values are 1 (ascending) or -1 (descending)
 */
export type MongoSortOrder = Record<string, SortOrder>;

// ============================================================================
// Dashboard Aggregation Result Types
// ============================================================================

/**
 * Result from occupancy aggregation pipeline
 */
export interface OccupancyDataItem {
  _id: string;
  totalGuests: number;
  totalCapacity: number;
}

/**
 * Result from revenue aggregation pipeline
 */
export interface RevenueDataItem {
  _id: {
    week: number;
    year: number;
  };
  totalRevenue: number;
  bookingCount: number;
}

/**
 * Result from duration distribution aggregation pipeline
 */
export interface DurationDataItem {
  _id: string;
  count: number;
}

/**
 * Result from total revenue aggregation
 */
export interface TotalRevenueResult {
  _id: null;
  total: number;
}

/**
 * Result from capacity aggregation
 */
export interface CapacityResult {
  _id: null;
  totalCapacity: number;
}

/**
 * Result from current occupancy aggregation
 */
export interface CurrentOccupancyResult {
  _id: null;
  occupiedCapacity: number;
}

// ============================================================================
// Populated Document Types (for Mongoose populate results)
// ============================================================================

/**
 * Booking with populated cabin (limited fields)
 */
export interface BookingWithPopulatedCabin extends Omit<IBooking, 'cabin'> {
  cabin: Pick<ICabin, 'name' | 'image' | 'capacity' | 'price' | 'discount'> & {
    _id: string;
  };
}

/**
 * Booking populated for dashboard recent activity
 */
export interface RecentBookingPopulated {
  _id: string;
  customer: string;
  cabin: {
    _id: string;
    name: string;
  } | null;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: IBooking['status'];
  createdAt: Date;
}
