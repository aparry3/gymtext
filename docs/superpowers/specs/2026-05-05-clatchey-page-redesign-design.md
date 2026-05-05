# Clatchey Page Redesign — Design

**Status:** Draft for review
**Owner:** Aaron
**Date:** 2026-05-05
**Path:** `apps/web/src/app/clatchey/`

## Context

The current `/clatchey` page predates `/nextlevelbasketball` and uses an older design pattern that no longer matches the brand polish of the newer coach landing pages. We are rebuilding it to:

1. Match the NLB structural and component DNA (same section rhythm, same Tailwind conventions, same level of polish).
2. Use Mt. St. Joseph's official colors (purple and cream) instead of the current `#4c1d95` purple + gold combo.
3. Replace the unsplash placeholder portrait with the canonical Clatchey portrait from Catholic Review.
4. Remove the camp-bundled-with-subscription model from NLB. The 3-day in-person camp is run by Mt. St. Joe and signs up externally; GymText is the *daily SMS coaching* product, sold standalone.

## Audience & Positioning

The page targets **any serious basketball player** drawn to Coach Clatchey's pedigree. Coach's resume (and the Mt. St. Joe summer camp) are credibility scaffolding; the conversion is to a **standalone $25/mo daily SMS coaching subscription**. The camp is presented as a real option (with an external signup link) but it is not required, not bundled, and not the page's primary action.

This positioning differs from NLB, where the GymText subscription IS the camp ticket and the two are inseparable.

## Visual System — "Two-Tone Rhythm"

The page alternates between three section backgrounds top-to-bottom, so every fold is a contrast change:

| Token | Hex | Used for |
|---|---|---|
| `msj-night` | `#14082a` | Hero base, footer base, deepest dark moments. Near-black with a purple cast. |
| `msj-purple-deep` | `#2e1855` | Mid-tone purple sections (NBA showcase, final CTA). |
| `msj-purple` | `#7c3aed` | Accent: marquee diamonds, headline highlight spans, primary CTA on cream backgrounds, eyebrow tags on cream. |
| `msj-purple-tint` | `#d8b4fe` | Muted highlight on dark backgrounds (eyebrow tags, hover states). |
| `msj-cream` | `#f6efe1` | Cream sections (bio, camp, how-it-works, pricing, FAQ). Also: button text on purple, body text on dark. |

All five tokens are exposed as CSS custom properties in `apps/web/src/app/clatchey/clatchey.css`, mirroring the `nlb-*` token pattern in `apps/web/src/app/nextlevelbasketball/next-level.css`. Tailwind utility classes follow the same naming (`bg-msj-cream`, `text-msj-purple`, `border-msj-purple/40`, etc.).

The display typeface is the existing `--font-anton` Anton variant referenced as `font-display-condensed` in NLB. We reuse the same class — no new fonts.

## Page Structure

### 1. Navigation (overlay on hero)

Transparent overlay, dark backdrop blur on scroll. Left: GymText `WordmarkWhite.png`. Right (desktop): nav links to `#bio`, `#camp`, `#sms`, `#faq`. Right (always): purple pill CTA `START $25/MO`.

### 2. Hero — `msj-night`

- Eyebrow: `GYMTEXT × MT. ST. JOE BASKETBALL · DAILY SMS COACHING` (small caps, tracked).
- Headline (Anton condensed, all-caps, ~7rem on desktop):

  > **30 years of winning.**
  > **Now on your phone.** *(highlight span in cream `#f6efe1`)*

- Sub-copy (cream/70% opacity):

  > Hall-of-Fame coach Pat Clatchey has spent three decades building a dynasty at Mt. St. Joseph — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. Now his daily playbook texts you the next workout.

- Buttons: solid purple `START $25/MO` + outlined cream `SEE THE CAMP` (jumps to `#camp`).
- Right column: Clatchey portrait inset in a 4:5 frame, subtle purple gradient overlay at the bottom with caption "Coach Pat Clatchey · Head Coach, Mt. St. Joseph".
- Image source: `https://catholicreview.org/wp-content/uploads/2018/12/Clatchey_DK47404-web-1.jpg` (used `unoptimized` since it's an external host).
- Footnote line below buttons (`text-[11px] text-msj-cream/50 tracking-[0.18em]`): `NO CAMP SIGNUP REQUIRED · CANCEL ANYTIME`.

### 3. Stats Marquee — `msj-night`

Animated horizontal ticker, identical implementation pattern to `NextLevelStatsBar` (`@keyframes` translateX, `prefers-reduced-motion` respected). Items separated by purple `◆`:

`850+ WINS · 3 NBA PLAYERS · 70+ NCAA D-I · 20+ CHAMPIONSHIPS · MT. ST. JOE BALTIMORE · DAILY SMS COACHING`

Border top + bottom in `msj-purple/40`.

### 4. Coach Bio — `msj-cream`

Two-column layout (image left 40%, copy right 60% on desktop; stacked on mobile).

Left: smaller crop of the Clatchey portrait in a 4:5 rounded frame, subtle deep-purple shadow. Caption overlay at bottom: pull-quote `"Fundamentals first. Victory follows."` — `Coach Pat Clatchey`.

Right column:
- Eyebrow (`msj-purple`): `MEET COACH CLATCHEY`.
- Headline (Anton condensed, deep purple ink):

  > **Three decades.**
  > **One coach. *A dynasty.*** *(highlight in `msj-purple`)*

- Two paragraphs of body copy (~80 words total). Reuse the legacy copy:

  > For over three decades, Pat Clatchey hasn't just coached basketball at Mount Saint Joseph High School — he's built a dynasty. Since 1992, he has amassed 850+ wins, placing him in elite company alongside legends like Bob Hurley.
  >
  > His court is a classroom: nearly 70 NCAA Division I athletes developed, 18 professional careers overseas, and three players sent directly to the NBA — including top-10 draft pick Jalen Smith. Coached the McDonald's All-American Game. Named MIAA Coach of the Decade.

- Stat trio at the bottom (3-column grid): `30+ YEARS / 850+ WINS / 20+ CHAMPIONSHIPS`. Stat values in Anton condensed, deep purple. Labels in small tracked caps.

### 5. NBA Alumni Showcase — `msj-purple-deep`

This section is the page's strongest credibility moment and is unique to Clatchey (NLB has no equivalent).

- Eyebrow (`msj-cream`): `THE PROOF`.
- Headline (Anton condensed, cream):

  > **From The Mount**
  > **to the *League.*** *(highlight in `msj-cream`)*

- Sub-copy (cream/70%): "Coach Clatchey doesn't just teach plays — he builds careers. These are the alumni whose careers started at Mt. St. Joe."
- 4-card grid (2×2 on mobile, 4×1 on desktop). Reuse the player names, achievements, class years, NBA flags, and image URLs from the existing `ClatcheyPlayerShowcase.tsx`:

  | Player | Achievement | Class | Badge |
  |---|---|---|---|
  | Jalen Smith | Phoenix Suns (Top-10 Pick) | 2018 | NBA |
  | Jaylen Adams | NBA & International Pro | 2014 | NBA |
  | Henry Sims | NBA Veteran | 2008 | NBA |
  | Phil Booth | 2× NCAA Champion (Villanova) · Pro | — | — |

- Card design: image fills aspect-4/5, gradient-to-top dark overlay, NBA badge top-right where applicable, name + achievement bottom-left in cream type. Hover: subtle scale + cream border accent.

### 6. The Camp — `msj-cream`

Lean credibility section with secondary CTA.

- Eyebrow (`msj-purple`): `THE IN-PERSON CAMP`.
- Headline (Anton condensed):

  > **3 days at**
  > **Mt. St. Joe. *Every summer.***

- One paragraph (~60 words):

  > Each summer, Coach Clatchey runs a 3-day basketball camp at Mt. St. Joseph High School in Baltimore. Open to middle and high school players. Real reps with the staff that produced 70+ Division I athletes. Camp registration is handled directly by Mt. St. Joe — separate from your daily SMS subscription.

- 3-cell fact strip (matches NLB's `FactCell` pattern):

  | LOCATION | FORMAT | AGES |
  |---|---|---|
  | Mt. St. Joseph High School · Baltimore, MD | 3 days · in-person | Middle / high school |

- Two-button row:
  - Primary in this section: outlined deep-purple `SIGN UP FOR CAMP →` linking to `https://www.msjnet.edu/athletics/camps` (target `_blank`).
  - Secondary: small text link `Can't make it? The daily texts are open year-round.` → jumps to `#pricing`.

### 7. How It Works — `msj-cream`

Same DNA as `NextLevelHowItWorks` but SMS-only. Top divider in `msj-purple/10`.

- Eyebrow (`msj-purple`): `HOW THE TEXTS WORK`.
- Headline:

  > **How it**
  > ***works.***

- 3-step grid (cream cards with deep-purple ink, purple step numbers in Anton condensed):

  | # | Title | Body |
  |---|---|---|
  | 01 | SUBSCRIBE | $25/mo. Cancel anytime. Two-minute signup. |
  | 02 | GET DAILY WORKOUTS | Coach Clatchey's plan lands in your messages every morning — drills, reps, and a clear focus for the day. |
  | 03 | REPLY · ADAPT | Tell us how it went, what hurt, what's next. The plan adapts to you. |

### 8. SMS Coaching with Phone Mockup — `msj-night`

Mirror of `NextLevelSmsCoaching`. Two-column: copy left, phone mockup right.

- Eyebrow (`msj-purple-tint`): `DAILY SMS COACHING`.
- Headline (cream):

  > **A coach in**
  > **your *pocket.*** *(highlight in cream)*

- Body (~50 words): "Every morning, Coach Clatchey sends the day's workout right to your phone — short enough to actually do, specific enough to actually move you forward. Reply with how it went. Skip a day if life happens. The plan keeps adapting."
- Inline CTA: `START $25/MO` purple pill.
- Phone mockup component: copy NLB's `PhoneMockup` structure verbatim, recolor the user-side bubble from `nlb-orange` to `msj-purple`. Sample message thread (Clatchey voice — fundamentals-first, blunt):

  > Mon · 6:38 AM
  >
  > **Coach:** Today is footwork. 50 form shots from the elbow, 3 sets of jab-step into pull-up. Stay in your stance. Send a clip.
  >
  > **You:** Done. Felt slow on the second set.
  >
  > Tue · 6:40 AM
  >
  > **Coach:** Slow is real. Today: 20 min ball-handling — 2-ball pound, in-and-out, killer cross. 3 sets x 30s. Then write 3 things you saw on yesterday's clip.
  >
  > **You:** Sent.
  >
  > Wed · 6:42 AM
  >
  > **Coach:** Good read on the help-side. Today is conditioning + reads — 5 suicides, then film. We're building. Keep showing up.

### 9. Pricing — `msj-cream`

Single centered card (not 2-column comparison). Max-width ~520px.

- Eyebrow (`msj-purple`): `THE PRICE`.
- Headline:

  > **One price.**
  > ***All in.***

- Card content:
  - Top tag: `DAILY SMS COACHING`.
  - Big price: `$25` Anton condensed deep-purple, `/ MONTH` in small tracked caps.
  - 4 feature bullets (purple checkmarks):
    - Daily SMS workouts written for you, every morning
    - Reply anytime — the plan adapts
    - Cancel anytime, no contract
    - Optional: in-person Mt. St. Joe summer camp (registered separately)
  - CTA: large solid deep-purple `START NOW` pill.
  - Footnote: `BILLED MONTHLY · CANCEL ANY TIME`.

### 10. FAQ — `msj-cream`

Two-column expandable list (`<details>` / `<summary>` like NLB). Top divider in `msj-purple/10`.

- Eyebrow: `QUESTIONS`.
- Headline:

  > **Questions,**
  > ***answered.***

- Q&A items (8 total, 4 per column):

  **Left column**
  1. *What if I'm not at Clatchey's level?* — Plans scale to where you are. Tell us your level when you sign up; the workouts adjust. We coach beginners and college recruits the same way: meet you where you are, push you forward.
  2. *How long are the daily workouts?* — Most are 30–45 minutes. Designed to actually be done, not skipped.
  3. *Do I need a gym?* — A hoop helps. Most days are doable with a basketball, a wall, and some space. We'll specify when court time is required.
  4. *Is the camp included?* — No. The camp is run by Mt. St. Joseph and registered separately on the school site. The daily SMS subscription is the standalone product here.

  **Right column**
  5. *Can I cancel anytime?* — Yes. No contract. Cancel from your account, no questions.
  6. *What ages?* — Built for middle school through college. Younger players welcome with parental signup.
  7. *Will I actually hear from Coach?* — Coach Clatchey writes the program. Day-to-day responses come from his coaching staff and the GymText system, modeled on his approach.
  8. *Does the plan adapt to my season?* — Yes. Tell us when your season starts; off-season, in-season, and post-season programming all run differently.

### 11. Final CTA — `msj-purple-deep`

Centered. Cream type on deep purple.

- Headline (Anton condensed, very large):

  > **Train like a Mount man.**
  > **Starting *tomorrow.***

- Sub-copy: "Join the daily workout program. Two-minute signup. Cancel anytime."
- Big cream pill button: `START $25/MO`.
- Footnote: `DAILY SMS COACHING · NO CAMP REQUIRED`.

### 12. Footer — `msj-night`

Same 3-column structure as `NextLevelFooter`.

- Column 1: GymText wordmark + tagline ("Daily SMS coaching from Hall of Fame Coach Pat Clatchey. Built for players who want to play at the next level.").
- Column 2 — `THE PROGRAM`: Subscribe, How it works, FAQ.
- Column 3 — `FEATURED PRESS`: 4 external links (reuse from existing `ClatcheyFooter`):
  - "A Baltimore Basketball Legend" — MSJ Student Media
  - "Mount St. Joseph Alums Dot the Map" — Catholic Review
  - "Coach of the Decade" — MIAA Sports Net
  - "McDonald's All-American Coach" — MaxPreps
- Bottom strip: `© 2026 GYMTEXT × COACH CLATCHEY` left, `POWERED BY [GYMTEXT WORDMARK]` right.

### 13. Sticky CTA (mobile only)

Appears after `scrollY > 500`. Dark bar pinned to bottom. Left: `COACH CLATCHEY · DAILY SMS · $25/MO`. Right: solid purple pill `START`. Mirror of `NextLevelStickyCTA` implementation.

## File Structure

Mirror the NLB folder layout. Move all Clatchey components into a dedicated subdirectory.

```
apps/web/src/components/pages/owner-landing/
└── clatchey/                          # NEW — colocate everything
    ├── index.ts                       # NEW — barrel re-export
    ├── ClatcheyLandingPage.tsx        # MOVE + REWRITE
    ├── ClatcheyHero.tsx               # MOVE + REWRITE
    ├── ClatcheyStatsBar.tsx           # MOVE + REWRITE (marquee, not 4-stat grid)
    ├── ClatcheyBioSection.tsx         # MOVE + REWRITE
    ├── ClatcheyPlayerShowcase.tsx     # MOVE + REWRITE (lighter rewrite — keeps data)
    ├── ClatcheyCamp.tsx               # NEW
    ├── ClatcheyHowItWorks.tsx         # NEW
    ├── ClatcheySmsCoaching.tsx        # NEW (phone mockup section)
    ├── ClatcheyPricing.tsx            # NEW (single-tier card)
    ├── ClatcheyFAQ.tsx                # NEW
    ├── ClatcheyCTA.tsx                # MOVE + REWRITE (final CTA section)
    ├── ClatcheyFooter.tsx             # MOVE + REWRITE
    └── ClatcheyStickyCTA.tsx          # MOVE + REWRITE
```

`apps/web/src/app/clatchey/page.tsx` updates the import to `@/components/pages/owner-landing/clatchey`. Metadata gets refreshed:

- Title: `Coach Pat Clatchey · Daily SMS Coaching · GymText`
- Description: `30 years of winning, now on your phone. Daily SMS basketball coaching from Hall-of-Fame coach Pat Clatchey — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. $25/mo. Cancel anytime.`

`apps/web/src/app/clatchey/clatchey.css` is rewritten with the new token set (current `--msj-purple: #4c1d95` and `--msj-gold: #fbbf24` are replaced by the 5 tokens listed in the Visual System section). Tailwind utility class declarations follow the NLB pattern: `bg-msj-*`, `text-msj-*`, `border-msj-*`, `from-msj-*`, hover variants, opacity variants.

The `font-display-condensed` class is added to `clatchey.css` (currently only in `next-level.css`) so both pages share the typography.

## What Gets Removed

- `ClatcheyProgramTracks.tsx` (Floor General / Complete Scorer / Paint Beast / Master Class) — incompatible with single-tier pricing. Multi-position curricula don't fit a $25/mo flat product.
- The unsplash placeholder portrait (`photo-1507003211169-0a1dd7228f2d`) and the placeholder court image (`photo-1546519638-68e109498ffc`) — replaced by the Catholic Review portrait.
- `--msj-gold: #fbbf24` token — gold isn't a Mt. St. Joe brand color.
- The yellow trophy/star icons in the current StatsBar — replaced by a marquee, no icons.

## Out of Scope

- Camp registration on this page (handled by external Mt. St. Joe link).
- Premium / 1:1 Zoom tier (single-tier pricing, decided in brainstorming).
- A/B testing the headline copy (locked in: "30 years of winning. Now on your phone.").
- Any database changes (no agent / model / migration work — this is a pure marketing page).
- Dark mode toggle (the page already alternates dark and cream sections by design).

## Acceptance Criteria

1. `/clatchey` renders with the 13 sections in the order specified, on both mobile and desktop.
2. The hero portrait is the Catholic Review URL, loading via `next/image` with `unoptimized`.
3. All five `msj-*` color tokens exist in `clatchey.css` and are applied via Tailwind utility classes.
4. The marquee animates left-to-right and respects `prefers-reduced-motion`.
5. Primary CTAs in the hero, SMS section, pricing card, sticky bar, and final CTA all link to the same placeholder URL `https://coaching.gymtext.co/signup/clatchey` (a single source-of-truth constant in the file, easy to swap later).
6. The camp signup CTA links to `https://www.msjnet.edu/athletics/camps` and opens in a new tab.
7. `pnpm build` and `pnpm lint` both pass.
8. Visual review: the page reads as "NLB-flavored polish in Mt. St. Joe colors" — same typography rhythm, same tracking-style labels, same card patterns, but unmistakably purple-and-cream.
