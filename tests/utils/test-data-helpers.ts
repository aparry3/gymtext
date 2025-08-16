import { generateUuid } from './uuid';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

export function createTestSubscription(userId: string) {
  return {
    id: generateUuid(),
    userId: userId,
    stripeSubscriptionId: `stripe_sub_${generateUuid().substring(0, 8)}`,
    status: 'active',
    planType: 'premium',
    currentPeriodStart: new Date('2024-01-01'),
    currentPeriodEnd: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
}

export function createTestWorkoutInstance(userId: string, date: Date, sessionType: string = 'strength') {
  return {
    id: generateUuid(),
    clientId: userId,
    fitnessPlanId: generateUuid(),
    mesocycleId: generateUuid(),
    microcycleId: generateUuid(),
    sessionType: sessionType,
    date: date,
    details: JSON.stringify([{ label: 'Main', activities: ['Exercise'] }]),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
}

export async function createCompleteWorkoutSetup(db: Kysely<DB>, userId: string, date: Date, sessionType: string = 'strength') {
  const fitnessPlanId = generateUuid();
  const mesocycleId = generateUuid();
  const microcycleId = generateUuid();
  const workoutId = generateUuid();
  
  // Create fitness plan with new schema
  await db.insertInto('fitnessPlans').values({
    id: fitnessPlanId,
    clientId: userId,
    programType: 'strength',
    goalStatement: 'Build strength',
    overview: 'Strength program',
    mesocycles: JSON.stringify([
      { name: 'Accumulation', weeks: 4, focus: ['volume'], deload: false }
    ]),
    lengthWeeks: 4,
    currentMesocycleIndex: 0,
    currentMicrocycleWeek: 1,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }).execute();
  
  // Create microcycle with new schema (pattern storage)
  await db.insertInto('microcycles').values({
    id: microcycleId,
    userId: userId,
    fitnessPlanId: fitnessPlanId,
    mesocycleIndex: 0,
    weekNumber: 1,
    pattern: JSON.stringify({
      Monday: 'Strength',
      Tuesday: 'Cardio',
      Wednesday: 'Recovery',
      Thursday: 'Strength',
      Friday: 'Cardio',
      Saturday: 'Active Recovery',
      Sunday: 'Rest'
    }),
    startDate: date,
    endDate: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }).execute();
  
  // Create workout instance
  await db.insertInto('workoutInstances').values({
    id: workoutId,
    clientId: userId,
    fitnessPlanId: fitnessPlanId,
    mesocycleId: mesocycleId,
    microcycleId: microcycleId,
    sessionType: sessionType,
    date: date,
    details: JSON.stringify([{ label: 'Main', activities: ['Exercise'] }]),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }).execute();
  
  return {
    fitnessPlanId,
    mesocycleId,
    microcycleId,
    workoutId,
  };
}