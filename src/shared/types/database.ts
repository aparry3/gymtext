import { Generated, ColumnType } from 'kysely';

// Define the database tables and their schema
export interface Database {
  users: UsersTable;
  fitnessProfiles: FitnessProfilesTable;
  subscriptions: SubscriptionsTable;
  workouts: WorkoutsTable;
  workoutLogs: WorkoutLogsTable;
  conversations: ConversationsTable;
  messages: MessagesTable;
  conversationTopics: ConversationTopicsTable;
}

// Users table schema
export interface UsersTable {
  id: Generated<string>;
  name: string;
  phoneNumber: string;
  email: string | null;
  createdAt: ColumnType<Date, string>;
  updatedAt: ColumnType<Date, string>;
  stripeCustomerId: string | null;
}

// Fitness profiles table schema
export interface FitnessProfilesTable {
  id: Generated<string>;
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
  createdAt: ColumnType<Date, string>;
  updatedAt: ColumnType<Date, string>;
}

// Subscriptions table schema
export interface SubscriptionsTable {
  id: Generated<string>;
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  currentPeriodStart: ColumnType<Date, string>;
  currentPeriodEnd: ColumnType<Date, string>;
  createdAt: ColumnType<Date, string>;
  updatedAt: ColumnType<Date, string>;
  canceledAt: ColumnType<Date, string> | null;
}

// Workouts table schema
export interface WorkoutsTable {
  id: Generated<string>;
  userId: string;
  date: ColumnType<Date, string>;
  workoutType: string;
  exercises: unknown; // JSON field in PostgreSQL, adjust type as needed
  sentAt: ColumnType<Date, string> | null;
  createdAt: ColumnType<Date, string>;
}

// Workout logs table schema
export interface WorkoutLogsTable {
  id: Generated<string>;
  userId: string;
  workoutId: string;
  completed: boolean;
  feedback: string | null;
  rating: number | null;
  completedAt: ColumnType<Date, string , never> | null;
  createdAt: ColumnType<Date, string , never>;
}

// Conversations table schema
export interface ConversationsTable {
  id: Generated<string>;
  userId: string;
  startedAt: ColumnType<Date, string>;
  lastMessageAt: ColumnType<Date, string>;
  status: 'active' | 'inactive' | 'archived';
  messageCount: number;
  metadata: unknown;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

// Messages table schema
export interface MessagesTable {
  id: Generated<string>;
  conversationId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  phoneFrom: string;
  phoneTo: string;
  twilioMessageSid: string | null;
  metadata: unknown;
  createdAt: ColumnType<Date, string | undefined, never>;
}

// Conversation topics table schema
export interface ConversationTopicsTable {
  id: Generated<string>;
  conversationId: string;
  topic: string;
  confidence: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}
