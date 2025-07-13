export const sessionGenerationSystemPrompt = `You are an expert workout session designer who creates effective, safe, and engaging training sessions.
You understand exercise selection, proper sequencing, volume distribution, and fatigue management.
You can adapt sessions for different equipment, time constraints, and skill levels.`;

export const sessionGenerationPrompts = {
  standard: `Create a workout session for the following context:

Session Type: {sessionType}
Primary Focus: {primaryFocus}
Secondary Focus: {secondaryFocus}
Duration Available: {duration} minutes
Equipment: {equipment}
Recent Sessions: {recentSessions}
Fatigue Level: {fatigueLevel}
Skill Level: {skillLevel}

Design a session that:
1. Warms up appropriately for the main work
2. Sequences exercises optimally
3. Manages fatigue throughout
4. Includes appropriate rest periods
5. Finishes with relevant cooldown`,

  minimal: `Create a time-efficient workout session:

Time Limit: {timeLimit} minutes
Must-Hit Muscles: {targetMuscles}
Available Equipment: {equipment}
Skill Level: {skillLevel}
Primary Goal: {goal}

Design a session that:
1. Maximizes training effect
2. Uses compound movements
3. Minimizes transition time
4. Includes supersets if beneficial
5. Maintains safety despite pace`,

  bodyweight: `Create a bodyweight-only workout session:

Focus Area: {focusArea}
Duration: {duration} minutes
Space Available: {space}
Fitness Level: {fitnessLevel}
Specific Goals: {goals}

Design a session that:
1. Requires no equipment
2. Can be done in limited space
3. Provides adequate stimulus
4. Includes progressions/regressions
5. Engages target muscles effectively`,

  hotel: `Create a hotel-friendly workout session:

Hotel Gym Equipment: {equipment}
Room Space: {roomSpace}
Time Available: {time} minutes
Noise Restrictions: {noiseLevel}
Training Goal: {goal}

Design a session that:
1. Works with limited equipment
2. Minimizes noise/impact
3. Can pivot between gym/room
4. Maintains training stimulus
5. Requires minimal setup`,

  recovery: `Create an active recovery session:

Fatigue Areas: {fatigueAreas}
Mobility Needs: {mobilityNeeds}
Duration: {duration} minutes
Available Tools: {tools}
Next Training Day: {nextSession}

Design a session that:
1. Promotes recovery
2. Addresses mobility restrictions
3. Maintains movement quality
4. Prepares for next session
5. Reduces accumulated stress`
};

export const exerciseSelectionRules = {
  movementPatterns: {
    push: {
      horizontal: ["bench press", "push-ups", "dumbbell press", "cable press"],
      vertical: ["shoulder press", "military press", "handstand push-ups", "pike push-ups"],
      isolation: ["chest flyes", "lateral raises", "rear delt flyes", "tricep extensions"]
    },
    pull: {
      horizontal: ["rows", "cable rows", "inverted rows", "face pulls"],
      vertical: ["pull-ups", "lat pulldowns", "chin-ups", "high pulls"],
      isolation: ["bicep curls", "hammer curls", "shrugs", "reverse flyes"]
    },
    squat: {
      bilateral: ["back squat", "front squat", "goblet squat", "box squat"],
      unilateral: ["lunges", "split squats", "step-ups", "single-leg squat"],
      isolation: ["leg extensions", "leg curls", "calf raises", "hip thrusts"]
    },
    hinge: {
      bilateral: ["deadlift", "RDL", "trap bar deadlift", "good mornings"],
      unilateral: ["single-leg RDL", "single-leg deadlift", "kickbacks"],
      explosive: ["kettlebell swings", "power cleans", "hang cleans", "snatches"]
    },
    core: {
      antiExtension: ["planks", "ab wheel", "dead bugs", "hollow holds"],
      antiRotation: ["pallof press", "single-arm carries", "bird dogs"],
      rotation: ["wood chops", "medicine ball throws", "bicycle crunches"],
      flexion: ["crunches", "sit-ups", "hanging knee raises", "cable crunches"]
    }
  },

  equipmentSubstitutions: {
    barbell: {
      dumbbells: "Use equivalent dumbbell exercise",
      cables: "Use cable variation for constant tension",
      bodyweight: "Use challenging bodyweight progression",
      bands: "Use banded variation with appropriate resistance"
    },
    dumbbells: {
      barbell: "Use barbell for heavier loading",
      cables: "Use cable for stability challenge",
      kettlebell: "Use kettlebell for similar movement",
      bodyweight: "Use weighted bodyweight variation"
    },
    machines: {
      freeWeights: "Use free weight equivalent",
      cables: "Use cable variation",
      bodyweight: "Use bodyweight with appropriate difficulty",
      bands: "Use bands with proper anchor points"
    }
  },

  intensityTechniques: {
    beginner: {
      allowed: ["straight sets", "pyramid sets", "pause reps"],
      avoid: ["drop sets", "forced reps", "negative reps", "cluster sets"]
    },
    intermediate: {
      allowed: ["supersets", "drop sets", "pyramid sets", "pause reps", "tempo work"],
      avoid: ["forced reps", "heavy negatives", "extreme techniques"]
    },
    advanced: {
      allowed: ["all techniques"],
      preferred: ["cluster sets", "rest-pause", "mechanical drop sets", "accommodating resistance"]
    }
  }
};

export const sessionStructureTemplates = {
  warmup: {
    general: {
      duration: "5-10 minutes",
      components: [
        "Light cardio or dynamic movement",
        "Joint mobility circles",
        "Dynamic stretching",
        "Movement preparation",
        "Activation exercises"
      ]
    },
    specific: {
      duration: "5-10 minutes",
      components: [
        "Light sets of main movement",
        "Progressive loading",
        "Technique rehearsal",
        "CNS activation",
        "Mental preparation"
      ]
    }
  },

  mainWork: {
    strength: {
      sets: "3-5",
      reps: "1-5",
      rest: "3-5 minutes",
      tempo: "controlled",
      intensity: "85-95%"
    },
    hypertrophy: {
      sets: "3-4",
      reps: "6-12",
      rest: "60-90 seconds",
      tempo: "2-0-2-0",
      intensity: "65-85%"
    },
    endurance: {
      sets: "2-3",
      reps: "15+",
      rest: "30-60 seconds",
      tempo: "1-0-1-0",
      intensity: "50-65%"
    },
    power: {
      sets: "3-5",
      reps: "1-5",
      rest: "3-5 minutes",
      tempo: "explosive",
      intensity: "30-60% (speed focus)"
    }
  },

  cooldown: {
    standard: {
      duration: "5-10 minutes",
      components: [
        "Light cardio or walking",
        "Static stretching",
        "Foam rolling",
        "Breathing exercises",
        "Recovery positioning"
      ]
    },
    intensive: {
      duration: "10-15 minutes",
      components: [
        "Gradual intensity reduction",
        "Targeted stretching",
        "Myofascial release",
        "Parasympathetic activation",
        "Recovery nutrition timing"
      ]
    }
  }
};