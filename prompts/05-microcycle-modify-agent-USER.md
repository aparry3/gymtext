# Microcycle Modify Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting modifications to an existing microcycle from the Microcycle Modify Agent.

## Structure

```
Modify Week [N] of [User Name]'s [Phase Name].

Original context:
- Week [N] of [Phase], created on [Date]
- Key exercises: [Summary of main lifts/runs]
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
- Add modification notes in relevant workout sections
- Append LOG section at the end with entry for this modification (date, context, changes, rationale)
```

## Modification Scenario Templates

### Scenario 1: Schedule Adjustment

**User reports unexpected training or schedule conflict**

```
Modify Week 3 of Alex Martinez's Accumulation Phase.

Original context:
- Week 3 of 4, created February 16, 2026
- Key exercises: Bench 155×5, Goblet squat 50×8, RDL 215×6
- Original schedule: Mon (Upper Strength), Tue (Rest), Wed (Lower Strength), Thu (Rest), Fri (Upper Hypertrophy), Sat (Lower Hypertrophy), Sun (Rest)

Modification requested:
"I went for a spontaneous 3-mile run on Tuesday instead of resting. Can you move my Wednesday lower body workout to Thursday so I have enough recovery?"

User context:
- Ran 3 miles on Tuesday morning (outdoor, easy pace)
- Tuesday was originally a rest day
- Concerned about squatting/deadlifting with insufficient recovery

Changes to implement:
- Update Tuesday schedule: Rest → Cardio (outdoor run, 3 miles)
- Move Wednesday's Lower Strength workout to Thursday
- Make Wednesday a rest day
- Update Week Overview to note the schedule adjustment
- Add note in Thursday's workout explaining the move from Wednesday

Output:
- Use standard microcycle format
- Show schedule changes with strikethrough
- Add LOG entry for Tuesday, February 17, 2026 explaining the modification
- Preserve all workout content (just moved, not changed)
```

---

### Scenario 2: Volume/Intensity Reduction (Injury Management)

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
- Add detailed notes about elbow management in each affected workout
- LOG entries for Tuesday (initial report), Thursday (substitution), Saturday (continued caution)
```

---

### Scenario 3: Exercise Substitution (Equipment Unavailable)

**User reports equipment is unavailable**

```
Modify Week 4 of Jordan Lee's Hypertrophy Phase.

Original context:
- Week 4 of 6, muscle building focus
- Key exercises: Barbell squat, leg press, Romanian deadlift
- Original schedule: Mon/Wed/Fri (lower body), Tue/Thu (upper body)

Modification requested:
"My gym's barbell rack is broken today (Wednesday). What can I do instead for squats?"

User context:
- Wednesday's session is Lower Strength (barbell squat, RDL, lunges)
- Dumbbells, leg press, and machines are available
- No pain or injury — just equipment limitation
- This is a one-time issue (rack will be fixed by Friday)

Changes to implement:
- Substitute goblet squat or dumbbell front squat for barbell back squat
- Match volume if possible (4×8 becomes 4×8 with DBs)
- Keep RDL and lunges unchanged (barbell and DBs available)
- Add note explaining the substitution
- No need to modify future sessions (equipment will be available)

Output:
- Use standard microcycle format
- Show exercise substitution with strikethrough: ~~Barbell Back Squat~~ → Goblet Squat
- Add note: "Gym's barbell rack broken today. Substituted goblet squat to maintain quad volume. Will return to barbell squat on Friday."
- LOG entry for Wednesday explaining the one-time equipment issue
```

---

### Scenario 4: Constraint Flare-Up (Protect Primary Goal)

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

### Scenario 5: Multi-Session Modification (Cascading Changes)

**Modification affects multiple sessions in the week**

```
Modify Week 2 of Sam Rivera's Strength Phase.

Original context:
- Week 2 of 4, upper/lower 4-day split
- Original schedule: Mon (Upper), Tue (Lower), Thu (Upper), Sat (Lower)

Modification requested:
"I'm traveling for work Wednesday-Friday. I can train Monday and Tuesday, but then I'm off until Saturday. Can you adjust the week?"

User context:
- Travel: Wed-Fri (no gym access)
- Can train: Mon, Tue, Sat, Sun (if needed)
- Has full week the following week (back to normal)

Changes to implement:
- Keep Monday and Tuesday as planned (no change needed)
- Move Thursday's Upper session to Sunday
- Keep Saturday's Lower session
- Adjust intensity/volume if needed for Tue → Sat gap
- Update Week Overview to note the travel disruption
- Note in Weekly Summary how to approach next week

Output:
- Use standard microcycle format
- Update Schedule section with new days
- Wed/Thu/Fri marked as Rest (travel)
- Sun added: Upper Strength (moved from Thu)
- Single LOG entry explaining the full week modification
- Note recovery considerations for Tue → Sat gap
```

---

### Scenario 6: Post-Workout Modification (Retroactive Adjustment)

**User reports what actually happened (different from plan)**

```
Modify Week 5 of Casey Kim's Maintenance Program.

Original context:
- Week 5, 2-day full-body program
- Original plan: Tue (Full-Body A), Sat (Full-Body B)
- Tuesday's session planned: Goblet squat 4×8, Push-ups 3×10, Rows 3×10, etc.

Modification requested:
"I did Tuesday's workout but I was exhausted and had to cut it short. I only got through 2 sets of everything instead of 3-4. What should I do for Saturday?"

User context:
- Tuesday: Completed warm-up and 2 sets of each exercise, then left (fatigue)
- Reported fatigue level: 8/10 (unusually high)
- Sleep: 5 hours Monday night (work stress)
- Feels better now (Thursday) and expects to be recovered by Saturday

Changes to implement:
- Update Tuesday's workout to reflect what actually happened (2 sets instead of 3-4)
- Add notes in Tuesday's workout explaining the fatigue and early exit
- Keep Saturday's workout as planned (user expects to be recovered)
- Add note in Saturday's workout to monitor energy and adjust if needed
- Update Weekly Summary to document the fatigue and recovery plan

Output:
- Use standard microcycle format
- Tuesday's exercises show reduced sets: ~~4 sets~~ → 2 sets completed
- Notes: "Cut session short due to fatigue (5 hours sleep). Energy was 2/10, decided to prioritize recovery."
- Saturday: Keep as planned, add note to warm up thoroughly and assess readiness
- LOG entry for Tuesday documenting fatigue and Saturday plan
```

---

### Scenario 7: Progressive Modification (Ongoing Constraint)

**User reports worsening or persistent constraint**

```
Modify Week 9 of Taylor Brown's Hypertrophy Block.

Original context:
- Week 9 of 12, upper/lower split
- Last week (Week 8): User reported minor knee discomfort during lunges
- This week's plan: Continue with lunges but monitor

Modification requested:
"My knee is still bothering me. It's not worse but it's not better either. Can we change the lunge variations to something else for now?"

User context:
- Right knee discomfort: 3/10 during lunges, 0/10 at rest
- Present for 2 weeks now (appeared in Week 8)
- No discomfort with squats, leg press, or leg curls
- Wants to continue training but avoid aggravating knee

Changes to implement:
- Replace all lunge variations with leg press or split squat variations
- If split squats also bother knee, use leg press or step-ups
- Keep squat, leg curl, and other exercises unchanged
- Add note that lunges will be reintroduced when knee is pain-free
- Update constraint status in Weekly Summary
- LOG entry referencing Week 8 issue and this week's continued modification

Output:
- Use standard microcycle format
- Show lunge substitutions with strikethrough
- Add notes: "Knee still 3/10 with lunges. Substituted leg press to avoid aggravation. Will reassess next week."
- LOG entry documents ongoing constraint and conservative approach
- Consider adding mobility/rehab work in warm-up
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
"User reports right shoulder pain (4/10) during overhead press. Wants to reduce pressing volume and substitute pain-free variations for the rest of the week."
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
"Fix the bench press issue."
```

### ✅ Clear Changes
```
"Reduce Tuesday's bench from 4×5 to 3×5. Substitute neutral-grip DB press for Thursday's close-grip bench. Monitor elbow through Saturday's heavy doubles."
```

---

## Template Variations by User Type

### Powerlifter (Meet Prep)
```
Modify Week [N] of [User]'s [Phase].

Original context:
- Week [N] of [Total], [Weeks to meet]
- Current lifts: Squat [weight×reps], Bench [weight×reps], Deadlift [weight×reps]
- Bodyweight: [weight] ([class])

Modification requested:
[User's exact words]

User context:
- [Injury/fatigue/schedule issue]
- [Meet timeline consideration]

Changes to implement:
- [Specific modifications to competition lifts or accessories]
- [Consider impact on meet prep timeline]
```

### Runner (Mileage-Focused)
```
Modify Week of [Date] for [User]'s [Phase].

Original context:
- Weekly mileage planned: [miles]
- Key run: [Long run, track workout, tempo]
- Lifting sessions: [Days and focus]

Modification requested:
[User's exact words]

User context:
- [Injury/tightness/fatigue]
- [Race timeline]

Changes to implement:
- [Adjust lifting to protect running]
- [Modify running if needed]
- [Prioritize race-specific sessions]
```

### General Fitness (Flexible Program)
```
Modify Week [N] of [User]'s [Program].

Original context:
- Week [N], [Session frequency]
- Key goals: [Strength, hypertrophy, conditioning]
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

---

## Final Checklist for Modify Requests

Before submitting a modify request, ensure:

- [ ] Original context is clear (which week, what was planned)
- [ ] User's request is quoted or paraphrased accurately
- [ ] User context is detailed (pain level, timing, severity, goals)
- [ ] Specific changes are listed (not vague instructions)
- [ ] Output format requirements are noted (strikethrough, LOG, etc.)
- [ ] Any multi-session impacts are considered
- [ ] Priority is clear (e.g., protect long run, conservative for meet prep)

---

This template guides how to **request microcycle modifications** that result in high-quality, well-documented adaptations while maintaining format consistency with the create microcycle output.
