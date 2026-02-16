import {
  createValidationErrorResponse,
  escapeRegex,
  requireApiAuth,
} from '@/lib/api-utils';
import { getClerkUsersBatch } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { createBookingSchema, updateBookingSchema } from '@/lib/validations';
import type { IBooking } from '@/models/Booking';
import type { ICabin } from '@/models/Cabin';
import type { BookingQueryFilter, MongoSortOrder } from '@/types/api';
import { getErrorMessage, isMongooseValidationError } from '@/types/errors';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { Booking, Cabin } from '../../../models';

// Helper function to populate bookings with Clerk customer data
// Uses optimized batch fetching with caching
async function populateBookingsWithClerkCustomers(
  bookings: Array<
    IBooking & {
      cabin?: Pick<
        ICabin,
        'name' | 'image' | 'capacity' | 'price' | 'discount'
      >;
    }
  >
) {
  // Get unique customer IDs to avoid duplicate API calls
  const customerIds = bookings.map(booking => booking.customer);
  const uniqueCustomerIds = Array.from(new Set(customerIds)) as string[];

  // Batch fetch all customers with optimized caching
  const { users: customerMap, errors: clerkErrors } =
    await getClerkUsersBatch(uniqueCustomerIds);

  // Populate bookings with customer data
  const populatedBookings = bookings.map(booking => {
    const customer = customerMap.get(booking.customer);

    // Provide fallback for missing customers
    const customerData = customer || {
      id: booking.customer,
      name: 'Unknown User',
      email: 'N/A',
    };

    return {
      ...booking.toObject(),
      customer: customerData,
      guest: customerData, // For legacy compatibility
      cabinName: booking.cabin?.name, // Add cabin name for easier access
    };
  });

  return {
    bookings: populatedBookings,
    _clerkWarning:
      clerkErrors > 0
        ? `Failed to fetch ${clerkErrors} customer record(s) from Clerk. Some customer data may be unavailable.`
        : undefined,
  };
}

export async function GET(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'checkInDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query for status filter only
    const query: BookingQueryFilter = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort: MongoSortOrder = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // If there's a search term, use optimized database queries
    if (search) {
      const safeSearch = escapeRegex(search);

      // Phase 1: Find matching cabin IDs from database
      const matchingCabins = await Cabin.find({
        name: { $regex: safeSearch, $options: 'i' },
      }).select('_id');
      const cabinIds = matchingCabins.map(c => c._id);

      // Build query to find bookings matching cabin name
      const searchQuery: BookingQueryFilter = { ...query };

      if (cabinIds.length > 0) {
        searchQuery.$or = [{ cabin: { $in: cabinIds } }];
      }

      // Get bookings matching the search criteria
      const matchingBookings = await Booking.find(searchQuery)
        .populate('cabin', 'name image capacity price discount')
        .sort(sort);

      // Populate with Clerk customer data
      const { bookings: populatedBookings, _clerkWarning } =
        await populateBookingsWithClerkCustomers(matchingBookings);

      // Additional client-side filtering for customer name/email
      // (since Clerk data isn't in our DB, we still need some filtering)
      const searchLower = search.toLowerCase();
      const filteredBookings = populatedBookings.filter(booking => {
        const cabin = booking.cabin;
        const customer = booking.customer || booking.guest;

        if (!cabin || !customer) return false;

        // Check cabin name (already filtered by DB, but double-check)
        if (cabin.name?.toLowerCase().includes(searchLower)) return true;

        // Check customer name/email (Clerk data)
        if (
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        return false;
      });

      // Apply pagination to filtered results
      const totalBookings = filteredBookings.length;
      const totalPages = Math.ceil(totalBookings / limit);
      const skip = (page - 1) * limit;
      const paginatedBookings = filteredBookings.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        data: paginatedBookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        ...(_clerkWarning ? { _clerkWarning } : {}),
      });
    } else {
      // No search term - use database pagination for better performance
      const skip = (page - 1) * limit;

      const bookings = await Booking.find(query)
        .populate('cabin', 'name image capacity price discount')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Populate with Clerk customer data
      const { bookings: populatedBookings, _clerkWarning } =
        await populateBookingsWithClerkCustomers(bookings);

      const totalBookings = await Booking.countDocuments(query);
      const totalPages = Math.ceil(totalBookings / limit);

      return NextResponse.json({
        success: true,
        data: populatedBookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        ...(_clerkWarning ? { _clerkWarning } : {}),
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookings',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const booking = await Booking.create(validationResult.data);

    // Populate the response
    const populatedBooking = await Booking.findById(booking._id).populate(
      'cabin',
      'name image capacity price discount'
    );

    // Populate with Clerk customer data
    const {
      bookings: [populatedWithClerk],
      _clerkWarning,
    } = await populateBookingsWithClerkCustomers([populatedBooking]);

    return NextResponse.json(
      {
        success: true,
        data: populatedWithClerk,
        ...(_clerkWarning ? { _clerkWarning } : {}),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle validation errors
    if (isMongooseValidationError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle date overlap errors
    const errorMessage = getErrorMessage(error);
    if (errorMessage.includes('overlap')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const validationResult = updateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { _id, ...updateData } = validationResult.data;

    // Fetch the existing booking to compare fields
    const existingBooking = await Booking.findById(_id);
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only check for date overlaps when dates or cabin actually changed
    const cabinChanged =
      updateData.cabin &&
      updateData.cabin.toString() !== existingBooking.cabin.toString();
    const checkInChanged =
      updateData.checkInDate &&
      new Date(updateData.checkInDate).getTime() !==
        existingBooking.checkInDate.getTime();
    const checkOutChanged =
      updateData.checkOutDate &&
      new Date(updateData.checkOutDate).getTime() !==
        existingBooking.checkOutDate.getTime();

    if (cabinChanged || checkInChanged || checkOutChanged) {
      const cabinId = updateData.cabin || existingBooking.cabin;
      const checkIn = updateData.checkInDate || existingBooking.checkInDate;
      const checkOut = updateData.checkOutDate || existingBooking.checkOutDate;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overlapping = await (Booking as any).findOverlapping(
        cabinId,
        checkIn,
        checkOut,
        new mongoose.Types.ObjectId(_id)
      );

      if (overlapping.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              'The selected dates overlap with an existing booking for this cabin',
          },
          { status: 409 }
        );
      }
    }

    // Note: runValidators omitted because Zod's updateBookingSchema already
    // validates all fields including date order. Mongoose's checkOutDate
    // validator breaks with findByIdAndUpdate (this context is the Query, not
    // the document, so this.checkInDate is undefined).
    const booking = await Booking.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).populate('cabin', 'name image capacity price discount');

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    // Populate with Clerk customer data
    const {
      bookings: [populatedWithClerk],
      _clerkWarning,
    } = await populateBookingsWithClerkCustomers([booking]);

    return NextResponse.json({
      success: true,
      data: populatedWithClerk,
      ...(_clerkWarning ? { _clerkWarning } : {}),
    });
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage = getErrorMessage(error);
    if (errorMessage.includes('overlap')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update booking',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID is required',
        },
        { status: 400 }
      );
    }

    // Get the booking before deleting to access customer ID
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete booking',
      },
      { status: 500 }
    );
  }
}
