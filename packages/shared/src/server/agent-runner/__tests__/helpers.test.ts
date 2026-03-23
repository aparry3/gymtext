import { describe, it, expect } from 'vitest';
import { fitnessContextId, chatSessionId } from '../helpers.js';

describe('helpers', () => {
  describe('fitnessContextId', () => {
    it('should generate correct context ID', () => {
      expect(fitnessContextId('user-123')).toBe('users/user-123/fitness');
    });

    it('should handle different user ID formats', () => {
      expect(fitnessContextId('abc')).toBe('users/abc/fitness');
      expect(fitnessContextId('00000000-0000-0000-0000-000000000001'))
        .toBe('users/00000000-0000-0000-0000-000000000001/fitness');
    });
  });

  describe('chatSessionId', () => {
    it('should generate correct session ID', () => {
      expect(chatSessionId('user-123')).toBe('chat:user-123');
    });
  });
});
