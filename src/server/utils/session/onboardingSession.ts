import type { FitnessProfile } from '@/server/models/userModel';

export interface PendingProfilePatch {
  updates: Partial<FitnessProfile>;
  reason: string;
  confidence: number;
  timestamp: number;
}

export interface UserDraft {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface OnboardingSessionState {
  draft: {
    user: UserDraft;
    profile: Partial<FitnessProfile>;
  };
  pendingPatches: PendingProfilePatch[];
  messages: Message[];
}

// In-memory placeholder store for Phase 4 (can be swapped to Redis/DB later)
const sessionStore = new Map<string, OnboardingSessionState>();

// Constants
const MAX_MESSAGE_HISTORY = 10; // Keep last 10 messages

/**
 * Get or initialize a session state
 */
export function getOrInitSession(tempSessionId: string): OnboardingSessionState {
  let state = sessionStore.get(tempSessionId);
  console.log('state', state)
  if (!state) {
    state = {
      draft: {
        user: {},
        profile: {}
      },
      pendingPatches: [],
      messages: []
    };
    sessionStore.set(tempSessionId, state);
  }
  return state;
}

/**
 * Get session state (backward compatible)
 */
export function getSessionState(tempSessionId: string): OnboardingSessionState {
  return getOrInitSession(tempSessionId);
}

/**
 * Add a pending profile patch
 */
export function addPendingPatch(tempSessionId: string, patch: PendingProfilePatch): void {
  const state = getOrInitSession(tempSessionId);
  state.pendingPatches.push(patch);
}

/**
 * Clear all pending patches
 */
export function clearPendingPatches(tempSessionId: string): void {
  const state = getOrInitSession(tempSessionId);
  state.pendingPatches = [];
}

/**
 * Append a message to the conversation history with rolling buffer
 */
export function appendMessage(tempSessionId: string, role: 'user' | 'assistant', content: string): void {
  const state = getOrInitSession(tempSessionId);
  state.messages.push({
    role,
    content,
    ts: Date.now()
  });
  
  // Keep only the last MAX_MESSAGE_HISTORY messages
  if (state.messages.length > MAX_MESSAGE_HISTORY) {
    state.messages = state.messages.slice(-MAX_MESSAGE_HISTORY);
  }
}

/**
 * Get recent conversation history
 */
export function getRecentMessages(tempSessionId: string, limit: number = 5): Message[] {
  const state = getOrInitSession(tempSessionId);
  return state.messages.slice(-limit);
}

/**
 * Apply intercepted user draft updates
 */
export function applyInterceptedUserDraft(tempSessionId: string, updates: Partial<UserDraft>): void {
  const state = getOrInitSession(tempSessionId);
  Object.assign(state.draft.user, updates);
}

/**
 * Apply intercepted profile draft updates
 */
export function applyInterceptedProfileDraft(tempSessionId: string, updates: Partial<FitnessProfile>): void {
  const state = getOrInitSession(tempSessionId);
  Object.assign(state.draft.profile, updates);
}

/**
 * Project a user object with session draft for unauth flows
 */
export function projectUser(baseUser: { name?: string; email?: string; phoneNumber?: string } | null, tempSessionId: string): { name?: string; email?: string; phoneNumber?: string } {
  const state = getOrInitSession(tempSessionId);
  
  // For unauth, draft is the source of truth
  if (!baseUser) {
    return { ...state.draft.user };
  }
  
  // For auth, merge with priority to DB values
  return {
    name: baseUser.name || state.draft.user.name,
    email: baseUser.email || state.draft.user.email,
    phoneNumber: baseUser.phoneNumber || state.draft.user.phoneNumber
  };
}

/**
 * Project a fitness profile with session draft and pending patches
 * Priority: pendingPatches > draft.profile > base
 */
export function projectProfile(base: FitnessProfile | null, tempSessionId: string): FitnessProfile | null {
  const state = getOrInitSession(tempSessionId);
  
  // Start with base or empty object
  let merged: FitnessProfile = { ...(base || {}) };
  
  // Apply draft profile (lower priority)
  if (state.draft.profile) {
    merged = { ...merged, ...state.draft.profile };
  }
  
  // Apply pending patches (higher priority)
  for (const patch of state.pendingPatches) {
    merged = { ...merged, ...patch.updates };
  }
  
  // Return null if nothing was added
  if (!base && Object.keys(merged).length === 0) {
    return null;
  }
  
  return merged;
}

/**
 * Clear entire session
 */
export function clearSession(tempSessionId: string): void {
  sessionStore.delete(tempSessionId);
}

/**
 * Get full session state (for debugging/testing)
 */
export function getFullSessionState(tempSessionId: string): OnboardingSessionState | undefined {
  return sessionStore.get(tempSessionId);
}