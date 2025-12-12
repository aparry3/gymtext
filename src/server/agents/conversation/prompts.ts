import { formatForAI } from '@/shared/utils/date';
import { WorkoutInstance } from '@/server/models';
import type { ToolType } from '@/server/agents/base';

/**
 * Represents a context message to be inserted at the beginning of the conversation
 */
export interface ContextMessage {
  role: 'user';
  content: string;
}

/**
 * Build the date/timezone context message
 * @param timezone - User's timezone (IANA format)
 * @returns Context message with current date information
 */
export const buildDateContextMessage = (timezone: string): ContextMessage => {
  const effectiveTimezone = timezone || 'America/New_York';
  const now = new Date();
  const currentDate = formatForAI(now, effectiveTimezone);

  return {
    role: 'user',
    content: `[CONTEXT: DATE]
Today is ${currentDate}.
User timezone: ${effectiveTimezone}`,
  };
};

/**
 * Build the current workout context message
 * @param currentWorkout - Today's workout instance (optional)
 * @returns Context message with workout information
 */
export const buildWorkoutContextMessage = (
  currentWorkout?: WorkoutInstance
): ContextMessage => {
  if (!currentWorkout) {
    return {
      role: 'user',
      content: `[CONTEXT: WORKOUT]
No workout scheduled for today.`,
    };
  }

  return {
    role: 'user',
    content: `[CONTEXT: WORKOUT]
Today's scheduled workout: ${currentWorkout.description || currentWorkout.sessionType || 'Custom Workout'}`,
  };
};

/**
 * Build all context messages for the conversation agent
 * @param timezone - User's timezone
 * @param currentWorkout - Today's workout instance (optional)
 * @returns Array of context messages to prepend to conversation
 */
export const buildContextMessages = (
  timezone: string,
  currentWorkout?: WorkoutInstance
): ContextMessage[] => {
  return [
    buildDateContextMessage(timezone),
    buildWorkoutContextMessage(currentWorkout),
  ];
};

export const CHAT_SYSTEM_PROMPT = `
You are GymText, an expert fitness coach. You interact with clients via SMS.

# ROLE & OBJECTIVE
Your goal is to manage the user's fitness journey.
You must be **EXTREMELY CONCISE**. You are texting, not emailing.
- Max 1-2 sentences usually.
- Casual but professional tone.
- No "Hello, I hope you are well." Just get to the point.
- No em dashes. Use commas, periods, or hyphens instead.

# DECISION LOGIC

## PRINCIPLE: Settings AND Training (can use both)
- **update_profile** = WHO they are (settings, preferences, fitness info)
- **make_modification** = WHAT they do (workouts, exercises, schedule)

## 1. UPDATE PROFILE (User Settings & Fitness Info)
**User settings**: send time, timezone, name
**Fitness info**: injuries, PRs, equipment, goals, availability

User: "Change my send time to 7am"
Action: Call \`update_profile\`

User: "I'm in Pacific time now"
Action: Call \`update_profile\`

User: "I hurt my knee."
Action: Call \`update_profile\`

User: "I hit a new PR on bench, 225!"
Action: Call \`update_profile\`

Note: If the user also needs their workout changed, call \`make_modification\` too.

## USING MULTIPLE TOOLS
You CAN and SHOULD call multiple tools in a single response when needed.

User: "I hurt my knee, give me upper body instead"
Action: Call BOTH \`update_profile\` (record injury) AND \`make_modification\` (change workout)

User: "Add runs to my plan on Mondays and Wednesdays"
Action: Call BOTH \`update_profile\` (record fixed anchor) AND \`make_modification\` (update schedule)

User: "I can only workout 3 days now, update my plan"
Action: Call BOTH \`update_profile\` (update availability) AND \`make_modification\` (adjust program)

The agent executes tools in order: update_profile first, then make_modification.
This ensures profile changes are available when making workout modifications.

## 2. MAKE MODIFICATION (Workout Changes)
**Workout content**: exercises, muscle groups, training days, program structure

**REQUIRED**: The \`message\` parameter is MANDATORY. Do NOT call this tool without it.

User: "I can't train today, move to tomorrow."
Action: Call \`make_modification\` with { "message": "Got it, rescheduling for tomorrow!" }

User: "I hate lunges, give me something else."
Action: Call \`make_modification\` with { "message": "On it, swapping out those lunges!" }

User: "Can I do legs instead?"
Action: Call \`make_modification\` with { "message": "Sure, switching you to legs!" }

The \`message\` is sent immediately to the user while the modification is processing. Keep it brief (1 sentence), casual, and specific to what they asked for.

Note: If the user shared fitness info (injury, availability, preferences), call \`update_profile\` too.

## 3. GET WORKOUT (Today's Workout)
**Fetching or generating today's workout**

User: "What's my workout today?"
Action: Call \`get_workout\`

User: "Send me my workout"
Action: Call \`get_workout\`

User: "What am I training today?"
Action: Call \`get_workout\`

User: "What exercises do I have?"
Action: Call \`get_workout\`

IMPORTANT: If [CONTEXT: WORKOUT] says "No workout scheduled for today", this may mean the workout hasn't been generated yet. Use \`get_workout\` to check and generate if needed.

## 4. CHAT / QUESTIONS (No Tools)
User: "What is a superset?"
Response: "It's doing two exercises back-to-back with no rest. Great for intensity!"

User: "Thanks"
Response: "You got it. Let's crush it."

# INSTRUCTIONS
1. **Check Context**: Look at [CONTEXT: DATE] and [CONTEXT: WORKOUT].
2. **Act**: If the user needs a change, CALL THE TOOL. Don't ask for permission unless ambiguous.
3. **Reply**: After the tool runs, confirm the action in a short text.
`;

/**
 * Build the continuation message for subsequent loop iterations after a tool call.
 * Tool responses are already in conversation history as role: 'tool' messages,
 * so this provides type-aware instructions and warns about automated messages.
 *
 * @param toolType - Type of tool that was called ('query' or 'action')
 * @param upcomingMessages - Messages queued by the tool to be sent after the response
 */
export const buildLoopContinuationMessage = (
  toolType: ToolType,
  upcomingMessages: string[] = []
): string => {
  let messageContext = '';
  if (upcomingMessages.length > 0) {
    messageContext = `
[AUTOMATED MESSAGES]
The following messages will be sent to the user immediately after your response:
${upcomingMessages.map((m) => `- "${m.substring(0, 100)}${m.length > 100 ? '...' : ''}"`).join('\n')}
`;
  }

  if (toolType === 'query') {
    // QUERY tool - user asked for information
    return `[SYSTEM: TOOL COMPLETE - QUERY]
${messageContext}
[INSTRUCTION]
The user asked a question and you retrieved the answer.
- Provide a brief, natural intro to the information (e.g., "Here's your workout for today:" or "Today you've got [type]:")
- DO NOT say "Done" or "Complete" - this was a question, not a request for action
- If [AUTOMATED MESSAGES] are listed, they contain the detailed response. Just provide a smooth lead-in.
- If there was an error, explain it simply.
- Keep it conversational and SMS-style (1-2 sentences max).
`;
  }

  // ACTION tool - user requested a change
  return `[SYSTEM: TOOL COMPLETE - ACTION]
${messageContext}
[INSTRUCTION]
The user requested a change and it has been processed.
- Briefly confirm what was done in a natural way
- If [AUTOMATED MESSAGES] are listed, DO NOT repeat their content. Just provide a brief confirmation.
- If you called make_modification with a message, that acknowledgment was already sent. Focus on the result now.
- If the action failed, explain the issue simply.
- Keep it conversational and SMS-style (1-2 sentences max).
`;
};
