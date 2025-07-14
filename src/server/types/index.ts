/**
 * Central type definitions for server-side code
 * This file consolidates commonly used types to avoid duplication
 */

import { Selectable, Insertable, Updateable } from 'kysely';
import {
  Users,
  FitnessProfiles,
  Conversations,
  Messages,
  Workouts,
  Subscriptions,
} from '@/shared/types/generated-schema';

// User-related types
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

export type FitnessProfile = Selectable<FitnessProfiles>;
export type NewFitnessProfile = Insertable<FitnessProfiles>;
export type FitnessProfileUpdate = Updateable<FitnessProfiles>;

export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[];
}

// Conversation-related types
export type Conversation = Selectable<Conversations>;
export type NewConversation = Insertable<Conversations>;
export type ConversationUpdate = Updateable<Conversations>;

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

// Workout-related types
export type Workout = Selectable<Workouts>;
export type NewWorkout = Insertable<Workouts>;
export type WorkoutUpdate = Updateable<Workouts>;

// Subscription-related types
export type Subscription = Selectable<Subscriptions>;
export type NewSubscription = Insertable<Subscriptions>;
export type SubscriptionUpdate = Updateable<Subscriptions>;