import { requireApiAuth } from '@/lib/api-utils';
import {
  deleteCompleteCustomer,
  getClerkUser,
  updateCompleteCustomer,
} from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { isMongooseValidationError } from '@/types/errors';
import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '../../../../models';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
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

    // Get all customer stats in a single aggregation pipeline
    await connectDB();

    // Run aggregation and recent bookings query in parallel
    const [statsResult, recentBookings] = await Promise.all([
      // Single aggregation for all stats
      Booking.aggregate([
        { $match: { customer: id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] },
            },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0],
              },
            },
            totalNights: { $sum: '$numNights' },
          },
        },
        {
          $project: {
            _id: 0,
            totalBookings: 1,
            completedBookings: 1,
            totalRevenue: 1,
            averageStayLength: {
              $cond: [
                { $gt: ['$totalBookings', 0] },
                { $divide: ['$totalNights', '$totalBookings'] },
                0,
              ],
            },
          },
        },
      ]),
      // Recent bookings with populated cabin
      Booking.find({ customer: id })
        .populate('cabin', 'name image capacity price')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Extract stats with defaults
    const stats = statsResult[0] || {
      totalBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      averageStayLength: 0,
    };

    // Flatten the customer data - use database values for core stats, calculated values for display-only stats
    const customerData = {
      ...customer,
      // Additional calculated stats for display purposes
      completedBookings: stats.completedBookings,
      totalRevenue: stats.totalRevenue,
      averageStayLength: stats.averageStayLength,
      recentBookings,
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
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    const { id } = await params; // This is the Clerk user ID

    const body = await request.json();

    // Update complete customer (Clerk user + extended data)
    const customer = await updateCompleteCustomer(id, {
      // Clerk user fields
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,

      // Extended data fields
      nationality: body.nationality,
      nationalId: body.nationalId,
      address: body.address,
      emergencyContact: body.emergencyContact,
      preferences: body.preferences,
    });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: unknown) {
    console.error('Error updating customer:', error);

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
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

    // Delete complete customer (Clerk user + extended data)
    await deleteCompleteCustomer(id);

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
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
