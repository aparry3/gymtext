import { MessageRepository } from '@/server/repositories/messageRepository';
import type { Messages } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

export type MessageDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
