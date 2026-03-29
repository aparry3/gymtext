import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitState } from '../circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      monitoringPeriod: 1000,
    });
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should have zero failure count', () => {
      const stats = breaker.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
    });
  });

  describe('CLOSED state', () => {
    it('should execute function normally', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reset failure count on success', async () => {
      // Cause some failures (but not enough to open)
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}

      expect(breaker.getStats().failureCount).toBe(2);

      // Success resets
      await breaker.execute(async () => 'ok');
      expect(breaker.getStats().failureCount).toBe(0);
    });

    it('should propagate errors', async () => {
      await expect(
        breaker.execute(async () => { throw new Error('db timeout'); })
      ).rejects.toThrow('db timeout');
    });
  });

  describe('transition to OPEN', () => {
    it('should open after reaching failure threshold', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => { throw new Error(`fail ${i}`); });
        } catch {}
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should not open before reaching threshold', async () => {
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch {}
      }

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('OPEN state', () => {
    beforeEach(async () => {
      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch {}
      }
    });

    it('should return null without executing', async () => {
      const fn = vi.fn().mockResolvedValue('should not run');
      const result = await breaker.execute(fn);
      expect(result).toBeNull();
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('HALF_OPEN state', () => {
    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Use short timeout
      breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 1000,
      });

      // Trip the breaker
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}
      expect(breaker.getState()).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await new Promise(r => setTimeout(r, 60));

      // Next execute should try (HALF_OPEN)
      const result = await breaker.execute(async () => 'recovered');
      expect(result).toBe('recovered');
    });

    it('should return to OPEN on failure in HALF_OPEN', async () => {
      breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 1000,
      });

      // Trip the breaker
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}

      // Wait for reset
      await new Promise(r => setTimeout(r, 60));

      // Fail in HALF_OPEN → back to OPEN
      try {
        await breaker.execute(async () => { throw new Error('still broken'); });
      } catch {}

      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should close after 3 consecutive successes in HALF_OPEN', async () => {
      breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 1000,
      });

      // Trip
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}
      try { await breaker.execute(async () => { throw new Error('fail'); }); } catch {}

      // Wait for reset
      await new Promise(r => setTimeout(r, 60));

      // 3 successes needed to close
      await breaker.execute(async () => 'ok1');
      expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

      await breaker.execute(async () => 'ok2');
      expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

      await breaker.execute(async () => 'ok3');
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });
});
