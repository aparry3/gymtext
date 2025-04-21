import { Generated, ColumnType } from 'kysely';

// Define the database tables and their schema
export interface Database {
  users: UsersTable;
  fitness_profiles: FitnessProfilesTable;
  subscriptions: SubscriptionsTable;
  workouts: WorkoutsTable;
  workout_logs: WorkoutLogsTable;
  program_outlines: ProgramOutlinesTable;
}

// Users table schema
export interface UsersTable {
  id: Generated<string>;
  name: string;
  phone_number: string;
  email: string | null;
  created_at: ColumnType<Date, string>;
  updated_at: ColumnType<Date, string>;
  stripe_customer_id: string | null;
}

// Fitness profiles table schema
export interface FitnessProfilesTable {
  id: Generated<string>;
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
  created_at: ColumnType<Date, string>;
  updated_at: ColumnType<Date, string>;
}

// Subscriptions table schema
export interface SubscriptionsTable {
  id: Generated<string>;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_type: string;
  current_period_start: ColumnType<Date, string>;
  current_period_end: ColumnType<Date, string>;
  created_at: ColumnType<Date, string>;
  updated_at: ColumnType<Date, string>;
  canceled_at: ColumnType<Date, string> | null;
}

// Workouts table schema
export interface WorkoutsTable {
  id: Generated<string>;
  user_id: string;
  date: ColumnType<Date, string>;
  workout_type: string;
  exercises: unknown; // JSON field in PostgreSQL, adjust type as needed
  sent_at: ColumnType<Date, string> | null;
  created_at: ColumnType<Date, string>;
}

// Workout logs table schema
export interface WorkoutLogsTable {
  id: Generated<string>;
  user_id: string;
  workout_id: string;
  completed: boolean;
  feedback: string | null;
  rating: number | null;
  completed_at: ColumnType<Date, string , never> | null;
  created_at: ColumnType<Date, string , never>;
}

// Program outline types
export interface ProgramOutline {
  id: string;               // UUID
  userId: string;           // Reference to users.id
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp

  goals: {
    primary: string;        // e.g., "Fat loss"
    secondary?: string[];   // e.g., ["Improve endurance"]
  };

  progression?: {
    type: 'linear' | 'undulating' | 'block';
    description: string;    // Describes the overall periodization
  };

  weeks: ProgramWeek[];     // Array of week-level entries
}

export interface ProgramWeek {
  weekNumber: number;       // 1-based index
  focusAreas: string[];     // e.g., ["strength", "mobility"]
  thingsToConsider: string[]; // e.g., ["keep rest under 90s", "prioritize compound lifts"]
  intensity?: 'light' | 'moderate' | 'heavy';
  volume?: 'low' | 'medium' | 'high';
  description?: string;     // High-level blurb for the week
  // Optional fields for future extension
  notes?: string[];         // Coach tips or annotations
}
// Program outlines table schema
export interface ProgramOutlinesTable {
  id: Generated<string>;
  user_id: string;
  outline: ProgramOutline;
  created_at: ColumnType<Date, string>;
} 