import type { Pagination } from './admin';

// Source type to distinguish between messages table and queue
export type MessageSource = 'message' | 'queue';

// Delivery status for messages
export type MessageDeliveryStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'undelivered';

// Direction
export type MessageDirection = 'inbound' | 'outbound';

// Provider type
export type MessageProvider = 'twilio' | 'local' | 'websocket';

// Row variant for color coding
export type MessageRowVariant =
  | 'inbound'
  | 'outbound-delivered'
  | 'outbound-sent'
  | 'outbound-failed'
  | 'queued';

// Unified message item for display (messages + queue items)
export interface AdminMessageItem {
  id: string;
  clientId: string;
  direction: MessageDirection;
  content: string;
  phoneFrom: string | null;
  phoneTo: string | null;
  provider: MessageProvider | null;
  providerMessageId: string | null;
  deliveryStatus: MessageDeliveryStatus;
  deliveryError: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  // Source info
  source: MessageSource;
  // Queue-specific fields
  queueName?: string;
  sequenceNumber?: number;
  // User info (for global view)
  userName?: string | null;
  userPhone?: string | null;
}

// Filter types for the messages list
export interface MessageFilters {
  search?: string;
  direction?: MessageDirection;
  status?: MessageDeliveryStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Sorting options
export interface MessageSort {
  field: 'createdAt';
  direction: 'asc' | 'desc';
}

// Stats for the messages page
export interface MessageStats {
  totalMessages: number;
  inbound: number;
  outbound: number;
  pending: number;
  failed: number;
}

// API Response type
export interface AdminMessagesResponse {
  messages: AdminMessageItem[];
  pagination: Pagination;
  stats: MessageStats;
}
