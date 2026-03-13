/**
 * WhatsApp 24-Hour Messaging Window Manager
 *
 * Tracks when users interact (reply, react, click buttons) to open free-form
 * messaging windows. Within 24 hours of the last user interaction, we can send
 * free-form messages (no template needed, no per-message cost).
 *
 * This is critical for cost optimization:
 *   - Template messages: ~$0.006/msg
 *   - Free-form within window: FREE
 *
 * At 30% reply rate with 10K users, this saves ~$6,600/year.
 */

import type { MessagingWindow } from './types';

const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * In-memory window store.
 *
 * For production, this should be backed by Redis or a DB table.
 * Using in-memory Map for now to keep the initial implementation simple.
 *
 * TODO: Migrate to Redis/DB for multi-instance support.
 */
const windowStore = new Map<string, MessagingWindow>();

/**
 * Record that a user interacted, opening (or refreshing) their 24-hour window.
 */
export function openMessagingWindow(
  userId: string,
  phone: string,
  trigger: MessagingWindow['trigger']
): MessagingWindow {
  const now = new Date();
  const window: MessagingWindow = {
    userId,
    phone,
    openedAt: now,
    expiresAt: new Date(now.getTime() + WINDOW_DURATION_MS),
    trigger,
  };

  windowStore.set(userId, window);

  console.log(
    `[MessagingWindow] Opened for user ${userId} (${trigger}), expires ${window.expiresAt.toISOString()}`
  );

  return window;
}

/**
 * Check whether a user currently has an open messaging window.
 */
export function hasOpenWindow(userId: string): boolean {
  const window = windowStore.get(userId);
  if (!window) return false;
  if (new Date() > window.expiresAt) {
    // Expired — clean up
    windowStore.delete(userId);
    return false;
  }
  return true;
}

/**
 * Get the current window for a user (if still active).
 */
export function getWindow(userId: string): MessagingWindow | null {
  const window = windowStore.get(userId);
  if (!window) return null;
  if (new Date() > window.expiresAt) {
    windowStore.delete(userId);
    return null;
  }
  return window;
}

/**
 * Close/invalidate a user's messaging window.
 */
export function closeWindow(userId: string): void {
  windowStore.delete(userId);
}

/**
 * Get count of currently-open windows (for monitoring).
 */
export function getOpenWindowCount(): number {
  const now = new Date();
  let count = 0;
  for (const [userId, window] of windowStore) {
    if (now > window.expiresAt) {
      windowStore.delete(userId);
    } else {
      count++;
    }
  }
  return count;
}
