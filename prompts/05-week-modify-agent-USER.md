# Microcycle Modify Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting modifications to an existing microcycle from the Microcycle Modify Agent.

## Structure

```
Modify Week [N] of [User Name]'s [Phase Name].

Original context:
- Week [N] of [Phase], created on [Date]
- Key work: [Summary of main sessions/lifts/runs/swims/rides/drills]
- Original schedule: [Mon/Tue/Wed/etc.]

Modification requested:
[User's request in their own words]

User context:
- [Pain/injury report, schedule conflict, equipment issue, etc.]
- [Severity, timing, or other relevant details]

Changes to implement:
- [Specific instruction 1]
- [Specific instruction 2]
- [Specific instruction 3]
- ...

Output:
- Use the standard microcycle dossier format
- Update affected sections only (preserve unmodified content)
- Use strikethrough for schedule/target changes: ~~Original~~ → New
- Add modification notes in relevant session sections
- Append LOG section at the end with entry for this modification (date, context, changes, rationale)
```

## Modification Scenario Templates (Diverse Modalities)

### Scenario 1: Schedule Adjustment (General Fitness)

**User reports unexpected training or schedule conflict**

```
Modify Week 3 of Alex Martinez's Accumulation Phase.

Original context:
- Week 3 of 4, created February 16, 2026
- Key work: Bench 155×5, Goblet squat 50×8, RDL 215×6
- Original schedule: Mon (Upper Strength), Tue (Rest), Wed (Lower Strength), Thu (Rest), Fri (Upper Hypertrophy), Sat (Lower Hypertrophy), Sun (Rest)

Modification requested:
"I went for a spontaneous 3-mile run on Tuesday instead of resting. Can you move my Wednesday lower body workout to Thursday so I have enough recovery?"

User context:
- Ran 3 miles on Tuesday morning (outdoor, easy pace)
- Tuesday was originally a rest day
- Concerned about squatting/deadlifting with insufficient recovery

Changes to implement:
- Update Tuesday schedule: Rest → Cardio (outdoor run, 3 miles)
- Move Wednesday's Lower Strength session to Thursday
- Make Wednesday a rest day
- Update Week Overview to note the schedule adjustment
- Add note in Thursday's session explaining the move from Wednesday

Output:
- Use standard microcycle format
- Show schedule changes with strikethrough
- Add LOG entry for Tuesday, February 17, 2026 explaining the modification
- Preserve all session content (just moved, not changed)
```

---

### Scenario 2: Volume/Intensity Reduction (Strength Training - Injury Management)

**User reports pain or discomfort requiring volume reduction**

```
Modify Week 7 of Chen Wu's Accumulation B Phase.

Original context:
- Week 7 of 8, USAPL meet prep
- Key lifts: Squat 295×4, Bench 175×4, Deadlift 320×2
- Original schedule: Mon (Squat + Bench Acc), Tue (Bench + Deadlift Acc), Wed (Rest), Thu (Squat Var + Light Bench), Fri (Rest), Sat (Competition Simulation)

Modification requested:
"My right elbow started hurting during Tuesday's bench warm-ups. It's not sharp pain but it's definitely tender. Can you reduce the pressing volume for the rest of this week?"

User context:
- Right elbow discomfort appeared during Tuesday's warm-up (135×2)
- Pain level: 3/10 — tender, not sharp
- No prior elbow issues in this prep
- Meet is 6 weeks away

Changes to implement:
- Reduce Tuesday's bench from 4×4 to 3×3
- Remove close-grip bench from Monday (if it hasn't happened yet)
- Substitute neutral-grip dumbbell press for Thursday's Larsen press (less elbow strain)
- Reduce Saturday's bench doubles (stop at 170 instead of progressing to 175-180)
- Keep board press (partial ROM is pain-free per user)
- Add elbow stretching to cool downs
- Update Weekly Summary with elbow constraint status

Output:
- Use standard microcycle format
- Mark modified exercises with strikethrough for original targets
- Add detailed notes about elbow management in each affected session
- LOG entries for Tuesday (initial report), Thursday (substitution), Saturday (continued caution)
```

---

### Scenario 3: Exercise Substitution (Swimming - Equipment Unavailable)

**User reports equipment is unavailable or pool conditions changed**

```
Modify Week 4 of Jordan Lee's Threshold Build Phase.

Original context:
- Week 4 of 6, building race pace endurance
- Key sessions: 6×200m threshold, 10×50m sprints, 3000m continuous swim
- Original schedule: Mon/Wed/Fri (pool sessions), Tue/Thu (dryland)

Modification requested:
"The pool's lane ropes are broken today (Wednesday) so I can't do straight swimming. What should I substitute for the threshold set?"

User context:
- Wednesday's session: 6×200m freestyle @ race pace (threshold work)
- Lane ropes unavailable (can't maintain straight line)
- Pull buoys, kickboards, and vertical space available
- This is a one-time issue (ropes will be fixed by Friday)

Changes to implement:
- Substitute threshold set with: vertical kicking (3×5 min) + pull buoy intervals (6×100m @ threshold pace)
- Match aerobic stimulus and intensity despite different format
- Keep dryland work unchanged
- Add note explaining the pool conditions and substitution rationale

Output:
- Use standard microcycle format
- Show exercise substitution with strikethrough
- Add note: "Lane ropes broken. Substituted vertical kicking + pull intervals to maintain threshold stimulus. Will return to normal swimming Friday."
- LOG entry for Wednesday explaining the pool conditions and substitution
```

---

### Scenario 4: Constraint Flare-Up (Endurance Training - Running)

**User reports pain/tightness that threatens primary training goal**

```
Modify Week of February 16, 2026 for David's Build Phase.

Original context:
- Peak mileage week: 52 miles planned
- Friday session: Light full-body with trap bar deadlift, banded lateral walks, glute work
- Saturday: 18-mile long run (key session for marathon prep)

Modification requested:
"My IT band is feeling tight after yesterday's track intervals (Thursday, 6×800m). I have my 18-mile long run tomorrow (Saturday) and I'm worried. Should I change Friday's lifting?"

User context:
- Left IT band tightness appeared 2 hours after Thursday's track workout
- Tightness rating: 4/10 — noticeable but not painful
- No tightness during the run itself
- Saturday's 18-mile run is the priority for the week
- Friday's lifting is supplemental (injury prevention)

Changes to implement:
- Remove Friday's trap bar deadlift (loading concern with IT band sensitive)
- Substitute bilateral glute bridges (bodyweight only, gentle activation)
- Remove banded lateral walks (abduction stress on IT band)
- Extend foam rolling time (2 min → 3 min, focus on IT band)
- Add extended cool down with IT band-specific stretching
- Update Weekly Summary with IT band flare-up status
- Note decision to reduce lateral/single-leg work if IT band persists next week

Output:
- Use standard microcycle format
- Show exercise substitutions with strikethrough
- Add extended warm-up/cool-down sections to Friday
- LOG entry for Thursday evening (when tightness reported) and Friday post-workout (outcome)
- Emphasize conservative approach to protect Saturday's key session
```

---

### Scenario 5: Multi-Session Modification (Cycling - Travel Disruption)

**Modification affects multiple sessions in the week**

```
Modify Week 2 of Sam Rivera's Base Building Phase.

Original context:
- Week 2 of 8, aerobic base development
- Original schedule: Mon (Recovery), Tue (Intervals), Wed (Endurance), Thu (Recovery), Fri (Threshold), Sat (Long Ride), Sun (Rest)

Modification requested:
"I'm traveling for work Wednesday-Friday. I can train Monday, Tuesday, Saturday, and Sunday. Can you adjust the week?"

User context:
- Travel: Wed-Fri (no bike access)
- Can train: Mon, Tue, Sat, Sun
- Has full week the following week (back to normal)

Changes to implement:
- Keep Monday and Tuesday as planned (no change needed)
- Move Friday's threshold ride to Sunday
- Extend Saturday's long ride by 30 minutes to compensate for lost endurance ride (Wed)
- Wed/Thu/Fri marked as Rest (travel)
- Update Week Overview to note the travel disruption
- Note recovery considerations for compressed schedule

Output:
- Use standard microcycle format
- Update Schedule section with new days
- Wed/Thu/Fri marked as Rest (travel)
- Sun added: Threshold Ride (moved from Fri)
- Single LOG entry explaining the full week modification
- Note recovery considerations for Tue → Sat gap
```

---

### Scenario 6: Post-Workout Modification (CrossFit - Retroactive Adjustment)

**User reports what actually happened (different from plan)**

```
Modify Week 5 of Casey Kim's Conditioning Block.

Original context:
- Week 5, 4-day CrossFit program
- Original plan: Mon (WOD A), Tue (Skills), Thu (WOD B), Sat (Long WOD)
- Monday's WOD planned: "Cindy" (20 min AMRAP: 5 pull-ups, 10 push-ups, 15 squats)

Modification requested:
"I did Monday's WOD but my lower back was tight and I had to scale more than planned. I did ring rows instead of pull-ups and only got 12 rounds instead of my usual 18. What should I do for Thursday?"

User context:
- Monday: Lower back tightness (4/10) during warm-up
- Scaled pull-ups to ring rows
- Completed 12 rounds (normally 18+)
- Lower back feels better now (Wednesday)

Changes to implement:
- Update Monday's session to reflect what actually happened (ring rows, 12 rounds)
- Add notes in Monday's workout explaining the lower back tightness and scaling
- Keep Thursday's WOD as planned (user feels recovered)
- Add note in Thursday's workout to monitor lower back and scale if needed
- Update Weekly Summary to document the scaling and recovery

Output:
- Use standard microcycle format
- Monday's exercises show scaling: ~~Pull-ups~~ → Ring rows
- Rounds: ~~18+ expected~~ → 12 completed
- Notes: "Lower back tight (4/10). Scaled to ring rows. Energy was 6/10."
- Thursday: Keep as planned, add note to warm up thoroughly and assess readiness
- LOG entry for Monday documenting tightness and Thursday plan
```

---

### Scenario 7: Progressive Modification (Climbing - Ongoing Constraint)

**User reports worsening or persistent constraint**

```
Modify Week 9 of Taylor Brown's Strength Phase.

Original context:
- Week 9 of 12, fingerboard and bouldering focus
- Last week (Week 8): User reported minor finger tweak on left index (A2 pulley)
- This week's plan: Continue with modified crimp work, monitor finger

Modification requested:
"My finger is still bothering me. It's not worse but it's not better either. Can we remove all the crimp work and focus on open-hand problems?"

User context:
- Left index finger (A2 pulley): 3/10 pain on crimps, 0/10 on open-hand
- Present for 2 weeks now (appeared in Week 8)
- No pain on slab or open-hand routes
- Wants to continue training but avoid aggravating finger

Changes to implement:
- Replace all crimp-heavy problems with open-hand and slab routes
- Remove fingerboard crimp hangs (keep open-hand hangs only)
- Add extended finger warm-up (flexion/extension exercises, 5 min)
- Cool down: contrast bath for injured finger
- Update constraint status in Weekly Summary
- LOG entry referencing Week 8 issue and this week's continued modification

Output:
- Use standard microcycle format
- Show problem substitutions: ~~Crimp boulders (V4-V6)~~ → Open-hand slabs (V3-V5)
- Add notes: "Finger still 3/10 on crimps. Removed all crimp work. Focus on open-hand movement and slab technique."
- LOG entry documents ongoing constraint and conservative approach
- Consider adding finger rehab protocol in warm-up
```

---

### Scenario 8: Volume Reduction (Rehab Protocol - Pain Management)

**User reports increased pain requiring conservative adjustment**

```
Modify Week 3 of Morgan's ACL Rehab Protocol.

Original context:
- Week 3 post-surgery, PT-guided rehab
- Key exercises: Terminal knee extensions, glute bridges, quad sets, heel slides
- Original schedule: Mon/Wed/Fri (PT exercises), Tue/Thu/Sat (walking)

Modification requested:
"The terminal knee extensions are hurting more this week. It's not terrible but it's definitely more uncomfortable than last week. Should I back off?"

User context:
- Right knee: 5/10 pain during TKE (was 2/10 last week)
- Pain appears midway through set 2
- No pain during glute bridges, quad sets, or walking
- PT appointment scheduled for Friday

Changes to implement:
- Reduce TKE volume: 3×15 → 2×10
- Decrease resistance band tension: red (heavy) → green (medium)
- Extend warm-up with gentle knee flexion/extension (5 min)
- Keep glute bridges and quad sets unchanged (no pain)
- Plan to reassess with PT on Friday before progressing
- LOG entry: document pain increase, modification, plan for PT consultation

Output:
- Use standard microcycle format
- TKE shows reduced volume: ~~3×15~~ → 2×10
- Resistance: ~~Red band~~ → Green band
- Notes: "Pain increased from 2/10 to 5/10 this week. Reduced volume and resistance. Will discuss with PT on Friday."
- LOG entry documents pain report, changes made, plan for PT consultation
```

---

### Scenario 9: Intensity Adjustment (Swimming - Meet Taper)

**User reports fatigue requiring taper adjustment**

```
Modify Week 11 of Riley's Championship Prep.

Original context:
- Week 11 of 12, taper week before championship meet
- Original plan: Reduced volume, maintain intensity
- Monday: 3000m total (normally 4500m), sprint work at race pace

Modification requested:
"I'm feeling really flat after last week's high-volume week. My 50m splits are 2 seconds slower than usual. Should we reduce intensity this week?"

User context:
- Monday's sprint set: 10×50m @ max effort — splits were 28-29s (normally 26-27s)
- Fatigue level: 7/10
- Meet is this coming Saturday (5 days away)
- Sleep and nutrition have been good

Changes to implement:
- Reduce sprint intensity: race pace → 90% effort
- Extend warm-up from 600m to 800m (extra time to feel ready)
- Cut Wednesday's threshold set from 6×200m to 4×200m
- Make Friday a pure technique/mobility day (no intensity)
- Update taper plan: focus on recovery and readiness, not maintaining fitness
- LOG entry: document fatigue and conservative taper adjustment

Output:
- Use standard microcycle format
- Monday's sprint set: ~~10×50m @ max~~ → 10×50m @ 90% (noted in retrospect)
- Wednesday: ~~6×200m~~ → 4×200m
- Friday: ~~Light swim~~ → Technique drills + mobility only
- Notes: "Flat after last week. Prioritizing recovery over intensity. Meet readiness is the goal."
- LOG entry documents fatigue and taper modification
```

---

### Scenario 10: Equipment Substitution (Strength Training - Home vs Gym)

**User has limited equipment availability**

```
Modify Week 2 of Jordan's Hypertrophy Block.

Original context:
- Week 2 of 8, muscle building focus
- Original plan: Barbell squat, leg press, Romanian deadlift (at commercial gym)
- Thursday session planned at gym

Modification requested:
"I can't make it to the gym today (Thursday). I have dumbbells up to 50 lbs at home. What can I substitute?"

User context:
- Thursday's session: Lower Strength (barbell squat 4×8, leg press 3×12, RDL 3×10)
- Equipment at home: dumbbells (10-50 lbs), resistance bands, bodyweight
- One-time issue (will be back at gym for Saturday's session)

Changes to implement:
- Substitute goblet squat for barbell back squat (4×8 with 50 lb DB)
- Substitute Bulgarian split squat for leg press (3×10 each leg with 25 lb DBs)
- Keep RDL but use dumbbells (3×10 with 40 lb DBs per hand)
- Add note explaining equipment limitation and substitution logic

Output:
- Use standard microcycle format
- Show exercise substitutions:
  - ~~Barbell Back Squat~~ → Goblet Squat (50 lb DB, 4×8)
  - ~~Leg Press~~ → Bulgarian Split Squat (25 lb DBs, 3×10 each)
  - ~~Barbell RDL~~ → Dumbbell RDL (40 lb DBs, 3×10)
- Notes: "Trained at home today (gym unavailable). Substituted DB variations to maintain quad/hamstring volume. Will return to barbell work Saturday."
- LOG entry for Thursday explaining the equipment substitution
```

---

## Key Elements of a Good Modify Request

1. **Clear original context** — Which week, what was planned
2. **Specific user request** — Exact words or situation described
3. **User context** — Why the change is needed (pain level, timing, severity)
4. **Explicit changes** — What should be modified and how
5. **Output format note** — Reminder to use strikethrough, LOG, etc.

## Common Pitfalls to Avoid

### ❌ Vague Request
```
"User wants to change something about the workout."
```

### ✅ Specific Request
```
"User reports right shoulder pain (4/10) during freestyle. Wants to reduce stroke volume and substitute pain-free drills for the rest of the week."
```

---

### ❌ No User Context
```
"Move Wednesday's workout to Thursday."
```

### ✅ With User Context
```
"User went for an unexpected 5-mile run on Tuesday. Move Wednesday's lower body workout to Thursday to ensure proper recovery before heavy squats."
```

---

### ❌ Unclear Changes
```
"Fix the interval issue."
```

### ✅ Clear Changes
```
"Reduce Tuesday's intervals from 6×1000m to 4×1000m. Maintain pace target but prioritize form and pain-free movement."
```

---

## Template Variations by Training Modality

### Strength Training (Powerlifting, Weightlifting, Bodybuilding)
```
Modify Week [N] of [User]'s [Phase].

Original context:
- Week [N] of [Total], [Context: meet prep, off-season, hypertrophy, etc.]
- Current lifts: [Key movements and weights]
- Bodyweight: [if relevant for weight class]

Modification requested:
[User's exact words]

User context:
- [Injury/fatigue/schedule issue]
- [Timeline consideration: meet, competition, goal date]

Changes to implement:
- [Specific modifications to main lifts or accessories]
- [Consider impact on training cycle or meet prep]
```

### Endurance Training (Running, Cycling, Swimming, Triathlon)
```
Modify Week of [Date] for [User]'s [Phase].

Original context:
- Weekly volume planned: [miles, hours, meters]
- Key session: [Long run, intervals, tempo, threshold, etc.]
- Supplemental work: [Lifting, drills, mobility]

Modification requested:
[User's exact words]

User context:
- [Injury/tightness/fatigue]
- [Race timeline or goal event]

Changes to implement:
- [Adjust volume/intensity to protect key sessions]
- [Modify supplemental work if needed]
- [Prioritize race-specific sessions]
```

### Skill-Based Training (Climbing, Gymnastics, Martial Arts)
```
Modify Week [N] of [User]'s [Program].

Original context:
- Week [N], [Focus: strength, endurance, technique, etc.]
- Key work: [Projects, skills, drills]
- Schedule: [Days and session types]

Modification requested:
[User's exact words]

User context:
- [Injury concern, fatigue, schedule conflict]
- [Goal timeline: competition, trip, project deadline]

Changes to implement:
- [Adjust volume/intensity/complexity as needed]
- [Substitute movements to protect injury]
- [Maintain training focus while managing constraints]
```

### General Fitness (Mixed Training, Maintenance, Health)
```
Modify Week [N] of [User]'s [Program].

Original context:
- Week [N], [Session frequency]
- Key goals: [Strength, conditioning, mobility, health markers]
- Schedule: [Days and times]

Modification requested:
[User's exact words]

User context:
- [Life stress, schedule conflict, energy levels]

Changes to implement:
- [Adjust volume/intensity as needed]
- [Reschedule sessions for convenience]
- [Maintain consistency without overreaching]
```

### Rehab & Mobility (Post-injury, PT Protocols, Prehab)
```
Modify Week [N] of [User]'s [Protocol].

Original context:
- Week [N] post-[surgery/injury], [Phase: early rehab, strength building, return-to-sport]
- Key exercises: [Movements, resistance, ROM goals]
- PT schedule: [When user sees therapist]

Modification requested:
[User's exact words]

User context:
- [Pain level changes, ROM improvements/setbacks]
- [Timeline: return-to-sport, clearance dates]

Changes to implement:
- [Adjust volume/resistance/ROM as needed]
- [Add or remove exercises based on pain]
- [Plan for PT consultation if needed]
```

### Sport-Specific Training (Tennis, Soccer, Basketball, etc.)
```
Modify Week [N] of [User]'s [Phase].

Original context:
- Week [N], [In-season, off-season, pre-season]
- Key work: [Sport practice, strength, conditioning, skill drills]
- Competition schedule: [Upcoming games/matches]

Modification requested:
[User's exact words]

User context:
- [Fatigue from games, injury, schedule conflict]
- [Competition priorities]

Changes to implement:
- [Adjust training volume around games]
- [Manage fatigue from sport demands]
- [Protect sport performance while maintaining fitness]
```

---

## Final Checklist for Modify Requests

Before submitting a modify request, ensure:

- [ ] Original context is clear (which week, what was planned)
- [ ] User's request is quoted or paraphrased accurately
- [ ] User context is detailed (pain level, timing, severity, goals)
- [ ] Specific changes are listed (not vague instructions)
- [ ] Output format requirements are noted (strikethrough, LOG, etc.)
- [ ] Any multi-session impacts are considered
- [ ] Priority is clear (e.g., protect race, conservative for meet prep, manage rehab)
- [ ] Training modality is respected (strength, endurance, skill, rehab, etc.)

---

This template guides how to **request microcycle modifications** that result in high-quality, well-documented adaptations **across all training modalities** while maintaining format consistency with the create microcycle output.
