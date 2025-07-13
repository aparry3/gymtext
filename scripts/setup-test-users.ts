#!/usr/bin/env tsx
/**
 * Set up test users for Phase 2 testing
 * Run with: npx tsx scripts/setup-test-users.ts
 */

import { randomUUID } from 'crypto';
import { db } from '../src/server/clients/dbClient';

const TEST_USERS = [
  {
    id: randomUUID(),
    name: 'Beginner Bob',
    email: 'beginner@test.com',
    phone_number: '+1234567890',
    profile: {
      skill_level: 'beginner',
      goals: ['weight loss', 'general fitness'],
      equipment: ['dumbbells', 'resistance bands'],
      days_per_week: 3,
      minutes_per_session: 30,
      age: 35,
      gender: 'male',
      fitness_goals: 'Lose 20 pounds and improve overall health',
      exercise_frequency: '3 times per week',
      injuries: 'None'
    }
  },
  {
    id: randomUUID(),
    name: 'Intermediate Iris',
    email: 'intermediate@test.com',
    phone_number: '+1234567891',
    profile: {
      skill_level: 'intermediate',
      goals: ['muscle gain', 'strength'],
      equipment: ['barbell', 'dumbbells', 'pull-up bar', 'bench'],
      days_per_week: 4,
      minutes_per_session: 45,
      age: 28,
      gender: 'female',
      fitness_goals: 'Build muscle and increase strength',
      exercise_frequency: '4 times per week',
      injuries: 'Previous knee injury (recovered)'
    }
  },
  {
    id: randomUUID(),
    name: 'Advanced Alex',
    email: 'advanced@test.com',
    phone_number: '+1234567892',
    profile: {
      skill_level: 'advanced',
      goals: ['powerlifting', 'strength', 'performance'],
      equipment: ['full gym'],
      days_per_week: 5,
      minutes_per_session: 60,
      age: 32,
      gender: 'non-binary',
      fitness_goals: 'Compete in powerlifting, total 1200lbs',
      exercise_frequency: '5-6 times per week',
      injuries: 'None'
    }
  },
  {
    id: randomUUID(),
    name: 'Travel Terry',
    email: 'travel@test.com',
    phone_number: '+1234567893',
    profile: {
      skill_level: 'intermediate',
      goals: ['maintain fitness', 'endurance'],
      equipment: ['bodyweight', 'resistance bands'],
      days_per_week: 4,
      minutes_per_session: 30,
      age: 40,
      gender: 'male',
      fitness_goals: 'Stay fit while traveling for work',
      exercise_frequency: '4 times per week',
      injuries: 'None',
      info: ['Travels 2 weeks per month', 'Limited gym access']
    }
  }
];

async function setupTestUsers() {
  console.log('🔧 Setting up test users for Phase 2 testing...\n');

  for (const testUser of TEST_USERS) {
    try {
      // Check if user already exists
      const existingUser = await db
        .selectFrom('users')
        .where('email', '=', testUser.email)
        .selectAll()
        .executeTakeFirst();

      if (existingUser) {
        console.log(`⚠️  User ${testUser.name} already exists (ID: ${existingUser.id})`);
        continue;
      }

      // Create user
      const user = await db
        .insertInto('users')
        .values({
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          phone_number: testUser.phone_number,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirst();

      if (!user) {
        console.log(`❌ Failed to create user ${testUser.name}`);
        continue;
      }

      // Create fitness profile
      await db
        .insertInto('fitness_profiles')
        .values({
          id: randomUUID(),
          user_id: user.id,
          skill_level: testUser.profile.skill_level,
          goals: testUser.profile.goals,
          equipment: testUser.profile.equipment,
          days_per_week: testUser.profile.days_per_week,
          minutes_per_session: testUser.profile.minutes_per_session,
          age: testUser.profile.age,
          gender: testUser.profile.gender,
          fitness_goals: testUser.profile.fitness_goals,
          exercise_frequency: testUser.profile.exercise_frequency,
          injuries: testUser.profile.injuries,
          created_at: new Date(),
          updated_at: new Date()
        })
        .execute();

      console.log(`✅ Created test user: ${testUser.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Profile: ${testUser.profile.skill_level} - ${testUser.profile.goals.join(', ')}`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error creating user ${testUser.name}:`, error);
    }
  }

  console.log('\n📋 Test User Summary:');
  console.log('-------------------');
  
  // List all test users
  const allTestUsers = await db
    .selectFrom('users')
    .where('email', 'like', '%@test.com')
    .leftJoin('fitness_profiles', 'users.id', 'fitness_profiles.user_id')
    .select([
      'users.id',
      'users.name',
      'users.email',
      'fitness_profiles.skill_level',
      'fitness_profiles.goals'
    ])
    .execute();

  allTestUsers.forEach(user => {
    console.log(`\n${user.name} (${user.id})`);
    console.log(`Email: ${user.email}`);
    console.log(`Level: ${user.skill_level || 'No profile'}`);
    console.log(`Goals: ${user.goals ? JSON.stringify(user.goals) : 'No goals'}`);
  });

  console.log('\n\n🚀 To test with these users, use their IDs in the test script:');
  console.log('   TEST_USER_ID=<user-id> npx tsx scripts/test-phase2.ts');
  
  await db.destroy();
}

setupTestUsers().catch(console.error);