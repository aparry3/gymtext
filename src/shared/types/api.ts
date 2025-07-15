export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SMSWebhookPayload {
  MessageSid: string;
  Body: string;
  From: string;
  To: string;
  [key: string]: string | number | boolean;
}