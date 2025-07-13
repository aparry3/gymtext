export const adaptationSystemPrompt = `You are an expert in training program adaptation and modification.
You understand how to adjust programs based on user feedback, performance data, and changing circumstances.
You balance the need for consistency with the requirement for individualization and responsiveness.`;

export const adaptationPrompts = {
  performance: `Adapt the program based on performance feedback:

Current Program: {currentProgram}
Performance Data: {performanceData}
User Feedback: {userFeedback}
Weeks Completed: {weeksCompleted}
Original Goals: {goals}

Analyze and adapt:
1. Identify what's working well
2. Address underperforming areas
3. Adjust volume/intensity as needed
4. Maintain program coherence
5. Plan next 2-4 weeks`,

  injury: `Modify the program for injury management:

Injury Type: {injuryType}
Affected Movements: {affectedMovements}
Medical Guidance: {medicalGuidance}
Current Program: {currentProgram}
Recovery Timeline: {timeline}

Create modifications that:
1. Work around the injury
2. Maintain fitness where possible
3. Support healing process
4. Prevent compensation patterns
5. Plan return to full training`,

  lifestyle: `Adjust program for lifestyle changes:

Change Type: {changeType}
New Constraints: {constraints}
Duration: {duration}
Current Program: {currentProgram}
Priority Goals: {priorities}

Adapt the program to:
1. Fit new schedule/constraints
2. Maintain key training stimuli
3. Adjust volume appropriately
4. Keep user engaged
5. Plan for return to normal`,

  plateau: `Break through a training plateau:

Plateau Duration: {duration}
Affected Metrics: {metrics}
Current Program: {currentProgram}
Training History: {history}
Recovery Status: {recovery}

Design adaptations to:
1. Introduce novel stimuli
2. Address weak points
3. Manage fatigue better
4. Enhance recovery
5. Reignite progress`,

  travel: `Create travel-friendly program modifications:

Travel Duration: {duration}
Available Equipment: {equipment}
Time Constraints: {timeConstraints}
Current Program Phase: {currentPhase}
Return Date: {returnDate}

Modify to:
1. Maintain training effect
2. Use available equipment
3. Fit travel schedule
4. Minimize fitness loss
5. Enable smooth return`
};

export const adaptationStrategies = {
  volumeAdjustments: {
    increase: {
      conditions: ["Easy recovery", "Strength increasing", "Requesting more work"],
      method: "Add 1-2 sets per muscle group per week",
      limit: "Max 25% increase over 4 weeks",
      monitoring: "Track recovery markers daily"
    },
    maintain: {
      conditions: ["Adequate progress", "Good recovery", "Sustainable pace"],
      method: "Keep current volume",
      adjustments: "Vary exercises or intensity",
      review: "Reassess every 2 weeks"
    },
    decrease: {
      conditions: ["Poor recovery", "Performance decline", "Life stress"],
      method: "Reduce by 20-40%",
      priority: "Maintain intensity over volume",
      duration: "1-2 weeks before reassessment"
    }
  },

  intensityModifications: {
    autoregulation: {
      rpe: {
        description: "Rate of Perceived Exertion",
        scale: "1-10 or RPE in Reserve",
        application: "Adjust load based on daily readiness",
        benefit: "Accounts for daily variation"
      },
      velocityBased: {
        description: "Bar speed measurement",
        threshold: "20% velocity drop = set termination",
        application: "Objective fatigue management",
        requirement: "Velocity measurement device"
      },
      flexibleLoading: {
        description: "Load range prescription",
        example: "Work up to 80-85% for doubles",
        application: "Allows for good and bad days",
        benefit: "Maintains consistency"
      }
    }
  },

  exerciseSubstitutions: {
    criteria: {
      movementPattern: "Must match primary pattern",
      muscleGroups: "Target same primary muscles",
      loadability: "Allow similar loading capacity",
      skillLevel: "Match user competency",
      equipment: "Use available equipment"
    },
    commonSwaps: {
      squats: {
        barbell: ["goblet squat", "front squat", "leg press", "split squats"],
        injury: ["box squat", "leg press", "wall sits", "step-ups"],
        minimal: ["bodyweight squats", "jump squats", "pistol squats", "lunges"]
      },
      deadlifts: {
        barbell: ["trap bar deadlift", "RDL", "rack pulls", "good mornings"],
        injury: ["hip thrusts", "reverse hypers", "cable pull-throughs", "back extensions"],
        minimal: ["single-leg RDL", "nordic curls", "broad jumps", "KB swings"]
      },
      benchPress: {
        barbell: ["dumbbell press", "floor press", "close-grip bench", "decline press"],
        injury: ["cable press", "push-ups", "machine press", "isometric holds"],
        minimal: ["push-ups", "dips", "pike push-ups", "diamond push-ups"]
      }
    }
  },

  recoveryEnhancement: {
    active: {
      methods: ["Light cardio", "Mobility work", "Swimming", "Yoga"],
      frequency: "2-3x per week",
      duration: "20-40 minutes",
      intensity: "40-60% max HR"
    },
    passive: {
      methods: ["Sleep optimization", "Nutrition timing", "Stress management", "Massage"],
      priority: "8+ hours sleep",
      nutrition: "Protein every 3-4 hours",
      hydration: "Half bodyweight in ounces minimum"
    },
    supplemental: {
      methods: ["Contrast therapy", "Compression", "Elevation", "Meditation"],
      timing: "Post-workout or evening",
      frequency: "As needed",
      tracking: "Monitor effectiveness"
    }
  }
};

export const communicationAdaptations = {
  beginner: {
    terminology: {
      "Progressive overload": "Getting a little stronger each week",
      "Hypertrophy": "Building muscle",
      "Volume": "Total amount of work",
      "Intensity": "How heavy the weight is",
      "Frequency": "How often you train",
      "RPE": "How hard it feels (1-10)",
      "Deload": "Easy week for recovery",
      "Compound movement": "Exercises using multiple muscles"
    },
    explanations: "Simple, relate to daily activities",
    focus: "Form, consistency, and gradual progress"
  },
  
  intermediate: {
    terminology: {
      "Periodization": "Planned training phases",
      "Time under tension": "How long muscles work each set",
      "Mind-muscle connection": "Focusing on target muscles",
      "Training split": "How you divide workouts",
      "Supersets": "Two exercises back-to-back",
      "Drop sets": "Reducing weight to continue",
      "Volume landmarks": "MEV, MAV, MRV",
      "Fatigue management": "Balancing work and recovery"
    },
    explanations: "More technical but still accessible",
    focus: "Optimization and refined technique"
  },
  
  advanced: {
    terminology: {
      "Accommodating resistance": "Bands/chains for strength curve",
      "Conjugate method": "Rotating exercise variations",
      "Block periodization": "Focused training phases",
      "Potentiation": "Performance enhancement techniques",
      "Velocity-based training": "Speed-focused programming",
      "DUP": "Daily undulating periodization",
      "MRV": "Maximum recoverable volume",
      "SRA curve": "Stimulus, recovery, adaptation"
    },
    explanations: "Full technical detail as appropriate",
    focus: "Fine-tuning and advanced strategies"
  }
};