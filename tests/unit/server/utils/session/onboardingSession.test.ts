import { describe, it, expect, beforeEach } from 'vitest';

import {
  getOrInitSession,
  getSessionState,
  addPendingPatch,
  clearPendingPatches,
  appendMessage,
  getRecentMessages,
  applyInterceptedUserDraft,
  applyInterceptedProfileDraft,
  projectProfile,
  projectUser,
  clearSession,
  getFullSessionState,
  type PendingProfilePatch,
} from '@/server/utils/session/onboardingSession';

import type { FitnessProfile } from '@/server/models/userModel';

function uniqueSessionId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe('onboardingSession utils', () => {
  let sessionId: string;

  beforeEach(() => {
    sessionId = uniqueSessionId();
    // Ensure clean slate
    clearSession(sessionId);
  });

  it('initializes a new session with empty draft, patches, and messages', () => {
    const state = getOrInitSession(sessionId);
    expect(state.draft.user).toBeTruthy();
    expect(state.draft.profile).toBeTruthy();
    expect(Array.isArray(state.pendingPatches)).toBe(true);
    expect(state.pendingPatches.length).toBe(0);
    expect(Array.isArray(state.messages)).toBe(true);
    expect(state.messages.length).toBe(0);
  });

  it('appends messages and enforces rolling buffer of last 10 messages', () => {
    // Add 15 messages alternating roles
    for (let i = 0; i < 15; i++) {
      appendMessage(sessionId, i % 2 === 0 ? 'user' : 'assistant', `msg-${i}`);
    }

    const state = getSessionState(sessionId);
    expect(state.messages.length).toBe(10);
    // Should keep last 10: msgs 5..14
    const contents = state.messages.map(m => m.content);
    expect(contents[0]).toBe('msg-5');
    expect(contents[9]).toBe('msg-14');

    // getRecentMessages default (5)
    const recent = getRecentMessages(sessionId);
    expect(recent.length).toBe(5);
    expect(recent.map(m => m.content)).toEqual(['msg-10', 'msg-11', 'msg-12', 'msg-13', 'msg-14']);

    // getRecentMessages with explicit limit
    const recent3 = getRecentMessages(sessionId, 3);
    expect(recent3.map(m => m.content)).toEqual(['msg-12', 'msg-13', 'msg-14']);
  });

  it('merges intercepted user and profile drafts', () => {
    applyInterceptedUserDraft(sessionId, { name: 'Alice' });
    applyInterceptedUserDraft(sessionId, { email: 'alice@example.com' });
    applyInterceptedProfileDraft(sessionId, { primaryGoal: 'muscle_gain' } as Partial<FitnessProfile>);

    const state = getSessionState(sessionId);
    expect(state.draft.user.name).toBe('Alice');
    expect(state.draft.user.email).toBe('alice@example.com');
    expect((state.draft.profile as any).primaryGoal).toBe('muscle_gain');
  });

  it('projectUser returns draft when base is null (unauth)', () => {
    applyInterceptedUserDraft(sessionId, { name: 'Unauth User', email: 'u@example.com', phoneNumber: '+15555550123' });
    const projected = projectUser(null, sessionId);
    expect(projected).toEqual({ name: 'Unauth User', email: 'u@example.com', phoneNumber: '+15555550123' });
  });

  it('projectUser prefers base user values when present (auth)', () => {
    applyInterceptedUserDraft(sessionId, { name: 'Draft Name', email: 'draft@example.com', phoneNumber: '+10000000000' });
    const base = { name: 'DB Name', email: null, phoneNumber: '+19999999999' };
    const projected = projectUser(base, sessionId);
    // name from DB, email falls back to draft, phone from DB
    expect(projected).toEqual({ name: 'DB Name', email: 'draft@example.com', phoneNumber: '+19999999999' });
  });

  it('projectProfile merges in correct precedence: base < draft.profile < pendingPatches', () => {
    const base: FitnessProfile = {
      // Using loose typing; cast to satisfy TS if needed
    } as unknown as FitnessProfile;

    // draft.profile sets weight=150, height=170
    applyInterceptedProfileDraft(sessionId, { weight: 150, height: 170 } as Partial<FitnessProfile>);

    // pending patch overrides weight and adds primaryGoal
    const patch: PendingProfilePatch = {
      updates: { weight: 155, primaryGoal: 'fat_loss' } as Partial<FitnessProfile>,
      reason: 'user stated new weight and goal',
      confidence: 0.9,
      timestamp: Date.now(),
    };
    addPendingPatch(sessionId, patch);

    const projected = projectProfile(base, sessionId) as any;
    expect(projected.height).toBe(170);
    expect(projected.weight).toBe(155); // overridden by pending patch
    expect(projected.primaryGoal).toBe('fat_loss');
  });

  it('projectProfile returns null when no base and no session data', () => {
    const projected = projectProfile(null, sessionId);
    expect(projected).toBeNull();
  });

  it('clearPendingPatches empties pendingPatches', () => {
    const patch: PendingProfilePatch = {
      updates: { primaryGoal: 'endurance' } as Partial<FitnessProfile>,
      reason: 'test',
      confidence: 0.8,
      timestamp: Date.now(),
    };
    addPendingPatch(sessionId, patch);
    let state = getSessionState(sessionId);
    expect(state.pendingPatches.length).toBe(1);

    clearPendingPatches(sessionId);
    state = getSessionState(sessionId);
    expect(state.pendingPatches.length).toBe(0);
  });

  it('clearSession removes entire session state', () => {
    getOrInitSession(sessionId);
    expect(getFullSessionState(sessionId)).toBeDefined();
    clearSession(sessionId);
    expect(getFullSessionState(sessionId)).toBeUndefined();
  });
});
