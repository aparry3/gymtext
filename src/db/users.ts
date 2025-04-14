import { db } from './db';

// Interface for user creation data
export interface CreateUserData {
  name: string;
  phone_number: string;
  email?: string | null;
  stripe_customer_id?: string | null;
}

// Interface for fitness profile creation data
export interface CreateFitnessProfileData {
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
}

// Function to create a new user
export async function createUser(userData: CreateUserData) {
  return await db
    .insertInto('users')
    .values({
      name: userData.name,
      phone_number: userData.phone_number,
      email: userData.email || null,
      stripe_customer_id: userData.stripe_customer_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to create a fitness profile for a user
export async function createFitnessProfile(profileData: CreateFitnessProfileData) {
  return await db
    .insertInto('fitness_profiles')
    .values({
      user_id: profileData.user_id,
      fitness_goals: profileData.fitness_goals,
      skill_level: profileData.skill_level,
      exercise_frequency: profileData.exercise_frequency,
      gender: profileData.gender,
      age: profileData.age,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to get a user by ID
export async function getUserById(id: string) {
  return await db
    .selectFrom('users')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
}

// Function to get a user by Stripe customer ID
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return await db
    .selectFrom('users')
    .where('stripe_customer_id', '=', stripeCustomerId)
    .selectAll()
    .executeTakeFirst();
}

// Function to get a user with their fitness profile
export async function getUserWithProfile(userId: string) {
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }

  const profile = await db
    .selectFrom('fitness_profiles')
    .where('user_id', '=', userId)
    .selectAll()
    .executeTakeFirst();

  return {
    ...user,
    profile,
  };
}

// Function to update a user
export async function updateUser(id: string, userData: Partial<CreateUserData>) {
  return await db
    .updateTable('users')
    .set({
      ...userData,
      updated_at: new Date(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
} 