/**
 * WhatsApp Reaction Handler
 *
 * Handles the "React with 👍 when you finish" workout completion flow.
 *
 * Emoji → Sentiment mapping:
 *   👍 → completed
 *   ❤️ → loved
 *   💪 → tough_but_done
 *   😅 → struggled
 *   🔥 → crushed_it
 *
 * When a user reacts to a workout message:
 *   1. Look up which workout the reacted message corresponds to
 *   2. Mark the workout as completed (if 👍/💪/🔥/❤️)
 *   3. Log the sentiment for future programming adjustments
 *   4. Open/refresh the 24-hour messaging window
 *   5. Send a free-form acknowledgment (within the now-open window)
 */

import axios from 'axios';

// ---------------------------------------------------------------------------
// Emoji → Sentiment mapping
// ---------------------------------------------------------------------------

export type WorkoutSentiment =
  | 'completed'
  | 'loved'
  | 'tough_but_done'
  | 'struggled'
  | 'crushed_it';

const EMOJI_SENTIMENT_MAP: Record<string, WorkoutSentiment> = {
  '👍': 'completed',
  '❤️': 'loved',
  '💪': 'tough_but_done',
  '😅': 'struggled',
  '🔥': 'crushed_it',
};

/** Emojis that count as workout completion */
const COMPLETION_EMOJIS = new Set(['👍', '💪', '🔥', '❤️']);

export function isCompletionEmoji(emoji: string): boolean {
  return COMPLETION_EMOJIS.has(emoji);
}

export function getSentiment(emoji: string): WorkoutSentiment | null {
  return EMOJI_SENTIMENT_MAP[emoji] ?? null;
}

// ---------------------------------------------------------------------------
// Acknowledgment messages (randomly selected for variety)
// ---------------------------------------------------------------------------

const COMPLETION_MESSAGES: Record<WorkoutSentiment, string[]> = {
  completed: [
    'Great work! 💪 See you tomorrow.',
    'Solid session! Recovery starts now. 🛌',
    'Done and dusted! Nice one. ✅',
  ],
  loved: [
    "Love to hear it! ❤️ Let's keep that energy going.",
    'Glad you enjoyed it! More where that came from. 🔥',
  ],
  tough_but_done: [
    'Tough sessions build tough athletes. Respect. 💪',
    'The hard ones matter most. Great job pushing through!',
  ],
  struggled: [
    "Showed up and that's what counts. We'll dial it in. 👊",
    "Thanks for the feedback — I'll adjust. Recovery time! 😌",
  ],
  crushed_it: [
    'Absolutely crushed it! 🔥🔥🔥',
    "Beast mode! You're on fire. 💥",
  ],
};

export function getAcknowledgmentMessage(sentiment: WorkoutSentiment): string {
  const messages = COMPLETION_MESSAGES[sentiment];
  return messages[Math.floor(Math.random() * messages.length)];
}

// ---------------------------------------------------------------------------
// Send a reaction from the business account back to the user
// ---------------------------------------------------------------------------

export async function sendBusinessReaction(
  recipientPhone: string,
  targetMessageId: string,
  emoji: string,
  config: { phoneNumberId: string; accessToken: string; apiVersion: string }
): Promise<void> {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'reaction',
      reaction: {
        message_id: targetMessageId,
        emoji,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
