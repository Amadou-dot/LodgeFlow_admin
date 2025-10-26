import { NextResponse } from 'next/server';

import { logger } from './logger';

/**
 * Standard API response interfaces
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : error;

  logger.error('API Error', error instanceof Error ? error : undefined, {
    status,
    message: errorMessage,
    details,
  });

  const response: ApiErrorResponse = {
    success: false,
    error: errorMessage,
  };

  if (details !== undefined) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Common error status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Handle common API errors with appropriate status codes
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('not found')) {
      return createErrorResponse(error, HTTP_STATUS.NOT_FOUND);
    }
    if (
      error.message.includes('unauthorized') ||
      error.message.includes('authentication')
    ) {
      return createErrorResponse(error, HTTP_STATUS.UNAUTHORIZED);
    }
    if (
      error.message.includes('forbidden') ||
      error.message.includes('permission')
    ) {
      return createErrorResponse(error, HTTP_STATUS.FORBIDDEN);
    }
    if (
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ) {
      return createErrorResponse(error, HTTP_STATUS.BAD_REQUEST);
    }

    // Default to internal server error
    return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Unknown error type
  return createErrorResponse(
    'An unexpected error occurred',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  body: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    field =>
      body[field] === undefined || body[field] === null || body[field] === ''
  );

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields as string[],
  };
}
