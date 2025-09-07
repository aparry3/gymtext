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
    expect(prompt).toContain('accept them and continue without confirmation');
  });

  it('includes summary guidance for when essentials are complete', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, []);
    
    // Should include behavior guidance about summaries
    expect(prompt).toContain('ONLY provide a comprehensive summary when essentials are complete AND you\'re ready to move to the next phase');
    expect(prompt).toContain('Do NOT summarize all captured information after every user response');
  });

  it('encourages batching of questions', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'phone', 'timezone']);
    
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
    
    // Should include profile information in the rich summary format
    expect(prompt).toContain('Build muscle'); 
    expect(prompt).toContain('Intermediate');
    expect(prompt).toContain('4 days/week');
    expect(prompt).toContain('Full gym');
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
    const allPending: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal'> = 
      ['name', 'phone', 'timezone', 'preferredSendHour', 'primaryGoal'];
    const prompt = buildOnboardingChatSystemPrompt(null, allPending);
    
    expect(prompt).toContain('Essentials missing: name, phone, timezone, preferredSendHour, primaryGoal');
  });

  it('provides clear behavior instructions for multiple details', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['name', 'timezone']);
    
    expect(prompt).toContain('If the user provides multiple details, accept them and continue without confirmation');
  });

  it('includes scheduling information collection guidance', () => {
    const prompt = buildOnboardingChatSystemPrompt(null, ['timezone', 'preferredSendHour']);
    
    // Should include scheduling guidance
    expect(prompt).toContain('SCHEDULING INFORMATION COLLECTION:');
    expect(prompt).toContain('Ask about timezone when collecting contact info');
    expect(prompt).toContain('What timezone are you in?');
    expect(prompt).toContain('What time of day works best for you to receive your workout?');
    expect(prompt).toContain('Most people prefer morning workouts around 8 AM');
    expect(prompt).toContain('This helps us send your workout at the perfect time in your local timezone');
  });
});