import { requireAuth } from '@/lib/auth';
import { getClerkUsers, searchClerkUsers } from '@/lib/clerk-users';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Map sortBy to valid Clerk fields
    let clerkSortBy = 'created_at';
    switch (sortBy) {
      case 'name':
        clerkSortBy = 'first_name';
        break;
      case 'email':
        clerkSortBy = 'email_address';
        break;
      case 'created_at':
      case 'updated_at':
      case 'last_sign_in_at':
      case 'last_active_at':
        clerkSortBy = sortBy;
        break;
      default:
        clerkSortBy = 'created_at';
    }

    const orderBy = `${sortOrder === 'desc' ? '-' : ''}${clerkSortBy}`;

    let response;
    if (search) {
      response = await searchClerkUsers(search, limit, offset);
    } else {
      response = await getClerkUsers({
        limit,
        offset,
        orderBy,
      });
    }

    const totalCustomers = response.totalCount;
    const totalPages = Math.ceil(totalCustomers / limit);

    return NextResponse.json({
      success: true,
      data: response.data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
