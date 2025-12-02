# Handling Rapid-Fire Messages (Debounce Strategy)

## The Problem
Users often send multiple texts in bursts:
1. "Can I change my workout?"
2. "My knee hurts."
3. "Actually just give me a rest day."

If we process these 1-by-1 sequentially:
- Job 1 sees "Can I change my workout?" -> Changes workout -> Replies.
- Job 2 sees "My knee hurts." -> Updates profile -> Replies.
- Job 3 sees "Actually just give me a rest day." -> Cancels workout -> Replies.

This is wasteful (3 LLM calls) and spams the user (3 replies).

## The Solution: Debounce + Batch Processing

We want to **wait** for the burst to finish, then process **all** pending messages in a single context.

### Architecture: Inngest Debounce

Inngest provides a `debounce` feature. However, standard debounce just *delays* execution. We need to ensure that when the function *does* run, it processes **all messages** that arrived during the debounce window, not just the one that triggered the event.

**Configuration:**
- **Debounce Period:** `10s` (Wait 10 seconds after the last event).
- **Key:** `event.data.userId` (Debounce per user).

### The Logic Flow

1.  **User sends Message 1.**
    *   Webhook stores Message 1 in DB.
    *   Webhook sends `message/received` (Event A).
    *   Inngest receives Event A. Starts 10s timer.

2.  **User sends Message 2 (2 seconds later).**
    *   Webhook stores Message 2 in DB.
    *   Webhook sends `message/received` (Event B).
    *   Inngest sees Event B for same user. **Cancels Event A's timer.** Starts new 10s timer.

3.  **Timer Expires (10s after Message 2).**
    *   Inngest executes **once** for Event B.

4.  **Execution Logic (`processMessage`):**
    *   The handler starts.
    *   It ignores `event.data.content` (which only contains Message 2).
    *   **Critical Step:** It calls `MessageService.getPendingMessages(userId)`.
        *   This fetches *all* messages from the user that haven't been "processed" or responded to yet (Message 1 + Message 2).
    *   It constructs a single `userMessage` block containing both texts.
    *   It invokes `ChatAgent` once.
    *   `ChatAgent` sees: "Can I change my workout? My knee hurts. Actually just give me a rest day."
    *   Agent decides: "Update profile (knee injury) -> Set Rest Day."
    *   One single coherent reply: "Got it. I've logged the knee injury. Taking a rest day today is a smart move—enjoy the recovery!"

### Implementation Requirements

1.  **Inngest Config:**
    ```typescript
    {
      debounce: { period: '10s', key: 'event.data.userId' }
    }
    ```

2.  **Message Service:**
    *   Need a way to identify "unprocessed" messages.
    *   Currently, we just rely on `getRecentMessages`.
    *   **Strategy:** `ChatService` already fetches "recent messages".
    *   We just need to ensure we filter out messages that the bot *has already replied to*.
    *   The `ConversationFlowBuilder` likely already does this, or we just grab the last `N` messages where `direction = 'inbound'` that are *newer* than the last `outbound` message.

3.  **Prompting:**
    *   The Agent prompt needs to handle multi-line input (it already does).

## Updated Plan Tasks
- [ ] **Inngest:** Add `debounce` config to `processMessage`.
- [ ] **ChatService:** Ensure `handleIncomingMessage` logic aggregates *all* recent unanswered user messages into the prompt, rather than just taking the single `message` string passed as an argument.
