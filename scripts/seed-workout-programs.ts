import { db } from '@/server/db/postgres/db';
import { WorkoutProgramService } from '@/server/services/workoutProgram.service';
import { ProgramPhaseService } from '@/server/services/programPhase.service';
import { ProgramSessionService } from '@/server/services/programSession.service';
import { UserProgramService } from '@/server/services/userProgram.service';

async function seedWorkoutPrograms() {
  console.log('Starting workout program seed...');

  const workoutProgramService = new WorkoutProgramService(db);
  const programPhaseService = new ProgramPhaseService(db);
  const programSessionService = new ProgramSessionService(db);
  const userProgramService = new UserProgramService(db);

  try {
    // Get a test user (assuming one exists)
    const testUser = await db
      .selectFrom('users')
      .select('id')
      .limit(1)
      .executeTakeFirst();

    if (!testUser) {
      console.error('No users found. Please create a user first.');
      return;
    }

    console.log(`Using test user: ${testUser.id}`);

    // Create a 12-week strength program
    const strengthProgram = await workoutProgramService.createProgram({
      userId: testUser.id,
      name: '12-Week Strength Foundation',
      description: 'A comprehensive strength building program focusing on compound movements and progressive overload',
      programType: 'strength',
      durationType: 'fixed',
      durationWeeks: 12,
      startDate: new Date(),
      goals: {
        primary: 'strength',
        secondary: ['muscle_gain', 'movement_quality'],
        metrics: [
          { name: 'squat_1rm', current: 225, target: 315, unit: 'lbs' },
          { name: 'bench_1rm', current: 185, target: 225, unit: 'lbs' },
          { name: 'deadlift_1rm', current: 315, target: 405, unit: 'lbs' }
        ]
      },
      equipmentRequired: ['barbell', 'dumbbells', 'rack', 'bench', 'pull_up_bar']
    });

    console.log(`Created program: ${strengthProgram.name}`);

    // Create phases
    const phases = await programPhaseService.createProgramPhases(strengthProgram.id, [
      {
        phaseNumber: 1,
        name: 'Anatomical Adaptation',
        description: 'Build work capacity and movement quality',
        focus: 'volume',
        startWeek: 1,
        endWeek: 4,
        trainingVariables: {
          intensityRange: { min: 60, max: 75 },
          volumeTargets: { totalSets: 80 },
          repRanges: { main: [8, 12], accessory: [12, 15] },
          restPeriods: { main: 90, accessory: 60 }
        }
      },
      {
        phaseNumber: 2,
        name: 'Strength Building',
        description: 'Focus on progressive overload in main lifts',
        focus: 'strength',
        startWeek: 5,
        endWeek: 8,
        trainingVariables: {
          intensityRange: { min: 75, max: 85 },
          volumeTargets: { totalSets: 70 },
          repRanges: { main: [4, 6], accessory: [8, 10] },
          restPeriods: { main: 180, accessory: 90 }
        }
      },
      {
        phaseNumber: 3,
        name: 'Intensification',
        description: 'Peak strength with reduced volume',
        focus: 'strength',
        startWeek: 9,
        endWeek: 11,
        trainingVariables: {
          intensityRange: { min: 85, max: 95 },
          volumeTargets: { totalSets: 50 },
          repRanges: { main: [1, 3], accessory: [6, 8] },
          restPeriods: { main: 300, accessory: 120 }
        }
      },
      {
        phaseNumber: 4,
        name: 'Deload & Test',
        description: 'Recovery and 1RM testing',
        focus: 'deload',
        startWeek: 12,
        endWeek: 12,
        trainingVariables: {
          intensityRange: { min: 50, max: 100 },
          volumeTargets: { totalSets: 30 },
          repRanges: { main: [1, 3], accessory: [10, 12] },
          restPeriods: { main: 300, accessory: 60 }
        }
      }
    ]);

    console.log(`Created ${phases.length} phases`);

    // Create weeks and sessions for the first phase
    const phase1 = phases[0];
    
    // Create week 1
    const week1 = await db
      .insertInto('program_weeks')
      .values({
        program_id: strengthProgram.id,
        phase_id: phase1.id,
        week_number: 1,
        name: 'Introduction Week',
        description: 'Establish baseline and practice form',
        weekly_volume_target: JSON.stringify({
          totalSets: 20,
          setsPerMuscleGroup: {
            chest: 6,
            back: 6,
            legs: 8,
            shoulders: 4,
            arms: 4
          }
        }),
        training_split: JSON.stringify({
          type: 'upper_lower',
          schedule: [
            { day: 1, focus: 'upper_body', type: 'strength' },
            { day: 3, focus: 'lower_body', type: 'strength' },
            { day: 5, focus: 'full_body', type: 'accessory' }
          ]
        })
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    console.log(`Created week ${week1.week_number}`);

    // Create sessions for week 1
    const sessions = await programSessionService.createWeekSessions({
      weekId: week1.id,
      sessions: [
        {
          dayOfWeek: 1, // Monday
          sessionType: 'strength',
          name: 'Upper Body A',
          description: 'Focus on pushing movements',
          durationMinutes: 60,
          exercises: [
            {
              blockType: 'main',
              blockLabel: 'A',
              exercises: [
                {
                  name: 'Barbell Bench Press',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '5', intensity: '60%' },
                    { setNumber: 2, reps: '5', intensity: '70%' },
                    { setNumber: 3, reps: '8-10', intensity: '75%' },
                    { setNumber: 4, reps: '8-10', intensity: '75%' }
                  ],
                  equipmentNeeded: ['barbell', 'bench', 'rack']
                }
              ]
            },
            {
              blockType: 'accessory',
              blockLabel: 'B',
              exercises: [
                {
                  name: 'Dumbbell Row',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '10-12', intensity: 'RPE 7' },
                    { setNumber: 2, reps: '10-12', intensity: 'RPE 7' },
                    { setNumber: 3, reps: '10-12', intensity: 'RPE 7' }
                  ],
                  equipmentNeeded: ['dumbbells', 'bench']
                },
                {
                  name: 'Overhead Press',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '8-10', intensity: 'RPE 7' },
                    { setNumber: 2, reps: '8-10', intensity: 'RPE 7' },
                    { setNumber: 3, reps: '8-10', intensity: 'RPE 7' }
                  ],
                  equipmentNeeded: ['barbell', 'rack']
                }
              ]
            }
          ]
        },
        {
          dayOfWeek: 3, // Wednesday
          sessionType: 'strength',
          name: 'Lower Body A',
          description: 'Squat-focused session',
          durationMinutes: 60,
          exercises: [
            {
              blockType: 'main',
              blockLabel: 'A',
              exercises: [
                {
                  name: 'Back Squat',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '5', intensity: '60%' },
                    { setNumber: 2, reps: '5', intensity: '70%' },
                    { setNumber: 3, reps: '8-10', intensity: '75%' },
                    { setNumber: 4, reps: '8-10', intensity: '75%' }
                  ],
                  equipmentNeeded: ['barbell', 'rack']
                }
              ]
            },
            {
              blockType: 'accessory',
              blockLabel: 'B',
              exercises: [
                {
                  name: 'Romanian Deadlift',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '10-12', intensity: 'RPE 7' },
                    { setNumber: 2, reps: '10-12', intensity: 'RPE 7' },
                    { setNumber: 3, reps: '10-12', intensity: 'RPE 7' }
                  ],
                  equipmentNeeded: ['barbell']
                },
                {
                  name: 'Leg Press',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '12-15', intensity: 'RPE 7' },
                    { setNumber: 2, reps: '12-15', intensity: 'RPE 7' },
                    { setNumber: 3, reps: '12-15', intensity: 'RPE 7' }
                  ],
                  equipmentNeeded: ['leg_press_machine']
                }
              ]
            }
          ]
        },
        {
          dayOfWeek: 5, // Friday
          sessionType: 'hypertrophy',
          name: 'Full Body Accessory',
          description: 'Higher rep accessory work',
          durationMinutes: 45,
          exercises: [
            {
              blockType: 'accessory',
              blockLabel: 'A',
              exercises: [
                {
                  name: 'Pull-ups',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '6-10', intensity: 'bodyweight' },
                    { setNumber: 2, reps: '6-10', intensity: 'bodyweight' },
                    { setNumber: 3, reps: '6-10', intensity: 'bodyweight' }
                  ],
                  equipmentNeeded: ['pull_up_bar']
                },
                {
                  name: 'Dips',
                  category: 'compound',
                  sets: [
                    { setNumber: 1, reps: '8-12', intensity: 'bodyweight' },
                    { setNumber: 2, reps: '8-12', intensity: 'bodyweight' },
                    { setNumber: 3, reps: '8-12', intensity: 'bodyweight' }
                  ],
                  equipmentNeeded: ['dip_bars']
                }
              ]
            },
            {
              blockType: 'core',
              blockLabel: 'B',
              exercises: [
                {
                  name: 'Plank',
                  category: 'core',
                  sets: [
                    { setNumber: 1, reps: '30-60 seconds', intensity: 'bodyweight' },
                    { setNumber: 2, reps: '30-60 seconds', intensity: 'bodyweight' },
                    { setNumber: 3, reps: '30-60 seconds', intensity: 'bodyweight' }
                  ],
                  equipmentNeeded: []
                }
              ]
            }
          ]
        }
      ]
    });

    console.log(`Created ${sessions.length} sessions for week 1`);

    // Enroll the user in the program
    const userProgram = await userProgramService.enrollUserInProgram({
      userId: testUser.id,
      programId: strengthProgram.id
    });

    console.log(`Enrolled user in program`);

    // Create a hypertrophy program template
    const hypertrophyTemplate = await db
      .insertInto('program_templates')
      .values({
        name: '8-Week Muscle Building',
        description: 'High-volume program for muscle growth',
        template_data: JSON.stringify({
          programType: 'hypertrophy',
          durationType: 'fixed',
          durationWeeks: 8,
          phases: [
            {
              name: 'Volume Accumulation',
              weeks: 4,
              focus: 'volume',
              sessionsPerWeek: 4
            },
            {
              name: 'Intensity Phase',
              weeks: 3,
              focus: 'intensity',
              sessionsPerWeek: 4
            },
            {
              name: 'Deload',
              weeks: 1,
              focus: 'recovery',
              sessionsPerWeek: 3
            }
          ],
          trainingSplit: 'push_pull_legs'
        }),
        category: 'hypertrophy',
        experience_level: 'intermediate',
        equipment_required: JSON.stringify(['barbell', 'dumbbells', 'cables', 'machines']),
        is_public: true
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    console.log(`Created program template: ${hypertrophyTemplate.name}`);

    console.log('\nSeed completed successfully!');
    console.log(`- Created 1 workout program`);
    console.log(`- Created ${phases.length} phases`);
    console.log(`- Created 1 week with ${sessions.length} sessions`);
    console.log(`- Enrolled user in program`);
    console.log(`- Created 1 program template`);

  } catch (error) {
    console.error('Error seeding workout programs:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedWorkoutPrograms().catch(console.error);
}