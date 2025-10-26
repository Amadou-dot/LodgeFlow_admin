import connectToDatabase from '@/lib/mongodb';
import { Experience } from '@/models/Experience';
import { NextResponse } from 'next/server';

type ParamProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ParamProps) {
  const { id } = await params;
  await connectToDatabase();
  try {
    const experience = await Experience.findById(id);
    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: ParamProps) {
  await connectToDatabase();
  const { id } = await params;
  try {
    const data = await request.json();
    const experience = await Experience.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: ParamProps) {
  await connectToDatabase();

  const { id } = await params;
  try {
    const experience = await Experience.findByIdAndDelete(id);
    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Experience deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}
