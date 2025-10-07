import { getClerkUser } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { Booking, Customer } from '../../../models';

// Helper function to update customer statistics
async function updateCustomerStats(clerkUserId: string) {
  try {
    // Get all bookings for this customer
    const customerBookings = await Booking.find({ customer: clerkUserId });

    // Calculate statistics
    const totalBookings = customerBookings.length;
    const totalSpent = customerBookings.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0),
      0
    );
    const completedBookings = customerBookings.filter(
      booking => booking.status === 'checked-out'
    ).length;

    // Find the most recent booking
    const sortedBookings = customerBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastBookingDate =
      sortedBookings.length > 0 ? sortedBookings[0].createdAt : null;

    // Update customer record by clerkUserId, create if it doesn't exist
    await Customer.findOneAndUpdate(
      { clerkUserId }, 
      {
        clerkUserId, // Include this in case we're creating a new record
        totalBookings,
        totalSpent,
        lastBookingDate,
      },
      { 
        upsert: true, // Create the record if it doesn't exist
        new: true // Return the updated document
      }
    );
  } catch (error) {
    console.error(`Error updating customer stats for ${clerkUserId}:`, error);
    // Don't throw the error to avoid breaking booking operations
  }
}

// Helper function to limit concurrent operations
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(mapper));
    results.push(...batchResults);
  }
  return results;
}

// Helper function to populate bookings with Clerk customer data
async function populateBookingsWithClerkCustomers(bookings: any[]) {
  // Get unique customer IDs to avoid duplicate API calls
  const customerIds = bookings.map(booking => booking.customer);
  const uniqueCustomerIds = Array.from(new Set(customerIds));
  
  // Pre-fetch all unique customers with limited concurrency
  const CONCURRENT_LIMIT = Number(process.env.CLERK_API_CONCURRENT_LIMIT) || 3; // Max 3 concurrent Clerk API calls
  
  const customers = await mapWithLimit(
    uniqueCustomerIds,
    CONCURRENT_LIMIT,
    async (customerId) => {
      try {
        return { id: customerId, data: await getClerkUser(customerId) };
      } catch (error) {
        console.error(`Failed to fetch customer ${customerId}:`, error);
        return {
          id: customerId,
          data: {
            id: customerId,
            name: 'Unknown User',
            email: 'N/A',
          }
        };
      }
    }
  );

  // Create a lookup map for customers
  const customerMap = new Map(customers.map(c => [c.id, c.data]));

  // Populate bookings with customer data
  const populatedBookings = bookings.map(booking => {
    const customer = customerMap.get(booking.customer);
    
    return {
      ...booking.toObject(),
      customer: customer,
      guest: customer, // For legacy compatibility
      cabinName: booking.cabin?.name, // Add cabin name for easier access
    };
  });

  return populatedBookings;
}

export async function GET(request: NextRequest) {
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
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // If there's a search term, we need to get all bookings and filter after population
    if (search) {
      // Get all bookings (with status filter if specified) and populate cabin only
      const allBookings = await Booking.find(query)
        .populate('cabin', 'name image capacity price discount')
        .sort(sort);

      // Populate with Clerk customer data
      const populatedBookings =
        await populateBookingsWithClerkCustomers(allBookings);

      // Filter by search term after population
      const searchLower = search.toLowerCase();
      const filteredBookings = populatedBookings.filter((booking: any) => {
        const cabin = booking.cabin;
        const customer = booking.customer || booking.guest;

        if (!cabin || !customer) return false;

        return (
          cabin.name?.toLowerCase().includes(searchLower) ||
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
        );
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
  try {
    await connectDB();

    const body = await request.json();
    const booking = await Booking.create(body);

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
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
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
    if (error.message && error.message.includes('overlap')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
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
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID is required',
        },
        { status: 400 }
      );
    }

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
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.message && error.message.includes('overlap')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
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
