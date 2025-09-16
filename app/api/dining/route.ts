import { connectDB, Dining } from '@/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const mealType = searchParams.get('mealType');
    const category = searchParams.get('category');
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build filter object
    const filter: any = {};
    if (type) filter.type = type;
    if (mealType) filter.mealType = mealType;
    if (category) filter.category = category;
    if (isAvailable !== null && isAvailable !== undefined)
      filter.isAvailable = isAvailable === 'true';

    // Add search functionality
    if (search) {
      // If we have other filters, we need to combine them with $and
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { mealType: { $regex: search, $options: 'i' } },
        ],
      };

      // If we have existing filters, combine them
      if (Object.keys(filter).length > 0) {
        const existingFilters = { ...filter };
        filter.$and = [existingFilters, searchFilter];
        // Remove the individual filter properties since they're now in $and
        Object.keys(existingFilters).forEach(key => delete filter[key]);
      } else {
        // If no other filters, just use the search filter
        Object.assign(filter, searchFilter);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const dining = await Dining.find(filter).sort(sort);

    return NextResponse.json({
      success: true,
      data: dining,
      count: dining.length,
    });
  } catch (error) {
    console.error('Error fetching dining:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dining items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'description',
      'type',
      'mealType',
      'price',
      'servingTime',
      'maxPeople',
      'category',
      'image',
    ];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate serving time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(body.servingTime.start) ||
      !timeRegex.test(body.servingTime.end)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format. Use HH:MM format.' },
        { status: 400 }
      );
    }

    const dining = new Dining(body);
    await dining.save();

    return NextResponse.json(
      {
        success: true,
        data: dining,
        message: 'Dining item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating dining item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dining item' },
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
        { success: false, error: 'Dining item ID is required' },
        { status: 400 }
      );
    }

    // Validate serving time format if provided
    if (updateData.servingTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (
        !timeRegex.test(updateData.servingTime.start) ||
        !timeRegex.test(updateData.servingTime.end)
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid time format. Use HH:MM format.' },
          { status: 400 }
        );
      }
    }

    const dining = await Dining.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Dining item ID is required' },
        { status: 400 }
      );
    }

    const dining = await Dining.findByIdAndDelete(id);

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
