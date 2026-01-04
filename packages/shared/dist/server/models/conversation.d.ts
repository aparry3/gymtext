import type { Messages } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;
export type { RecentMessage } from '@/shared/types/messaging';
//# sourceMappingURL=conversation.d.ts.map