# Test User Personas

This document defines test user personas for gymtext development and testing. Each persona represents a realistic user profile with specific goals, constraints, and preferences to stress-test all aspects of the agent system.

## Detail Level Distribution

Personas are intentionally varied in detail to simulate real onboarding scenarios:
- **Sparse (4):** Minimal information, vague goals, basic metrics
- **Moderate (7):** Standard detail level
- **Detailed (4):** Extensive background, metrics, and preferences

This tests how agents handle incomplete vs. comprehensive user data.

---

## Persona: Sarah Chen
**Detail Level:** Sparse

**Demographics:**
- Age: 28
- Gender: Female
- Phone: +13392220001

**Experience:**
- Level: Novice
- Background: Started a few months ago. Desk job.

**Goals:**
- Get stronger and lose some weight

**Schedule:**
- Days available: Mon/Wed/Fri
- Session duration: 45 min

**Equipment:**
- Location: Commercial gym
- Available: Barbells, dumbbells, machines

**Metrics (starting):**
- Bodyweight: ~145 lb

**Notes:**
Classic beginner who needs hand-holding and encouragement. Great for testing onboarding, educational content, and progressive overload from basics. Should test agent's ability to build confidence while introducing fundamental movements safely.

---

## Persona: Marcus Johnson
**Detail Level:** Detailed

**Demographics:**
- Age: 32
- Gender: Male
- Phone: +13392220002

**Experience:**
- Level: Intermediate (2.5 years focused powerlifting, 4 years total lifting)
- Background: Started with general strength training in 2020, switched to powerlifting-specific training in 2022. Competed in USAPL local meet (Nov 2024, went 8/9, placed 3rd in 220 lb class). Currently 12 weeks out from Spring Regional meet (May 17, 2025). Works with coach for technique but wants programming support.

**Goals:**
- Primary: Increase competition total from 1350 lb → 1450 lb (100 lb increase)
  - Squat: 455 → 485 lb (+30 lb)
  - Bench: 315 → 340 lb (+25 lb)
  - Deadlift: 580 → 625 lb (+45 lb)
- Secondary: Fix bench press sticking point (2-3" off chest), improve squat depth consistency, stay healthy through meet prep
- Timeline: Peak for meet on May 17, 2025 (12 weeks out), then off-season hypertrophy block

**Schedule:**
- Days available: Mon/Tue/Thu/Fri (4x per week, strictly consistent)
- Blocked: Wed (date night), Sat/Sun (family time, light recovery only)
- Session duration: 90-120 min (has time, not rushed)
- Preferred time: 5:30 AM (before work as software engineer, gym is empty, best energy)
- Cannot train evenings (too tired after work)

**Equipment:**
- Location: Iron Haven Powerlifting Gym (Tempe, AZ)
- Available equipment:
  - 6 competition-spec power racks (Rogue) with full calibrated plates
  - Specialty bars: Safety Squat Bar, Swiss Bar, Football Bar, Texas Deadlift Bar, Kadillac Bar
  - Strongman equipment: Log, yoke, farmers handles
  - Chains (various weights), resistance bands (mini to monster)
  - 3 competition benches, 2 mono-lifts
  - Full dumbbell rack (5-150 lb), cable stations, GHD, reverse hyper
  - Cardio: Assault bike, SkiErg, rower (for conditioning)

**Constraints:**
- Injuries/limitations:
  - Chronic right shoulder impingement (started 2023, manages with daily band work)
  - Aggravated by high-volume overhead work or wide-grip bench
  - Sees sports PT monthly, doing rotator cuff prehab 6x/week
  - Cannot do strict overhead press, uses landmine variations
  - History: Lower back tweak (2022, fully resolved), left hip flexor strain (2023, resolved)
- Dislikes: 
  - High-rep bodybuilding work (>12 reps feels pointless)
  - Machines (prefers free weights)
  - Cardio (only does minimum for work capacity)
- Preferences:
  - Percentage-based programming (familiar with RPE and % of 1RM)
  - Loves data tracking (uses Strong app, HRV tracking, sleep tracking)
  - Prefers competition-style lifts with limited variations
  - Responds well to higher frequency (benching 3x/week works better than 2x)
  - Prefers daily undulating periodization over linear
  - Likes to know "why" behind programming choices

**Metrics (starting - tested 2 weeks ago):**
- Competition Lifts:
  - Squat: 455 lb (1RM), 425 x 2, 405 x 4, e1RM ~465 lb
  - Bench: 315 lb (1RM), 295 x 3, 275 x 6, e1RM ~320 lb
  - Deadlift: 580 lb (1RM), 545 x 2, 515 x 4, e1RM ~590 lb
  - Total: 1350 lb
- Variations:
  - Safety Squat Bar: 385 x 5
  - Close-grip bench: 275 x 5
  - Deficit deadlift (2"): 495 x 3
  - Paused squat: 405 x 2
  - Paused bench: 285 x 3
- Bodyweight: 220 lb (walks around at 218-223, competes at 220 class)
- Body comp: ~15% BF (not a focus, just stays in weight class)
- Recent progress: Added 75 lb to total in last 12 months (1275 → 1350)
- Work capacity: Can handle 20-25 working sets per session

**Training history:**
- 2020-2022: General strength training (bro splits, then Starting Strength)
- 2022: Switched to powerlifting after hitting 315/225/405
- Nov 2023: First meet (1275 total, 9/9)
- Nov 2024: Second meet (1350 total, 8/9 - missed third deadlift attempt at 605)
- Currently: Most successful training block was 6-week DUP cycle (fall 2024)

**Notes:**
Serious intermediate powerlifter with specific meet prep needs. Extremely detail-oriented (tracks everything). Tests periodization, percentage-based programming, deload management, tapering, and peak-week strategies. Should validate agent's ability to handle sport-specific programming, injury management, and working around existing PT protocols. Great for testing data-heavy conversations and technical programming discussions.

---

## Persona: Emily Rodriguez
**Detail Level:** Detailed

**Demographics:**
- Age: 42
- Gender: Female
- Phone: +13392220003

**Experience:**
- Level: Advanced (5 years serious running, 2 years strength training)
- Background: Started running at 37 after kids got older. Completed 8 marathons (PR: 3:25:17 at Chicago 2024). Added strength training in 2023 after recurring IT band syndrome derailed Boston training. Works with running coach (online) but handles own strength programming. Has solid understanding of lifting mechanics but doesn't prioritize strength PRs.

**Goals:**
- Primary: Marathon performance - Boston Qualifier attempt (need sub-3:15 for age group, shooting for 3:12 cushion)
- Secondary goals:
  - Injury prevention (specifically IT band, hip stability)
  - Maintain leg power for hills and late-race surges
  - Upper body strength for running posture/economy
  - Core stability for marathon endurance
- Timeline: Goal race on June 14, 2025 (16 weeks out), currently in base-building phase
- Long-term: If BQ achieved, run Boston 2026 for time (sub-3:10 goal)

**Schedule:**
- Strength days: Tue/Thu/Sat (3x per week, synchronized with run schedule)
- Blocked: Mon/Wed/Fri/Sun (key run workouts - cannot be sore for these)
- Session duration: 45-60 min (efficient, no time to waste)
- Preferred times:
  - Tuesday: 6:30 PM (after easy recovery run + dinner)
  - Thursday: 6:30 PM (after easy run)
  - Saturday: 8:00 AM (after morning long run - timing critical)
- Running schedule for context:
  - Monday: Intervals/tempo (key workout - needs fresh legs)
  - Wednesday: Medium-long run or hills (key workout)
  - Friday: Easy recovery
  - Sunday: Long run (16-20 miles currently, building to 22)
  - Current volume: 55 mpw, building to 65-70 mpw peak

**Equipment:**
- Location: Home gym (converted garage)
- Available:
  - Rogue squat rack with pull-up bar
  - Barbell (standard 45 lb Olympic bar)
  - Plates: 2x45, 2x25, 4x10, 4x5, 4x2.5 (total 225 lb)
  - Dumbbells: 10, 15, 20, 25, 30, 35, 40 lb pairs
  - Kettlebells: 16, 24, 32 kg
  - Resistance bands (mini, light, medium, heavy loop bands)
  - Adjustable bench (flat/incline)
  - Foam roller, lacrosse balls, massage gun
  - Yoga mat, slant board
- Does not have: Heavy plates (maxes out at 225 lb), specialty bars, cable machine, leg press

**Constraints:**
- Injuries/limitations:
  - IT band syndrome (right leg, 2022-2023, mostly resolved with PT + strength)
  - Still prone to flare-ups if leg volume too high or glute med weak
  - Tight hip flexors (common runner issue)
  - Previous: Left plantar fasciitis (2021, fully healed)
- Training interference:
  - Cannot tolerate heavy leg volume on Sat before Sunday long run
  - Eccentric leg work causes excessive soreness (avoid Nordics, heavy split squats)
  - Peak weeks (18-20 mpw): Need to reduce strength volume significantly
  - Taper phase (3 weeks pre-race): Minimal strength, maintenance only
- Dislikes:
  - Long gym sessions (45 min max or she skips)
  - Excessive leg volume (prefers quality over quantity)
  - Bodybuilding-style training (not the goal)
  - Complex exercise rotations (keeps things simple/consistent)
- Preferences:
  - Efficient workouts (supersets, circuits work well)
  - Emphasis on single-leg strength (addresses imbalances)
  - Posterior chain focus (glutes, hamstrings for running power)
  - Hip stability work (glute med, hip external rotation)
  - Understands that strength is supplementary, not primary

**Metrics (starting - tested 3 weeks ago):**
- Strength lifts:
  - Front squat: 135 lb x 5 (doesn't back squat - quad-dominant fatigues running)
  - Romanian deadlift: 185 lb x 8
  - Single-leg RDL: 30 lb DB x 10/leg
  - Bulgarian split squat: 20 lb DBs x 8/leg (prefers goblet: 35 lb KB x 10)
  - Pull-ups: 8 strict, 12 with band assist
  - Overhead press: 65 lb x 8
  - Trap bar deadlift: 205 lb x 5 (occasional substitute)
- Bodyweight: 128 lb (race weight: 125-126 lb)
- Running metrics:
  - Marathon PR: 3:25:17 (Chicago 2024)
  - Half marathon: 1:36:42 (Oct 2024)
  - 5K: 21:18 (Aug 2024)
  - Current easy pace: 8:30-9:00 min/mile
  - Tempo pace: 7:20-7:30 min/mile
  - Interval pace: 6:50-7:10 min/mile (depending on workout)
  - Long run pace: 8:45-9:15 min/mile
  - Goal marathon pace: 7:26 min/mile (3:15 pace)
  - VO2max: 49 ml/kg/min (estimated from Garmin)
- Recent progress: Added 6 minutes to marathon PR in 18 months (3:31 → 3:25)

**Training philosophy:**
- Running is priority #1, strength supports running
- Strength training reduced IT band issues dramatically (PT attribution)
- Prefers "minimum effective dose" for strength
- Values posterior chain (glutes/hamstrings) and hip stability most
- Will sacrifice upper body work before lower body injury prevention work
- Understands periodization: build strength in base phase, maintain during peak/taper

**Notes:**
Advanced endurance athlete using strength as supplementary training. Extremely detail-oriented about how strength impacts running (tracks soreness, fatigue, run performance). Tests agent's ability to program around primary sport, manage fatigue from high external training load, adjust volume week-to-week based on run schedule, and periodize strength to complement marathon training phases. Should validate intelligent interference management, injury prevention focus, and minimal effective dose philosophy.

---

## Persona: David Park
**Detail Level:** Detailed

**Demographics:**
- Age: 35
- Gender: Male
- Phone: +13392220004

**Experience:**
- Level: Advanced (7 years consistent training)
- Background: Competitive bodybuilder (men's physique division, NPC). Competed in 5 shows over 3 years (2022-2024), best placing: 2nd in regional show (June 2024, light heavyweight class). Currently 8 weeks into contest prep for NPC Western Regional (July 19, 2025 - 20 weeks out). Works from home as UX designer, flexible schedule allows optimal training/meal timing. Has worked with coach previously but doing self-coached prep this time.

**Goals:**
- Primary: Win or place top 3 at NPC Western Regional (men's physique light heavyweight)
  - Stage weight target: 175 lb (currently 185 lb, need to lose 10 lb while maintaining muscle)
  - Body composition: 6-7% body fat on stage (currently ~12%)
  - Bring up weak points: rear delts, lateral delts, arms (specifically triceps long head)
- Secondary goals:
  - Improve symmetry (left side slightly smaller)
  - Better conditioning than previous shows (tighter glutes/hamstrings)
  - Improve stage presence and posing
- Timeline:
  - Week 1-8 (current): Building phase, slight deficit
  - Week 9-16: Progressive deficit, high volume maintained
  - Week 17-19: Final push, peak week protocol
  - Week 20: Show day (July 19, 2025)
- Post-show: Reverse diet, off-season mass phase (focus on arms/shoulders)

**Schedule:**
- Days available: Mon/Tue/Thu/Fri/Sat (5x per week, non-negotiable)
- Blocked: Wed/Sun (rest days - active recovery, posing practice)
- Session duration: 75-90 min (not including cardio)
- Preferred time: 11:00 AM (works from home, trains mid-morning after 2nd meal)
- Current split: Push/Pull/Legs/Upper/Lower (PPL-UL hybrid)
- Cardio: 4x per week (20-30 min post-workout), will increase in later prep
- Weekly structure:
  - Monday: Push (chest/front delts/triceps emphasis)
  - Tuesday: Pull (back width, rear delts)
  - Thursday: Legs (quad focus, glute/ham accessories)
  - Friday: Upper (shoulders/arms specialization)
  - Saturday: Legs (glute/ham focus, quad accessories)

**Equipment:**
- Location: LA Fitness (commercial gym, 24-hour access)
- Available equipment:
  - Full dumbbell rack (5-120 lb)
  - 8 cable stations (single/double adjustable pulleys)
  - Machine selection: Hammer Strength (chest press, rows, shoulder press), leg press, hack squat, Smith machine, leg curl/extension, pec deck, lat pulldown varieties
  - 4 squat racks (rarely uses for squats due to knee)
  - Barbells (uses for RDLs, hip thrusts, some pressing)
  - Preacher curl bench, adjustable benches (flat/incline/decline)
  - Cardio: Stairmaster (preferred), treadmill, elliptical, bike
- Prefers: Cables and machines for most work (better mind-muscle connection, safer on knee)

**Constraints:**
- Injuries/limitations:
  - Left knee: ACL reconstruction (2019, 6 years post-op, fully healed but chronic instability)
  - Avoids: Heavy barbell back squats (>225 lb), deep lunges, anything with knee instability risk
  - Safe movements: Leg press, hack squat, Bulgarian split squats (controlled), smith machine, leg extensions/curls
  - Requires: Knee sleeves for leg days, thorough warmup (10 min minimum)
- Energy management:
  - Currently in caloric deficit (2200 cal, down from 2800 maintenance)
  - Energy lower in PM (prefers AM training)
  - Deep deficit fatigue expected weeks 14-18 (will need volume adjustments)
- Previous issues:
  - 2023 prep: Overtrained shoulders, had to deload week 14
  - 2024 prep: Lost too much muscle (deficit too aggressive)
- Dislikes:
  - Heavy powerlifting-style training (3-5 rep max work)
  - Barbell squats (knee concern + doesn't prioritize quad separation anyway)
  - Cardio (tolerates it, but hates it)
- Preferences:
  - Controlled tempo (3-1-1-1 or 4-0-2-0), emphasizes eccentric
  - Mind-muscle connection over weight moved
  - High volume (15-20 sets per muscle group per week)
  - Multiple angles per muscle (3-4 exercises per major group)
  - Isolation work (loves cables, machines, single-joint movements)
  - Drop sets, supersets, rest-pause in later prep

**Metrics (starting - current week 8 of prep):**
- Bodyweight: 185 lb (morning, fasted)
  - Stage target: 175 lb
  - Previous show weight: 178 lb (too heavy, placed 4th)
- Body composition:
  - Current: ~12% body fat (visual estimate, abs visible but not shredded)
  - Goal: 6-7% stage conditioning
  - Weekly tracking: Photos (daily), scale (daily AM), measurements (weekly)
- Strength (current, in caloric deficit):
  - Incline DB press: 90 lb x 10 reps
  - Flat DB press: 100 lb x 8
  - Weighted pull-ups: +45 lb x 8
  - Cable rows: 180 lb x 12
  - DB shoulder press: 70 lb x 10
  - Lateral raises: 30 lb x 15
  - Leg press: 450 lb x 15 (controlled, full ROM)
  - Romanian deadlift: 225 lb x 12
  - Leg extension: 180 lb x 15
  - Barbell hip thrust: 315 lb x 15
  - Preacher curl: 70 lb barbell x 12
  - Overhead tricep extension: 60 lb DB x 12
- Measurements (current):
  - Chest: 42"
  - Waist: 32" (goal: 29-30" on stage)
  - Arms: 15.5" (goal: maintain or grow to 16")
  - Shoulders: 50"
  - Quads: 24.5"
  - Calves: 15" (genetic weak point, not emphasized in men's physique)
- Progress tracking:
  - Weekly photos: Front/back/side (same lighting/time/day)
  - Daily weigh-ins: Track 7-day average
  - Strength: Log all workouts in spreadsheet (volume, reps, RPE)
  - Biofeedback: Sleep (7-8hr target), energy (1-10 scale), hunger (1-10 scale)

**Nutrition (context for training):**
- Current macros: 220P / 180C / 55F = ~2200 cal (deficit)
- Meal timing: 5 meals per day (every 3 hours)
- Protein: 1.2g/lb bodyweight (high to preserve muscle)
- Carbs: Cycling (higher on leg days)
- Cardio: Fasted AM (4x week, 20-30 min Stairmaster)
- Refeed: Saturday (300g carbs, maintenance calories)

**Training philosophy:**
- Volume and frequency over intensity
- Progressive overload through reps/sets (not weight, especially in deficit)
- Symmetry and proportion over absolute size
- Mind-muscle connection is king (tempo, control, squeeze)
- Strategic deloads (every 6 weeks or as needed)
- Injury prevention (ego checked at door, knee health priority)
- Data-driven adjustments (weekly check-ins with self, adjust based on biofeedback)

**Previous contest history:**
- Nov 2022: First show (NPC local, 5th place, 188 lb - too heavy, underconditioned)
- June 2023: 3rd place (regional, 182 lb - better conditioning, still too heavy)
- Nov 2023: 4th place (overreached in prep, lost muscle)
- June 2024: 2nd place (178 lb - best conditioning, but still slightly off)
- Goal: July 2025: 1st place (175 lb, 6-7% BF, peak conditioning)

**Notes:**
Advanced bodybuilder with meticulous contest prep approach. Extremely detail-oriented (tracks everything: weight, macros, workouts, photos, measurements, biofeedback). Tests agent's ability to program volume-based hypertrophy training, exercise variety, weak point specialization, progressive deficit management, deload timing, and peak week protocols. Should validate machine/cable/isolation exercise programming, body part split optimization, training adaptations during caloric deficit, and integration with nutrition phases. Great for testing data-heavy conversations, progress tracking, and contest prep periodization.

---

## Persona: Jessica Kim
**Detail Level:** Detailed

**Demographics:**
- Age: 29
- Gender: Female
- Phone: +13392220005

**Experience:**
- Level: Intermediate (2 years CrossFit, 3 years general fitness before that)
- Background: Started CrossFit in Jan 2023 at local affiliate (CrossFit Riverdale). Competed in scaled division at 3 local throwdowns (2023-2024), placed top 10 twice. Currently transitioning from scaled to Rx. Works full-time as marketing manager, trains 5x/week religiously. Solid all-around fitness with emphasis on improving Olympic lifting technique and gymnastics skills.

**Goals:**
- Primary: Compete Rx in 2025 CrossFit Open (Feb 2025, 8 weeks away)
  - Successfully complete all Rx workouts (even if slow)
  - Specifically: string together bar muscle-ups, hit heavier barbell cycling weights
- Secondary goals:
  - Increase Olympic lift maxes (C&J: 155→175 lb, Snatch: 115→135 lb)
  - Improve gymnastics: 5+ unbroken bar muscle-ups, 10+ unbroken HSPU
  - Build engine for longer chippers (often gasses out after 12-15 min)
  - Better pacing strategy in metcons
- Timeline: Open starts Feb 24, 2025 (8 weeks), then continue improving for summer competitions
- Long-term: Qualify for Quarterfinals in 2026 (top 25% in region)

**Schedule:**
- Days available: Mon/Tue/Wed/Fri/Sat (5x per week, extremely consistent)
- Blocked: Thu (rest/active recovery), Sun (social/life balance)
- Session duration: 60-75 min (includes warmup, skill, WOD, cooldown)
- Preferred time: 5:30 PM class (directly after work, non-negotiable schedule)
- Current pattern:
  - Mon: Heavy strength + short metcon
  - Tue: Skill work (Oly or gymnastics) + medium metcon
  - Wed: Benchmark WOD or longer chipper
  - Fri: Oly lifting focus + accessory
  - Sat: 9:00 AM partner WOD or team competition prep
- Occasionally does open gym (Sat afternoon) for specific weaknesses

**Equipment:**
- Location: CrossFit Riverdale (affiliate gym)
- Available equipment (full CrossFit setup):
  - 12 barbells (men's/women's Olympic bars), full bumper plate sets
  - 6 rowers (Concept2), 4 Assault bikes, 2 SkiErgs
  - Gymnastics: 8 pull-up rigs, 4 sets of rings, climbing rope, parallettes
  - Plyo boxes (20/24/30"), GHD, reverse hyper
  - Kettlebells: 8-70 lb
  - Dumbbells: 10-100 lb (pairs)
  - Sleds, sandbags, medicine balls (14-20 lb), wall ball targets
  - Heavy battle ropes, TRX, resistance bands
  - Turf area for sled pushes/pulls
- Does not have: Specialized powerlifting equipment (monolift, chains), machines

**Constraints:**
- Injuries/limitations:
  - History of right wrist strain (spring 2024) from high-rep overhead work (snatches, HSPU)
  - Managed with wrist mobility, taping for heavy days, avoiding excessive volume
  - Tends to flare up with >30 reps of snatches or >50 HSPU in single session
  - No other major injuries (lucky so far)
- Volume management:
  - Cannot handle high-volume Olympic lifting + heavy metcon in same session
  - Needs at least 1 full rest day per week or accumulates fatigue
  - Sleep quality drops if overreaching (tracks with Whoop)
- Dislikes:
  - Boring steady-state cardio (would rather do intervals/varied work)
  - Pure powerlifting-style training (likes variety)
  - Long strength sessions with minimal metcon (wants both)
- Preferences:
  - Functional movements over isolation exercises
  - Enjoys competition (even in training - likes leaderboard)
  - Loves benchmark WODs (Fran, Grace, Isabel, etc.) for progress tracking
  - Prefers EMOM/AMRAP formats over long steady work
  - Wants clear progress markers and measurable goals

**Metrics (starting - tested Jan 2025):**
- Olympic lifts (1RM):
  - Clean & jerk: 155 lb (clean PR: 165 lb, jerk is limiting factor)
  - Snatch: 115 lb
  - Power clean: 145 lb
  - Power snatch: 95 lb
  - Clean pulls: 185 lb x 3
  - Overhead squat: 105 lb
- Strength lifts:
  - Back squat: 205 lb x 1, 185 x 3
  - Front squat: 165 lb x 1
  - Deadlift: 255 lb x 1
  - Strict press: 85 lb x 1
  - Push press: 115 lb x 1
- Gymnastics:
  - Pull-ups: 15 strict, 30+ kipping unbroken
  - Chest-to-bar: 20 unbroken
  - Bar muscle-ups: 2-3 singles (cannot string yet)
  - Ring muscle-ups: 1-2 (very inconsistent)
  - HSPU: 12 unbroken (strict: 3)
  - Handstand walk: 50 feet unbroken
  - Toes-to-bar: 25+ unbroken
- Benchmark WODs:
  - Fran (21-15-9 thrusters 95lb/pull-ups): 6:45
  - Grace (30 C&J for time, 135 lb): 4:32
  - Cindy (20min AMRAP: 5 PU, 10 pushup, 15 squat): 22 rounds
  - Murph (with vest): 52:18
  - 500m row: 1:48
  - 5K run: 26:30 (not a strong runner)
- Bodyweight: 145 lb (maintains year-round)
- Body composition: ~20% BF (not a focus, just stays fit)
- Engine: Can hold 85% effort for ~8-10 min before significant drop-off

**Training history:**
- 2020-2022: General gym (OrangeTheory, some lifting)
- Jan 2023: Joined CrossFit, fell in love with it
- Summer 2023: First local throwdown (scaled, 8th place)
- Fall 2023: Consistent 5x/week training, saw big strength gains
- Spring 2024: Wrist injury, took 3 weeks easy, learned to manage volume
- Fall 2024: Started transitioning scaled→Rx, got first bar muscle-up
- Current: Focused on Open prep, most consistent training block yet

**Notes:**
Competitive CrossFit athlete with varied training needs across strength, skill, and conditioning. Very detail-oriented (tracks all benchmark times, maxes, uses Whoop for recovery). Tests agent's ability to program Olympic lifts, gymnastics progressions, metabolic conditioning, and balance all three modalities without overtraining. Should validate complex movement coaching, WOD-style programming, and periodization for CrossFit competitions. Great for testing multi-modal programming and skill progression tracking.

---

## Persona: Tom Anderson
**Detail Level:** Moderate

**Demographics:**
- Age: 51
- Gender: Male
- Phone: +13392220006

**Experience:**
- Level: Intermediate (lifting on/off for 20 years, consistent last 3 years)
- Background: Former college athlete (basketball), stayed active but inconsistent until 3 years ago. Now focused on healthy aging.

**Goals:**
- Primary: Maintain strength and muscle mass (anti-aging)
- Secondary: Joint health, mobility, stay athletic
- Timeline: No specific timeline, long-term health focus

**Schedule:**
- Days available: Mon/Wed/Fri (3x per week, very consistent)
- Session duration: 60 min
- Preferred time: 6:00 AM

**Equipment:**
- Location: Commercial gym (YMCA)
- Available: Standard commercial gym equipment

**Constraints:**
- Injuries/limitations: Arthritis in right shoulder, previous meniscus surgery (left knee), needs longer warm-up
- Dislikes: Heavy overhead pressing, max effort lifts
- Preferences: Sustainable training, values recovery, likes to feel good not destroyed

**Metrics (starting):**
- Trap bar deadlift: 275 lb x 5 (prefers over conventional)
- Goblet squat: 70 lb x 10
- Landmine press: 95 lb x 8
- Bodyweight: 195 lb (maintained well)

**Notes:**
Older athlete focused on longevity and healthy aging. Tests agent's ability to program for joint health, appropriate intensity, exercise modifications, and sustainable progression. Should validate emphasis on recovery, mobility work, and realistic expectations for masters athletes.

---

## Persona: Alex Rivera
**Detail Level:** Sparse

**Demographics:**
- Age: 24
- Gender: Non-binary
- Phone: +13392220007

**Experience:**
- Level: Novice
- Background: Recovering from ACL surgery (9 months post-op). Used to play soccer.

**Goals:**
- Get back to playing soccer
- Rebuild leg strength

**Schedule:**
- Days available: Mon/Wed/Fri/Sat
- Session duration: ~45 min

**Equipment:**
- Location: University rec center
- Available: Standard gym equipment

**Constraints:**
- Injuries/limitations: ACL reconstruction (right knee), still doing PT
- Preferences: Careful progression, nervous about re-injury

**Metrics (starting):**
- Single-leg squat: Bodyweight x 5 (surgical leg)
- Knee feels: ~90% most days

**Notes:**
Rehab/recovery focused client returning from major injury. Tests agent's ability to handle injury return protocols, build progressions carefully, integrate with PT, and manage psychological aspects of recovery. Should validate conservative programming and readiness progressions.

---

## Persona: Rachel Green
**Detail Level:** Sparse

**Demographics:**
- Age: 26
- Gender: Female
- Phone: +13392220008

**Experience:**
- Level: Novice
- Background: Busy tech worker, trying to build fitness habit at home.

**Goals:**
- Build some muscle and lose weight
- Feel less stressed

**Schedule:**
- Days available: Mon/Tue/Thu/Fri (variable)
- Session duration: 30 min (max)

**Equipment:**
- Location: Home (apartment)
- Available: Dumbbells, resistance bands, pull-up bar

**Metrics (starting):**
- Push-ups: 15

**Notes:**
Busy professional with minimal home equipment. Tests agent's ability to program effective workouts with limited gear, time-efficient sessions, and creative exercise variations. Should validate home gym programming and sustainable habit building for busy people.

---

## Persona: Brandon Taylor
**Detail Level:** Moderate

**Demographics:**
- Age: 22
- Gender: Male
- Phone: +13392220009

**Experience:**
- Level: Intermediate (3 years)
- Background: College basketball player (D3), in-season currently. Needs strength training that complements basketball without interfering.

**Goals:**
- Primary: Athletic performance for basketball (explosiveness, durability)
- Secondary: Maintain strength during season, injury prevention
- Timeline: In-season (12 weeks remaining)

**Schedule:**
- Days available: Mon/Thu (2x per week during season, limited by practice/games)
- Session duration: 45 min
- Preferred time: 2:00 PM (between classes and practice)

**Equipment:**
- Location: University athletic facility
- Available: Full athletic performance center (platforms, racks, sleds, plyo boxes, etc.)

**Constraints:**
- Injuries/limitations: Chronic ankle instability (tapes for games), can't be too sore for games
- Dislikes: High volume that impacts basketball performance
- Preferences: Explosive movements, wants to jump higher and move faster

**Metrics (starting):**
- Back squat: 285 lb x 3
- Power clean: 205 lb x 2
- Trap bar jump: 135 lb
- Vertical jump: 32 inches
- Bodyweight: 185 lb

**Notes:**
In-season athlete needing sport-specific training that doesn't interfere with primary sport. Tests agent's ability to program low-volume explosive work, manage fatigue around games, and prioritize performance over gains. Should validate in-season athlete management and sport-specific needs.

---

## Persona: Linda Martinez
**Detail Level:** Sparse

**Demographics:**
- Age: 38
- Gender: Female
- Phone: +13392220010

**Experience:**
- Level: Novice
- Background: Single parent, very busy. Just started working out.

**Goals:**
- Lose weight and have more energy for kids

**Schedule:**
- Days available: Whenever possible (3x per week goal)
- Session duration: 20-30 min max

**Equipment:**
- Location: Home (garage)
- Available: Kettlebells, bands

**Constraints:**
- Very limited time, schedule is unpredictable
- Postpartum issues (needs some core modifications)

**Metrics (starting):**
- Bodyweight: 168 lb (wants to lose ~25 lb)

**Notes:**
Time-starved parent with minimal equipment and unpredictable schedule. Tests agent's ability to provide flexible programming, very short workouts, simple exercises, and accommodate schedule variability. Should validate adaptation to chaotic life schedules and postpartum modifications.

---

## Persona: Chris Bennett
**Detail Level:** Moderate

**Demographics:**
- Age: 45
- Gender: Male
- Phone: +13392220011

**Experience:**
- Level: Advanced (12 years cycling, 4 years strength)
- Background: Competitive cyclist (Cat 3 road racer), uses strength training purely for cycling performance and injury prevention.

**Goals:**
- Primary: Cycling performance (power output, durability on bike)
- Secondary: Prevent overuse injuries, maintain upper body strength
- Timeline: Peak racing season in 10 weeks

**Schedule:**
- Days available: Tue/Fri (2x per week, cycling is priority)
- Session duration: 40-50 min (short, focused)
- Preferred time: 6:00 PM (after recovery rides)

**Equipment:**
- Location: Home gym (basement)
- Available: Barbell, plates (up to 300 lb), squat rack, bench

**Constraints:**
- Injuries/limitations: Tight hip flexors, previous lower back strain from poor bike fit (resolved)
- Dislikes: Leg volume that impacts cycling workouts, anything that makes legs heavy
- Preferences: Minimal effective dose for strength, emphasis on mobility and stability

**Metrics (starting):**
- Cycling FTP: 315 watts
- Trap bar deadlift: 250 lb x 5 (maintenance only)
- Single-leg RDL: 40 lb x 8
- Doesn't care about strength PRs, only cycling performance

**Notes:**
Endurance athlete (cycling) using strength as supplementary training with minimal interference. Tests agent's ability to program minimal effective dose, schedule around high cycling volume, and emphasize injury prevention over strength gains. Should validate sport-specific support role programming.

---

## Persona: Mia Thompson
**Detail Level:** Moderate

**Demographics:**
- Age: 30
- Gender: Female
- Phone: +13392220012

**Experience:**
- Level: Intermediate (2 years)
- Background: Alpine ski racer (amateur/masters level), trains year-round with off-season strength focus and in-season maintenance.

**Goals:**
- Primary: Ski performance (leg power, stability, injury prevention)
- Secondary: Core strength, explosive power, single-leg strength
- Timeline: Currently off-season (8 months until ski season)

**Schedule:**
- Days available: Mon/Tue/Thu/Sat (4x per week)
- Session duration: 60-75 min
- Preferred time: Morning (varies)

**Equipment:**
- Location: Hybrid (commercial gym + home)
- Available: Full commercial gym access, some home equipment for quick sessions

**Constraints:**
- Injuries/limitations: Previous MCL sprain (right knee), manages with prehab and stability work
- Dislikes: Upper body emphasis, wants leg-focused training
- Preferences: Explosive movements, plyometrics, heavy single-leg work

**Metrics (starting):**
- Back squat: 185 lb x 5
- Bulgarian split squat: 50 lb DBs x 8
- Box jump: 30 inches
- Lateral bounds: 8 feet
- Bodyweight: 155 lb

**Notes:**
Sport-specific athlete (skiing) with seasonal periodization needs. Tests agent's ability to program for explosive power, single-leg strength, off-season vs in-season phases, and sport-specific movement patterns. Should validate seasonal athlete programming and injury prevention protocols.

---

## Persona: Jordan Phillips
**Detail Level:** Moderate

**Demographics:**
- Age: 27
- Gender: Male
- Phone: +13392220013

**Experience:**
- Level: Intermediate (18 months)
- Background: Former "skinny guy," focused on muscle gain and body recomposition. Dedicated to getting bigger and stronger.

**Goals:**
- Primary: Hypertrophy (gain 15 more lbs muscle)
- Secondary: Increase main lifts, look more athletic
- Timeline: Long-term (next 6-8 months)

**Schedule:**
- Days available: Mon/Tue/Thu/Fri/Sat (5x per week)
- Session duration: 75 min
- Preferred time: 6:00 PM

**Equipment:**
- Location: Commercial gym
- Available: Full equipment

**Constraints:**
- Injuries/limitations: None
- Dislikes: Cardio, prefers pure lifting
- Preferences: Progressive overload, wants to track everything, enjoys PRs

**Metrics (starting):**
- Bench press: 185 lb x 5
- Squat: 225 lb x 5
- Deadlift: 275 lb x 5
- Bodyweight: 165 lb (started at 145 lb)
- Eating in surplus

**Notes:**
Classic hardgainer focused on hypertrophy and strength. Tests agent's ability to program for muscle growth, balanced progression, and appropriate volume for intermediate lifter. Should validate upper/lower or PPL splits and progressive overload strategies.

---

## Persona: Samantha Lee
**Detail Level:** Moderate

**Demographics:**
- Age: 33
- Gender: Female
- Phone: +13392220014

**Experience:**
- Level: Novice (4 months)
- Background: Postpartum (6 months), cleared by doctor to return to exercise. Previously moderately active but took pregnancy/postpartum break.

**Goals:**
- Primary: Rebuild core strength and pelvic floor function
- Secondary: General fitness, regain pre-pregnancy strength
- Timeline: No rush, gradual progression

**Schedule:**
- Days available: Mon/Wed/Fri (3x per week when baby naps cooperate)
- Session duration: 30-45 min
- Preferred time: 10:00 AM (mid-morning nap)

**Equipment:**
- Location: Home
- Available: Resistance bands, 10/15/20 lb dumbbells, exercise ball, yoga mat

**Constraints:**
- Injuries/limitations: Postpartum diastasis recti, pelvic floor weakness (working with pelvic PT)
- Dislikes: High-impact movements, exercises that cause leaking or coning
- Preferences: Core-safe exercises, gentle progression, wants pelvic floor integration

**Metrics (starting):**
- Bodyweight squat: 12 reps
- Modified push-ups (elevated): 8 reps
- Dead bug: 10 reps controlled
- Glute bridge: 15 reps
- Cleared for exercise but needs modifications

**Notes:**
Postpartum client with specific core/pelvic floor considerations. Tests agent's ability to program around diastasis recti, integrate pelvic floor exercises, avoid problematic movements, and progress conservatively. Should validate postpartum-specific programming and awareness of contraindications.

---

## Persona: Kevin O'Brien
**Detail Level:** Moderate

**Demographics:**
- Age: 36
- Gender: Male
- Phone: +13392220015

**Experience:**
- Level: Intermediate (3 years)
- Background: General fitness enthusiast, no specific sport, just wants to be strong and capable. Enjoys variety.

**Goals:**
- Primary: General strength and fitness (jack of all trades)
- Secondary: Be ready for anything (hiking, sports, challenges)
- Timeline: No specific timeline, ongoing development

**Schedule:**
- Days available: Mon/Wed/Fri/Sat (4x per week)
- Session duration: 60 min
- Preferred time: 12:00 PM (lunch hour)

**Equipment:**
- Location: Commercial gym (Crunch Fitness)
- Available: Full commercial gym equipment

**Constraints:**
- Injuries/limitations: None currently
- Dislikes: Monotonous programming, likes variation
- Preferences: Mix of strength, conditioning, some skills (handstands, etc.), enjoys challenges

**Metrics (starting):**
- Squat: 245 lb x 5
- Bench: 205 lb x 5
- Deadlift: 315 lb x 5
- Can run 5K in 25 minutes
- Bodyweight: 180 lb

**Notes:**
General fitness enthusiast wanting broad capabilities. Tests agent's ability to program balanced training across strength, conditioning, and skills without specific sport focus. Should validate generalist programming and appropriate variety without losing focus.

---

## Implementation Notes

### Phone Number Range
All test personas use phone numbers in the range `+13392220001` through `+13392220015` (15 personas total).

### Coverage Matrix

**Activities:**
- ✅ Powerlifting (Marcus)
- ✅ Running (Emily)
- ✅ Bodybuilding (David)
- ✅ CrossFit (Jessica)
- ✅ General fitness (Sarah, Rachel, Linda, Jordan, Kevin)
- ✅ Sports-specific: Basketball (Brandon), Skiing (Mia), Cycling (Chris)
- ✅ Rehab/recovery (Alex)

**Experience Levels:**
- ✅ Novice: Sarah, Rachel, Linda, Alex, Samantha (5)
- ✅ Intermediate: Marcus, Jessica, Tom, Brandon, Mia, Jordan, Kevin (7)
- ✅ Advanced: Emily, David, Chris (3)

**Goals:**
- ✅ Strength: Marcus, Jordan
- ✅ Hypertrophy: David, Jordan
- ✅ Fat loss: Sarah, Rachel, Linda
- ✅ Performance: Emily, Jessica, Brandon, Mia, Chris
- ✅ Maintenance: Tom, Kevin
- ✅ Injury recovery: Alex, Samantha

**Equipment:**
- ✅ Commercial gym: Sarah, Marcus, David, Jessica, Tom, Kevin
- ✅ Home gym: Emily, Rachel, Linda, Samantha
- ✅ Minimal/bodyweight: Rachel (limited), Linda (limited)
- ✅ Hybrid: Mia
- ✅ Specialty: Marcus (powerlifting), Jessica (CrossFit), Brandon (university)

**Constraints:**
- ✅ Injuries: Marcus (shoulder), Emily (IT band history), David (knee), Tom (shoulder, knee), Alex (ACL recovery), Brandon (ankle), Chris (hip/back history), Mia (knee history), Samantha (diastasis recti, pelvic floor)
- ✅ Time limits: Rachel, Linda
- ✅ Schedule variability: Linda, Brandon (in-season)

**Demographics:**
- Ages: 22-51 (good distribution across 20s, 30s, 40s, 50s)
- Gender: 8 female, 6 male, 1 non-binary
- Life stages: Student (Brandon), working professionals (most), parents (Linda, Samantha), masters athlete (Tom)

### Testing Use Cases

These personas should enable testing of:
1. **Onboarding flows** - novice vs experienced users
2. **Progressive overload** - different starting points and goals
3. **Periodization** - meet prep, race prep, seasonal, general
4. **Exercise selection** - equipment availability, injury management
5. **Volume management** - recovery, age, sport interference
6. **Scheduling** - rigid vs flexible, in-season vs off-season
7. **Special populations** - postpartum, injury recovery, masters athletes
8. **Sport-specific** - strength as primary vs supplementary training
9. **Modality variety** - barbell, dumbbell, bodyweight, machines, Olympic lifts
10. **Communication style** - education level, confidence, preferences

Each persona is realistic enough to generate authentic training conversations and programming challenges.

---

## Usage

### Create a single test user

```bash
pnpm test:create-user sarah-chen
```

### Create all test users

```bash
pnpm test:create-user --all
```

### List available personas

```bash
pnpm test:create-user --list
```

### Clean up test users

```bash
pnpm test:cleanup-users
```

### Dry run cleanup (see what would be deleted)

```bash
pnpm test:cleanup-users --dry-run
```

### JSON Data Files

Persona data is stored as individual JSON files in `scripts/test-data/personas/`. Each file contains:
- `id` — Persona identifier (used as CLI argument)
- `detailLevel` — sparse, moderate, or detailed
- `userData` — Name, phone, age, gender, timezone
- `signupData` — Experience, goals, equipment, injuries (maps to signup form fields)
- `onboardingMessages` — Simulated user messages for onboarding conversation

### What the scripts do

**`create-test-user`:**
1. Loads persona JSON file
2. Deletes existing user with same phone number (idempotent)
3. Creates user record in database
4. Creates test Stripe subscription directly in DB (bypasses Stripe)
5. Creates onboarding data record
6. Stores onboarding messages

**`cleanup-test-users`:**
1. Finds all users with phone numbers in range +13392220001 through +13392220015
2. Deletes all related data (workouts, profiles, messages, subscriptions, etc.)
3. Deletes user records
