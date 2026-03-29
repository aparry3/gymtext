import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueueService } from '../domain/messaging/queueService';
import type { QueueServiceInstance } from '../domain/messaging/queueService';

function makeQueueEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: `q-${Date.now()}`,
    clientId: 'user-1',
    messageId: 'msg-1',
    queueName: 'daily',
    sequenceNumber: 1,
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    messageQueue: {
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) =>
        makeQueueEntry(data)
      ),
      createMany: vi.fn().mockImplementation(async (entries: Record<string, unknown>[]) =>
        entries.map((e) => makeQueueEntry(e))
      ),
      findPendingByClient: vi.fn().mockResolvedValue([]),
      findNextPending: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(undefined),
      findByMessageId: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockImplementation(async (id: string) =>
        makeQueueEntry({ id, status: 'processing' })
      ),
      markCompleted: vi.fn().mockImplementation(async (id: string) =>
        makeQueueEntry({ id, status: 'completed' })
      ),
      markFailed: vi.fn().mockImplementation(async (id: string, error?: string) =>
        makeQueueEntry({ id, status: 'failed', error })
      ),
      incrementRetry: vi.fn(),
      updateStatus: vi.fn().mockImplementation(async (id: string, status: string, error?: string) =>
        makeQueueEntry({ id, status, error, retryCount: 1 })
      ),
      deleteById: vi.fn().mockImplementation(async (id: string) =>
        makeQueueEntry({ id })
      ),
      cancelAllPendingForClient: vi.fn().mockResolvedValue(3),
      deleteStalePending: vi.fn().mockResolvedValue([]),
      getQueueStatus: vi.fn().mockResolvedValue({
        total: 5, pending: 2, processing: 1, completed: 1, failed: 1,
      }),
      deleteCompleted: vi.fn(),
      findStalled: vi.fn().mockResolvedValue([]),
    },
  } as any;
}

describe('QueueService', () => {
  let service: QueueServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createQueueService(repos);
  });

  describe('enqueue', () => {
    it('should create queue entry with auto sequence number', async () => {
      const result = await service.enqueue('user-1', 'msg-1', 'daily');
      expect(result).toBeTruthy();
      expect(repos.messageQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'user-1',
          messageId: 'msg-1',
          queueName: 'daily',
          sequenceNumber: 1,
        })
      );
    });

    it('should increment sequence number based on existing entries', async () => {
      repos.messageQueue.findPendingByClient.mockResolvedValue([
        makeQueueEntry({ sequenceNumber: 1 }),
        makeQueueEntry({ sequenceNumber: 2 }),
      ]);
      await service.enqueue('user-1', 'msg-3', 'daily');
      expect(repos.messageQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceNumber: 3 })
      );
    });

    it('should use explicit sequence number when provided', async () => {
      await service.enqueue('user-1', 'msg-1', 'daily', 10);
      expect(repos.messageQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceNumber: 10 })
      );
    });
  });

  describe('enqueueMany', () => {
    it('should create multiple entries with sequential numbers', async () => {
      const result = await service.enqueueMany('user-1', ['msg-1', 'msg-2', 'msg-3'], 'onboarding');
      expect(result).toHaveLength(3);
      expect(repos.messageQueue.createMany).toHaveBeenCalledWith([
        expect.objectContaining({ messageId: 'msg-1', sequenceNumber: 1 }),
        expect.objectContaining({ messageId: 'msg-2', sequenceNumber: 2 }),
        expect.objectContaining({ messageId: 'msg-3', sequenceNumber: 3 }),
      ]);
    });

    it('should return empty array for empty input', async () => {
      const result = await service.enqueueMany('user-1', [], 'daily');
      expect(result).toEqual([]);
    });

    it('should continue sequence from existing entries', async () => {
      repos.messageQueue.findPendingByClient.mockResolvedValue([
        makeQueueEntry({ sequenceNumber: 5 }),
      ]);
      await service.enqueueMany('user-1', ['msg-a', 'msg-b'], 'daily');
      expect(repos.messageQueue.createMany).toHaveBeenCalledWith([
        expect.objectContaining({ sequenceNumber: 6 }),
        expect.objectContaining({ sequenceNumber: 7 }),
      ]);
    });
  });

  describe('state transitions', () => {
    it('should mark entry as processing', async () => {
      const result = await service.markProcessing('q-1');
      expect(result.status).toBe('processing');
      expect(repos.messageQueue.markProcessing).toHaveBeenCalledWith('q-1');
    });

    it('should mark entry as completed', async () => {
      const result = await service.markCompleted('q-1');
      expect(result.status).toBe('completed');
    });

    it('should mark entry as failed with error', async () => {
      const result = await service.markFailed('q-1', 'Twilio 21610');
      expect(result.status).toBe('failed');
    });
  });

  describe('shouldRetry', () => {
    it('should return true when retry count < max retries', () => {
      const entry = makeQueueEntry({ retryCount: 0, maxRetries: 3 });
      expect(service.shouldRetry(entry as any)).toBe(true);
    });

    it('should return false when retry count >= max retries', () => {
      const entry = makeQueueEntry({ retryCount: 3, maxRetries: 3 });
      expect(service.shouldRetry(entry as any)).toBe(false);
    });

    it('should return true at boundary (retryCount = maxRetries - 1)', () => {
      const entry = makeQueueEntry({ retryCount: 2, maxRetries: 3 });
      expect(service.shouldRetry(entry as any)).toBe(true);
    });
  });

  describe('incrementRetryAndReset', () => {
    it('should increment retry and reset to pending', async () => {
      const result = await service.incrementRetryAndReset('q-1', 'Temporary failure');
      expect(repos.messageQueue.incrementRetry).toHaveBeenCalledWith('q-1');
      expect(repos.messageQueue.updateStatus).toHaveBeenCalledWith('q-1', 'pending', 'Temporary failure');
      expect(result.retryCount).toBe(1);
    });
  });

  describe('cancelAllForClient', () => {
    it('should cancel all pending entries', async () => {
      const count = await service.cancelAllForClient('user-1');
      expect(count).toBe(3);
      expect(repos.messageQueue.cancelAllPendingForClient).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getQueueStatus', () => {
    it('should return status breakdown', async () => {
      const status = await service.getQueueStatus('user-1', 'daily');
      expect(status.total).toBe(5);
      expect(status.pending).toBe(2);
      expect(status.processing).toBe(1);
      expect(status.completed).toBe(1);
      expect(status.failed).toBe(1);
    });
  });
});
