import { db } from './db';

// Interface for database user entity
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for database fitness profile entity
export interface FitnessProfile {
  id: string;
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

// Combined user with profile
export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[]
}


// Interface for user creation data
export interface CreateUserData {
  name: string;
  phoneNumber: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}

// Interface for fitness profile creation data
export interface CreateFitnessProfileData {
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
}

// Function to create a new user
export async function createUser(userData: CreateUserData): Promise<User> {
  return await db
    .insertInto('users')
    .values({
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      email: userData.email || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to create a fitness profile for a user
export async function createFitnessProfile(profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
  return await db
    .insertInto('fitnessProfiles')
    .values({
      userId: profileData.userId,
      fitnessGoals: profileData.fitnessGoals,
      skillLevel: profileData.skillLevel,
      exerciseFrequency: profileData.exerciseFrequency,
      gender: profileData.gender,
      age: profileData.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to get a user by ID
export async function getUserById(id: string): Promise<User | undefined> {
  return await db
    .selectFrom('users')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
}

// Function to get a user by Stripe customer ID
export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
  return await db
    .selectFrom('users')
    .where('stripeCustomerId', '=', stripeCustomerId)
    .selectAll()
    .executeTakeFirst();
}

// Function to get a user with their fitness profile
export async function getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }

  const profile = await db
    .selectFrom('fitnessProfiles')
    .where('userId', '=', userId)
    .selectAll()
    .executeTakeFirst();

  return {
    ...user,
    profile: profile || null,
    info: []
  };
}

// Function to get a user by phone number
export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
  return await db
    .selectFrom('users')
    .where('phoneNumber', '=', phoneNumber)
    .selectAll()
    .executeTakeFirst();
}

// Function to update a user
export async function updateUser(id: string, userData: Partial<CreateUserData>): Promise<User> {
  return await db
    .updateTable('users')
    .set({
      ...userData,
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
  }