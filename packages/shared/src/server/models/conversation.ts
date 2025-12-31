import type { Messages } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

// Kysely DB types
export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

// Re-export RecentMessage from shared types
export type { RecentMessage } from '@/shared/types/messaging';
