import { describe, it, expect } from 'vitest';

// Lightweight smoke test for the onboarding SSE route handler shape
// We don't execute Next.js runtime here; just ensure the module exports POST

describe('API: /api/chat/onboarding route', () => {
  it('should export POST handler', async () => {
    const mod = await import('@/app/api/chat/onboarding/route');
    expect(typeof mod.POST).toBe('function');
  });
});
