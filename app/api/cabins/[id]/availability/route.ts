import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: cabinId } = await context.params;
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Default to next 6 months if no date range provided
    const defaultStart = new Date();
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 6);

    const queryStartDate = startDate ? new Date(startDate) : defaultStart;
    const queryEndDate = endDate ? new Date(endDate) : defaultEnd;

    // Find all bookings that overlap with the query date range
    const bookings = await Booking.find({
      cabin: cabinId,
      status: { $nin: ['cancelled'] }, // Exclude cancelled bookings
      $or: [
        {
          checkInDate: { $lt: queryEndDate },
          checkOutDate: { $gt: queryStartDate },
        },
      ],
    })
      .select('checkInDate checkOutDate')
      .lean();

    // Create array of unavailable date ranges
    const unavailableDates = bookings.map((booking: any) => ({
      start: booking.checkInDate.toISOString().split('T')[0],
      end: booking.checkOutDate.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      data: {
        cabinId,
        unavailableDates,
        queryRange: {
          start: queryStartDate.toISOString().split('T')[0],
          end: queryEndDate.toISOString().split('T')[0],
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cabin availability',
      },
      { status: 500 }
    );
  }
}
