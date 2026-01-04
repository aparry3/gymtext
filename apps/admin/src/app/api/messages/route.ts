import { NextResponse } from 'next/server';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { MessageQueueRepository } from '@/server/repositories/messageQueueRepository';
import type {
  AdminMessageItem,
  MessageFilters,
  AdminMessagesResponse,
  MessageDeliveryStatus,
  MessageDirection,
  MessageProvider,
} from '@/components/admin/types';

const messageRepo = new MessageRepository();
const queueRepo = new MessageQueueRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: MessageFilters & { page?: number; pageSize?: number } = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }
    if (searchParams.get('direction')) {
      filters.direction = searchParams.get('direction') as MessageDirection;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as MessageDeliveryStatus;
    }
    if (searchParams.get('clientId')) {
      filters.clientId = searchParams.get('clientId')!;
    }

    // Parse pagination
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!, 10)
      : 1;
    const pageSize = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!, 10)
      : 50;
    const offset = (page - 1) * pageSize;

    // Fetch messages with user info
    const { messages, total } = await messageRepo.findAllWithUserInfo({
      limit: pageSize,
      offset,
      direction: filters.direction,
      status: filters.status,
      search: filters.search,
      clientId: filters.clientId,
    });

    // Fetch pending queue items (only if status filter includes 'pending' or no status filter)
    let pendingQueueItems: Awaited<
      ReturnType<typeof queueRepo.findAllPendingWithUserInfo>
    > = [];
    if (!filters.status || filters.status === 'pending') {
      pendingQueueItems = await queueRepo.findAllPendingWithUserInfo({
        limit: 100,
        clientId: filters.clientId,
      });
    }

    // Transform messages to AdminMessageItem format
    const adminMessages: AdminMessageItem[] = messages.map((msg) => ({
      id: msg.id,
      clientId: msg.clientId,
      direction: msg.direction as MessageDirection,
      content: msg.content,
      phoneFrom: msg.phoneFrom,
      phoneTo: msg.phoneTo,
      provider: msg.provider as MessageProvider,
      providerMessageId: msg.providerMessageId,
      deliveryStatus: msg.deliveryStatus as MessageDeliveryStatus,
      deliveryError: msg.deliveryError,
      metadata: msg.metadata as Record<string, unknown> | null,
      createdAt: msg.createdAt,
      source: 'message' as const,
      userName: msg.userName,
      userPhone: msg.userPhone,
    }));

    // Transform queue items to AdminMessageItem format
    const adminQueueItems: AdminMessageItem[] = pendingQueueItems.map(
      (item) => ({
        id: item.id,
        clientId: item.clientId,
        direction: 'outbound' as const,
        content: item.messageContent || '',
        phoneFrom: null,
        phoneTo: null,
        provider: null,
        providerMessageId: null,
        deliveryStatus: 'pending' as const,
        deliveryError: item.errorMessage,
        metadata: item.mediaUrls
          ? ({ mediaUrls: item.mediaUrls } as Record<string, unknown>)
          : null,
        createdAt: item.createdAt,
        source: 'queue' as const,
        queueName: item.queueName,
        sequenceNumber: item.sequenceNumber,
        userName: item.userName,
        userPhone: item.userPhone,
      })
    );

    // Merge and sort by createdAt DESC
    const allItems = [...adminMessages, ...adminQueueItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get stats
    const stats = await messageRepo.getStats(filters.clientId);

    // Add pending queue count to stats
    stats.pending += pendingQueueItems.length;

    const response: AdminMessagesResponse = {
      messages: allItems,
      pagination: {
        page,
        limit: pageSize,
        total: total + pendingQueueItems.length,
        totalPages: Math.ceil((total + pendingQueueItems.length) / pageSize),
      },
      stats,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred fetching messages',
      },
      { status: 500 }
    );
  }
}
