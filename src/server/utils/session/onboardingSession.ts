import type { FitnessProfile } from '@/server/models/userModel';

export interface PendingProfilePatch {
  updates: Partial<FitnessProfile>;
  reason: string;
  confidence: number;
  timestamp: number;
}

export interface OnboardingSessionState {
  pendingPatches: PendingProfilePatch[];
}

// In-memory placeholder store for Phase 4 (can be swapped to Redis/DB later)
const sessionStore = new Map<string, OnboardingSessionState>();

export function getSessionState(tempSessionId: string): OnboardingSessionState {
  let state = sessionStore.get(tempSessionId);
  if (!state) {
    state = { pendingPatches: [] };
    sessionStore.set(tempSessionId, state);
  }
  return state;
}

export function addPendingPatch(tempSessionId: string, patch: PendingProfilePatch): void {
  const state = getSessionState(tempSessionId);
  state.pendingPatches.push(patch);
}

export function clearPendingPatches(tempSessionId: string): void {
  const state = getSessionState(tempSessionId);
  state.pendingPatches = [];
}

export function projectProfile(base: FitnessProfile | null, tempSessionId: string): FitnessProfile | null {
  const state = getSessionState(tempSessionId);
  if (!base && state.pendingPatches.length === 0) return base;
  const merged: FitnessProfile = { ...(base || {}) };
  for (const p of state.pendingPatches) {
    Object.assign(merged, p.updates);
  }
  return merged;
}
