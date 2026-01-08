import {
  createRateLimitResponse,
  createValidationErrorResponse,
  requireApiAuth,
} from '@/lib/api-utils';
import {
  createCompleteCustomer,
  getClerkUsers,
  searchClerkUsers,
} from '@/lib/clerk-users';
import { checkRateLimit, createRateLimitKey, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { createCustomerSchema } from '@/lib/validations';
import { getErrorMessage } from '@/types/errors';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {

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

export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  // Rate limit customer creation
  const rateLimitKey = createRateLimitKey(authResult.userId, 'customer-create');
  const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.CUSTOMER_CREATE);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.resetTime);
  }

  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = createCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      nationality,
      nationalId,
      address,
      emergencyContact,
      preferences,
    } = validationResult.data;

    // Create complete customer (Clerk user + extended data)
    const customer = await createCompleteCustomer({
      email,
      phone,
      password,
      firstName,
      lastName,
      nationality,
      nationalId,
      address,
      emergencyContact,
      preferences,
    });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error: unknown) {
    console.error('Error creating customer:', error);

    const errorMessage = getErrorMessage(error, 'Failed to create customer');
    const statusCode = errorMessage.includes('already exists') ? 409 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
