import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Cabin } from '../../../../models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    await connectDB();
    const id = await params.id;

    const cabin = await Cabin.findById(id);

    if (!cabin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cabin not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cabin,
    });
  } catch (error) {
    console.error('Error fetching cabin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cabin',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    await connectDB();
    const id = await params.id;

    const body = await request.json();

    const cabin = await Cabin.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!cabin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cabin not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cabin,
    });
  } catch (error: any) {
    console.error('Error updating cabin:', error);

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
        error: 'Failed to update cabin',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    await connectDB();
    const id = await params.id;

    const cabin = await Cabin.findByIdAndDelete(id);

    if (!cabin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cabin not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cabin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cabin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete cabin',
      },
      { status: 500 }
    );
  }
}
