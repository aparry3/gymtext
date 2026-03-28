/**
 * Message Stream API (Server-Sent Events)
 *
 * Provides real-time message streaming for local development and admin chat.
 * Clients can subscribe to receive messages as they are sent.
 */

import { NextRequest } from 'next/server';
import { localMessagingClient, type LocalMessage } from '@/server/connections/messaging';
import { getMessagingConfig } from '@/shared/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const allowedOrigins = [
    process.env.ADMIN_APP_URL,
    'http://localhost:3001',
  ].filter(Boolean);
  return allowedOrigins.includes(origin) ? origin : null;
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const corsOrigin = getCorsOrigin(request);
  return new Response(null, {
    status: 204,
    headers: {
      ...(corsOrigin && { 'Access-Control-Allow-Origin': corsOrigin }),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  // Only allow SSE when using local messaging provider
  const { provider } = getMessagingConfig();
  if (provider !== 'local') {
    return new Response('SSE is only available with MESSAGING_PROVIDER=local', {
      status: 400,
    });
  }

  const corsOrigin = getCorsOrigin(request);

  // Optional: Filter by phoneNumber from query params
  const { searchParams } = new URL(request.url);
  const filterPhoneNumber = searchParams.get('phoneNumber');

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Set up message listener
      const messageListener = (message: LocalMessage) => {
        // Filter by phone number if specified
        if (filterPhoneNumber && message.to !== filterPhoneNumber) {
          return;
        }

        const data = {
          type: 'message',
          message: {
            id: message.messageId,
            to: message.to,
            from: message.from,
            content: message.content,
            timestamp: message.timestamp,
          },
        };

        const sseMessage = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(sseMessage));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Subscribe to messages
      localMessagingClient.onMessage(messageListener);

      console.log('[SSE] Client connected', {
        filterPhoneNumber,
        activeListeners: localMessagingClient.getListenerCount(),
      });

      // Clean up on connection close
      const cleanup = () => {
        localMessagingClient.offMessage(messageListener);
        console.log('[SSE] Client disconnected', {
          activeListeners: localMessagingClient.getListenerCount(),
        });
      };

      // Handle connection close
      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // Controller might already be closed - ignore error
        }
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...(corsOrigin && {
        'Access-Control-Allow-Origin': corsOrigin,
      }),
    },
  });
}
