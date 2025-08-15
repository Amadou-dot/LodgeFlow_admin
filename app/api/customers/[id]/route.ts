import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import { Booking, Customer } from "../../../../models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // Get customer with their booking history
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    // Get customer's bookings
    const bookings = await Booking.find({ customer: id })
      .populate("cabin", "name image capacity price")
      .sort({ createdAt: -1 })
      .limit(10); // Last 10 bookings

    // Calculate additional stats
    const totalBookings = await Booking.countDocuments({ customer: id });
    const completedBookings = await Booking.countDocuments({
      customer: id,
      status: "checked-out",
    });

    const revenueResult = await Booking.aggregate([
      { $match: { customer: customer._id, isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const customerData = {
      ...customer.toObject(),
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
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();

    const customer = await Customer.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update customer",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if customer has any bookings
    const bookingCount = await Booking.countDocuments({ customer: id });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete customer with existing bookings",
        },
        { status: 400 },
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete customer",
      },
      { status: 500 },
    );
  }
}
