import { describe, it, expect, beforeEach, vi } from 'vitest';
import { callbackRegistry } from '@/server/agents/registry/callbackRegistry';

describe('CallbackRegistry', () => {
  beforeEach(() => {
    callbackRegistry.clear();
  });

  describe('register', () => {
    it('should register a callback', () => {
      callbackRegistry.register({
        name: 'test_callback',
        execute: async () => {},
      });

      expect(callbackRegistry.has('test_callback')).toBe(true);
    });

    it('should throw on duplicate registration', () => {
      const def = { name: 'test_callback', execute: async () => {} };
      callbackRegistry.register(def);
      expect(() => callbackRegistry.register(def)).toThrow('already registered');
    });
  });

  describe('executeCallbacks', () => {
    it('should execute on_success callbacks when succeeded', async () => {
      const executeFn = vi.fn();
      callbackRegistry.register({
        name: 'success_cb',
        execute: executeFn,
      });

      await callbackRegistry.executeCallbacks(
        [{ name: 'success_cb', when: 'on_success' }],
        { agentResult: { response: 'hello' } },
        true
      );

      expect(executeFn).toHaveBeenCalledWith({
        agentResult: { response: 'hello' },
      });
    });

    it('should skip on_success callbacks when failed', async () => {
      const executeFn = vi.fn();
      callbackRegistry.register({
        name: 'success_cb',
        execute: executeFn,
      });

      await callbackRegistry.executeCallbacks(
        [{ name: 'success_cb', when: 'on_success' }],
        { agentResult: null },
        false
      );

      expect(executeFn).not.toHaveBeenCalled();
    });

    it('should execute on_failure callbacks when failed', async () => {
      const executeFn = vi.fn();
      callbackRegistry.register({
        name: 'failure_cb',
        execute: executeFn,
      });

      await callbackRegistry.executeCallbacks(
        [{ name: 'failure_cb', when: 'on_failure' }],
        { agentResult: null },
        false
      );

      expect(executeFn).toHaveBeenCalled();
    });

    it('should execute always callbacks regardless of success', async () => {
      const executeFn = vi.fn();
      callbackRegistry.register({
        name: 'always_cb',
        execute: executeFn,
      });

      await callbackRegistry.executeCallbacks(
        [{ name: 'always_cb', when: 'always' }],
        { agentResult: null },
        false
      );

      expect(executeFn).toHaveBeenCalled();

      executeFn.mockClear();

      await callbackRegistry.executeCallbacks(
        [{ name: 'always_cb', when: 'always' }],
        { agentResult: null },
        true
      );

      expect(executeFn).toHaveBeenCalled();
    });

    it('should default to on_success when when is not specified', async () => {
      const executeFn = vi.fn();
      callbackRegistry.register({
        name: 'default_cb',
        execute: executeFn,
      });

      // No 'when' specified - should default to on_success
      await callbackRegistry.executeCallbacks(
        [{ name: 'default_cb' }],
        { agentResult: null },
        true
      );

      expect(executeFn).toHaveBeenCalled();
    });

    it('should continue executing even if one callback fails', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('boom'));
      const succeedingFn = vi.fn();

      callbackRegistry.register({ name: 'failing', execute: failingFn });
      callbackRegistry.register({ name: 'succeeding', execute: succeedingFn });

      await callbackRegistry.executeCallbacks(
        [
          { name: 'failing', when: 'always' },
          { name: 'succeeding', when: 'always' },
        ],
        { agentResult: null },
        true
      );

      expect(failingFn).toHaveBeenCalled();
      expect(succeedingFn).toHaveBeenCalled();
    });

    it('should skip unregistered callbacks with a warning', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await callbackRegistry.executeCallbacks(
        [{ name: 'nonexistent' }],
        { agentResult: null },
        true
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not registered'),
      );

      consoleSpy.mockRestore();
    });
  });
});
