import { db } from './db';

export interface Conversation {
  id: string;
  user_id: string;
  started_at: Date;
  last_message_at: Date;
  status: 'active' | 'inactive' | 'archived';
  message_count: number;
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  phone_from: string;
  phone_to: string;
  twilio_message_sid: string | null;
  metadata: unknown;
  created_at: Date;
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

export interface Workout {
  id: string;
  user_id: string;
  date: Date;
  workout_type: string;
  exercises: unknown;
  sent_at: Date | null;
  created_at: Date;
}

// Get the most recent active conversation for a user
export async function getActiveConversation(
  userId: string,
  conversationGapMinutes: number = 30
): Promise<Conversation | null> {
  const cutoffTime = new Date(Date.now() - conversationGapMinutes * 60 * 1000);
  
  const conversation = await db
    .selectFrom('conversations')
    .where('user_id', '=', userId)
    .where('status', '=', 'active')
    .where('last_message_at', '>=', cutoffTime)
    .orderBy('last_message_at', 'desc')
    .selectAll()
    .executeTakeFirst();

  return conversation || null;
}

// Get recent messages from a conversation
export async function getRecentMessages(
  conversationId: string,
  limit: number = 5
): Promise<Message[]> {
  const messages = await db
    .selectFrom('messages')
    .where('conversation_id', '=', conversationId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .selectAll()
    .execute();

  // Reverse to get chronological order
  return messages.reverse();
}

// Get recent messages for a user across all conversations
export async function getRecentMessagesForUser(
  userId: string,
  limit: number = 10
): Promise<Message[]> {
  const messages = await db
    .selectFrom('messages')
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .selectAll()
    .execute();

  return messages.reverse();
}

// Get user's fitness profile
export async function getUserFitnessProfile(
  userId: string
): Promise<FitnessProfile | null> {
  const profile = await db
    .selectFrom('fitness_profiles')
    .where('user_id', '=', userId)
    .selectAll()
    .executeTakeFirst();

  return profile || null;
}

// Get recent workouts for a user
export async function getRecentWorkouts(
  userId: string,
  limit: number = 5
): Promise<Workout[]> {
  return await db
    .selectFrom('workouts')
    .where('user_id', '=', userId)
    .orderBy('date', 'desc')
    .limit(limit)
    .selectAll()
    .execute();
}

// Get conversation by ID
export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  const conversation = await db
    .selectFrom('conversations')
    .where('id', '=', conversationId)
    .selectAll()
    .executeTakeFirst();

  return conversation || null;
}

// Get message count for a conversation
export async function getConversationMessageCount(
  conversationId: string
): Promise<number> {
  const result = await db
    .selectFrom('messages')
    .where('conversation_id', '=', conversationId)
    .select(db.fn.count('id').as('count'))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

// Get conversation topics (if implemented)
export async function getConversationTopics(
  conversationId: string
): Promise<string[]> {
  const topics = await db
    .selectFrom('conversation_topics')
    .where('conversation_id', '=', conversationId)
    .orderBy('confidence', 'desc')
    .select('topic')
    .execute();

  return topics.map(t => t.topic);
}

// Get all messages for a conversation (for summarization)
export async function getAllConversationMessages(
  conversationId: string
): Promise<Message[]> {
  return await db
    .selectFrom('messages')
    .where('conversation_id', '=', conversationId)
    .orderBy('created_at', 'asc')
    .selectAll()
    .execute();
}