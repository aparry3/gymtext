# Product Requirements Document: Enhanced Workout Planning System

## Executive Summary

This document outlines the requirements for enhancing GymText's workout planning system to provide more structured, persistent, and adaptable fitness programs. The system will move from the current ad-hoc workout generation to a comprehensive planning architecture that creates, stores, and manages personalized workout programs.

## Problem Statement

The current system has several limitations:
- Workout plans exist only in vector storage, making them difficult to manage and review
- No structured representation of multi-week programs or periodization
- Limited ability to adapt plans based on user feedback or circumstances
- No visibility into the overall program structure for users or trainers
- Daily workouts are generated without a clear long-term progression strategy

## Goals

1. **Create Structured Workout Programs**: Design comprehensive fitness programs based on user goals, experience, and constraints
2. **Enable Program Visibility**: Store programs in a format that can be viewed and understood by users, trainers, and AI agents
3. **Support Adaptability**: Allow programs to evolve based on user feedback, progress, and changing circumstances
4. **Maintain Simplicity**: Keep the SMS-first experience while adding depth to the underlying system

## Requirements

### 1. Program Creation

#### 1.1 User Profile Enhancement
Expand the fitness profile to capture:
- **Training History**: Years of experience, previous injuries, preferred training styles
- **Specific Goals**: 
  - Primary goal (e.g., strength, muscle gain, fat loss, endurance)
  - Secondary goals
  - Target metrics (e.g., bench press 225lbs, run 5k in 25 minutes)
  - Timeline preferences (e.g., 12-week program vs. ongoing)
- **Equipment Access**: Detailed equipment list with variations (home, gym, travel)
- **Schedule Constraints**: Available days, time per session, blackout dates
- **Movement Restrictions**: Injuries, mobility limitations, exercise preferences

#### 1.2 Program Structure
Programs should include:
- **Program Metadata**:
  - Name and description
  - Duration (fixed-length or ongoing)
  - Primary and secondary goals
  - Target audience/experience level
  - Equipment requirements
  
- **Periodization Model**:
  - Phases (e.g., foundation, strength, hypertrophy, deload)
  - Phase duration and goals
  - Progression strategy
  - Deload/recovery weeks

- **Weekly Templates**:
  - Training split (e.g., Upper/Lower, Push/Pull/Legs, Full Body)
  - Session types and focus areas
  - Volume and intensity targets
  - Recovery protocols

- **Exercise Selection Strategy**:
  - Primary movement patterns
  - Accessory work priorities
  - Exercise progressions and regressions
  - Alternative exercises for equipment constraints

### 2. Program Storage

#### 2.1 Database Schema
Create new tables to store structured program data:
- `workout_programs`: Master program records
- `program_phases`: Periodization phases within programs
- `program_weeks`: Weekly templates and variations
- `program_sessions`: Individual workout session templates
- `user_programs`: User-specific program assignments and modifications

#### 2.2 Data Format
Programs should be stored in a structured format that:
- Can be easily queried and modified
- Supports both template-based and individualized programs
- Maintains version history for changes
- Can be exported/imported for sharing

#### 2.3 Integration with Existing Systems
- Maintain compatibility with vector storage for AI context
- Link programs to generated daily workouts
- Track which program/phase/week each workout belongs to

### 3. Program Adaptability

#### 3.1 Feedback Integration
- Capture workout completion data and ratings
- Track exercise performance (sets, reps, weights)
- Monitor fatigue and recovery indicators
- Adjust future workouts based on performance trends

#### 3.2 Circumstantial Adaptations
Support modifications for:
- **Travel**: Alternate workouts for limited equipment
- **Time Constraints**: Shortened versions of workouts
- **Injury/Recovery**: Modified exercises or reduced volume
- **Progress Plateaus**: Intensity techniques or exercise variations

#### 3.3 Program Progression
- Automatic progression based on performance
- Deload triggers based on accumulated fatigue
- Phase transitions based on goal achievement
- Long-term periodization adjustments

### 4. User Experience

#### 4.1 SMS Interface
Maintain the current SMS-first approach while adding:
- Weekly program overview messages
- Progress summaries
- Program phase notifications
- Adaptation confirmations

#### 4.2 Program Visibility (Future UI)
Design data structures to support:
- Calendar view of upcoming workouts
- Progress tracking and visualization
- Program overview and phase information
- Exercise library and video links

#### 4.3 Trainer/Coach Interface (Future)
Enable trainers to:
- Review client programs
- Make manual adjustments
- Monitor progress and compliance
- Communicate through the platform

### 5. User Communication and Language Adaptation

#### 5.1 Experience-Based Language
The system must adapt its communication style based on user experience level:

**Beginner Users**:
- Replace technical terms with simple language:
  - "Hypertrophy" → "Muscle building"
  - "Anatomical adaptation" → "Getting your body ready"
  - "Periodization" → "Your training plan"
  - "Deload" → "Easy recovery week"
  - "Progressive overload" → "Gradually getting stronger"
  - "RPE" → "How hard it feels (1-10)"

**Intermediate Users**:
- Use a mix of technical and accessible terms
- Introduce concepts with brief explanations
- Example: "This week focuses on hypertrophy (muscle building) with higher reps"

**Advanced Users**:
- Use full technical terminology
- Include detailed training variables
- Discuss advanced concepts like DUP, conjugate method, etc.

#### 5.2 Communication Guidelines
- **Initial Assessment**: Gauge user's fitness knowledge during onboarding
- **Adaptive Messaging**: Store user's preferred communication style
- **Education Mode**: Optional explanations for users who want to learn
- **Consistency**: Use the same terms throughout a user's journey

#### 5.3 SMS Message Examples

**Beginner**: 
"Today's workout: Upper body strength! We'll do pushing and pulling exercises to build balanced muscle. 3 sets of 8-12 reps for each exercise. Rest 60-90 seconds between sets."

**Advanced**: 
"Upper Power Day: Focus on explosive concentric with controlled eccentric. Main lifts at 85% 1RM for 3x3, accessories at RPE 7-8. Implement compensatory acceleration on all main movements."

#### 5.4 Internal vs. External Terminology
- **Internal Storage**: Use precise technical terms for accuracy
- **External Communication**: Translate based on user profile
- **API Responses**: Include both technical and user-friendly versions
- **Documentation**: Maintain glossary for term mappings

## Technical Considerations

### 1. Data Migration
- Migrate existing vector-stored workout outlines to new schema
- Preserve historical workout data
- Maintain user continuity during transition

### 2. AI Integration
- Enhance prompts to generate structured programs
- Implement program-aware workout generation
- Add context about current phase/week/goals
- Support natural language program modifications

### 3. Performance
- Efficient queries for daily workout generation
- Caching strategies for frequently accessed program data
- Batch generation capabilities for future workouts

### 4. Flexibility vs. Structure
- Balance between rigid program templates and AI flexibility
- Allow both pre-designed and fully custom programs
- Support hybrid approaches (template + AI customization)

## Success Metrics

1. **User Engagement**:
   - Workout completion rate
   - Program adherence over time
   - User satisfaction scores

2. **Program Quality**:
   - Progress toward stated goals
   - Injury/burnout rates
   - Program completion rates

3. **System Performance**:
   - Workout generation time
   - Adaptation response time
   - System reliability

## Constraints

1. **SMS Limitations**: Individual workouts must fit within SMS character limits
2. **User Simplicity**: Changes should not complicate the basic user experience
3. **Backward Compatibility**: Existing users should transition seamlessly
4. **Cost Considerations**: AI token usage should remain economical

## Future Considerations

1. **Social Features**: Share programs, community challenges
2. **Nutrition Integration**: Coordinate meal plans with training phases
3. **Wearable Integration**: Use heart rate, sleep data for adaptations
4. **Multi-Sport Support**: Running, cycling, sport-specific training
5. **Team/Group Training**: Shared programs for groups

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Design and implement database schema
- Create basic program templates
- Update user onboarding flow

### Phase 2: Program Generation (Weeks 3-4)
- Enhance AI agents for program creation
- Implement program storage and retrieval
- Create program-aware workout generation

### Phase 3: Adaptability (Weeks 5-6)
- Build feedback processing system
- Implement program modification logic
- Add circumstantial adaptation features

### Phase 4: Migration & Testing (Weeks 7-8)
- Migrate existing users to new system
- Comprehensive testing
- Performance optimization

## Appendix: Example Program Structure

```json
{
  "program": {
    "id": "uuid",
    "name": "12-Week Strength Foundation",
    "description": "Build foundational strength with progressive overload",
    "duration_weeks": 12,
    "user_id": "uuid",
    "goals": {
      "primary": "strength",
      "secondary": ["muscle_gain", "movement_quality"],
      "metrics": {
        "squat_1rm_increase": "25%",
        "bench_1rm_increase": "20%"
      }
    },
    "phases": [
      {
        "name": "Anatomical Adaptation",
        "weeks": [1, 2, 3, 4],
        "focus": "movement_quality",
        "weekly_template": {
          "monday": "upper_body_a",
          "wednesday": "lower_body_a",
          "friday": "full_body",
          "saturday": "conditioning"
        }
      }
    ]
  }
}
```