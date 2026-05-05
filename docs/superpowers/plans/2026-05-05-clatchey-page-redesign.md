# Clatchey Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/clatchey` as a polished, NLB-flavored landing page in Mt. St. Joseph's purple-and-cream palette, with the daily SMS coaching subscription as the standalone product and the in-person camp as external credibility.

**Architecture:** Mirror the `next-level-basketball/` directory structure under `apps/web/src/components/pages/owner-landing/clatchey/`. Each of the 13 page sections becomes its own component. CSS color tokens live in `apps/web/src/app/clatchey/clatchey.css` following the same `nlb-*` token pattern.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS v4 · Anton (display-condensed) · `next/image` · `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-05-05-clatchey-page-redesign-design.md`

**Reference implementation:** `apps/web/src/components/pages/owner-landing/next-level-basketball/` and `apps/web/src/app/nextlevelbasketball/next-level.css`.

**Verification approach:** No unit tests for marketing pages (matches NLB pattern — no test files in `next-level-basketball/`). Verification per task: dev server renders the section without errors. Final task: `pnpm build` + `pnpm lint` pass + manual visual QA at `localhost:3000/clatchey`.

---

## Task 1: Replace `clatchey.css` with the new token set

**Files:**
- Modify: `apps/web/src/app/clatchey/clatchey.css`

- [ ] **Step 1: Replace the file contents with the new token set**

Overwrite `apps/web/src/app/clatchey/clatchey.css` with:

```css
/* Pat Clatchey / Mt. St. Joseph theme colors — purple & cream */
:root {
  --msj-night: #14082a;        /* near-black with purple cast */
  --msj-purple-deep: #2e1855;  /* mid-tone deep purple */
  --msj-purple: #7c3aed;       /* primary accent purple */
  --msj-purple-tint: #d8b4fe;  /* muted highlight on dark */
  --msj-cream: #f6efe1;        /* light brand color */

  /* Tuple components for rgb(R G B / opacity) declarations */
  --msj-night-rgb: 20 8 42;
  --msj-purple-deep-rgb: 46 24 85;
  --msj-purple-rgb: 124 58 237;
  --msj-purple-tint-rgb: 216 180 254;
  --msj-cream-rgb: 246 239 225;
}

/* Solid backgrounds */
.bg-msj-night { background-color: var(--msj-night); }
.bg-msj-purple-deep { background-color: var(--msj-purple-deep); }
.bg-msj-purple { background-color: var(--msj-purple); }
.bg-msj-purple-tint { background-color: var(--msj-purple-tint); }
.bg-msj-cream { background-color: var(--msj-cream); }

/* Solid text */
.text-msj-night { color: var(--msj-night); }
.text-msj-purple-deep { color: var(--msj-purple-deep); }
.text-msj-purple { color: var(--msj-purple); }
.text-msj-purple-tint { color: var(--msj-purple-tint); }
.text-msj-cream { color: var(--msj-cream); }

/* Solid borders */
.border-msj-night { border-color: var(--msj-night); }
.border-msj-purple-deep { border-color: var(--msj-purple-deep); }
.border-msj-purple { border-color: var(--msj-purple); }
.border-msj-purple-tint { border-color: var(--msj-purple-tint); }
.border-msj-cream { border-color: var(--msj-cream); }

/* Background opacity variants */
.bg-msj-purple\/10 { background-color: rgb(var(--msj-purple-rgb) / 0.1); }
.bg-msj-purple\/20 { background-color: rgb(var(--msj-purple-rgb) / 0.2); }
.bg-msj-purple\/90 { background-color: rgb(var(--msj-purple-rgb) / 0.9); }
.bg-msj-purple-deep\/5 { background-color: rgb(var(--msj-purple-deep-rgb) / 0.05); }
.bg-msj-purple-deep\/10 { background-color: rgb(var(--msj-purple-deep-rgb) / 0.1); }
.bg-msj-cream\/5 { background-color: rgb(var(--msj-cream-rgb) / 0.05); }
.bg-msj-cream\/10 { background-color: rgb(var(--msj-cream-rgb) / 0.1); }
.bg-msj-night\/85 { background-color: rgb(var(--msj-night-rgb) / 0.85); }
.bg-msj-night\/10 { background-color: rgb(var(--msj-night-rgb) / 0.1); }

/* Border opacity variants */
.border-msj-purple\/30 { border-color: rgb(var(--msj-purple-rgb) / 0.3); }
.border-msj-purple\/40 { border-color: rgb(var(--msj-purple-rgb) / 0.4); }
.border-msj-purple-tint\/40 { border-color: rgb(var(--msj-purple-tint-rgb) / 0.4); }
.border-msj-purple-deep\/10 { border-color: rgb(var(--msj-purple-deep-rgb) / 0.1); }
.border-msj-cream\/5 { border-color: rgb(var(--msj-cream-rgb) / 0.05); }
.border-msj-cream\/10 { border-color: rgb(var(--msj-cream-rgb) / 0.1); }
.border-msj-cream\/20 { border-color: rgb(var(--msj-cream-rgb) / 0.2); }
.border-msj-cream\/25 { border-color: rgb(var(--msj-cream-rgb) / 0.25); }
.border-y-msj-purple\/40 {
  border-top-color: rgb(var(--msj-purple-rgb) / 0.4);
  border-bottom-color: rgb(var(--msj-purple-rgb) / 0.4);
}

/* Text opacity variants — cream on dark sections */
.text-msj-cream\/35 { color: rgb(var(--msj-cream-rgb) / 0.35); }
.text-msj-cream\/40 { color: rgb(var(--msj-cream-rgb) / 0.4); }
.text-msj-cream\/50 { color: rgb(var(--msj-cream-rgb) / 0.5); }
.text-msj-cream\/55 { color: rgb(var(--msj-cream-rgb) / 0.55); }
.text-msj-cream\/60 { color: rgb(var(--msj-cream-rgb) / 0.6); }
.text-msj-cream\/65 { color: rgb(var(--msj-cream-rgb) / 0.65); }
.text-msj-cream\/70 { color: rgb(var(--msj-cream-rgb) / 0.7); }
.text-msj-cream\/75 { color: rgb(var(--msj-cream-rgb) / 0.75); }
.text-msj-cream\/85 { color: rgb(var(--msj-cream-rgb) / 0.85); }
.text-msj-cream\/90 { color: rgb(var(--msj-cream-rgb) / 0.9); }

/* Text opacity variants — purple-deep on cream sections */
.text-msj-purple-deep\/50 { color: rgb(var(--msj-purple-deep-rgb) / 0.5); }
.text-msj-purple-deep\/60 { color: rgb(var(--msj-purple-deep-rgb) / 0.6); }
.text-msj-purple-deep\/65 { color: rgb(var(--msj-purple-deep-rgb) / 0.65); }
.text-msj-purple-deep\/70 { color: rgb(var(--msj-purple-deep-rgb) / 0.7); }
.text-msj-purple-deep\/75 { color: rgb(var(--msj-purple-deep-rgb) / 0.75); }
.text-msj-purple-deep\/80 { color: rgb(var(--msj-purple-deep-rgb) / 0.8); }

/* Gradient stops (used in hero portrait + player cards) */
.from-msj-night {
  --tw-gradient-from: var(--msj-night) var(--tw-gradient-from-position, );
  --tw-gradient-to: rgb(var(--msj-night-rgb) / 0) var(--tw-gradient-to-position, );
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.via-msj-night\/10 {
  --tw-gradient-to: rgb(var(--msj-night-rgb) / 0) var(--tw-gradient-to-position, );
  --tw-gradient-stops: var(--tw-gradient-from), rgb(var(--msj-night-rgb) / 0.1) var(--tw-gradient-via-position, ), var(--tw-gradient-to);
}
.from-msj-night\/85 {
  --tw-gradient-from: rgb(var(--msj-night-rgb) / 0.85) var(--tw-gradient-from-position, );
  --tw-gradient-to: rgb(var(--msj-night-rgb) / 0) var(--tw-gradient-to-position, );
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

/* Hover variants */
.hover\:bg-msj-purple:hover { background-color: var(--msj-purple); }
.hover\:bg-msj-purple-deep:hover { background-color: var(--msj-purple-deep); }
.hover\:bg-msj-cream:hover { background-color: var(--msj-cream); }
.hover\:text-msj-purple:hover { color: var(--msj-purple); }
.hover\:text-msj-purple-tint:hover { color: var(--msj-purple-tint); }
.hover\:text-msj-cream:hover { color: var(--msj-cream); }
.hover\:text-msj-night:hover { color: var(--msj-night); }
.hover\:border-msj-purple:hover { border-color: var(--msj-purple); }

/* Display-condensed font (Anton, mirrors NLB) */
.font-display-condensed {
  font-family: var(--font-anton), Impact, "Arial Narrow", sans-serif;
  letter-spacing: 0.01em;
}

/* Marquee animation */
@keyframes msj-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.msj-marquee-track {
  animation: msj-marquee 40s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .msj-marquee-track { animation: none; }
}
```

- [ ] **Step 2: Verify dev server still compiles**

Run: `pnpm dev:web` (in another terminal — leave running through subsequent tasks). Visit `http://localhost:3000/clatchey`. Page should render (using old components) without CSS errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/clatchey/clatchey.css
git commit -m "feat(clatchey): replace theme tokens with msj purple/cream palette"
```

---

## Task 2: Create the `clatchey/` component directory and barrel index

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/index.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p apps/web/src/components/pages/owner-landing/clatchey
```

- [ ] **Step 2: Create the barrel `index.ts`**

Create `apps/web/src/components/pages/owner-landing/clatchey/index.ts`:

```typescript
export { ClatcheyLandingPage } from './ClatcheyLandingPage';
export { ClatcheyHero } from './ClatcheyHero';
export { ClatcheyStatsBar } from './ClatcheyStatsBar';
export { ClatcheyBioSection } from './ClatcheyBioSection';
export { ClatcheyPlayerShowcase } from './ClatcheyPlayerShowcase';
export { ClatcheyCamp } from './ClatcheyCamp';
export { ClatcheyHowItWorks } from './ClatcheyHowItWorks';
export { ClatcheySmsCoaching } from './ClatcheySmsCoaching';
export { ClatcheyPricing } from './ClatcheyPricing';
export { ClatcheyFAQ } from './ClatcheyFAQ';
export { ClatcheyCTA } from './ClatcheyCTA';
export { ClatcheyFooter } from './ClatcheyFooter';
export { ClatcheyStickyCTA } from './ClatcheyStickyCTA';
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/index.ts
git commit -m "feat(clatchey): scaffold new component directory with barrel"
```

(The barrel will fail to compile until subsequent tasks create the referenced files. This is fine — `page.tsx` still imports from the old location, so the build is not broken yet. The barrel is only consumed by the new `ClatcheyLandingPage` at Task 16.)

---

## Task 3: Create `ClatcheyHero.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHero.tsx`

- [ ] **Step 1: Create the Hero component**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHero.tsx`:

```typescript
import Image from 'next/image';

export const CLATCHEY_SIGNUP_URL = 'https://coaching.gymtext.co/signup/clatchey';
export const CLATCHEY_PORTRAIT_URL =
  'https://catholicreview.org/wp-content/uploads/2018/12/Clatchey_DK47404-web-1.jpg';

export function ClatcheyHero() {
  return (
    <section className="relative bg-msj-night text-msj-cream overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.28), transparent 70%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/70 font-semibold mb-8">
          <span>GYMTEXT × MT. ST. JOE BASKETBALL</span>
          <span className="text-msj-purple">•</span>
          <span>DAILY SMS COACHING</span>
          <span className="text-msj-purple">•</span>
          <span>$25 / MO</span>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
          <div>
            <h1 className="font-display-condensed text-[3.75rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[7rem] leading-[0.92] tracking-tight uppercase">
              <span className="block">30 years of</span>
              <span className="block">winning.</span>
              <span className="block text-msj-purple-tint">Now on your phone.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base md:text-lg text-msj-cream/70 leading-relaxed">
              Hall-of-Fame coach Pat Clatchey has spent three decades building a dynasty at
              Mt. St. Joseph — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. Now his
              daily playbook texts you the next workout.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={CLATCHEY_SIGNUP_URL}
                className="bg-msj-purple text-msj-cream text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
              >
                START $25 / MO
              </a>
              <a
                href="#camp"
                className="border border-msj-cream/25 text-msj-cream/90 text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:bg-msj-cream hover:text-msj-night transition-all"
              >
                SEE THE CAMP
              </a>
            </div>
            <div className="mt-5 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/50 font-semibold">
              NO CAMP SIGNUP REQUIRED · CANCEL ANYTIME
            </div>
          </div>

          <PortraitCard />
        </div>
      </div>
    </section>
  );
}

function PortraitCard() {
  return (
    <div className="relative w-full max-w-md ml-auto aspect-[4/5] rounded-2xl overflow-hidden bg-msj-cream/10 border border-msj-cream/10">
      <Image
        src={CLATCHEY_PORTRAIT_URL}
        alt="Coach Pat Clatchey"
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
        unoptimized
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-msj-night/85 via-msj-night/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] text-msj-cream/60 font-semibold mb-1">
            COACH PAT CLATCHEY
          </div>
          <div className="text-[11px] tracking-[0.18em] text-msj-cream font-bold uppercase">
            Head Coach · Mt. St. Joseph Gaels
          </div>
        </div>
        <div className="text-[10px] tracking-[0.22em] text-msj-cream/60 font-semibold">
          SINCE 1992
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles standalone**

Run: `pnpm --filter web exec tsc --noEmit -p tsconfig.json` (or rely on the dev server hot reload — the file should not produce TypeScript errors).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHero.tsx
git commit -m "feat(clatchey): add hero with portrait and dual CTAs"
```

---

## Task 4: Create `ClatcheyStatsBar.tsx` (marquee)

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStatsBar.tsx`

- [ ] **Step 1: Create the marquee component**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStatsBar.tsx`:

```typescript
const MARQUEE_ITEMS = [
  '850+ WINS',
  '3 NBA PLAYERS',
  '70+ NCAA D-I',
  '20+ CHAMPIONSHIPS',
  'MT. ST. JOE · BALTIMORE',
  'DAILY SMS COACHING',
];

export function ClatcheyStatsBar() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section
      aria-label="Coach Clatchey stats"
      className="bg-msj-night border-y border-msj-purple/40 overflow-hidden"
    >
      <div className="msj-marquee-track flex items-center gap-12 py-4 whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            <span className="text-[11px] md:text-xs tracking-[0.28em] text-msj-cream font-bold uppercase">
              {item}
            </span>
            <span aria-hidden className="text-msj-purple text-lg leading-none">
              ◆
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStatsBar.tsx
git commit -m "feat(clatchey): add stats marquee"
```

---

## Task 5: Create `ClatcheyBioSection.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyBioSection.tsx`

- [ ] **Step 1: Create the bio section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyBioSection.tsx`:

```typescript
import Image from 'next/image';
import { CLATCHEY_PORTRAIT_URL } from './ClatcheyHero';

export function ClatcheyBioSection() {
  return (
    <section
      id="bio"
      className="bg-msj-cream text-msj-purple-deep py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-msj-purple-deep/5 border border-msj-purple-deep/10">
          <Image
            src={CLATCHEY_PORTRAIT_URL}
            alt="Coach Pat Clatchey"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-msj-night/85 via-msj-night/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="font-display-condensed text-2xl md:text-3xl text-msj-cream uppercase leading-tight">
              &ldquo;Fundamentals first.<br />Victory follows.&rdquo;
            </p>
            <p className="text-[10px] tracking-[0.22em] text-msj-cream/70 font-semibold mt-2">
              — COACH PAT CLATCHEY
            </p>
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
            MEET COACH CLATCHEY
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Three decades.</span>
            <span className="block">One coach.</span>
            <span className="block">
              A <span className="text-msj-purple">dynasty.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-msj-purple-deep/80 leading-relaxed max-w-xl">
            <p>
              For over three decades, Pat Clatchey hasn&apos;t just coached basketball at Mount
              Saint Joseph High School — he&apos;s built a dynasty. Since 1992, he has amassed
              850+ wins, placing him in elite company alongside legends like Bob Hurley.
            </p>
            <p>
              His court is a classroom: nearly 70 NCAA Division I athletes developed, 18
              professional careers overseas, and three players sent directly to the NBA —
              including top-10 draft pick Jalen Smith. Coached the McDonald&apos;s All-American
              Game. Named MIAA Coach of the Decade.
            </p>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-4 max-w-lg">
            <Stat value="30+" label="Years coaching" />
            <Stat value="850+" label="Career wins" />
            <Stat value="20+" label="Championships" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display-condensed text-4xl md:text-5xl text-msj-purple leading-none">
        {value}
      </div>
      <div className="text-[11px] text-msj-purple-deep/60 mt-2">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyBioSection.tsx
git commit -m "feat(clatchey): add coach bio section"
```

---

## Task 6: Create `ClatcheyPlayerShowcase.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPlayerShowcase.tsx`

- [ ] **Step 1: Create the NBA alumni showcase**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPlayerShowcase.tsx`:

```typescript
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';

interface Player {
  name: string;
  achievement: string;
  classYear: string;
  imageUrl: string;
  isNba?: boolean;
}

const PLAYERS: Player[] = [
  {
    name: 'Jalen Smith',
    achievement: 'Phoenix Suns · Top-10 Pick',
    classYear: 'Class of 2018',
    imageUrl:
      'https://i.ytimg.com/vi/yhxv8b4a9vM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC4wCoZFzq9hedDRav3l7A6w2jbgw',
    isNba: true,
  },
  {
    name: 'Jaylen Adams',
    achievement: 'NBA & International Pro',
    classYear: 'Class of 2014',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8woCNeAwFBnJ11P65OUAF1o6ZmSD6G_2MLA&s',
    isNba: true,
  },
  {
    name: 'Henry Sims',
    achievement: 'NBA Veteran',
    classYear: 'Class of 2008',
    imageUrl: 'https://s3media.247sports.com/Uploads/Assets/36/558/3558036.jpg',
    isNba: true,
  },
  {
    name: 'Phil Booth',
    achievement: '2× NCAA Champion · Villanova',
    classYear: 'Pro Basketball',
    imageUrl:
      'https://s.yimg.com/ny/api/res/1.2/3yZzkJx5metJVErWz9U8.w--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03OTk7Y2Y9d2VicA--/https://media.zenfs.com/en/homerun/feed_manager_auto_publish_494/07108e7df5714ee6145455eeea1ad394',
    isNba: false,
  },
];

export function ClatcheyPlayerShowcase() {
  return (
    <section
      id="proof"
      className="bg-msj-purple-deep text-msj-cream py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">From The Mount</span>
            <span className="block">
              to the <span className="text-msj-purple-tint">League.</span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-msj-cream/65 leading-relaxed max-w-2xl">
            Coach Clatchey doesn&apos;t just teach plays — he builds careers. These are the
            alumni whose careers started at Mt. St. Joe.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PLAYERS.map((player) => (
            <div
              key={player.name}
              className="group relative rounded-2xl overflow-hidden bg-msj-night border border-msj-cream/10 hover:border-msj-purple-tint/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-msj-night via-transparent to-transparent opacity-90"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                {player.isNba && (
                  <div className="inline-flex items-center gap-1 bg-msj-purple/90 backdrop-blur-sm text-msj-cream text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded mb-1 md:mb-2">
                    <BadgeCheck className="w-3 h-3" /> NBA
                  </div>
                )}
                <h4 className="text-base md:text-xl font-bold text-msj-cream mb-0.5 md:mb-1">
                  {player.name}
                </h4>
                <p className="text-msj-purple-tint font-medium text-xs md:text-sm line-clamp-1">
                  {player.achievement}
                </p>
                <p className="text-msj-cream/50 text-[10px] md:text-xs mt-0.5 md:mt-1">
                  {player.classYear}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPlayerShowcase.tsx
git commit -m "feat(clatchey): add NBA alumni showcase"
```

---

## Task 7: Create `ClatcheyCamp.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCamp.tsx`

- [ ] **Step 1: Create the camp section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCamp.tsx`:

```typescript
export const CAMP_SIGNUP_URL = 'https://www.msjnet.edu/athletics/camps';

export function ClatcheyCamp() {
  return (
    <section id="camp" className="bg-msj-cream text-msj-purple-deep py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
          THE IN-PERSON CAMP
        </div>
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">3 days at</span>
          <span className="block">
            Mt. St. Joe. <span className="text-msj-purple">Every summer.</span>
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-msj-purple-deep/75 leading-relaxed">
          Each summer, Coach Clatchey runs a 3-day basketball camp at Mt. St. Joseph High
          School in Baltimore. Open to middle and high school players. Real reps with the
          staff that produced 70+ Division I athletes. Camp registration is handled directly
          by Mt. St. Joe — separate from your daily SMS subscription.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-msj-purple-deep/10 rounded-2xl overflow-hidden border border-msj-purple-deep/10">
          <FactCell label="LOCATION" value="Mt. St. Joseph HS · Baltimore, MD" />
          <FactCell label="FORMAT" value="3 days · in-person" />
          <FactCell label="AGES" value="Middle / high school" highlight />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={CAMP_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-msj-purple-deep text-msj-purple-deep text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:bg-msj-purple-deep hover:text-msj-cream transition-all"
          >
            SIGN UP FOR CAMP →
          </a>
          <a
            href="#pricing"
            className="text-sm text-msj-purple-deep/70 hover:text-msj-purple transition-colors underline underline-offset-4"
          >
            Can&apos;t make it? The daily texts are open year-round.
          </a>
        </div>
      </div>
    </section>
  );
}

function FactCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-msj-cream p-5 md:p-6">
      <div className="text-[9px] tracking-[0.22em] text-msj-purple-deep/50 font-semibold mb-1.5">
        {label}
      </div>
      <div
        className={`text-sm md:text-base font-bold ${
          highlight ? 'text-msj-purple' : 'text-msj-purple-deep'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCamp.tsx
git commit -m "feat(clatchey): add lean camp section with external signup link"
```

---

## Task 8: Create `ClatcheyHowItWorks.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHowItWorks.tsx`

- [ ] **Step 1: Create the How It Works section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHowItWorks.tsx`:

```typescript
const STEPS = [
  {
    number: '01',
    title: 'SUBSCRIBE',
    body: '$25/mo. Cancel anytime. Two-minute signup.',
  },
  {
    number: '02',
    title: 'GET DAILY WORKOUTS',
    body:
      "Coach Clatchey's plan lands in your messages every morning — drills, reps, and a clear focus for the day.",
  },
  {
    number: '03',
    title: 'REPLY · ADAPT',
    body:
      "Tell us how it went, what hurt, what's next. The plan adapts to you.",
  },
];

export function ClatcheyHowItWorks() {
  return (
    <section className="bg-msj-cream text-msj-purple-deep py-20 md:py-28 border-t border-msj-purple-deep/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">How it</span>
            <span className="block text-msj-purple">works.</span>
          </h2>
          <p className="text-base md:text-lg text-msj-purple-deep/65 leading-relaxed max-w-2xl">
            One subscription, three habits. Show up every morning, tell us how it went, the
            plan keeps building.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className="rounded-2xl bg-msj-purple-deep/5 border border-msj-purple-deep/10 p-7"
            >
              <div className="font-display-condensed text-5xl text-msj-purple leading-none mb-5">
                {s.number}
              </div>
              <div className="text-sm tracking-[0.2em] text-msj-purple-deep font-bold mb-3">
                {s.title}
              </div>
              <p className="text-sm text-msj-purple-deep/65 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyHowItWorks.tsx
git commit -m "feat(clatchey): add how-it-works 3-step section"
```

---

## Task 9: Create `ClatcheySmsCoaching.tsx` (with phone mockup)

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheySmsCoaching.tsx`

- [ ] **Step 1: Create the SMS coaching section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheySmsCoaching.tsx`:

```typescript
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheySmsCoaching() {
  return (
    <section
      id="sms"
      className="bg-msj-night text-msj-cream py-20 md:py-28 border-t border-msj-cream/5"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="text-[10px] tracking-[0.28em] text-msj-purple-tint font-bold mb-4">
            DAILY SMS COACHING
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">A coach in</span>
            <span className="block">
              your <span className="text-msj-purple-tint">pocket.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-msj-cream/70 leading-relaxed max-w-lg">
            <p>
              Every morning, Coach Clatchey&apos;s program sends the day&apos;s workout right
              to your phone — short enough to actually do, specific enough to actually move
              you forward.
            </p>
            <p>Reply with how it went. Skip a day if life happens. The plan keeps adapting.</p>
          </div>
          <a
            href={CLATCHEY_SIGNUP_URL}
            className="inline-block mt-8 bg-msj-purple text-msj-cream text-xs md:text-sm tracking-[0.22em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
          >
            START $25 / MO
          </a>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-[280px] md:w-[320px] aspect-[9/19] rounded-[2.5rem] bg-black border-[10px] border-msj-cream/10 shadow-2xl shadow-black/60 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
      <div className="h-full overflow-hidden bg-[#0d0a18] px-3 pt-10 pb-6 space-y-3">
        <Bubble side="meta">Mon · 6:38 AM</Bubble>
        <Bubble side="left">
          Today is footwork. 50 form shots from the elbow + 3 sets of jab-step into pull-up.
          Stay in your stance. Send a clip.
        </Bubble>
        <Bubble side="right">Done. Felt slow on the second set.</Bubble>
        <Bubble side="meta">Tue · 6:40 AM</Bubble>
        <Bubble side="left">
          Slow is real. Today: 20 min ball-handling — 2-ball pound, in-and-out, killer cross.
          3 sets x 30s. Then write 3 things you saw on yesterday&apos;s clip.
        </Bubble>
        <Bubble side="right">Sent.</Bubble>
        <Bubble side="meta">Wed · 6:42 AM</Bubble>
        <Bubble side="left">
          Good read on the help-side. Today is conditioning + reads — 5 suicides, then film.
          We&apos;re building. Keep showing up.
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({
  side,
  children,
}: {
  side: 'left' | 'right' | 'meta';
  children: React.ReactNode;
}) {
  if (side === 'meta') {
    return (
      <div className="text-center text-[9px] tracking-[0.18em] text-msj-cream/35 font-semibold py-1">
        {children}
      </div>
    );
  }
  const base = 'max-w-[80%] text-[11px] leading-snug rounded-2xl px-3 py-2';
  return side === 'left' ? (
    <div className={`${base} bg-msj-cream/10 text-msj-cream/85 mr-auto rounded-bl-md`}>
      {children}
    </div>
  ) : (
    <div className={`${base} bg-msj-purple text-msj-cream ml-auto rounded-br-md`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheySmsCoaching.tsx
git commit -m "feat(clatchey): add SMS coaching section with phone mockup"
```

---

## Task 10: Create `ClatcheyPricing.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPricing.tsx`

- [ ] **Step 1: Create the pricing section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPricing.tsx`:

```typescript
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

const FEATURES = [
  {
    title: 'Daily SMS workouts',
    body: 'A coach-written workout in your messages every morning.',
  },
  {
    title: 'Reply anytime',
    body: 'Tell us how it went, what to skip, what to push — the plan adapts.',
  },
  {
    title: 'Cancel anytime',
    body: "No contract. Stay as long as it's helping you grow.",
  },
  {
    title: 'In-person camp (optional)',
    body: 'Mt. St. Joe summer camp registers separately on the school site.',
  },
];

export function ClatcheyPricing() {
  return (
    <section id="pricing" className="bg-msj-cream text-msj-purple-deep py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
          THE PRICE
        </div>
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">One price.</span>
          <span className="block text-msj-purple">All in.</span>
        </h2>

        <div className="mt-12 rounded-2xl bg-msj-purple-deep/5 border border-msj-purple-deep/10 p-7 md:p-10 text-left">
          <div className="text-[11px] tracking-[0.28em] text-msj-purple-deep/60 font-bold mb-1">
            DAILY SMS COACHING
          </div>
          <div className="flex items-baseline gap-2 mb-7">
            <span className="font-display-condensed text-7xl md:text-8xl leading-none text-msj-purple-deep">
              $25
            </span>
            <span className="text-[11px] tracking-[0.2em] text-msj-purple-deep/60 font-semibold">
              / MONTH
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold bg-msj-purple text-msj-cream">
                  ✓
                </span>
                <div className="min-w-0">
                  <div className="text-sm md:text-base font-bold text-msj-purple-deep">
                    {f.title}
                  </div>
                  <div className="text-xs md:text-sm text-msj-purple-deep/65 mt-0.5">
                    {f.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={CLATCHEY_SIGNUP_URL}
            className="block text-center text-xs md:text-sm tracking-[0.22em] font-bold py-4 rounded-full bg-msj-purple-deep text-msj-cream hover:brightness-125 transition-all"
          >
            START NOW
          </a>

          <div className="mt-4 text-[10px] tracking-[0.2em] text-msj-purple-deep/50 font-semibold text-center">
            BILLED MONTHLY · CANCEL ANY TIME
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyPricing.tsx
git commit -m "feat(clatchey): add single-tier pricing section"
```

---

## Task 11: Create `ClatcheyFAQ.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFAQ.tsx`

- [ ] **Step 1: Create the FAQ section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFAQ.tsx`:

```typescript
const FAQS_LEFT = [
  {
    q: "What if I'm not at Clatchey's level?",
    a: "Plans scale to where you are. Tell us your level when you sign up; the workouts adjust. We coach beginners and college recruits the same way: meet you where you are, push you forward.",
  },
  {
    q: 'How long are the daily workouts?',
    a: 'Most are 30–45 minutes. Designed to actually be done, not skipped.',
  },
  {
    q: 'Do I need a gym?',
    a: "A hoop helps. Most days are doable with a basketball, a wall, and some space. We'll specify when court time is required.",
  },
  {
    q: 'Is the camp included?',
    a: 'No. The camp is run by Mt. St. Joseph and registered separately on the school site. The daily SMS subscription is the standalone product here.',
  },
];

const FAQS_RIGHT = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contract. Cancel from your account, no questions.',
  },
  {
    q: 'What ages?',
    a: 'Built for middle school through college. Younger players welcome with parental signup.',
  },
  {
    q: 'Will I actually hear from Coach?',
    a: "Coach Clatchey writes the program. Day-to-day responses come from his coaching staff and the GymText system, modeled on his approach.",
  },
  {
    q: 'Does the plan adapt to my season?',
    a: 'Yes. Tell us when your season starts; off-season, in-season, and post-season programming all run differently.',
  },
];

export function ClatcheyFAQ() {
  return (
    <section
      id="faq"
      className="bg-msj-cream text-msj-purple-deep py-20 md:py-28 border-t border-msj-purple-deep/10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Questions,</span>
            <span className="block text-msj-purple">answered.</span>
          </h2>
          <p className="text-base md:text-lg text-msj-purple-deep/65 leading-relaxed max-w-2xl">
            Everything you need to know before signing up. Still curious? Reply to any text
            after you start.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
          <div>
            {FAQS_LEFT.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
          <div>
            {FAQS_RIGHT.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-msj-purple-deep/10 py-5 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex items-start justify-between gap-6 cursor-pointer text-sm md:text-base font-semibold text-msj-purple-deep list-none">
        <span>{q}</span>
        <span className="shrink-0 text-msj-purple text-xl leading-none mt-0.5 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-msj-purple-deep/65 leading-relaxed pr-8">{a}</p>
    </details>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFAQ.tsx
git commit -m "feat(clatchey): add SMS-focused FAQ section"
```

---

## Task 12: Create `ClatcheyCTA.tsx` (final CTA)

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCTA.tsx`

- [ ] **Step 1: Create the final CTA section**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCTA.tsx`:

```typescript
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheyCTA() {
  return (
    <section className="bg-msj-purple-deep text-msj-cream py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-display-condensed text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.95] tracking-tight">
          <span className="block">Train like a Mount man.</span>
          <span className="block">
            Starting <span className="text-msj-purple-tint">tomorrow.</span>
          </span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-msj-cream/85 leading-relaxed">
          Join the daily workout program. Two-minute signup. Cancel anytime.
        </p>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="inline-block mt-9 bg-msj-cream text-msj-purple-deep text-xs md:text-sm tracking-[0.22em] font-bold px-9 py-5 rounded-full hover:brightness-95 transition-all"
        >
          START $25 / MO
        </a>
        <div className="mt-6 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/75 font-semibold">
          DAILY SMS COACHING · NO CAMP REQUIRED
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyCTA.tsx
git commit -m "feat(clatchey): add final CTA section"
```

---

## Task 13: Create `ClatcheyFooter.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFooter.tsx`

- [ ] **Step 1: Create the footer**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFooter.tsx`:

```typescript
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';
import { CAMP_SIGNUP_URL } from './ClatcheyCamp';

interface PressArticle {
  title: string;
  source: string;
  url: string;
}

const PRESS_LINKS: PressArticle[] = [
  {
    title: 'A Baltimore Basketball Legend',
    source: 'MSJ Student Media',
    url: 'https://msjstudent.media/2021/10/25/coach-pat-clatchey-a-baltimore-basketball-legend/',
  },
  {
    title: 'Mount St. Joseph Alums Dot the Map',
    source: 'Catholic Review',
    url: 'https://catholicreview.org/thanks-to-coach-clatchey-mount-st-joseph-alums-dot-the-basketball-map/',
  },
  {
    title: 'Coach Clatchey Wins No. 800',
    source: 'Baltimore Sun',
    url: 'https://www.baltimoresun.com/2023/12/04/mount-saint-joseph-basketball-coach-pat-clatchey-win-800/',
  },
  {
    title: "McDonald's All-American Coach",
    source: 'MaxPreps',
    url: 'https://www.maxpreps.com/news/S300c1HCd0GI9UEbDM0p1w/mcdonalds-boys-all-american-team-announced.htm',
  },
];

export function ClatcheyFooter() {
  return (
    <footer className="bg-msj-night text-msj-cream border-t border-msj-cream/5 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={120}
            height={28}
            className="h-6 w-auto mb-4"
          />
          <p className="text-xs text-msj-cream/55 leading-relaxed">
            Daily SMS coaching from Hall-of-Fame coach Pat Clatchey. Built for players who
            want to play at the next level.
          </p>
        </div>

        <FooterColumn title="THE PROGRAM">
          <FooterLink href={CLATCHEY_SIGNUP_URL}>Subscribe — $25/mo</FooterLink>
          <FooterLink href="#sms">How it works</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
          <FooterLink href={CAMP_SIGNUP_URL}>In-person camp</FooterLink>
        </FooterColumn>

        <FooterColumn title="FEATURED PRESS">
          {PRESS_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-msj-cream/65 hover:text-msj-purple-tint transition-colors text-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                <span className="block text-msj-cream font-medium">{link.title}</span>
                <span className="text-xs text-msj-cream/50">{link.source}</span>
              </span>
            </a>
          ))}
        </FooterColumn>

        <FooterColumn title="CONTACT">
          <FooterLink href="mailto:hello@gymtext.co">hello@gymtext.co</FooterLink>
          <span className="text-sm text-msj-cream/65">Baltimore, MD</span>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-msj-cream/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[10px] tracking-[0.22em] text-msj-cream/40 font-semibold">
          <span>© 2026 GYMTEXT × COACH CLATCHEY</span>
          <div className="flex items-center gap-2">
            <span>POWERED BY</span>
            <Image
              src="/WordmarkWhite.png"
              alt="GymText"
              width={70}
              height={16}
              className="h-3.5 w-auto opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.28em] text-msj-cream/40 font-bold mb-4">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-msj-cream/65 hover:text-msj-purple-tint transition-colors"
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyFooter.tsx
git commit -m "feat(clatchey): add footer with press links and contact"
```

---

## Task 14: Create `ClatcheyStickyCTA.tsx`

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStickyCTA.tsx`

- [ ] **Step 1: Create the sticky CTA**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStickyCTA.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheyStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-msj-night border-t border-msj-cream/10 shadow-2xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-msj-cream/50 font-bold uppercase">
            Coach Clatchey · $25/mo
          </p>
          <p className="text-sm font-bold text-msj-cream">Daily SMS coaching</p>
        </div>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="bg-msj-purple text-msj-cream px-5 py-3 rounded-full font-bold text-xs tracking-[0.2em] hover:brightness-110 transition-all"
        >
          START
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyStickyCTA.tsx
git commit -m "feat(clatchey): add mobile sticky CTA"
```

---

## Task 15: Create `ClatcheyLandingPage.tsx` and wire all sections together

**Files:**
- Create: `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyLandingPage.tsx`

- [ ] **Step 1: Create the LandingPage shell**

Create `apps/web/src/components/pages/owner-landing/clatchey/ClatcheyLandingPage.tsx`:

```typescript
import Image from 'next/image';
import Link from 'next/link';
import { ClatcheyHero, CLATCHEY_SIGNUP_URL } from './ClatcheyHero';
import { ClatcheyStatsBar } from './ClatcheyStatsBar';
import { ClatcheyBioSection } from './ClatcheyBioSection';
import { ClatcheyPlayerShowcase } from './ClatcheyPlayerShowcase';
import { ClatcheyCamp } from './ClatcheyCamp';
import { ClatcheyHowItWorks } from './ClatcheyHowItWorks';
import { ClatcheySmsCoaching } from './ClatcheySmsCoaching';
import { ClatcheyPricing } from './ClatcheyPricing';
import { ClatcheyFAQ } from './ClatcheyFAQ';
import { ClatcheyCTA } from './ClatcheyCTA';
import { ClatcheyFooter } from './ClatcheyFooter';
import { ClatcheyStickyCTA } from './ClatcheyStickyCTA';

export function ClatcheyLandingPage() {
  return (
    <div className="min-h-screen bg-msj-night text-msj-cream">
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={100}
            height={24}
            className="h-6 md:h-7 w-auto"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.18em] text-msj-cream/70 font-semibold">
          <a href="#bio" className="hover:text-msj-cream transition-colors">COACH</a>
          <a href="#proof" className="hover:text-msj-cream transition-colors">PROOF</a>
          <a href="#camp" className="hover:text-msj-cream transition-colors">CAMP</a>
          <a href="#sms" className="hover:text-msj-cream transition-colors">SMS</a>
          <a href="#faq" className="hover:text-msj-cream transition-colors">FAQ</a>
        </div>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="bg-msj-purple text-msj-cream text-[11px] md:text-xs tracking-[0.18em] font-bold px-4 md:px-5 py-2.5 rounded-full hover:brightness-110 transition-all"
        >
          START $25/MO
        </a>
      </nav>

      <ClatcheyHero />
      <ClatcheyStatsBar />
      <ClatcheyBioSection />
      <ClatcheyPlayerShowcase />
      <ClatcheyCamp />
      <ClatcheyHowItWorks />
      <ClatcheySmsCoaching />
      <ClatcheyPricing />
      <ClatcheyFAQ />
      <ClatcheyCTA />
      <ClatcheyFooter />
      <ClatcheyStickyCTA />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/pages/owner-landing/clatchey/ClatcheyLandingPage.tsx
git commit -m "feat(clatchey): add landing page shell wiring all sections"
```

---

## Task 16: Switch `page.tsx` to the new component path

**Files:**
- Modify: `apps/web/src/app/clatchey/page.tsx`

- [ ] **Step 1: Update the import path and metadata**

Replace the contents of `apps/web/src/app/clatchey/page.tsx` with:

```typescript
import type { Metadata } from 'next';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/clatchey';
import './clatchey.css';

const TITLE = 'Coach Pat Clatchey · Daily SMS Coaching · GymText';
const DESCRIPTION =
  '30 years of winning, now on your phone. Daily SMS basketball coaching from Hall-of-Fame coach Pat Clatchey — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. $25/mo. Cancel anytime.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ClatcheyPage() {
  return <ClatcheyLandingPage />;
}
```

- [ ] **Step 2: Verify the page renders end-to-end**

In the browser at `http://localhost:3000/clatchey`, scroll the entire page top to bottom. All 13 sections should render without errors. Check the browser console for any image-load failures.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/clatchey/page.tsx
git commit -m "feat(clatchey): switch route to new component path with refreshed metadata"
```

---

## Task 17: Update remaining references and delete the old Clatchey components

The old Clatchey components are referenced in two more places besides `app/clatchey/page.tsx` (already handled in Task 16):
- `apps/web/src/app/o/[slug]/page.tsx` — the legacy `/o/<slug>` route. `next.config.ts` permanently redirects `/o/coachclatchey` → `/clatchey`, so the slug page never serves Clatchey at runtime, but the import must still resolve at build time. We update the import path to point to the new location.
- `apps/web/src/components/pages/owner-landing/index.ts` — the parent barrel re-exports the old Clatchey components. We remove those re-exports (the new `clatchey/index.ts` barrel is the single source of truth now).

**Files:**
- Modify: `apps/web/src/app/o/[slug]/page.tsx`
- Modify: `apps/web/src/components/pages/owner-landing/index.ts`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyLandingPage.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyHero.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyStatsBar.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyBioSection.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyPlayerShowcase.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyProgramTracks.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyCTA.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyStickyCTA.tsx`
- Delete: `apps/web/src/components/pages/owner-landing/ClatcheyFooter.tsx`

- [ ] **Step 1: Update the import in `o/[slug]/page.tsx`**

In `apps/web/src/app/o/[slug]/page.tsx`, change line 3 from:

```typescript
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/ClatcheyLandingPage';
```

to:

```typescript
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/clatchey';
```

(The other imports — `MikeyLandingPage`, `NextLevelLandingPage` — and the `clatchey.css`/`mikey.css`/`next-level.css` imports stay as they are.)

- [ ] **Step 2: Update the parent barrel `owner-landing/index.ts`**

Replace the contents of `apps/web/src/components/pages/owner-landing/index.ts` with:

```typescript
export { MikeyLandingPage } from './MikeyLandingPage';
export { MikeyHero } from './MikeyHero';
export { MikeyStatsBar } from './MikeyStatsBar';
export { MikeyBioSection } from './MikeyBioSection';
export { MikeyPhotoShowcase } from './MikeyPhotoShowcase';
export { MikeyProgramTracks } from './MikeyProgramTracks';
export { MikeyCTA } from './MikeyCTA';
export { MikeyStickyCTA } from './MikeyStickyCTA';
export { MikeyFooter } from './MikeyFooter';
```

(All Clatchey re-exports removed. Mikey re-exports preserved.)

- [ ] **Step 3: Verify no other code imports the old Clatchey components**

Run:

```bash
grep -rn "owner-landing/Clatchey\|from '\./Clatchey" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: zero results. If anything still references the old paths, fix it before proceeding to deletion.

- [ ] **Step 4: Delete the old files**

```bash
rm apps/web/src/components/pages/owner-landing/ClatcheyLandingPage.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyHero.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyStatsBar.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyBioSection.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyPlayerShowcase.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyProgramTracks.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyCTA.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyStickyCTA.tsx \
   apps/web/src/components/pages/owner-landing/ClatcheyFooter.tsx
```

- [ ] **Step 5: Commit**

```bash
git add -A apps/web/src/components/pages/owner-landing/ apps/web/src/app/o/
git commit -m "chore(clatchey): remove legacy components and update remaining references"
```

---

## Task 18: Final verification — build, lint, visual QA

**Files:** none (verification only)

- [ ] **Step 1: Run the build**

```bash
source .env.local && pnpm build:web
```

Expected: build completes without errors. The CLAUDE.md note says `tsc` alone is insufficient; this catches Next.js bundling, route generation, and tree-shaking issues.

- [ ] **Step 2: Run lint**

```bash
source .env.local && pnpm lint
```

Expected: zero errors, zero warnings on the Clatchey files.

- [ ] **Step 3: Visual QA on desktop**

Open `http://localhost:3000/clatchey` in a desktop browser (≥ 1280px wide). Verify:

1. Hero renders with the Catholic Review portrait, two CTAs, and the eyebrow row.
2. Marquee animates left-to-right.
3. Bio section shows the portrait, "Three decades. One coach. A dynasty." headline, and the 30+ / 850+ / 20+ stat trio.
4. NBA showcase shows all 4 players with NBA badges on the first 3.
5. Camp section "Sign up for camp" link opens `https://www.msjnet.edu/athletics/camps` in a new tab.
6. SMS phone mockup shows the purple-bubble messages.
7. Pricing card shows $25/mo with 4 features.
8. FAQ has all 8 questions, first one open by default.
9. Final purple CTA shows "Train like a Mount man."
10. Footer has 4 press links, Program column, Contact column.

- [ ] **Step 4: Visual QA on mobile (≤ 480px wide)**

Resize the browser or use device emulation. Verify:

1. Nav collapses to logo + START pill (no link row).
2. Hero stacks portrait below copy.
3. Bio section stacks portrait above text.
4. NBA showcase becomes 2×2 grid.
5. Camp fact strip stacks vertically.
6. Pricing card centers and remains readable.
7. After scrolling 500px, the sticky CTA appears at the bottom of the viewport with "Coach Clatchey · $25/mo · START".
8. The sticky CTA is hidden on desktop (md: breakpoint).

- [ ] **Step 5: Visual QA on `prefers-reduced-motion`**

In browser dev tools, enable `prefers-reduced-motion: reduce`. Reload `/clatchey`. The marquee should freeze (no animation).

- [ ] **Step 6: Final commit if any fixes were needed**

If steps 1-5 surfaced any issues that required code changes, commit those fixes:

```bash
git add -A
git commit -m "fix(clatchey): visual QA cleanup"
```

If no fixes needed, no commit. Done.

---

## Self-Review Checklist (run before handoff)

- [x] **Spec coverage:** All 13 sections from the spec are covered by Tasks 3–14. The single-tier pricing, the camp external link, the Catholic Review portrait, and the 5 color tokens are all implemented.
- [x] **Placeholder scan:** No "TBD"/"TODO" in any task. Every code step has complete code.
- [x] **Type consistency:** `CLATCHEY_SIGNUP_URL` is exported from `ClatcheyHero.tsx` (Task 3) and imported in 5 later tasks. `CAMP_SIGNUP_URL` is exported from `ClatcheyCamp.tsx` (Task 7) and imported in `ClatcheyFooter.tsx` (Task 13). `CLATCHEY_PORTRAIT_URL` exported from Task 3, used in Task 5.
- [x] **Component naming:** All components use `Clatchey` prefix. All file paths follow the NLB pattern. Barrel `index.ts` (Task 2) re-exports all 13 components by their actual names.
- [x] **CSS class coverage:** Every Tailwind class used in the components has a corresponding declaration in `clatchey.css` (Task 1). `bg-msj-night`, `bg-msj-cream`, `bg-msj-purple-deep`, `bg-msj-purple`, `bg-msj-purple/10`, `text-msj-cream/70`, `border-msj-cream/10`, etc. all declared.
- [x] **Old code removal:** Task 17 deletes 9 old Clatchey component files, updates the legacy `/o/[slug]` route's import, and removes Clatchey re-exports from the parent `owner-landing/index.ts` barrel. The Step 3 grep verifies no stragglers reference the old paths.
