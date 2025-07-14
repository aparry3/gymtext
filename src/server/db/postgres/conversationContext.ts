import { db } from './db';

export interface Conversation {
  id: string;
  userId: string;
  startedAt: Date;
  lastMessageAt: Date;
  status: 'active' | 'inactive' | 'archived';
  messageCount: number;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  phoneFrom: string;
  phoneTo: string;
  twilioMessageSid: string | null;
  metadata: unknown;
  createdAt: Date;
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

export interface Workout {
  id: string;
  userId: string;
  date: Date;
  workoutType: string;
  exercises: unknown;
  sentAt: Date | null;
  createdAt: Date;
}

// Get the most recent active conversation for a user
export async function getActiveConversation(
  userId: string,
  conversationGapMinutes: number = 30
): Promise<Conversation | null> {
  const cutoffTime = new Date(Date.now() - conversationGapMinutes * 60 * 1000);
  
  const conversation = await db
    .selectFrom('conversations')
    .where('userId', '=', userId)
    .where('status', '=', 'active')
    .where('lastMessageAt', '>=', cutoffTime)
    .orderBy('lastMessageAt', 'desc')
    .selectAll()
    .executeTakeFirst();

  return conversation ? {
    ...conversation,
    status: conversation.status as 'active' | 'inactive' | 'archived'
  } : null;
}

// Get recent messages from a conversation
export async function getRecentMessages(
  conversationId: string,
  limit: number = 5
): Promise<Message[]> {
  const messages = await db
    .selectFrom('messages')
    .where('conversationId', '=', conversationId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .selectAll()
    .execute();

  // Reverse to get chronological order
  return messages.reverse().map(msg => ({
    ...msg,
    direction: msg.direction as 'inbound' | 'outbound'
  }));
}

// Get recent messages for a user across all conversations
export async function getRecentMessagesForUser(
  userId: string,
  limit: number = 10
): Promise<Message[]> {
  const messages = await db
    .selectFrom('messages')
    .where('userId', '=', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .selectAll()
    .execute();

  return messages.reverse().map(msg => ({
    ...msg,
    direction: msg.direction as 'inbound' | 'outbound'
  }));
}

// Get user's fitness profile
export async function getUserFitnessProfile(
  userId: string
): Promise<FitnessProfile | null> {
  const profile = await db
    .selectFrom('fitnessProfiles')
    .where('userId', '=', userId)
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
    .where('userId', '=', userId)
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

  return conversation ? {
    ...conversation,
    status: conversation.status as 'active' | 'inactive' | 'archived'
  } : null;
}

// Get message count for a conversation
export async function getConversationMessageCount(
  conversationId: string
): Promise<number> {
  const result = await db
    .selectFrom('messages')
    .where('conversationId', '=', conversationId)
    .select(db.fn.count('id').as('count'))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

// Get conversation topics (if implemented)
export async function getConversationTopics(
  conversationId: string
): Promise<string[]> {
  const topics = await db
    .selectFrom('conversationTopics')
    .where('conversationId', '=', conversationId)
    .orderBy('confidence', 'desc')
    .select('topic')
    .execute();

  return topics.map(t => t.topic);
}

// Get all messages for a conversation (for summarization)
export async function getAllConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const messages = await db
    .selectFrom('messages')
    .where('conversationId', '=', conversationId)
    .orderBy('createdAt', 'asc')
    .selectAll()
    .execute();

  return messages.map(msg => ({
    ...msg,
    direction: msg.direction as 'inbound' | 'outbound'
  }));
}