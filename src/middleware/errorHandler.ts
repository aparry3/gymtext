import { NextResponse } from 'next/server';
import { API_CODES } from '@/constants';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = API_CODES.INTERNAL_ERROR,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: unknown): NextResponse {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: API_CODES.INTERNAL_ERROR }
    );
  }
  
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
    },
    { status: API_CODES.INTERNAL_ERROR }
  );
}

// Async error wrapper for API routes
export function asyncHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}