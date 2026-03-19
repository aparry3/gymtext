import { describe, it, expect } from 'vitest';
import { ConversationFlowBuilder } from '../flows/conversationFlowBuilder';
import type { Message } from '../../models/conversation';

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    userId: 'user-1',
    content: 'Hello there!',
    direction: 'inbound',
    createdAt: new Date('2026-03-19T09:00:00Z'),
    ...overrides,
  } as Message;
}

describe('ConversationFlowBuilder', () => {
  // ===========================================================================
  // Instance methods
  // ===========================================================================
  describe('addMessage', () => {
    it('should add a single message', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage(makeMessage());
      expect(flow.length).toBe(1);
    });

    it('should add an array of messages', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ id: 'msg-1' }),
        makeMessage({ id: 'msg-2' }),
        makeMessage({ id: 'msg-3' }),
      ]);
      expect(flow.length).toBe(3);
    });

    it('should accumulate messages across calls', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage(makeMessage({ id: 'msg-1' }));
      flow.addMessage(makeMessage({ id: 'msg-2' }));
      expect(flow.length).toBe(2);
    });
  });

  describe('getRecentMessages', () => {
    it('should return all messages when no limit', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ id: 'msg-1', content: 'First' }),
        makeMessage({ id: 'msg-2', content: 'Second' }),
        makeMessage({ id: 'msg-3', content: 'Third' }),
      ]);

      const messages = flow.getRecentMessages();
      expect(messages).toHaveLength(3);
    });

    it('should return limited messages (most recent)', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ id: 'msg-1', content: 'First' }),
        makeMessage({ id: 'msg-2', content: 'Second' }),
        makeMessage({ id: 'msg-3', content: 'Third' }),
      ]);

      const messages = flow.getRecentMessages(2);
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Second');
      expect(messages[1].content).toBe('Third');
    });

    it('should return a copy (not mutate internal state)', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage(makeMessage());

      const messages = flow.getRecentMessages();
      messages.push(makeMessage({ id: 'extra' }));

      expect(flow.length).toBe(1); // Internal state unchanged
    });
  });

  describe('toArray', () => {
    it('should convert inbound messages to user role', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage(makeMessage({ direction: 'inbound', content: 'Hi!' }));

      const result = flow.toArray();
      expect(result).toEqual([{ role: 'user', content: 'Hi!' }]);
    });

    it('should convert outbound messages to assistant role', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage(makeMessage({ direction: 'outbound', content: 'Hello!' }));

      const result = flow.toArray();
      expect(result).toEqual([{ role: 'assistant', content: 'Hello!' }]);
    });

    it('should respect limit parameter', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ direction: 'inbound', content: 'First' }),
        makeMessage({ direction: 'outbound', content: 'Second' }),
        makeMessage({ direction: 'inbound', content: 'Third' }),
      ]);

      const result = flow.toArray(1);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Third');
    });
  });

  describe('toString', () => {
    it('should format as User/Assistant conversation', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ direction: 'inbound', content: 'What should I do today?' }),
        makeMessage({ direction: 'outbound', content: 'Let\'s do squats!' }),
      ]);

      const result = flow.toString();
      expect(result).toBe(
        'User: What should I do today?\n\nAssistant: Let\'s do squats!'
      );
    });

    it('should respect limit parameter', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([
        makeMessage({ direction: 'inbound', content: 'First' }),
        makeMessage({ direction: 'outbound', content: 'Second' }),
        makeMessage({ direction: 'inbound', content: 'Third' }),
      ]);

      const result = flow.toString(1);
      expect(result).toBe('User: Third');
    });
  });

  describe('clear', () => {
    it('should remove all messages', () => {
      const flow = new ConversationFlowBuilder();
      flow.addMessage([makeMessage(), makeMessage()]);
      expect(flow.length).toBe(2);

      flow.clear();
      expect(flow.length).toBe(0);
      expect(flow.getRecentMessages()).toEqual([]);
    });
  });

  // ===========================================================================
  // Static methods
  // ===========================================================================
  describe('toMessageArray (static)', () => {
    it('should convert Message array to role/content format', () => {
      const messages = [
        makeMessage({ direction: 'inbound', content: 'Hey' }),
        makeMessage({ direction: 'outbound', content: 'Hello!' }),
      ];

      const result = ConversationFlowBuilder.toMessageArray(messages);
      expect(result).toEqual([
        { role: 'user', content: 'Hey' },
        { role: 'assistant', content: 'Hello!' },
      ]);
    });

    it('should handle empty array', () => {
      expect(ConversationFlowBuilder.toMessageArray([])).toEqual([]);
    });
  });

  describe('filterMessagesForContext (static)', () => {
    it('should remove last message if inbound (duplicate of current)', () => {
      const messages = [
        makeMessage({ direction: 'outbound', content: 'Previous reply' }),
        makeMessage({ direction: 'inbound', content: 'Current message being processed' }),
      ];

      const result = ConversationFlowBuilder.filterMessagesForContext(messages);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Previous reply');
    });

    it('should keep last message if outbound (reply agent context)', () => {
      const messages = [
        makeMessage({ direction: 'inbound', content: 'User question' }),
        makeMessage({ direction: 'outbound', content: 'Reply agent acknowledgment' }),
      ];

      const result = ConversationFlowBuilder.filterMessagesForContext(messages);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for empty input', () => {
      expect(ConversationFlowBuilder.filterMessagesForContext([])).toEqual([]);
    });

    it('should return empty array for null/undefined input', () => {
      expect(ConversationFlowBuilder.filterMessagesForContext(null as any)).toEqual([]);
    });
  });
});
