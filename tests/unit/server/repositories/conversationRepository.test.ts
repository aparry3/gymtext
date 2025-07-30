import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { ConversationBuilder, mockConversations, createMockConversations, createConversationSequence } from '../../../fixtures/conversations';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('ConversationRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let conversationRepository: ConversationRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    conversationRepository = new ConversationRepository(mockDb);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('create', () => {
    it('should create a new conversation successfully', async () => {
      const conversationData = new ConversationBuilder().asNewConversation();
      const expectedConversation = new ConversationBuilder(conversationData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('conversations');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedConversation);

      const result = await conversationRepository.create(conversationData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('conversations');
      expect(insertBuilder.values).toHaveBeenCalledWith(conversationData);
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedConversation);
    });

    it('should create conversation with metadata', async () => {
      const conversationData = new ConversationBuilder()
        .withMetadata({ topic: 'fitness_plan', planId: 'plan-123' })
        .asNewConversation();
      const expectedConversation = new ConversationBuilder(conversationData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('conversations');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedConversation);

      const result = await conversationRepository.create(conversationData);

      expect(result.metadata).toEqual({ topic: 'fitness_plan', planId: 'plan-123' });
    });

    it('should throw error when insert fails', async () => {
      const conversationData = new ConversationBuilder().asNewConversation();
      const insertBuilder = dbHelper.mockInsertInto('conversations');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(conversationRepository.create(conversationData)).rejects.toThrow('Insert failed');
    });
  });

  describe('findById', () => {
    it('should find conversation by id', async () => {
      const conversation = mockConversations.active();
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(conversation);

      const result = await conversationRepository.findById(conversation.id);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('conversations');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('id', '=', conversation.id);
      expect(result).toEqual(conversation);
    });

    it('should return undefined when conversation not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await conversationRepository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all conversations for a user ordered by last message', async () => {
      const userId = 'user-1';
      const conversations = createConversationSequence(userId);
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.execute.mockResolvedValue(conversations.reverse());

      const result = await conversationRepository.findByUserId(userId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('conversations');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', userId);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('conv-seq-3');
    });

    it('should return empty array when no conversations found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.execute.mockResolvedValue([]);

      const result = await conversationRepository.findByUserId('user-without-conversations');

      expect(result).toEqual([]);
    });

    it('should handle multiple conversations correctly', async () => {
      const conversations = createMockConversations(5, 'user-1');
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.execute.mockResolvedValue(conversations);

      const result = await conversationRepository.findByUserId('user-1');

      expect(result).toHaveLength(5);
      expect(result).toEqual(conversations);
    });
  });

  describe('findActiveByUserId', () => {
    it('should find active conversation for a user', async () => {
      const conversation = mockConversations.active();
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(conversation);

      const result = await conversationRepository.findActiveByUserId(conversation.userId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('conversations');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledTimes(2);
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', conversation.userId);
      expect(selectBuilder.where).toHaveBeenCalledWith('status', '=', 'active');
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
      expect(result).toEqual(conversation);
    });

    it('should return undefined when no active conversation found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await conversationRepository.findActiveByUserId('user-1');

      expect(result).toBeUndefined();
    });

    it('should return most recent active conversation when multiple exist', async () => {
      const recentConversation = mockConversations.recent();
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(recentConversation);

      const result = await conversationRepository.findActiveByUserId('user-2');

      expect(result).toEqual(recentConversation);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
    });
  });

  describe('update', () => {
    it('should update conversation successfully', async () => {
      const conversation = mockConversations.active();
      const updateData = { 
        status: 'inactive' as const, 
        lastMessageAt: new Date() 
      };
      const updatedConversation = { ...conversation, ...updateData };
      
      const updateBuilder = dbHelper.mockUpdateTable('conversations');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(updatedConversation);

      const result = await conversationRepository.update(conversation.id, updateData);

      expect(mockDb.updateTable).toHaveBeenCalledWith('conversations');
      expect(updateBuilder.set).toHaveBeenCalledWith(updateData);
      expect(updateBuilder.where).toHaveBeenCalledWith('id', '=', conversation.id);
      expect(updateBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(updatedConversation);
    });

    it('should update metadata', async () => {
      const conversation = mockConversations.withMetadata();
      const updateData = { 
        metadata: { topic: 'workout', workoutId: 'workout-456' } 
      };
      const updatedConversation = { ...conversation, ...updateData };
      
      const updateBuilder = dbHelper.mockUpdateTable('conversations');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(updatedConversation);

      const result = await conversationRepository.update(conversation.id, updateData);

      expect(result.metadata).toEqual(updateData.metadata);
    });

    it('should throw error when update fails', async () => {
      const updateBuilder = dbHelper.mockUpdateTable('conversations');
      updateBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Update failed'));

      await expect(
        conversationRepository.update('conv-1', { status: 'inactive' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('markAsInactive', () => {
    it('should mark conversation as inactive', async () => {
      const conversation = mockConversations.active();
      const inactiveConversation = { ...conversation, status: 'inactive' as const };
      
      const updateBuilder = dbHelper.mockUpdateTable('conversations');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(inactiveConversation);

      const result = await conversationRepository.markAsInactive(conversation.id);

      expect(mockDb.updateTable).toHaveBeenCalledWith('conversations');
      expect(updateBuilder.set).toHaveBeenCalledWith({ status: 'inactive' });
      expect(updateBuilder.where).toHaveBeenCalledWith('id', '=', conversation.id);
      expect(result.status).toBe('inactive');
    });

    it('should handle already inactive conversations', async () => {
      const conversation = mockConversations.inactive();
      
      const updateBuilder = dbHelper.mockUpdateTable('conversations');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(conversation);

      const result = await conversationRepository.markAsInactive(conversation.id);

      expect(result.status).toBe('inactive');
    });
  });

  describe('getLastConversationForUser', () => {
    it('should get the last conversation for a user', async () => {
      const userId = 'user-1';
      const conversation = mockConversations.recent();
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(conversation);

      const result = await conversationRepository.getLastConversationForUser(userId);

      expect(console.log).toHaveBeenCalledWith('userId', userId);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('conversations');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', userId);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
      expect(result).toEqual(conversation);
    });

    it('should return undefined when user has no conversations', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await conversationRepository.getLastConversationForUser('new-user');

      expect(result).toBeUndefined();
    });

    it('should return most recent conversation', async () => {
      const conversations = createConversationSequence('user-1');
      const mostRecent = conversations[conversations.length - 1];
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.executeTakeFirst.mockResolvedValue(mostRecent);

      const result = await conversationRepository.getLastConversationForUser('user-1');

      expect(result?.id).toBe('conv-seq-3');
      expect(result?.status).toBe('active');
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.selectFrom = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(conversationRepository.findById('conv-1')).rejects.toThrow('Database connection failed');
    });

    it('should handle query timeout errors', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('conversations');
      selectBuilder.execute.mockRejectedValue(new Error('Query timeout'));

      await expect(conversationRepository.findByUserId('user-1')).rejects.toThrow('Query timeout');
    });
  });
});