import { requireApiAuth } from '@/lib/api-utils';
import connectToDatabase from '@/lib/mongodb';
import { Experience } from '@/models/Experience';
import { NextResponse } from 'next/server';

export async function GET() {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectToDatabase();
    const experiences = await Experience.find({});
    return NextResponse.json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectToDatabase();
    const data = await request.json();
    const experience = new Experience(data);
    await experience.save();
    return NextResponse.json(
      { success: true, data: experience },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}
