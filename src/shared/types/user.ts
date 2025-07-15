export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[];
}

export interface CreateUserData {
  name: string;
  phoneNumber: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}

export interface CreateFitnessProfileData {
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
  createdAt?: string;
  updatedAt?: string;
}