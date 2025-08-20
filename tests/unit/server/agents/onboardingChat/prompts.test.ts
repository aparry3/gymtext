import { describe, it, expect } from 'vitest';
import { buildOnboardingChatSystemPrompt } from '@/server/agents/onboardingChat/prompts';

describe('buildOnboardingChatSystemPrompt', () => {
  it('mentions essentials when pending', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'email']);
    expect(prompt).toContain('Essentials missing: name, email');
  });

  it('mentions essentials complete when none pending', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    expect(prompt).toContain('Essentials complete');
  });
});
