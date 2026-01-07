import { createValidationErrorResponse, escapeRegex, requireApiAuth } from '@/lib/api-utils';
import { getClerkUsersBatch } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { createBookingSchema, updateBookingSchema } from '@/lib/validations';
import type { IBooking } from '@/models/Booking';
import type { ICabin } from '@/models/Cabin';
import type { BookingQueryFilter, MongoSortOrder } from '@/types/api';
import { getErrorMessage, isMongooseValidationError } from '@/types/errors';
import { NextRequest, NextResponse } from 'next/server';
import { Booking, Cabin, Customer as CustomerModel } from '../../../models';

// Helper function to update customer statistics
async function updateCustomerStats(clerkUserId: string) {
  try {
    // Get all bookings for this customer
    const customerBookings = await Booking.find({ customer: clerkUserId });

    // Filter out cancelled bookings for revenue calculations
    const validBookings = customerBookings.filter(
      booking => booking.status !== 'cancelled'
    );

    // Calculate statistics
    const totalBookings = customerBookings.length; // Include all bookings for count
    const totalSpent = validBookings.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0),
      0
    );
    // Find the most recent booking
    const sortedBookings = customerBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastBookingDate =
      sortedBookings.length > 0 ? sortedBookings[0].createdAt : null;

    // Update customer record by clerkUserId, create if it doesn't exist
    await CustomerModel.findOneAndUpdate(
      { clerkUserId },
      {
        clerkUserId, // Include this in case we're creating a new record
        totalBookings,
        totalSpent,
        lastBookingDate,
      },
      {
        upsert: true, // Create the record if it doesn't exist
        new: true, // Return the updated document
      }
    );
  } catch (error) {
    console.error(`Error updating customer stats for ${clerkUserId}:`, error);
    // Don't throw the error to avoid breaking booking operations
  }
}

// Helper function to populate bookings with Clerk customer data
// Uses optimized batch fetching with caching
async function populateBookingsWithClerkCustomers(
  bookings: Array<IBooking & { cabin?: Pick<ICabin, 'name' | 'image' | 'capacity' | 'price' | 'discount'> }>
) {
  // Get unique customer IDs to avoid duplicate API calls
  const customerIds = bookings.map(booking => booking.customer);
  const uniqueCustomerIds = Array.from(new Set(customerIds)) as string[];

  // Batch fetch all customers with optimized caching
  const customerMap = await getClerkUsersBatch(uniqueCustomerIds);

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

  return populatedBookings;
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
        name: { $regex: safeSearch, $options: 'i' }
      }).select('_id');
      const cabinIds = matchingCabins.map(c => c._id);

      // Phase 2: Find matching customer IDs from our Customer collection
      // (searches by name/email stored in extended data)
      const matchingCustomers = await CustomerModel.find({
        $or: [
          { 'address.street': { $regex: safeSearch, $options: 'i' } },
          { nationality: { $regex: safeSearch, $options: 'i' } },
        ]
      }).select('clerkUserId');
      const customerIds = matchingCustomers.map(c => c.clerkUserId);

      // Build query to find bookings matching either cabin OR customer
      const searchQuery: BookingQueryFilter = { ...query };

      // Only add $or if we have matches, otherwise fall back to populate-then-filter
      if (cabinIds.length > 0 || customerIds.length > 0) {
        const orConditions = [];
        if (cabinIds.length > 0) {
          orConditions.push({ cabin: { $in: cabinIds } });
        }
        if (customerIds.length > 0) {
          orConditions.push({ customer: { $in: customerIds } });
        }
        searchQuery.$or = orConditions;
      }

      // Get bookings matching the search criteria
      const matchingBookings = await Booking.find(searchQuery)
        .populate('cabin', 'name image capacity price discount')
        .sort(sort);

      // Populate with Clerk customer data
      const populatedBookings = await populateBookingsWithClerkCustomers(matchingBookings);

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
      const populatedBookings =
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

    // Update customer statistics after creating booking
    await updateCustomerStats(booking.customer);

    // Populate the response
    const populatedBooking = await Booking.findById(booking._id).populate(
      'cabin',
      'name image capacity price discount'
    );

    // Populate with Clerk customer data
    const [populatedWithClerk] = await populateBookingsWithClerkCustomers([
      populatedBooking,
    ]);

    return NextResponse.json(
      {
        success: true,
        data: populatedWithClerk,
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

    const booking = await Booking.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
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
    const [populatedWithClerk] = await populateBookingsWithClerkCustomers([
      booking,
    ]);

    // Update customer statistics after updating booking
    await updateCustomerStats(booking.customer);

    return NextResponse.json({
      success: true,
      data: populatedWithClerk,
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

    const customerId = booking.customer;

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    // Update customer statistics after deleting booking
    await updateCustomerStats(customerId);

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
