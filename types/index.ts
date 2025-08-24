import type { IBooking } from '@/models/Booking';
import type { ICabin } from '@/models/Cabin';
import type { ICustomer } from '@/models/Customer';
import type { IExperience } from '@/models/Experience';
import type { ISettings } from '@/models/Settings';
import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Re-export model types for easier importing
export type Cabin = ICabin;
export type Customer = ICustomer;
export type Booking = IBooking;
export type Settings = ISettings;
export type Experience = IExperience;

// Extended types for populated models (used in API responses)
export interface PopulatedBooking
  extends Omit<
    IBooking,
    'cabin' | 'customer' | 'checkInDate' | 'checkOutDate'
  > {
  cabin: ICabin;
  customer: ICustomer;
  checkInDate: string | Date; // API returns string, but might be Date in some contexts
  checkOutDate: string | Date; // API returns string, but might be Date in some contexts
  cabinName?: string; // For legacy compatibility
  guest?: ICustomer; // For legacy compatibility
}

// Legacy type aliases for backward compatibility
export type AppSettings = ISettings;

// Additional types for API requests
export interface CreateCabinData {
  name: string;
  image: string;
  capacity: number;
  price: number;
  discount: number;
  description: string;
  amenities: string[];
}

export interface UpdateCabinData extends Partial<CreateCabinData> {
  _id: string;
}

// Experience-related types
export interface CreateExperienceData {
  name: string;
  price: number;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  category: string;
  description: string;
  longDescription?: string;
  image: string;
  gallery?: string[];
  includes: string[];
  available: string[];
  ctaText: string;
  isPopular: boolean;
  maxParticipants?: number;
  minAge?: number;
  requirements?: string[];
  location?: string;
  highlights?: string[];
  whatToBring?: string[];
  cancellationPolicy?: string;
  seasonality?: string;
  tags?: string[];
}

export interface UpdateExperienceData extends Partial<CreateExperienceData> {
  _id: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CabinFilters {
  filter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  capacity?: 'small' | 'medium' | 'large';
  discount?: 'with' | 'without';
  search?: string;
}

export interface BookingsFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomersFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
