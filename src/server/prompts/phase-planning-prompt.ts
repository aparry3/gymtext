export const phasePlanningSystemPrompt = `You are an expert in exercise periodization and training phase design. 
You understand how to structure training blocks to maximize adaptation while managing fatigue and preventing overtraining.
Your expertise includes linear, undulating, and block periodization models.`;

export const phasePlanningPrompts = {
  strengthPhase: `Design a strength-focused training phase.

Duration: {duration} weeks
Current Strength Levels: {currentLevels}
Target Improvements: {targets}
Available Equipment: {equipment}
Recovery Capacity: {recoveryCapacity}

Create a phase that:
1. Progressively increases intensity
2. Manages volume appropriately
3. Includes technique work
4. Plans for supercompensation
5. Includes a deload strategy`,

  hypertrophyPhase: `Design a muscle-building focused training phase.

Duration: {duration} weeks
Target Muscle Groups: {targetGroups}
Training Experience: {experience}
Weekly Frequency: {frequency}
Nutrition Status: {nutritionStatus}

Create a phase that:
1. Maximizes muscle tension time
2. Provides adequate volume
3. Ensures muscle group recovery
4. Includes intensity techniques
5. Prevents accommodation`,

  powerPhase: `Design a power and explosiveness training phase.

Duration: {duration} weeks
Sport/Activity: {sport}
Current Power Metrics: {currentMetrics}
Injury History: {injuryHistory}
Training Age: {trainingAge}

Create a phase that:
1. Develops rate of force development
2. Includes plyometric progression
3. Manages CNS fatigue
4. Integrates with strength work
5. Peaks at appropriate time`,

  endurancePhase: `Design an endurance-focused training phase.

Duration: {duration} weeks
Endurance Goals: {goals}
Current Conditioning: {currentLevel}
Time Availability: {timeAvailable}
Other Training: {concurrentTraining}

Create a phase that:
1. Builds aerobic capacity
2. Includes threshold work
3. Prevents interference with strength
4. Manages training load
5. Includes recovery protocols`,

  deloadPhase: `Design a recovery and deload phase.

Duration: {duration} weeks
Accumulated Fatigue: {fatigueLevel}
Previous Phase Intensity: {previousIntensity}
Upcoming Phase: {nextPhase}
Recovery Needs: {specificNeeds}

Create a phase that:
1. Reduces training stress
2. Maintains movement patterns
3. Promotes supercompensation
4. Addresses weak points
5. Prepares for next phase`
};

export const phaseProgressionRules = {
  volumeProgression: {
    beginner: {
      weeklyIncrease: "5-10%",
      maxWeeklyVolume: "10-12 sets per muscle group",
      deloadFrequency: "Every 4 weeks",
      startingVolume: "6-8 sets per muscle group"
    },
    intermediate: {
      weeklyIncrease: "3-5%",
      maxWeeklyVolume: "12-20 sets per muscle group",
      deloadFrequency: "Every 3-4 weeks",
      startingVolume: "10-12 sets per muscle group"
    },
    advanced: {
      weeklyIncrease: "2-3%",
      maxWeeklyVolume: "20-25 sets per muscle group",
      deloadFrequency: "Every 3 weeks",
      startingVolume: "12-16 sets per muscle group"
    }
  },

  intensityProgression: {
    strengthPhase: {
      week1: "80-85%",
      week2: "82.5-87.5%",
      week3: "85-90%",
      week4: "70-75% (deload)",
      repRanges: "1-5"
    },
    hypertrophyPhase: {
      week1: "65-75%",
      week2: "67.5-77.5%",
      week3: "70-80%",
      week4: "60-70% (deload)",
      repRanges: "6-12"
    },
    endurancePhase: {
      week1: "50-60%",
      week2: "52.5-62.5%",
      week3: "55-65%",
      week4: "45-55% (deload)",
      repRanges: "15-20+"
    }
  },

  phaseTransitions: {
    strengthToHypertrophy: {
      transitionWeek: {
        volumeAdjustment: "Increase by 20-30%",
        intensityAdjustment: "Decrease by 10-15%",
        exerciseSelection: "Add isolation movements",
        restPeriods: "Decrease to 60-90 seconds"
      }
    },
    hypertrophyToStrength: {
      transitionWeek: {
        volumeAdjustment: "Decrease by 30-40%",
        intensityAdjustment: "Increase by 10-15%",
        exerciseSelection: "Focus on compounds",
        restPeriods: "Increase to 3-5 minutes"
      }
    },
    anyToDeload: {
      transitionWeek: {
        volumeAdjustment: "Decrease by 40-50%",
        intensityAdjustment: "Decrease by 20-30%",
        exerciseSelection: "Maintain movement patterns",
        restPeriods: "As needed for recovery"
      }
    }
  }
};

export const phaseAdaptationTriggers = {
  excessiveFatigue: {
    indicators: [
      "Performance decrease >10%",
      "RPE increase >2 points",
      "Sleep quality decline",
      "Motivation loss",
      "Joint discomfort"
    ],
    adaptations: [
      "Immediate 20% volume reduction",
      "Extra recovery day",
      "Intensity cap at 85%",
      "Focus on technique",
      "Consider full deload"
    ]
  },

  rapidProgress: {
    indicators: [
      "Consistent PR setting",
      "RPE decrease >2 points",
      "Perfect recovery",
      "High motivation",
      "Technical mastery"
    ],
    adaptations: [
      "Accelerate progression by 50%",
      "Add advanced techniques",
      "Increase training density",
      "Consider phase abbreviation",
      "Plan for higher peak"
    ]
  },

  plateau: {
    indicators: [
      "No progress for 2 weeks",
      "Same weights/reps",
      "Technique stagnation",
      "Mental staleness",
      "Accommodation signs"
    ],
    adaptations: [
      "Exercise variation",
      "Rep range change",
      "Tempo manipulation",
      "Mini-deload",
      "Phase modification"
    ]
  }
};