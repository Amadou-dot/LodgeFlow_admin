import connectToDatabase from '@/lib/mongodb';
import { Experience } from '@/models/Experience';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  try {
    const experiences = await Experience.find({});
    return NextResponse.json(experiences);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectToDatabase();
  try {
    const data = await request.json();
    const experience = new Experience(data);
    await experience.save();
    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}
