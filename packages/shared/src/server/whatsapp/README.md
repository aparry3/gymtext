# WhatsApp Business Cloud API Integration

## Overview

Direct integration with Meta's WhatsApp Business Cloud API for gymtext workout delivery.
Uses utility template messages (~$0.006/msg) instead of marketing (~$0.03/msg).

## Architecture

```
packages/shared/src/server/whatsapp/
├── index.ts            # Public API exports
├── types.ts            # TypeScript types for webhooks and events
├── templates.ts        # 6 template definitions + submission/send payload builders
├── templateSender.ts   # High-level template & free-form message sending
├── webhookParser.ts    # Parses raw webhook JSON into typed events
├── messagingWindow.ts  # 24-hour free messaging window tracker
├── reactions.ts        # Reaction → sentiment mapping + acknowledgments
├── scripts/
│   ├── submitTemplates.ts  # CLI to submit templates to Meta API
│   └── exportTemplates.ts  # Export templates as JSON files
└── README.md

apps/web/src/app/api/whatsapp-cloud/webhook/route.ts  # Webhook handler
```

## Environment Variables

```bash
# Required
WHATSAPP_PHONE_NUMBER_ID=102934567890123
WHATSAPP_BUSINESS_ACCOUNT_ID=108765432109876
WHATSAPP_ACCESS_TOKEN=EAAx...permanent_system_user_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_string
WHATSAPP_ENABLED=true

# Optional (defaults shown)
WHATSAPP_API_VERSION=v23.0

# Template name overrides (default to template definition names)
WHATSAPP_TEMPLATE_DAILY_WORKOUT=daily_workout_ready_v1
WHATSAPP_TEMPLATE_DAILY_WORKOUT_EVENING=daily_workout_ready_evening_v1
WHATSAPP_TEMPLATE_REST_DAY=rest_day_notification_v1
WHATSAPP_TEMPLATE_WELCOME=first_workout_welcome_v1
WHATSAPP_TEMPLATE_STREAK_MILESTONE=workout_streak_milestone_v1
WHATSAPP_TEMPLATE_REENGAGEMENT=workout_reengagement_v1
```

## Templates (6 total)

| # | Name | Category | Use Case |
|---|------|----------|----------|
| 1 | `daily_workout_ready_v1` | UTILITY | Morning workout delivery |
| 2 | `daily_workout_ready_evening_v1` | UTILITY | Evening workout delivery |
| 3 | `workout_streak_milestone_v1` | UTILITY | 7/14/30/100-day streaks |
| 4 | `rest_day_notification_v1` | UTILITY | Rest day with recovery tips |
| 5 | `first_workout_welcome_v1` | UTILITY | New user onboarding |
| 6 | `workout_reengagement_v1` | UTILITY | Lapsed user (7+ days) |

### Submitting Templates

```bash
# Preview payloads (dry run)
npx tsx packages/shared/src/server/whatsapp/scripts/submitTemplates.ts --dry-run

# Submit all to Meta
npx tsx packages/shared/src/server/whatsapp/scripts/submitTemplates.ts

# Submit a single template
npx tsx packages/shared/src/server/whatsapp/scripts/submitTemplates.ts --template=daily_workout_ready_v1

# Export as JSON files
npx tsx packages/shared/src/server/whatsapp/scripts/exportTemplates.ts
```

## Webhook Events

The webhook handler (`/api/whatsapp-cloud/webhook`) processes:

| Event | Handler | Action |
|-------|---------|--------|
| Text message | `handleTextMessage` | STOP/START/HELP commands, agent ingestion |
| Reaction added | `handleReactionAdded` | Workout completion (👍💪🔥❤️), sentiment logging |
| Reaction removed | `handleReactionRemoved` | Logged, no undo |
| Button click | `handleButtonClick` | Stored, opens 24h window |
| Interactive reply | `handleInteractiveReply` | Agent ingestion (quick replies) |
| Status update | `handleStatus` | Delivery tracking, queue advancement |

### Reaction → Sentiment Mapping

| Emoji | Sentiment | Counts as Completion |
|-------|-----------|---------------------|
| 👍 | completed | ✅ |
| ❤️ | loved | ✅ |
| 💪 | tough_but_done | ✅ |
| 😅 | struggled | ❌ |
| 🔥 | crushed_it | ✅ |

## 24-Hour Messaging Window

Any user interaction (text reply, reaction, button click, quick reply) opens a 24-hour window
during which we can send **free-form messages at no cost** instead of paid templates.

The `messagingWindow.ts` module tracks these windows in-memory.

**TODO:** Migrate to Redis or DB for multi-instance deployments.

## Sending Messages

```typescript
import { sendTemplate, sendFreeFormIfWindowOpen } from '@gymtext/shared/server/whatsapp';

// Send a template message (always works, costs ~$0.006)
await sendTemplate('15551234567', 'daily_workout_ready_v1', {
  userName: 'Aaron',
  workoutType: 'Upper Body Push',
  focus: 'Chest & Shoulders',
  date: '2026-03-13',
}, config);

// Send free-form if window is open (free), returns null if window closed
const result = await sendFreeFormIfWindowOpen(userId, '15551234567', 'Great work! 💪', config);
```

## Cost Optimization

| Scenario | Per-message cost | 10K users/day | Annual |
|----------|-----------------|---------------|--------|
| Template only | $0.006 | $60/day | $21,900 |
| 30% reply rate | ~$0.004 | $42/day | $15,300 |
| 50% reply rate | ~$0.003 | $30/day | $11,000 |

**Strategy:** Every template includes an engagement prompt to encourage replies and open free windows.
