import { Generated, ColumnType } from 'kysely';

// Define the database tables and their schema
export interface Database {
  users: UsersTable;
  fitness_profiles: FitnessProfilesTable;
  subscriptions: SubscriptionsTable;
  workouts: WorkoutsTable;
  workout_logs: WorkoutLogsTable;
  conversations: ConversationsTable;
  messages: MessagesTable;
  conversation_topics: ConversationTopicsTable;
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

// Conversations table schema
export interface ConversationsTable {
  id: Generated<string>;
  user_id: string;
  started_at: ColumnType<Date, string>;
  last_message_at: ColumnType<Date, string>;
  status: 'active' | 'inactive' | 'archived';
  message_count: number;
  metadata: unknown;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

// Messages table schema
export interface MessagesTable {
  id: Generated<string>;
  conversation_id: string;
  user_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  phone_from: string;
  phone_to: string;
  twilio_message_sid: string | null;
  metadata: unknown;
  created_at: ColumnType<Date, string | undefined, never>;
}

// Conversation topics table schema
export interface ConversationTopicsTable {
  id: Generated<string>;
  conversation_id: string;
  topic: string;
  confidence: number;
  created_at: ColumnType<Date, string | undefined, never>;
}
