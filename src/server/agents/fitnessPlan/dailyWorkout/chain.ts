import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { Microcycle, MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview, FitnessPlan } from '@/server/models/fitnessPlan';
import { WorkoutInstance, EnhancedWorkoutInstance, WorkoutBlock } from '@/server/models/workout';
import { _EnhancedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { dailyWorkoutPrompt } from './prompts';

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.3, 
  model: "gemini-2.0-flash" 
});

export interface DailyWorkoutContext {
  user: UserWithProfile;
  date: Date;
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  };
  microcycle: Microcycle;
  mesocycle: MesocycleOverview;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

export const generateDailyWorkout = async (context: DailyWorkoutContext): Promise<EnhancedWorkoutInstance> => {
  const { 
    user, 
    date, 
    dayPlan, 
    microcycle, 
    mesocycle, 
    fitnessPlan, 
    recentWorkouts 
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Generate prompt
  const prompt = dailyWorkoutPrompt(
    user,
    fitnessProfile,
    dayPlan,
    microcycle.pattern,
    mesocycle,
    fitnessPlan.programType,
    recentWorkouts
  );

  // Use structured output for the enhanced workout schema
  const structuredModel = llm.withStructuredOutput(_EnhancedWorkoutInstanceSchema);

  try {
    // Generate the workout
    const workout = await structuredModel.invoke(prompt);
    
    // Ensure date is set correctly
    return {
      ...workout,
      date
    } as EnhancedWorkoutInstance;
  } catch (error) {
    console.error('Error generating workout with AI:', error);
    
    // Generate fallback workout
    return generateFallbackWorkout(date, dayPlan, mesocycle, microcycle.pattern);
  }
}

/**
 * Generate a fallback workout if AI generation fails
 */
function generateFallbackWorkout(
  date: Date,
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  },
  mesocycle: MesocycleOverview,
  microcycle: MicrocyclePattern
): EnhancedWorkoutInstance {
  const load = dayPlan.load || 'moderate';
  const isDeload = mesocycle.deload && microcycle.weekIndex === mesocycle.weeks;
  const adjustedLoad = isDeload ? 'light' : load;

  // Rest day
  if (dayPlan.theme.toLowerCase().includes('rest')) {
    return {
      date,
      theme: 'Rest Day',
      blocks: [
        {
          name: 'Active Recovery',
          items: [
            {
              type: 'cooldown',
              exercise: 'Light Walking',
              durationMin: 20,
              RPE: 2,
              notes: 'Optional - only if feeling good'
            },
            {
              type: 'cooldown',
              exercise: 'Stretching',
              durationMin: 10,
              notes: 'Focus on tight areas'
            }
          ]
        }
      ],
      notes: 'Rest and recovery day'
    };
  }

  // Basic workout structure
  const blocks: WorkoutBlock[] = [];

  // Warm-up
  blocks.push({
    name: 'Warm-up',
    items: [
      {
        type: 'prep',
        exercise: 'Dynamic Warm-up',
        durationMin: 5,
        RPE: 3,
        notes: 'General movement preparation'
      },
      {
        type: 'cardio',
        exercise: 'Light Cardio',
        durationMin: 5,
        RPE: 4
      }
    ]
  });

  // Main block based on theme
  if (dayPlan.theme.toLowerCase().includes('upper')) {
    blocks.push({
      name: 'Main - Upper Body',
      items: [
        {
          type: 'compound',
          exercise: 'Horizontal Push',
          sets: isDeload ? 2 : 3,
          reps: '8-12',
          rest: '90s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7
        },
        {
          type: 'compound',
          exercise: 'Horizontal Pull',
          sets: isDeload ? 2 : 3,
          reps: '8-12',
          rest: '90s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7
        },
        {
          type: 'secondary',
          exercise: 'Vertical Push',
          sets: isDeload ? 2 : 3,
          reps: '10-15',
          rest: '60s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 7 : 6
        }
      ]
    });
  } else if (dayPlan.theme.toLowerCase().includes('lower')) {
    blocks.push({
      name: 'Main - Lower Body',
      items: [
        {
          type: 'compound',
          exercise: 'Squat Pattern',
          sets: isDeload ? 2 : 3,
          reps: '8-12',
          rest: '2min',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7
        },
        {
          type: 'compound',
          exercise: 'Hip Hinge Pattern',
          sets: isDeload ? 2 : 3,
          reps: '8-12',
          rest: '2min',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7
        },
        {
          type: 'secondary',
          exercise: 'Single Leg Work',
          sets: isDeload ? 2 : 3,
          reps: '10-12 each',
          rest: '60s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 7 : 6
        }
      ]
    });
  } else if (dayPlan.theme.toLowerCase().includes('cardio') || dayPlan.theme.toLowerCase().includes('hiit')) {
    blocks.push({
      name: 'Main - Cardio',
      items: [
        {
          type: 'cardio',
          exercise: dayPlan.theme,
          durationMin: adjustedLoad === 'light' ? 20 : adjustedLoad === 'heavy' ? 40 : 30,
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7,
          notes: `Maintain ${adjustedLoad} intensity`
        }
      ]
    });
  } else {
    // Generic full body
    blocks.push({
      name: 'Main - Full Body',
      items: [
        {
          type: 'compound',
          exercise: 'Full Body Movement 1',
          sets: isDeload ? 2 : 3,
          reps: '10-12',
          rest: '90s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 8 : 7
        },
        {
          type: 'compound',
          exercise: 'Full Body Movement 2',
          sets: isDeload ? 2 : 3,
          reps: '10-12',
          rest: '90s',
          RPE: adjustedLoad === 'light' ? 5 : adjustedLoad === 'heavy' ? 7 : 6
        }
      ]
    });
  }

  // Cool-down
  blocks.push({
    name: 'Cool-down',
    items: [
      {
        type: 'cooldown',
        exercise: 'Static Stretching',
        durationMin: 5,
        notes: 'Hold each stretch for 30 seconds'
      },
      {
        type: 'cooldown',
        exercise: 'Breathing Exercises',
        durationMin: 3,
        notes: 'Deep breathing for recovery'
      }
    ]
  });

  return {
    date,
    theme: dayPlan.theme,
    blocks,
    notes: isDeload ? 'Deload week - reduced volume and intensity' : `${load} intensity day`
  };
}