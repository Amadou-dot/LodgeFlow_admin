import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Dining } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const dining = await Dining.findById(params.id);
    
    if (!dining) {
      return NextResponse.json(
        { success: false, error: 'Dining item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: dining,
    });
  } catch (error) {
    console.error('Error fetching dining item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dining item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate serving time format if provided
    if (body.servingTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(body.servingTime.start) || !timeRegex.test(body.servingTime.end)) {
        return NextResponse.json(
          { success: false, error: 'Invalid time format. Use HH:MM format.' },
          { status: 400 }
        );
      }
    }
    
    const dining = await Dining.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!dining) {
      return NextResponse.json(
        { success: false, error: 'Dining item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: dining,
      message: 'Dining item updated successfully',
    });
  } catch (error) {
    console.error('Error updating dining item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dining item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const dining = await Dining.findByIdAndDelete(params.id);
    
    if (!dining) {
      return NextResponse.json(
        { success: false, error: 'Dining item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dining item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting dining item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete dining item' },
      { status: 500 }
    );
  }
}
