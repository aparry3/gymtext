# Program Features Research: Pricing & Coach Scheduling

> Research doc for two new program-level features.
> Date: 2026-04-02

---

## 1. Program-Specific Pricing

### Current State

- **Single global price:** `STRIPE_PRICE_ID` env var → loaded via `getStripeConfig().priceId`
- **Used in:** `subscriptionService.ts` (resubscription) and `apps/web/src/app/api/users/signup/route.ts` (checkout session creation)
- **Programs table** already has `billing_model` column (`subscription | one_time | free`) but no custom price field
- **ProgramOwners** already have `stripe_connect_account_id` (for future revenue splits)

### Technical Approach

**Recommended: Store a Stripe Price ID per program.**

Each program gets its own `stripe_price_id` column. When a user signs up for a program, we use that program's price instead of the global default. If null, fall back to the global `STRIPE_PRICE_ID`.

#### Why a Price ID (not a new Product)?

Stripe's model: **Product → Price(s)**. A Product is the thing you sell; a Price is how much it costs (amount, currency, interval).

- **One Product per program** makes sense semantically — each program is a distinct offering
- **One Price per Product** is sufficient initially (monthly subscription at X/mo)
- But all you actually need in the checkout session is the **Price ID** — Stripe doesn't care if prices belong to different products or the same one

**Pragmatic recommendation:** Store just the `stripe_price_id` on the program. Coaches/admins create the Product + Price in Stripe (or via API from admin portal), then paste or select the Price ID. This is the simplest approach that works.

#### Stripe API for Creating Products/Prices Programmatically

If we want the admin portal to create Stripe Products/Prices directly (no Stripe Dashboard needed):

```typescript
// Create a Product for the program
const product = await stripe.products.create({
  name: program.name,
  description: program.description,
  metadata: { programId: program.id },
});

// Create a Price for the product
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2999, // $29.99 in cents
  currency: 'usd',
  recurring: { interval: 'month' },
  metadata: { programId: program.id },
});

// Store price.id on the program
await programRepo.update(program.id, { stripePriceId: price.id });
```

For one-time programs:
```typescript
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 9999, // $99.99
  currency: 'usd',
  // No `recurring` → one-time price
});
```

The checkout session already supports both `mode: 'subscription'` and `mode: 'payment'` — we'd switch based on `billingModel`.

### Database Schema Changes

```sql
-- Add Stripe product/price columns to programs
ALTER TABLE programs ADD COLUMN stripe_product_id TEXT;
ALTER TABLE programs ADD COLUMN stripe_price_id TEXT;
ALTER TABLE programs ADD COLUMN price_amount_cents INTEGER;  -- Display-only cache (e.g., show "$29.99/mo" in UI)
ALTER TABLE programs ADD COLUMN price_currency TEXT DEFAULT 'usd';
```

**Why cache `price_amount_cents`?** So the admin portal and public landing pages can display the price without calling Stripe every time. The source of truth remains Stripe; this is a display cache updated when the price is set.

### Code Changes Required

#### 1. Signup route (`apps/web/src/app/api/users/signup/route.ts`)

Currently:
```typescript
const { priceId } = getStripeConfig();
// ...
line_items: [{ price: priceId, quantity: 1 }],
```

Change to:
```typescript
// Determine price: program-specific or global default
const programPriceId = program?.stripePriceId;
const priceId = programPriceId || getStripeConfig().priceId;
const checkoutMode = program?.billingModel === 'one_time' ? 'payment' : 'subscription';

const session = await stripe.checkout.sessions.create({
  // ...
  mode: checkoutMode,
  line_items: [{ price: priceId, quantity: 1 }],
  metadata: { userId, programId: program?.id || '' },
});
```

#### 2. Subscription service (resubscription flow)

Same pattern — look up the user's enrolled program, use its price if set.

#### 3. Admin portal program settings

Add a "Pricing" section to the Settings tab on `programs/[id]/page.tsx`:
- **Price amount** (input in dollars, stored in cents)
- **Billing interval** (monthly / one-time / free) — already exists as `billingModel`
- "Create/Update in Stripe" button → calls API that creates Product + Price via Stripe API
- Displays current Stripe Price ID + product link

#### 4. Webhook handling

The `checkout.session.completed` webhook already stores `planType: 'monthly'` — we should store the actual plan type and price from the session metadata. Add `programId` to subscription metadata for tracking.

### Stripe Connect Considerations

The `program_owners` table already has `stripe_connect_account_id`. For revenue splits:
- Use `payment_intent_data.application_fee_amount` or `transfer_data` in the checkout session
- `revenue_split_percent` is already on the `programs` table
- This is a Phase 2 concern — get basic per-program pricing working first

### Summary

| Step | Effort | Priority |
|------|--------|----------|
| Add `stripe_price_id` + `price_amount_cents` columns | Small | Must-have |
| Update signup route to use program price | Medium | Must-have |
| Admin UI: pricing section in program settings | Medium | Must-have |
| API endpoint to create Stripe Product/Price | Medium | Nice-to-have (can paste Price ID manually at first) |
| Update resubscription flow | Small | Must-have |
| Stripe Connect revenue splits | Large | Phase 2 |

---

## 2. Optional Coach Scheduling

### Current State

The database **already has scheduling columns** on the `programs` table (added in migration `20260323000000_sport_specific_exercises.ts`):

```sql
scheduling_enabled BOOLEAN NOT NULL DEFAULT false
scheduling_type TEXT        -- e.g., 'calendly', 'cal_com', 'custom_url'
scheduling_url TEXT         -- The actual booking link
scheduling_notes TEXT       -- Optional notes shown to users
```

These columns exist but are **not exposed in any UI yet** — not in the admin portal, not in the programs portal, and not in the public-facing signup/enrollment flow.

The `Program` model in `program.ts` also **doesn't map these fields yet** — they're in the DB types but not in the domain model.

### Calendar Platform Options

#### Option A: Calendly (Recommended for V1)

**Pros:**
- Industry standard, coaches already have accounts
- Simple: just store the booking URL per program
- No infrastructure to manage
- Embeddable widget (inline or popup)
- Free tier: 1 event type, unlimited bookings
- API available for checking bookings, but not needed for V1

**Cons:**
- $10/mo per seat for teams (coach pays, not us)
- Limited customization on free tier
- Third-party dependency

**Integration approach:** Just store the Calendly link. No API integration needed for V1. The coach pastes their Calendly URL in the admin portal.

```
https://calendly.com/coach-name/30min
```

Embed options:
```typescript
// Popup widget (recommended)
<script src="https://assets.calendly.com/assets/external/widget.js" />
<a href="" onClick={() => Calendly.initPopupWidget({ url: schedulingUrl })}>
  Schedule a call with your coach
</a>

// Inline embed
<div className="calendly-inline-widget"
  data-url={schedulingUrl}
  style={{ minWidth: 320, height: 630 }} />
```

#### Option B: Cal.com (Open Source Alternative)

**Pros:**
- Open source, self-hostable
- Free tier on cal.com cloud (1 event type)
- More customizable than Calendly
- API-first design
- Can white-label if self-hosted

**Cons:**
- Less well-known (coaches may not have accounts)
- Self-hosting = infrastructure burden
- Cloud version is still early compared to Calendly

**Integration approach:** Same as Calendly — store the Cal.com booking URL. Also supports embed:

```typescript
// Cal.com embed
import Cal from "@calcom/embed-react";
<Cal calLink="coach-name/30min" />
```

#### Option C: Custom URL (Any Platform)

**Pros:**
- Maximum flexibility — works with any booking tool
- No vendor lock-in
- Coaches can use whatever they already have (Acuity, Square, etc.)

**Cons:**
- No embed widget (just opens in new tab)
- No integration/analytics
- Can't verify the URL actually works

**Integration approach:** Just store any URL. Display as a button/link.

### Recommendation: Support All Three via `scheduling_type`

The DB already has `scheduling_type`. Use it:

| `scheduling_type` | Behavior |
|---|---|
| `calendly` | Calendly embed widget (popup or inline) |
| `cal_com` | Cal.com embed widget |
| `custom_url` | Plain link (opens in new tab) |
| `null` | Scheduling disabled |

For V1, all three are just URLs — the `scheduling_type` tells the frontend which embed to use. No API integrations needed.

### Database Schema Changes

**None needed** — the columns already exist:

```
programs.scheduling_enabled  BOOLEAN DEFAULT false
programs.scheduling_type     TEXT    -- 'calendly' | 'cal_com' | 'custom_url'
programs.scheduling_url      TEXT    -- The booking link
programs.scheduling_notes    TEXT    -- "Book a 30-min intro call with Coach Mike"
```

### Code Changes Required

#### 1. Update Program domain model (`packages/shared/src/server/models/program.ts`)

Add the scheduling fields to the `Program` interface and `ProgramModel.fromDB()`:

```typescript
export interface Program {
  // ... existing fields ...
  schedulingEnabled: boolean;
  schedulingType: string | null;  // 'calendly' | 'cal_com' | 'custom_url'
  schedulingUrl: string | null;
  schedulingNotes: string | null;
}
```

#### 2. Admin portal: program settings

Add a "Coach Scheduling" section to the Settings tab (`apps/admin/src/app/(protected)/programs/[id]/page.tsx`):

- **Enable scheduling** toggle
- **Scheduling type** dropdown (Calendly / Cal.com / Custom URL)
- **Booking URL** text input
- **Notes** textarea (optional, shown to users)
- Preview button to test the link

#### 3. Programs portal: program detail page

Same fields in `apps/programs/src/app/(protected)/programs/[id]/page.tsx` so coaches can configure it themselves.

#### 4. Public-facing: user enrollment / program landing page

When `scheduling_enabled` is true for a user's enrolled program:
- Show a "Schedule a Call" button/card
- For Calendly/Cal.com: use their embed widget
- For custom URL: open in new tab
- Display `scheduling_notes` as context

#### 5. Admin API: program update endpoint

The PATCH endpoint at `apps/admin/src/app/api/programs/[id]/route.ts` needs to accept the scheduling fields:

```typescript
if (body.schedulingEnabled !== undefined) updateData.schedulingEnabled = body.schedulingEnabled;
if (body.schedulingType !== undefined) updateData.schedulingType = body.schedulingType;
if (body.schedulingUrl !== undefined) updateData.schedulingUrl = body.schedulingUrl;
if (body.schedulingNotes !== undefined) updateData.schedulingNotes = body.schedulingNotes;
```

### Future Enhancements (Not V1)

- **Calendly API integration:** Auto-check if slots are available, show next available time
- **Cal.com self-hosted:** White-labeled scheduling under gymtext.co domain
- **Booking tracking:** Log when users click the scheduling link, track conversion
- **SMS scheduling reminders:** Send a text to the user before their scheduled call
- **Automatic scheduling link in onboarding:** After signup, send a "Book your intro call" message

### Summary

| Step | Effort | Priority |
|------|--------|----------|
| Update Program model with scheduling fields | Small | Must-have |
| Admin portal: scheduling settings UI | Medium | Must-have |
| Programs portal: scheduling settings UI | Medium | Must-have |
| Public-facing: "Schedule a Call" component | Medium | Must-have |
| Admin API: accept scheduling fields | Small | Must-have |
| Calendly embed widget support | Small | Nice-to-have for V1 |
| Cal.com embed widget support | Small | Nice-to-have for V1 |

---

## Implementation Plan

### Phase 1: Foundation (1-2 days)

1. **Migration:** Add `stripe_product_id`, `stripe_price_id`, `price_amount_cents`, `price_currency` to `programs`
2. **Model update:** Add pricing + scheduling fields to `Program` interface and `ProgramModel.fromDB()`
3. **Admin API:** Update program PATCH endpoint to accept all new fields

### Phase 2: Pricing (2-3 days)

4. **Admin portal UI:** Add pricing section to program settings tab
5. **Stripe API endpoint:** Create Product + Price from admin portal (optional — can paste Price ID manually)
6. **Signup flow:** Use program-specific price in checkout session creation
7. **Resubscription:** Use program-specific price when creating resubscription sessions

### Phase 3: Scheduling (1-2 days)

8. **Admin portal UI:** Add scheduling section to program settings tab
9. **Programs portal UI:** Mirror scheduling settings for coaches
10. **Public-facing component:** "Schedule a Call" button/embed on user dashboard or program page

### Phase 4: Polish (1 day)

11. **Webhook updates:** Store `programId` in subscription metadata
12. **Display prices** on program landing pages
13. **Embed widgets** for Calendly/Cal.com (vs plain links)

### Total Estimated Effort: 5-8 days

---

## Key Decisions to Confirm with Aaron

1. **Should we create Stripe Products/Prices via API or manual paste?** API is cleaner but more work. Manual paste works fine for now with a handful of programs.
2. **Do coaches set their own prices or does the admin set them?** This affects whether the pricing UI goes in the Programs portal (coach-facing) or just the Admin portal.
3. **Scheduling embed vs. plain link for V1?** Embed is nicer but adds JS dependencies. Plain link is simpler.
4. **Should scheduling be visible on the user's `/me` dashboard?** Or only on the program landing page during signup?
