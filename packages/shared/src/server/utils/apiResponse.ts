import { NextResponse } from 'next/server';
import { getEnvironmentSettings } from '@/server/config';

export interface APIError {
  message: string;
  error?: string;
  statusCode?: number;
  details?: unknown;
}

export interface APISuccess<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
}

/**
 * Creates a standardized error response
 * @param message The error message
 * @param statusCode The HTTP status code (default 500)
 * @param error Optional error details
 * @returns NextResponse with JSON error
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  error?: unknown
): NextResponse {
  const response: APIError = {
    message,
    statusCode,
  };

  if (error) {
    response.error = error instanceof Error ? error.message : String(error);
    
    // In development, include stack trace
    if (getEnvironmentSettings().isDevelopment && error instanceof Error) {
      response.details = {
        stack: error.stack,
        name: error.name,
      };
    }
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Creates a standardized success response
 * @param data The response data
 * @param message Optional success message
 * @param statusCode The HTTP status code (default 200)
 * @returns NextResponse with JSON data
 */
export function successResponse<T = unknown>(
  data?: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  const response: APISuccess<T> = {
    statusCode,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Common error responses
 */
export const APIErrors = {
  BadRequest: (message: string = 'Bad Request', error?: unknown) => 
    errorResponse(message, 400, error),
    
  Unauthorized: (message: string = 'Unauthorized', error?: unknown) => 
    errorResponse(message, 401, error),
    
  Forbidden: (message: string = 'Forbidden', error?: unknown) => 
    errorResponse(message, 403, error),
    
  NotFound: (message: string = 'Not Found', error?: unknown) => 
    errorResponse(message, 404, error),
    
  InternalServerError: (message: string = 'Internal Server Error', error?: unknown) => 
    errorResponse(message, 500, error),
    
  ServiceUnavailable: (message: string = 'Service Unavailable', error?: unknown) => 
    errorResponse(message, 503, error),
};