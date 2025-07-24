import type { Conversation, NewConversation, ConversationUpdate } from '@/server/models/conversation';

export class ConversationBuilder {
  private conversation: Conversation;

  constructor(overrides: Partial<Conversation> = {}) {
    const now = new Date();
    this.conversation = {
      id: this.generateUuid(),
      userId: this.generateUuid(),
      startedAt: now,
      lastMessageAt: now,
      status: 'active',
      messageCount: 0,
      metadata: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): ConversationBuilder {
    this.conversation.id = id;
    return this;
  }

  withUserId(userId: string): ConversationBuilder {
    this.conversation.userId = userId;
    return this;
  }

  withStartedAt(startedAt: Date): ConversationBuilder {
    this.conversation.startedAt = startedAt;
    return this;
  }

  withLastMessageAt(lastMessageAt: Date): ConversationBuilder {
    this.conversation.lastMessageAt = lastMessageAt;
    return this;
  }

  withStatus(status: 'active' | 'inactive'): ConversationBuilder {
    this.conversation.status = status;
    return this;
  }

  withMetadata(metadata: any): ConversationBuilder {
    this.conversation.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: Date): ConversationBuilder {
    this.conversation.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): ConversationBuilder {
    this.conversation.updatedAt = updatedAt;
    return this;
  }

  asNewConversation(): NewConversation {
    const { id, createdAt, updatedAt, ...newConversation } = this.conversation;
    return newConversation;
  }

  asConversationUpdate(): ConversationUpdate {
    const { id, userId, createdAt, ...update } = this.conversation;
    return update;
  }

  build(): Conversation {
    return { ...this.conversation };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockConversations = {
  active: () => new ConversationBuilder()
    .withId('conv-1')
    .withUserId('user-1')
    .withStatus('active')
    .withStartedAt(new Date('2024-01-01T10:00:00Z'))
    .withLastMessageAt(new Date('2024-01-01T10:30:00Z'))
    .build(),

  inactive: () => new ConversationBuilder()
    .withId('conv-2')
    .withUserId('user-1')
    .withStatus('inactive')
    .withStartedAt(new Date('2024-01-01T08:00:00Z'))
    .withLastMessageAt(new Date('2024-01-01T09:00:00Z'))
    .build(),

  recent: () => new ConversationBuilder()
    .withId('conv-3')
    .withUserId('user-2')
    .withStatus('active')
    .withStartedAt(new Date('2024-01-01T14:00:00Z'))
    .withLastMessageAt(new Date('2024-01-01T15:00:00Z'))
    .build(),

  withMetadata: () => new ConversationBuilder()
    .withId('conv-4')
    .withUserId('user-3')
    .withStatus('active')
    .withMetadata({ topic: 'fitness_plan', planId: 'plan-123' })
    .build(),

  old: () => new ConversationBuilder()
    .withId('conv-5')
    .withUserId('user-1')
    .withStatus('inactive')
    .withStartedAt(new Date('2023-12-01T10:00:00Z'))
    .withLastMessageAt(new Date('2023-12-01T11:00:00Z'))
    .build(),
};

export const createMockConversations = (count: number, userId?: string): Conversation[] => {
  const now = new Date();
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive'];
  
  return Array.from({ length: count }, (_, i) => {
    const startedAt = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const lastMessageAt = new Date(startedAt.getTime() + (Math.random() * 4 * 60 * 60 * 1000));
    
    return new ConversationBuilder()
      .withId(`conv-${i + 1}`)
      .withUserId(userId || `user-${Math.ceil((i + 1) / 3)}`)
      .withStatus(i === 0 ? 'active' : statuses[i % 2])
      .withStartedAt(startedAt)
      .withLastMessageAt(lastMessageAt)
      .build();
  });
};

export const createConversationSequence = (userId: string): Conversation[] => {
  const now = new Date();
  
  return [
    new ConversationBuilder()
      .withId('conv-seq-1')
      .withUserId(userId)
      .withStatus('inactive')
      .withStartedAt(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
      .withLastMessageAt(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
      .build(),
    new ConversationBuilder()
      .withId('conv-seq-2')
      .withUserId(userId)
      .withStatus('inactive')
      .withStartedAt(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))
      .withLastMessageAt(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))
      .build(),
    new ConversationBuilder()
      .withId('conv-seq-3')
      .withUserId(userId)
      .withStatus('active')
      .withStartedAt(new Date(now.getTime() - 60 * 60 * 1000))
      .withLastMessageAt(new Date(now.getTime() - 30 * 60 * 1000))
      .build(),
  ];
};