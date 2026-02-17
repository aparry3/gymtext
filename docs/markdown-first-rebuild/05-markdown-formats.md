# Markdown Formats - Canonical Structures

This document defines the canonical markdown structures for all core entities in the GymText system.

## 1. User Dossier

The User Dossier is the single source of truth for everything related to a user's fitness journey.

```markdown
# Training Dossier - [User Name]

## Profile
- **Name:** [Full Name]
- **Age:** [Age]
- **Experience Level:** [Beginner|Intermediate|Advanced] ([Years] training)
- **Primary Goals:** [List of goals]
- **Secondary Goals:** [List of goals]
- **Timezone:** [Timezone]
- **Preferred Message Time:** [HH:MM AM/PM]

## Equipment Access
### [Location, e.g., Home Gym]
- [Equipment Item]
- [Equipment Item]

### [Location, e.g., Commercial Gym]
- [Equipment Item]

## Schedule & Availability
- **Training Days:** [List of days]
- **Typical Duration:** [Min-Max minutes]
- **Morning Preference:** [Time Range]
- **Cannot Train:** [List of days/times]

## Training History
### [YYYY-MM-DD] - [Event Name, e.g., Initial Assessment]
- [Note item]
- [Weight/Metric]: [Value]

## Current Training Plan
**Program:** [Program Name]
**Phase:** [e.g., Week 3 of 4]
**Start Date:** [YYYY-MM-DD]

## Preferences & Notes
- **Likes:** [List]
- **Dislikes:** [List]
- **Injuries/Limitations:** [List with dates]
- **Communication Style:** [Concise|Technical|Motivational]
```

## 2. Training Plan

A complete 12-week macrocycle structure.

```markdown
# [Program Title]

**Program Owner:** [Coach/Source]
**User:** [User Name]
**Duration:** 12 weeks ([Start Date] to [End Date])
**Goal:** [Summary of primary goal]

## Program Philosophy
[A paragraph explaining the methodology and why it was chosen for this user.]

## Microcycle 1-4: [Phase Name, e.g., Hypertrophy] (Weeks 1-4)

### Weekly Pattern
#### [Day, e.g., Monday] - [Focus, e.g., Upper Body]
**Focus:** [Details]
**Volume:** [Approx sets]

**Main Lifts:**
1. [Exercise Name]: [Sets] × [Reps] (RPE [Range])
2. [Exercise Name]: [Sets] × [Reps] (RPE [Range])

**Accessories:**
3. [Exercise Name]: [Sets] × [Reps]
4. [Exercise Name]: [Sets] × [Reps]

### Progression
- **Week 1:** [Instructions]
- **Week 2:** [Instructions]
- **Week 3:** [Instructions]
- **Week 4:** [Instructions, e.g., Deload]

## [Continue for Microcycles 5-8, 9-12]

## Modification History
- **[YYYY-MM-DD]:** [Description of change and why]
```

## 3. Daily Workout

The specific instance generated for a single day.

```markdown
# Workout - [Day of Week], [Full Date]
**Program:** [Program Name] (Week [X], Day [Y])
**Focus:** [Focus Area]

## Warm-Up ([X] minutes)
1. [Activity]: [Duration/Reps]
2. [Activity]: [Duration/Reps]

## Main Workout

### [X]. [Exercise Name]
**Target:** [Sets] × [Reps] @ RPE [X]
- **Set 1:** [Weight] lbs × [Reps]
- **Set 2:** [Weight] lbs × [Reps]
**Rest:** [X] minutes between sets
**Notes:** [Form cues or specific instructions]

## Cool Down ([X] minutes)
1. [Stretch]: [Duration]
2. [Stretch]: [Duration]

## Notes
- [Post-workout feedback/log]
```

## Implementation Note
Main agents are instructed to follow these templates strictly. Section headers (`#`, `##`, `###`) are used for lightweight validation by the system to ensure all components of a plan or workout are present before saving.
