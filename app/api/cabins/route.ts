import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import { Cabin } from "../../../models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build query
    let query = {};

    // Apply filters
    if (filter) {
      switch (filter) {
        case "with-discount":
          query = { discount: { $gt: 0 } };
          break;
        case "no-discount":
          query = { discount: 0 };
          break;
        case "small":
          query = { capacity: { $lte: 3 } };
          break;
        case "medium":
          query = { capacity: { $gte: 4, $lte: 6 } };
          break;
        case "large":
          query = { capacity: { $gte: 7 } };
          break;
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const cabins = await Cabin.find(query).sort(sort);

    return NextResponse.json({
      success: true,
      data: cabins,
    });
  } catch (error) {
    console.error("Error fetching cabins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cabins",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const cabin = await Cabin.create(body);

    return NextResponse.json(
      {
        success: true,
        data: cabin,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating cabin:", error);

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

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create cabin",
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
          error: "Cabin ID is required",
        },
        { status: 400 },
      );
    }

    const cabin = await Cabin.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!cabin) {
      return NextResponse.json(
        {
          success: false,
          error: "Cabin not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: cabin,
    });
  } catch (error: any) {
    console.error("Error updating cabin:", error);

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

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cabin",
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
          error: "Cabin ID is required",
        },
        { status: 400 },
      );
    }

    const cabin = await Cabin.findByIdAndDelete(id);

    if (!cabin) {
      return NextResponse.json(
        {
          success: false,
          error: "Cabin not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cabin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cabin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete cabin",
      },
      { status: 500 },
    );
  }
}
