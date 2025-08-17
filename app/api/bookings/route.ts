import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import { Booking } from "../../../models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "checkInDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    let query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { "cabin.name": { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get bookings with populated cabin and customer data
    const bookings = await Booking.find(query)
      .populate("cabin", "name image capacity price discount")
      .populate("customer", "name email nationality phone")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Apply search filter after population if search term exists
    let filteredBookings = bookings;
    if (search) {
      filteredBookings = bookings.filter((booking: any) => {
        const cabin = booking.cabin;
        const customer = booking.customer || booking.guest;
        
        if (!cabin || !customer) return false;
        
        const searchLower = search.toLowerCase();
        return (
          cabin.name?.toLowerCase().includes(searchLower) ||
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Get total count for pagination (considering search)
    let totalBookings;
    if (search) {
      // For search, we need to get all matching records to count them
      const allBookings = await Booking.find(
        status && status !== "all" ? { status } : {}
      )
        .populate("cabin", "name")
        .populate("customer", "name email");
      
      const filtered = allBookings.filter((booking: any) => {
        const cabin = booking.cabin;
        const customer = booking.customer || booking.guest;
        
        if (!cabin || !customer) return false;
        
        const searchLower = search.toLowerCase();
        return (
          cabin.name?.toLowerCase().includes(searchLower) ||
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
        );
      });
      
      totalBookings = filtered.length;
    } else {
      totalBookings = await Booking.countDocuments(
        status && status !== "all" ? { status } : {}
      );
    }
    const totalPages = Math.ceil(totalBookings / limit);

    return NextResponse.json({
      success: true,
      data: filteredBookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings",
      },
      { status: 500 },
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
      .populate("cabin", "name image capacity price discount")
      .populate("customer", "name email nationality phone");

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);

    // Handle validation errors
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

    // Handle date overlap errors
    if (error.message && error.message.includes("overlap")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }, // Conflict
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking",
      },
      { status: 500 },
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
          error: "Booking ID is required",
        },
        { status: 400 },
      );
    }

    const booking = await Booking.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("cabin", "name image capacity price discount")
      .populate("customer", "name email nationality phone");

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);

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

    if (error.message && error.message.includes("overlap")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update booking",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking ID is required",
        },
        { status: 400 },
      );
    }

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete booking",
      },
      { status: 500 },
    );
  }
}
