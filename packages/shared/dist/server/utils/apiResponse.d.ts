import { NextResponse } from 'next/server';
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
export declare function errorResponse(message: string, statusCode?: number, error?: unknown): NextResponse;
/**
 * Creates a standardized success response
 * @param data The response data
 * @param message Optional success message
 * @param statusCode The HTTP status code (default 200)
 * @returns NextResponse with JSON data
 */
export declare function successResponse<T = unknown>(data?: T, message?: string, statusCode?: number): NextResponse;
/**
 * Common error responses
 */
export declare const APIErrors: {
    BadRequest: (message?: string, error?: unknown) => NextResponse<unknown>;
    Unauthorized: (message?: string, error?: unknown) => NextResponse<unknown>;
    Forbidden: (message?: string, error?: unknown) => NextResponse<unknown>;
    NotFound: (message?: string, error?: unknown) => NextResponse<unknown>;
    InternalServerError: (message?: string, error?: unknown) => NextResponse<unknown>;
    ServiceUnavailable: (message?: string, error?: unknown) => NextResponse<unknown>;
};
//# sourceMappingURL=apiResponse.d.ts.map