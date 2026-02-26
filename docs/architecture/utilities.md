# Utilities Reference

## Date Utilities (`packages/shared/src/shared/utils/date.ts`)

Luxon-based date/time utilities — **MUST use instead of raw Date objects** throughout the codebase. ~809 lines.

### Construction
- `parseDate(input)` — Parse various date formats
- `now(timezone?)` — Current DateTime in timezone
- `today(timezone?)` — Current date (start of day)
- `startOfDay(dt)` / `endOfDay(dt)` — Day boundaries

### Timezone Operations
- `convertToTimezone(dt, tz)` — Convert to specific timezone
- `convertToUTC(dt)` — Convert to UTC
- `getLocalHour(dt, tz)` — Get hour in timezone
- `isValidTimezone(tz)` — Validate IANA timezone string

### Formatting
- `formatForUI(dt, style)` — Human-readable formats (short/long/time/datetime/relative)
- `formatForAI(dt)` — AI-friendly date representation
- `formatForAPI(dt)` — ISO format for API responses
- `formatDate(dt, format)` — Custom format string

### Comparison
- `isSameDay(a, b)` — Same calendar day check
- `isToday(dt, tz)` — Is today in timezone
- `isPast(dt)` / `isFuture(dt)` — Temporal comparison
- `diffInDays(a, b)` — Day difference
- `isWeekdayInTimezone(dt, tz)` — Weekday check

### Manipulation
- `addDays(dt, n)` / `subtractDays(dt, n)`
- `addWeeks(dt, n)` / `subtractWeeks(dt, n)`
- `startOfWeek(dt)` / `endOfWeek(dt)`
- `getDayOfWeek(dt)` / `getDayOfWeekName(dt)` / `getWeekday(dt)`
- `toISODate(dt)` — Extract ISO date string

## Timezone Utilities (`packages/shared/src/shared/utils/timezone.ts`)

IANA timezone validation, conversion, and formatting. ~132 lines.

- `COMMON_TIMEZONES` — 26 major timezones across Americas, Europe, Asia Pacific
- `isValidIANATimezone(tz)` — Validate timezone string
- `getLocalHourForTimezone(tz)` — Current local hour
- `convertPreferredHourToUTC(hour, tz)` — Convert local hour to UTC
- `getAllUTCHoursForLocalHour(hour)` — All UTC hours that map to a local hour (handles DST)
- `formatTimezoneForDisplay(tz)` — E.g., "New York (EST)"
- `getCommonTimezones()` — List of common timezone options

## Circuit Breaker (`packages/shared/src/server/utils/circuitBreaker.ts`)

Fault tolerance pattern for external service calls. ~92 lines.

**States**: CLOSED → OPEN → HALF_OPEN → CLOSED

- **CLOSED**: Normal operation, counting failures
- **OPEN**: Service unreachable, fast-fail all requests
- **HALF_OPEN**: After reset timeout, allow one test request

**Configuration**: failure threshold, reset timeout, monitoring period

**Methods**: `execute(fn)`, `getState()`, `getStats()`

## Formatters (`packages/shared/src/server/utils/formatters/`)

| File | Purpose |
|------|---------|
| `fitnessProfile.ts` | Format fitness profile data for UI and AI consumption |
| `microcycle.ts` | Format weekly training pattern data |
| `text.ts` | General text formatting utilities |

Also: `server/utils/profile/jsonToMarkdown.ts` — Converts fitness profile JSON to markdown for AI prompts.

## Server Utilities (`packages/shared/src/server/utils/`)

| File | Purpose |
|------|---------|
| `apiResponse.ts` | Standardized API response formatting |
| `authMiddleware.ts` | Authentication middleware for API routes |
| `smsValidation.ts` | SMS message validation (length, content) |
| `exerciseNormalization.ts` | Exercise name/alias normalization |
| `embeddings.ts` | Vector embedding generation |
| `token-manager.ts` | JWT/token management |
| `sessionCrypto.ts` | Session encryption/decryption (Node.js) |
| `sessionCryptoEdge.ts` | Session encryption/decryption (Edge runtime) |
| `fileParser.ts` | PDF, Excel, CSV file parsing |
| `twilioErrors.ts` | Twilio error code mapping |
| `whatsappTemplates.ts` | WhatsApp template message utilities |
| `pathNormalizer.ts` | URL path normalization |

## Key Rules

1. **Always use date utilities** — Never use raw `new Date()` or `Date.now()`. The Luxon-based utilities handle timezone-aware operations correctly.
2. **Timezone-first** — All date operations should be timezone-aware. User timezones are stored in fitness profiles.
3. **Circuit breaker for external calls** — Wrap Twilio/Stripe/OpenAI calls in circuit breaker for resilience.
