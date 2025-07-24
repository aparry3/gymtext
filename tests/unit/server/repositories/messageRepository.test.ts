import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { MessageBuilder, mockMessages, createMessageSequence, createMockMessages } from '../../../fixtures/messages';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('MessageRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let messageRepository: MessageRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    messageRepository = new MessageRepository(mockDb);
  });

  describe('create', () => {
    it('should create a new message successfully', async () => {
      const messageData = new MessageBuilder().asNewMessage();
      const expectedMessage = new MessageBuilder(messageData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('messages');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMessage);

      const result = await messageRepository.create(messageData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('messages');
      expect(insertBuilder.values).toHaveBeenCalledWith(messageData);
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedMessage);
    });

    it('should create user message (inbound)', async () => {
      const messageData = new MessageBuilder()
        .asUserMessage()
        .asNewMessage();
      const expectedMessage = new MessageBuilder(messageData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('messages');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMessage);

      const result = await messageRepository.create(messageData);

      expect(result.direction).toBe('inbound');
    });

    it('should create assistant message (outbound) with Twilio SID', async () => {
      const messageData = new MessageBuilder()
        .asAssistantMessage()
        .withTwilioMessageSid('SM1234567890')
        .asNewMessage();
      const expectedMessage = new MessageBuilder(messageData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('messages');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMessage);

      const result = await messageRepository.create(messageData);

      expect(result.direction).toBe('outbound');
      expect(result.twilioMessageSid).toBe('SM1234567890');
    });

    it('should create message with metadata', async () => {
      const metadata = { type: 'workout', workoutId: 'workout-123' };
      const messageData = new MessageBuilder()
        .withMetadata(metadata)
        .asNewMessage();
      const expectedMessage = new MessageBuilder(messageData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('messages');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMessage);

      const result = await messageRepository.create(messageData);

      expect(result.metadata).toEqual(metadata);
    });

    it('should throw error when insert fails', async () => {
      const messageData = new MessageBuilder().asNewMessage();
      const insertBuilder = dbHelper.mockInsertInto('messages');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(messageRepository.create(messageData)).rejects.toThrow('Insert failed');
    });
  });

  describe('findById', () => {
    it('should find message by id', async () => {
      const message = mockMessages.userGreeting();
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(message);

      const result = await messageRepository.findById(message.id);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('messages');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('id', '=', message.id);
      expect(result).toEqual(message);
    });

    it('should return undefined when message not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await messageRepository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByConversationId', () => {
    it('should find all messages in a conversation ordered by creation time', async () => {
      const conversationId = 'conv-1';
      const messages = createMessageSequence(conversationId, 'user-1');
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue(messages);

      const result = await messageRepository.findByConversationId(conversationId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('messages');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('conversationId', '=', conversationId);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('createdAt', 'asc');
      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('seq-msg-1');
      expect(result[4].id).toBe('seq-msg-5');
    });

    it('should return empty array when no messages found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue([]);

      const result = await messageRepository.findByConversationId('empty-conversation');

      expect(result).toEqual([]);
    });

    it('should handle conversation with many messages', async () => {
      const messages = createMockMessages(50, 'conv-1');
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue(messages);

      const result = await messageRepository.findByConversationId('conv-1');

      expect(result).toHaveLength(50);
    });
  });

  describe('findByUserId', () => {
    it('should find messages by user id with default limit', async () => {
      const userId = 'user-1';
      const messages = createMockMessages(50, undefined, userId);
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue(messages);

      const result = await messageRepository.findByUserId(userId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('messages');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', userId);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(selectBuilder.limit).toHaveBeenCalledWith(50);
    });

    it('should find messages with custom limit', async () => {
      const userId = 'user-1';
      const messages = createMockMessages(10, undefined, userId);
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue(messages);

      const result = await messageRepository.findByUserId(userId, 10);

      expect(selectBuilder.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(10);
    });

    it('should return messages in descending order by creation time', async () => {
      const userId = 'user-1';
      const messages = createMockMessages(5, undefined, userId).reverse();
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue(messages);

      const result = await messageRepository.findByUserId(userId, 5);

      expect(selectBuilder.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result[0].id).toBe('msg-5');
      expect(result[4].id).toBe('msg-1');
    });

    it('should return empty array when user has no messages', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockResolvedValue([]);

      const result = await messageRepository.findByUserId('user-without-messages');

      expect(result).toEqual([]);
    });
  });

  describe('countByConversationId', () => {
    it('should count messages in a conversation', async () => {
      const conversationId = 'conv-1';
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue({ count: '25' });

      const result = await messageRepository.countByConversationId(conversationId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('messages');
      expect(selectBuilder.select).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('conversationId', '=', conversationId);
      expect(result).toBe(25);
    });

    it('should return 0 when no messages found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue({ count: '0' });

      const result = await messageRepository.countByConversationId('empty-conversation');

      expect(result).toBe(0);
    });

    it('should handle null count result', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(null);

      const result = await messageRepository.countByConversationId('conv-1');

      expect(result).toBe(0);
    });

    it('should handle undefined count result', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await messageRepository.countByConversationId('conv-1');

      expect(result).toBe(0);
    });

    it('should convert string count to number', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue({ count: '100' });

      const result = await messageRepository.countByConversationId('conv-1');

      expect(result).toBe(100);
      expect(typeof result).toBe('number');
    });
  });

  describe('edge cases', () => {
    it('should handle very long message content', async () => {
      const longMessage = mockMessages.longMessage();
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(longMessage);

      const result = await messageRepository.findById(longMessage.id);

      expect(result?.content.length).toBeGreaterThan(1000);
    });

    it('should handle messages with emoji', async () => {
      const emojiMessage = mockMessages.withEmoji();
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(emojiMessage);

      const result = await messageRepository.findById(emojiMessage.id);

      expect(result?.content).toContain('💪');
      expect(result?.content).toContain('🎉');
    });

    it('should handle complex metadata', async () => {
      const complexMetadata = {
        type: 'workout',
        workout: {
          id: 'workout-123',
          exercises: ['squats', 'bench press'],
          sets: [3, 3],
          reps: [10, 8],
        },
        timestamp: new Date().toISOString(),
      };
      
      const message = new MessageBuilder()
        .withMetadata(complexMetadata)
        .build();
      
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockResolvedValue(message);

      const result = await messageRepository.findById(message.id);

      expect(result?.metadata).toEqual(complexMetadata);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.selectFrom = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(messageRepository.findById('msg-1')).rejects.toThrow('Database connection failed');
    });

    it('should handle query timeout errors', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.execute.mockRejectedValue(new Error('Query timeout'));

      await expect(messageRepository.findByConversationId('conv-1')).rejects.toThrow('Query timeout');
    });

    it('should handle count query errors', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('messages');
      selectBuilder.executeTakeFirst.mockRejectedValue(new Error('Count failed'));

      await expect(messageRepository.countByConversationId('conv-1')).rejects.toThrow('Count failed');
    });
  });
});