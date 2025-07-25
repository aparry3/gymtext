import type { Message, NewMessage } from '@/server/models/messageModel';

export class MessageBuilder {
  private message: Message;

  constructor(overrides: Partial<Message> = {}) {
    const now = new Date();
    this.message = {
      id: this.generateUuid(),
      userId: this.generateUuid(),
      conversationId: this.generateUuid(),
      content: 'Hello, I need help with my fitness plan.',
      direction: 'inbound',
      phoneFrom: '+1234567890',
      phoneTo: '+0987654321',
      twilioMessageSid: null,
      metadata: {},
      createdAt: now,
      ...overrides,
    };
  }

  withId(id: string): MessageBuilder {
    this.message.id = id;
    return this;
  }

  withUserId(userId: string): MessageBuilder {
    this.message.userId = userId;
    return this;
  }

  withConversationId(conversationId: string): MessageBuilder {
    this.message.conversationId = conversationId;
    return this;
  }

  withContent(content: string): MessageBuilder {
    this.message.content = content;
    return this;
  }

  withDirection(direction: 'inbound' | 'outbound'): MessageBuilder {
    this.message.direction = direction;
    return this;
  }

  withPhoneFrom(phoneFrom: string): MessageBuilder {
    this.message.phoneFrom = phoneFrom;
    return this;
  }

  withPhoneTo(phoneTo: string): MessageBuilder {
    this.message.phoneTo = phoneTo;
    return this;
  }

  withTwilioMessageSid(twilioMessageSid: string | null): MessageBuilder {
    this.message.twilioMessageSid = twilioMessageSid;
    return this;
  }

  withMetadata(metadata: any): MessageBuilder {
    this.message.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: Date): MessageBuilder {
    this.message.createdAt = createdAt;
    return this;
  }

  asUserMessage(): MessageBuilder {
    this.message.direction = 'inbound';
    return this;
  }

  asAssistantMessage(): MessageBuilder {
    this.message.direction = 'outbound';
    return this;
  }

  asNewMessage(): NewMessage {
    const { id, createdAt, ...newMessage } = this.message;
    return newMessage;
  }

  build(): Message {
    return { ...this.message };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockMessages = {
  userGreeting: () => new MessageBuilder()
    .withId('msg-1')
    .withContent('Hi, I want to start working out')
    .asUserMessage()
    .build(),

  assistantResponse: () => new MessageBuilder()
    .withId('msg-2')
    .withContent('Great! I can help you create a personalized fitness plan. What are your main fitness goals?')
    .asAssistantMessage()
    .withTwilioMessageSid('SM1234567890abcdef')
    .build(),

  userGoals: () => new MessageBuilder()
    .withId('msg-3')
    .withContent('I want to build muscle and lose some weight')
    .asUserMessage()
    .build(),

  workoutMessage: () => new MessageBuilder()
    .withId('msg-4')
    .withContent('Today\'s workout: 3x10 Squats, 3x8 Bench Press, 3x12 Rows')
    .asAssistantMessage()
    .withMetadata({ type: 'workout', workoutId: 'workout-123' })
    .build(),

  longMessage: () => new MessageBuilder()
    .withId('msg-5')
    .withContent('Lorem ipsum dolor sit amet, '.repeat(100))
    .asUserMessage()
    .build(),

  withEmoji: () => new MessageBuilder()
    .withId('msg-6')
    .withContent('Great job on completing your workout! 💪🎉')
    .asAssistantMessage()
    .build(),

  errorMessage: () => new MessageBuilder()
    .withId('msg-7')
    .withContent('I\'m having trouble understanding. Could you please rephrase?')
    .asAssistantMessage()
    .withMetadata({ error: true, reason: 'parse_error' })
    .build(),
};

export const createMessageSequence = (conversationId: string, userId: string): Message[] => {
  const now = new Date();
  const phoneFrom = '+1234567890';
  const phoneTo = '+0987654321';
  
  return [
    new MessageBuilder()
      .withId('seq-msg-1')
      .withConversationId(conversationId)
      .withUserId(userId)
      .withContent('Hi, I need help getting started with fitness')
      .asUserMessage()
      .withPhoneFrom(phoneFrom)
      .withPhoneTo(phoneTo)
      .withCreatedAt(new Date(now.getTime() - 60 * 60 * 1000))
      .build(),
    
    new MessageBuilder()
      .withId('seq-msg-2')
      .withConversationId(conversationId)
      .withUserId(userId)
      .withContent('Welcome! I\'d be happy to help. What\'s your current fitness level?')
      .asAssistantMessage()
      .withPhoneFrom(phoneTo)
      .withPhoneTo(phoneFrom)
      .withCreatedAt(new Date(now.getTime() - 59 * 60 * 1000))
      .withTwilioMessageSid('SM001')
      .build(),
    
    new MessageBuilder()
      .withId('seq-msg-3')
      .withConversationId(conversationId)
      .withUserId(userId)
      .withContent('I\'m a beginner, haven\'t worked out in years')
      .asUserMessage()
      .withPhoneFrom(phoneFrom)
      .withPhoneTo(phoneTo)
      .withCreatedAt(new Date(now.getTime() - 58 * 60 * 1000))
      .build(),
    
    new MessageBuilder()
      .withId('seq-msg-4')
      .withConversationId(conversationId)
      .withUserId(userId)
      .withContent('No problem! Let\'s start with a beginner-friendly program. How many days per week can you commit to working out?')
      .asAssistantMessage()
      .withPhoneFrom(phoneTo)
      .withPhoneTo(phoneFrom)
      .withCreatedAt(new Date(now.getTime() - 57 * 60 * 1000))
      .withTwilioMessageSid('SM002')
      .build(),
    
    new MessageBuilder()
      .withId('seq-msg-5')
      .withConversationId(conversationId)
      .withUserId(userId)
      .withContent('I can do 3 days a week')
      .asUserMessage()
      .withPhoneFrom(phoneFrom)
      .withPhoneTo(phoneTo)
      .withCreatedAt(new Date(now.getTime() - 56 * 60 * 1000))
      .build(),
  ];
};

export const createMockMessages = (count: number, conversationId?: string, userId?: string): Message[] => {
  const messageTypes = [
    'Hi, I want to start working out',
    'What equipment do I need?',
    'Can you show me proper squat form?',
    'I completed today\'s workout!',
    'I\'m feeling sore, is that normal?',
    'How do I track my progress?',
    'What should I eat before working out?',
    'Can we adjust my workout plan?',
  ];

  const assistantResponses = [
    'Great! Let\'s get started with your fitness journey.',
    'You\'ll need basic equipment like dumbbells and a mat.',
    'Here\'s how to perform a proper squat: [instructions]',
    'Excellent work! How did it feel?',
    'Some soreness is normal, especially when starting out.',
    'I recommend tracking your workouts in a journal.',
    'A light meal 1-2 hours before is ideal.',
    'Of course! What would you like to change?',
  ];

  return Array.from({ length: count }, (_, i) => {
    const isUserMessage = i % 2 === 0;
    const messageIndex = Math.floor(i / 2) % messageTypes.length;
    
    return new MessageBuilder()
      .withId(`msg-${i + 1}`)
      .withConversationId(conversationId || `conv-${Math.ceil((i + 1) / 5)}`)
      .withUserId(userId || `user-${Math.ceil((i + 1) / 10)}`)
      .withContent(isUserMessage ? messageTypes[messageIndex] : assistantResponses[messageIndex])
      .withDirection(isUserMessage ? 'inbound' : 'outbound')
      .withCreatedAt(new Date(Date.now() - (count - i) * 60 * 1000))
      .build();
  });
};

export const createInvalidMessages = () => ({
  emptyContent: {
    userId: 'user-1',
    conversationId: 'conv-1',
    content: '',
    direction: 'inbound' as const,
    phoneFrom: '+1234567890',
    phoneTo: '+0987654321',
  },
  invalidDirection: {
    userId: 'user-1',
    conversationId: 'conv-1',
    content: 'Test message',
    direction: 'invalid' as any,
    phoneFrom: '+1234567890',
    phoneTo: '+0987654321',
  },
  missingPhoneFrom: {
    userId: 'user-1',
    conversationId: 'conv-1',
    content: 'Test message',
    direction: 'inbound' as const,
    phoneTo: '+0987654321',
  },
  tooLongContent: {
    userId: 'user-1',
    conversationId: 'conv-1',
    content: 'x'.repeat(10001),
    direction: 'inbound' as const,
    phoneFrom: '+1234567890',
    phoneTo: '+0987654321',
  },
});