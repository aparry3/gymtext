# Profile Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting profile creation or updates from the Profile Agent.

## Structure

```
[Action: Create/Update] a fitness profile for the following user:

[User Information]
- Name:
- Age:
- Gender (if relevant):
- Experience:
- Goals:
- Schedule:
- Equipment:
- Constraints:
- Current metrics:

[Optional: Specific update request]

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
```

## Examples

### Example 1: General Fitness Client (Strength + Muscle Building)

```
Create a fitness profile for the following user:

Name: Alex Martinez
Age: 28
Gender: Male
Experience: 2 years consistent lifting (3-4x/week)
Goals: Build muscle, lose 10 lbs body fat, run a 5K under 25 minutes
Schedule: Mon/Wed/Fri/Sat, 45-60 min sessions
Equipment: Home gym (barbell, DBs 5-50lb, rack, bench, bands), LA Fitness on weekends (full commercial gym)
Constraints: Knee discomfort with barbell squats (since Feb 16, 2026) — using goblet/front squats instead
Current metrics:
  - Bench Press: 145 lb x 5
  - Deadlift: 225 lb x 5
  - Bodyweight: 176 lb
  - 5K PR: 26:30 (Jan 2026)

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
```

### Example 2: Pure Endurance Athlete (Cyclist, No Lifting)

```
Create a fitness profile for the following user:

Name: Jordan Lee
Age: 34
Gender: Female
Experience: 5 years cycling, training for century ride (100 miles)
Goals: Complete century ride in under 6 hours (May 2026), improve FTP from 180W to 200W
Schedule: 5-6 days/week cycling, 1 rest day
Equipment: Road bike (Canyon Endurace), indoor trainer (Wahoo Kickr), power meter
Constraints: Lower back tightness after rides > 3 hours (since Jan 2026) — working on bike fit
Current metrics:
  - FTP: 180W (2.7 W/kg)
  - Weekly volume: 8-10 hours, 150-200 miles
  - Longest ride: 75 miles @ 16 mph avg
  - Heart rate zones: Z1 <130, Z2 130-145, Z3 145-160, Z4 160-175, Z5 >175
Preferences: Prefers outdoor rides on weekends, structured intervals on trainer weekdays

Use the standard profile format. Prioritize endurance metrics over strength.
```

### Example 3: Rehab/Return-to-Training

```
Create a fitness profile for the following user:

Name: Sam Rivera
Age: 42
Gender: Male
Experience: Former athlete (played college soccer), returning after ACL reconstruction (surgery Nov 2025)
Goals: Return to pain-free movement, rebuild knee strength, eventually return to recreational soccer (target: Fall 2026)
Schedule: 3-4 days/week, 30-45 min sessions
Equipment: Home (bodyweight, resistance bands), access to PT clinic gym (cable machine, leg press)
Constraints:
  - [ACTIVE] ACL reconstruction (Nov 2025) — cleared for bodyweight and light resistance by PT (since Jan 2026)
  - [ACTIVE] Avoid pivoting/cutting movements until Month 6 post-op (May 2026)
  - [ACTIVE] Pain-free ROM: 0-120° knee flexion (working toward full ROM)
Current metrics:
  - Bodyweight squat: pain-free to 90° (can't reach parallel yet)
  - Single-leg balance: 30s eyes open (working on eyes closed)
  - Quad strength: noticeable atrophy on surgical leg
  - Bodyweight: 185 lb (up from 178 pre-surgery, aiming to return to 178)

Use the standard profile format. Prioritize Movement Quality metrics and document injury history clearly.
```

### Example 4: Non-Periodized Maintenance (Busy Professional)

```
Create a fitness profile for the following user:

Name: Casey Kim
Age: 36
Gender: Non-binary
Experience: On/off gym-goer for 10 years, recently inconsistent due to new job
Goals: Maintain fitness during busy work season, sustain 2x/week habit for 6 months, feel strong and energized (not chasing PRs)
Schedule: Tuesday and Saturday mornings, 45 min max
Equipment: 24-Hour Fitness (full commercial gym)
Constraints: Unpredictable work schedule — needs flexible program that doesn't require perfect week-to-week progression
Current metrics:
  - Goblet squat: 50 lb x 10
  - Push-ups: 25 consecutive
  - Bodyweight: 165 lb (comfortable, not trying to change)
  - Energy level: 6/10 (wants to improve through consistent movement)
Preferences: Prefers simple, repeatable workouts; enjoys full-body sessions; wants to avoid burnout from overly complex programming

Use the standard profile format. Emphasize habit consistency over performance progression.
```

## Update Protocol Example

```
Update Alex Martinez's profile with the following changes:

- New constraint: Right shoulder discomfort during overhead press (since Feb 20, 2026) — avoiding overhead work for 2 weeks
- Updated metric: Bench Press: 155 lb x 5 (Feb 18, 2026) — up from 145 lb
- Goal adjustment: 5K race moved to April (was March)

Add entry to LOG documenting these changes.
```

## Key Elements

Every user prompt should include:
1. **Clear action** (Create or Update)
2. **User information** (name, age, experience, goals, schedule, equipment, constraints, metrics)
3. **Format reminder** (light touch, 1 sentence)
4. **Optional modality-specific guidance** (e.g., "Prioritize endurance metrics" for cyclists)

## What NOT to Include

- ❌ Full role description (that's in the system prompt)
- ❌ Detailed format specification (that's in the system prompt)
- ❌ Examples of good/bad profiles (that's in the system prompt)
- ❌ General instructions about documentation (that's in the system prompt)
