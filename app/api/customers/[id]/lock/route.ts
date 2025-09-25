import { requireAuth } from '@/lib/auth';
import { lockClerkUser, unlockClerkUser } from '@/lib/clerk-users';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params; // This is the Clerk user ID

    // Lock the user in Clerk
    const lockedUser = await lockClerkUser(id);

    return NextResponse.json({
      success: true,
      message: 'User locked successfully',
      data: {
        locked: true,
        lockedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
     
    console.error('Error locking user:', error);

    if (error.message === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to lock user',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params; // This is the Clerk user ID

    // Unlock the user in Clerk
    const unlockedUser = await unlockClerkUser(id);

    return NextResponse.json({
      success: true,
      message: 'User unlocked successfully',
      data: {
        locked: false,
        unlockedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
     
    console.error('Error unlocking user:', error);

    if (error.message === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to unlock user',
      },
      { status: 500 }
    );
  }
}
