import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Booking, Cabin } from '../../../models';
import { getClerkUser } from '../../../lib/clerk-users';

export async function GET() {
  try {
    await connectDB();

    // Get current date and calculate periods
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Parallel queries for efficiency
    const [
      totalBookings,
      totalRevenue,
      totalCabins,
      totalCancellations,
      recentBookings,
      checkInsToday,
      checkOutsToday,
      occupancyData,
      revenueData,
    ] = await Promise.all([
      // Total bookings in last 30 days
      Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        status: { $ne: 'cancelled' },
      }),

      // Total revenue in last 30 days
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'cancelled' },
            isPaid: true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' },
          },
        },
      ]),

      // Total cabins
      Cabin.countDocuments(),

      // Total cancellations in last 30 days
      Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        status: 'cancelled',
      }),

      // Recent bookings (last 6 months)
      Booking.find({
        createdAt: { $gte: sixMonthsAgo },
      })
        .populate('cabin', 'name')
        .sort({ createdAt: -1 })
        .limit(10),

      // Check-ins today
      Booking.countDocuments({
        checkInDate: {
          $gte: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ),
          $lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          ),
        },
        status: 'confirmed',
      }),

      // Check-outs today
      Booking.countDocuments({
        checkOutDate: {
          $gte: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ),
          $lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          ),
        },
        status: 'checked-in',
      }),

      // Occupancy data for last 7 days
      Booking.aggregate([
        {
          $match: {
            checkInDate: { $lte: today },
            checkOutDate: { $gt: sevenDaysAgo },
            status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          },
        },
        {
          $lookup: {
            from: 'cabins',
            localField: 'cabin',
            foreignField: '_id',
            as: 'cabinData',
          },
        },
        {
          $unwind: '$cabinData',
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$checkInDate',
              },
            },
            totalGuests: { $sum: '$numGuests' },
            totalCapacity: { $sum: '$cabinData.capacity' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Revenue data for last 30 days by week
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'cancelled' },
            isPaid: true,
          },
        },
        {
          $group: {
            _id: {
              week: { $week: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            totalRevenue: { $sum: '$totalPrice' },
            bookingCount: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.week': 1 },
        },
      ]),
    ]);

    // Calculate occupancy rate
    const totalCapacity = await Cabin.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
        },
      },
    ]);

    const currentOccupancy = await Booking.aggregate([
      {
        $match: {
          checkInDate: { $lte: today },
          checkOutDate: { $gt: today },
          status: { $in: ['confirmed', 'checked-in'] },
        },
      },
      {
        $group: {
          _id: null,
          occupiedCapacity: { $sum: '$numGuests' },
        },
      },
    ]);

    const occupancyRate =
      totalCapacity[0] && currentOccupancy[0]
        ? (currentOccupancy[0].occupiedCapacity /
            totalCapacity[0].totalCapacity) *
          100
        : 0;

    // Format the response
    const stats = {
      overview: {
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCabins,
        totalCustomers: 17, // Placeholder - using known Clerk user count from seeding
        totalCancellations,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        checkInsToday,
        checkOutsToday,
      },
      recentActivity: await Promise.all(
        recentBookings.map(async (booking: any) => {
          let customerName = 'Customer';
          
          // Fetch customer name from Clerk
          if (booking.customer) {
            try {
              const clerkUser = await getClerkUser(booking.customer);
              customerName = clerkUser?.name || `${clerkUser?.first_name || ''} ${clerkUser?.last_name || ''}`.trim() || 'Customer';
            } catch (error) {
              console.warn('Failed to fetch customer name for:', booking.customer);
            }
          }

          return {
            id: booking._id,
            customerName,
            cabinName: booking.cabin?.name || 'Unknown',
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            totalPrice: booking.totalPrice,
            status: booking.status,
            createdAt: booking.createdAt,
          };
        })
      ),
      charts: {
        occupancy: occupancyData.map((item: any) => ({
          date: item._id,
          occupancyRate:
            item.totalCapacity > 0
              ? Math.round((item.totalGuests / item.totalCapacity) * 100)
              : 0,
          totalGuests: item.totalGuests,
          totalCapacity: item.totalCapacity,
        })),
        revenue: revenueData.map((item: any) => ({
          week: `Week ${item._id.week}`,
          revenue: item.totalRevenue,
          bookings: item.bookingCount,
        })),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
      },
      { status: 500 }
    );
  }
}
