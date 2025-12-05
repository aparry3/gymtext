'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelative } from '@/shared/utils/date';
import type {
  AdminMessageItem,
  MessageRowVariant,
} from '@/types/adminMessages';

interface MessagesTableProps {
  messages: AdminMessageItem[];
  isLoading?: boolean;
  showUserColumn?: boolean;
}

export function MessagesTable({
  messages,
  isLoading = false,
  showUserColumn = true,
}: MessagesTableProps) {
  if (isLoading) {
    return <MessagesTableSkeleton showUserColumn={showUserColumn} />;
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No messages found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {showUserColumn && (
                <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                  User
                </th>
              )}
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Direction
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Status
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Preview
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                showUserColumn={showUserColumn}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MessageRowProps {
  message: AdminMessageItem;
  showUserColumn: boolean;
}

function MessageRow({ message, showUserColumn }: MessageRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const variant = getRowVariant(message);
  const bgColor = getRowBackgroundColor(variant);

  return (
    <>
      <tr
        className={`border-b border-gray-50 cursor-pointer transition-all duration-200 ${bgColor}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {showUserColumn && (
          <td className="p-4">
            <Link
              href={`/admin/users/${message.clientId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              <div className="font-medium">
                {message.userName || 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPhone(message.userPhone || '')}
              </div>
            </Link>
          </td>
        )}

        <td className="p-4">
          <div className="flex items-center gap-1">
            <DirectionBadge direction={message.direction} />
            {message.source === 'queue' && (
              <Badge variant="outline" className="text-xs">
                Queue
              </Badge>
            )}
          </div>
        </td>

        <td className="p-4">
          <StatusBadge status={message.deliveryStatus} />
        </td>

        <td className="p-4">
          <div className="max-w-md truncate text-sm">
            {message.content.substring(0, 80)}
            {message.content.length > 80 && '...'}
          </div>
        </td>

        <td className="p-4">
          <div className="text-sm text-muted-foreground">
            {formatRelative(message.createdAt)}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className={bgColor}>
          <td
            colSpan={showUserColumn ? 5 : 4}
            className="p-4 border-b border-gray-100"
          >
            <ExpandedContent message={message} />
          </td>
        </tr>
      )}
    </>
  );
}

function ExpandedContent({ message }: { message: AdminMessageItem }) {
  return (
    <div className="space-y-4 bg-white/50 rounded-lg p-4">
      <div>
        <h4 className="font-medium mb-2">Full Content</h4>
        <p className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
          {message.content}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">From:</span>
          <div>{formatPhone(message.phoneFrom || 'N/A')}</div>
        </div>
        <div>
          <span className="text-muted-foreground">To:</span>
          <div>{formatPhone(message.phoneTo || 'N/A')}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Provider:</span>
          <div>{message.provider || 'Queue'}</div>
        </div>
        <div>
          <span className="text-muted-foreground">ID:</span>
          <div className="font-mono text-xs">{message.id.slice(0, 8)}...</div>
        </div>
      </div>

      {message.queueName && (
        <div className="text-sm">
          <span className="text-muted-foreground">Queue: </span>
          {message.queueName}
          {message.sequenceNumber !== undefined && (
            <span className="ml-2 text-muted-foreground">
              (#{message.sequenceNumber})
            </span>
          )}
        </div>
      )}

      {message.deliveryError && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          <strong>Error:</strong> {message.deliveryError}
        </div>
      )}

      {message.metadata && Object.keys(message.metadata).length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Metadata</h4>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(message.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function DirectionBadge({
  direction,
}: {
  direction: AdminMessageItem['direction'];
}) {
  if (direction === 'inbound') {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        <ArrowDownLeft className="h-3 w-3 mr-1" />
        In
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
      <ArrowUpRight className="h-3 w-3 mr-1" />
      Out
    </Badge>
  );
}

function StatusBadge({
  status,
}: {
  status: AdminMessageItem['deliveryStatus'];
}) {
  const variants: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
    queued: { label: 'Queued', className: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Sent', className: 'bg-sky-100 text-sky-700' },
    delivered: { label: 'Delivered', className: 'bg-blue-100 text-blue-700' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
    undelivered: {
      label: 'Undelivered',
      className: 'bg-red-100 text-red-700',
    },
  };

  const variant = variants[status] || variants.queued;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variant.className}`}
    >
      {variant.label}
    </span>
  );
}

function getRowVariant(message: AdminMessageItem): MessageRowVariant {
  if (message.source === 'queue' || message.deliveryStatus === 'pending') {
    return 'queued';
  }
  if (message.direction === 'inbound') {
    return 'inbound';
  }
  if (message.deliveryStatus === 'delivered') {
    return 'outbound-delivered';
  }
  if (message.deliveryStatus === 'sent' || message.deliveryStatus === 'queued') {
    return 'outbound-sent';
  }
  if (
    message.deliveryStatus === 'failed' ||
    message.deliveryStatus === 'undelivered'
  ) {
    return 'outbound-failed';
  }
  return 'queued';
}

function getRowBackgroundColor(variant: MessageRowVariant): string {
  const colors: Record<MessageRowVariant, string> = {
    inbound: 'bg-orange-50 hover:bg-orange-100',
    'outbound-delivered': 'bg-blue-50 hover:bg-blue-100',
    'outbound-sent': 'bg-sky-50 hover:bg-sky-100',
    'outbound-failed': 'bg-red-50 hover:bg-red-100',
    queued: 'bg-gray-50 hover:bg-gray-100',
  };
  return colors[variant];
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const number = cleaned.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  return phone;
}

function MessagesTableSkeleton({
  showUserColumn,
}: {
  showUserColumn: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {showUserColumn && (
                <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                  User
                </th>
              )}
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Direction
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Status
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Preview
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {showUserColumn && (
                  <td className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </td>
                )}
                <td className="p-4">
                  <Skeleton className="h-6 w-14" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-64" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Icons
const ArrowDownLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25"
    />
  </svg>
);

const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
);
