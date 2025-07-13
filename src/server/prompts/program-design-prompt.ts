export const programDesignSystemPrompt = `You are an expert fitness program designer with extensive knowledge of:
- Exercise science and biomechanics
- Periodization models (linear, undulating, block)
- Progressive overload principles
- Recovery and adaptation
- Individual differences in training response

Your role is to create comprehensive, science-based workout programs tailored to individual needs.`;

export const programDesignPrompts = {
  initial: `Design a comprehensive {durationType} workout program for a {skillLevel} trainee.

Primary Goal: {primaryGoal}
Secondary Goals: {secondaryGoals}
Available Equipment: {equipment}
Training Days per Week: {daysPerWeek}
Session Duration: {sessionDuration} minutes
Current Fitness Level: {fitnessLevel}
Injuries/Limitations: {injuries}

Create a program that includes:
1. Appropriate periodization for their skill level
2. Progressive overload strategy
3. Recovery considerations
4. Exercise variety to prevent boredom
5. Realistic progression timeline`,

  adaptation: `Analyze the current program and create an adapted version.

Current Program Phase: {currentPhase}
Weeks Completed: {weeksCompleted}
Reason for Adaptation: {reason}
User Feedback: {feedback}
Performance Metrics: {metrics}

Adapt the program while:
1. Maintaining overall program integrity
2. Addressing the specific concern
3. Ensuring continued progress
4. Minimizing disruption to established patterns`,

  phaseTransition: `Design the next phase of the training program.

Previous Phase: {previousPhase}
Previous Phase Duration: {duration} weeks
Performance Outcomes: {outcomes}
User Feedback: {feedback}
Original Goals: {goals}

Create the next phase that:
1. Builds on previous adaptations
2. Introduces appropriate new stimuli
3. Manages fatigue accumulation
4. Progresses toward stated goals`,

  travelMode: `Modify the current program for travel constraints.

Current Program: {currentProgram}
Travel Duration: {travelDuration}
Available Equipment: {travelEquipment}
Time Constraints: {timeConstraints}
Hotel Gym Access: {hotelGym}

Create a travel-friendly version that:
1. Maintains training stimulus
2. Uses minimal equipment
3. Can be done in limited space
4. Keeps session duration flexible
5. Allows easy return to regular program`
};

export const programStructureTemplates = {
  beginner: {
    phases: [
      {
        name: "Adaptation Phase",
        duration: 4,
        focus: "movement quality",
        characteristics: [
          "Full body workouts",
          "Basic movement patterns",
          "Higher repetitions (12-15)",
          "Moderate intensity (60-70%)",
          "Focus on form and technique"
        ]
      },
      {
        name: "Foundation Building",
        duration: 4,
        focus: "strength foundation",
        characteristics: [
          "Introduction to compound movements",
          "Progressive loading",
          "Repetitions 8-12",
          "Intensity 70-80%",
          "Introduction to training splits"
        ]
      },
      {
        name: "Progressive Development",
        duration: 4,
        focus: "consistent progress",
        characteristics: [
          "Established movement patterns",
          "Progressive overload focus",
          "Varied rep ranges",
          "Introduction to periodization",
          "Deload week included"
        ]
      }
    ]
  },
  intermediate: {
    phases: [
      {
        name: "Accumulation Phase",
        duration: 3,
        focus: "volume accumulation",
        characteristics: [
          "Higher training volume",
          "Moderate intensity (70-85%)",
          "Rep ranges 6-12",
          "Focus on time under tension",
          "Accessory work emphasis"
        ]
      },
      {
        name: "Intensification Phase",
        duration: 3,
        focus: "strength development",
        characteristics: [
          "Reduced volume",
          "Higher intensity (80-90%)",
          "Rep ranges 3-6",
          "Compound movement focus",
          "Longer rest periods"
        ]
      },
      {
        name: "Realization Phase",
        duration: 2,
        focus: "peak performance",
        characteristics: [
          "Very low volume",
          "High intensity (85-95%)",
          "Rep ranges 1-3",
          "Competition preparation",
          "Full recovery between sessions"
        ]
      }
    ]
  },
  advanced: {
    phases: [
      {
        name: "Hypertrophy Block",
        duration: 4,
        focus: "muscle growth",
        characteristics: [
          "High volume training",
          "Multiple exercises per muscle",
          "Intensity 65-80%",
          "Short rest periods",
          "Training to near failure"
        ]
      },
      {
        name: "Strength Block",
        duration: 4,
        focus: "maximal strength",
        characteristics: [
          "Lower volume",
          "Heavy compound movements",
          "Intensity 85-95%",
          "Long rest periods",
          "Technical precision"
        ]
      },
      {
        name: "Power Block",
        duration: 3,
        focus: "explosive strength",
        characteristics: [
          "Explosive movements",
          "Olympic lift variations",
          "Plyometrics",
          "Moderate loads moved fast",
          "Full recovery between sets"
        ]
      },
      {
        name: "Deload/Transition",
        duration: 1,
        focus: "recovery",
        characteristics: [
          "Reduced volume by 50%",
          "Light intensity (50-70%)",
          "Focus on mobility",
          "Active recovery",
          "Preparation for next cycle"
        ]
      }
    ]
  }
};