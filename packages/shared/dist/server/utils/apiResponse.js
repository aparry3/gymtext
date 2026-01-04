import { NextResponse } from 'next/server';
import { getEnvironmentSettings } from '@/server/config';
/**
 * Creates a standardized error response
 * @param message The error message
 * @param statusCode The HTTP status code (default 500)
 * @param error Optional error details
 * @returns NextResponse with JSON error
 */
export function errorResponse(message, statusCode = 500, error) {
    const response = {
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
export function successResponse(data, message, statusCode = 200) {
    const response = {
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
    BadRequest: (message = 'Bad Request', error) => errorResponse(message, 400, error),
    Unauthorized: (message = 'Unauthorized', error) => errorResponse(message, 401, error),
    Forbidden: (message = 'Forbidden', error) => errorResponse(message, 403, error),
    NotFound: (message = 'Not Found', error) => errorResponse(message, 404, error),
    InternalServerError: (message = 'Internal Server Error', error) => errorResponse(message, 500, error),
    ServiceUnavailable: (message = 'Service Unavailable', error) => errorResponse(message, 503, error),
};
