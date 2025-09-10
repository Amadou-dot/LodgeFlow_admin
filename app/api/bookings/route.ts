import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '../../../models';

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
      // Get all bookings (with status filter if specified) and populate
      const allBookings = await Booking.find(query)
        .populate('cabin', 'name image capacity price discount')
        .populate('customer', 'name email nationality phone')
        .sort(sort);

      // Filter by search term after population
      const searchLower = search.toLowerCase();
      const filteredBookings = allBookings.filter((booking: any) => {
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
        .populate('customer', 'name email nationality phone')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalBookings = await Booking.countDocuments(query);
      const totalPages = Math.ceil(totalBookings / limit);

      return NextResponse.json({
        success: true,
        data: bookings,
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
    console.error('Error fetching bookings:', error);
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

    // Populate the response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('cabin', 'name image capacity price discount')
      .populate('customer', 'name email nationality phone');

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);

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
    })
      .populate('cabin', 'name image capacity price discount')
      .populate('customer', 'name email nationality phone');

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);

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

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete booking',
      },
      { status: 500 }
    );
  }
}
