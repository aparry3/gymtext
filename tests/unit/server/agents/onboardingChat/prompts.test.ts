import { describe, it, expect } from 'vitest';
import { buildOnboardingChatSystemPrompt } from '@/server/agents/onboardingChat/prompts';
import type { FitnessProfile } from '@/server/models/userModel';

describe('buildOnboardingChatSystemPrompt', () => {
  it('mentions essentials when pending', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'email']);
    expect(prompt).toContain('Essentials missing: name, email');
  });

  it('mentions essentials complete when none pending', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    expect(prompt).toContain('Essentials complete');
  });

  it('does not include per-field confirmation language', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'email']);
    
    // Should NOT contain these confirmation patterns
    expect(prompt.toLowerCase()).not.toContain('confirm your');
    expect(prompt.toLowerCase()).not.toContain('confirm it');
    expect(prompt.toLowerCase()).not.toContain('briefly confirm');
    expect(prompt.toLowerCase()).not.toContain('when a user provides an essential');
    
    // Should contain guidance to NOT confirm
    expect(prompt).toContain('Do not confirm each item');
    expect(prompt).toContain('accept them and continue without confirmation');
  });

  it('includes summary guidance for when essentials are complete', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    
    // Should include summary guidance
    expect(prompt).toContain('Once essentials are complete, send ONE friendly summary');
    expect(prompt).toContain('Fantastic! I\'ve got what I need');
    expect(prompt).toContain('Let me know if I missed anything');
  });

  it('encourages batching of questions', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'email', 'phone']);
    
    // Should encourage batching
    expect(prompt).toContain('Ask for 2–3 missing essentials together when natural');
    expect(prompt).toContain('Batch logically');
    expect(prompt).toContain('one question or a small batch per turn');
    
    // Should NOT enforce single questions
    expect(prompt.toLowerCase()).not.toContain('one focused question at a time');
    expect(prompt.toLowerCase()).not.toContain('one clear question per message');
  });

  it('includes profile summary when profile exists', () => {
    const mockProfile: Partial<FitnessProfile> = {
      primaryGoal: 'Build muscle',
      experienceLevel: 'Intermediate',
      availability: { daysPerWeek: 4 },
      equipment: { access: 'Full gym' }
    };
    
    const prompt = buildOnboardingChatSystemPrompt(mockProfile as FitnessProfile, []);
    
    expect(prompt).toContain('Primary Goal: Build muscle');
    expect(prompt).toContain('Experience: Intermediate');
    expect(prompt).toContain('Availability: 4');
    expect(prompt).toContain('Equipment: Full gym');
  });

  it('shows "No profile yet" when profile is null', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name']);
    expect(prompt).toContain('No profile yet');
  });

  it('maintains concise response guidance', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    expect(prompt).toContain('Keep replies under ~120 words');
  });

  it('emphasizes human and conversational tone', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    
    expect(prompt).toContain('Be warm, clear, and efficient');
    expect(prompt).toContain('Conversational and human');
    expect(prompt).toContain('Avoid robotic phrasing and redundant confirmations');
  });

  it('handles all pending required fields', () => {
    const allPending: Array<'name' | 'email' | 'phone' | 'primaryGoal'> = 
      ['name', 'email', 'phone', 'primaryGoal'];
    const prompt = buildOnboardingChatSystemPrompt(null, allPending);
    
    expect(prompt).toContain('Essentials missing: name, email, phone, primaryGoal');
  });

  it('provides clear behavior instructions for multiple details', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'email']);
    
    expect(prompt).toContain('If the user provides multiple details, accept them and continue without confirmation');
  });
});