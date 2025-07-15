export interface User {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FitnessProfile {
  id: string;
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[];
}

export interface CreateUserData {
  name: string;
  phone_number: string;
  email?: string | null;
  stripe_customer_id?: string | null;
}

export interface CreateFitnessProfileData {
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
}