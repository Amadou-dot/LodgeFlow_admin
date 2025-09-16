import { requireAuth } from '@/lib/auth';
import { getClerkUser, upsertCustomerExtendedData } from '@/lib/clerk-users';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Booking } from '../../../../models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Get customer from Clerk with extended data
    const customer = await getClerkUser(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      );
    }

    // Get customer's bookings from our database
    await connectDB();
    const bookings = await Booking.find({ customer: id })
      .populate('cabin', 'name image capacity price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate additional stats
    const totalBookings = await Booking.countDocuments({ customer: id });
    const completedBookings = await Booking.countDocuments({
      customer: id,
      status: 'checked-out',
    });

    const revenueResult = await Booking.aggregate([
      { $match: { customer: id, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const customerData = {
      ...customer,
      stats: {
        totalBookings,
        completedBookings,
        totalRevenue,
        averageStayLength:
          bookings.length > 0
            ? bookings.reduce((sum, booking) => sum + booking.numNights, 0) /
              bookings.length
            : 0,
      },
      recentBookings: bookings,
    };

    return NextResponse.json({
      success: true,
      data: customerData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params; // This is the Clerk user ID

    const body = await request.json();

    // Update extended customer data in our database
    const extendedData = await upsertCustomerExtendedData(id, {
      nationality: body.nationality,
      nationalId: body.nationalId,
      address: body.address,
      emergencyContact: body.emergencyContact,
      preferences: body.preferences,
      totalBookings: body.totalBookings,
      totalSpent: body.totalSpent,
      lastBookingDate: body.lastBookingDate,
    });

    // Get the updated customer with Clerk data
    const customer = await getClerkUser(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error updating customer:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update customer',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params; // This is the Clerk user ID

    // Check if customer has any bookings
    const bookingCount = await Booking.countDocuments({ customer: id });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete customer with existing bookings',
        },
        { status: 400 }
      );
    }

    // We can only delete the extended data from our database
    // Clerk users should be deleted through Clerk's dashboard/API
    const CustomerModel = (await import('../../../../models')).Customer;
    const extendedData = await CustomerModel.findOneAndDelete({
      clerkUserId: id,
    });

    if (!extendedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer extended data not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer extended data deleted successfully',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete customer',
      },
      { status: 500 }
    );
  }
}
