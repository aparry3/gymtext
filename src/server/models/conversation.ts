import type { Messages } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

export interface RecentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageId?: string;
}