import { BaseRepository } from './baseRepository';
import type { ProfileUpdates } from '../models/_types';
import type { Selectable, Insertable } from 'kysely';
export type ProfileUpdate = Selectable<ProfileUpdates>;
export type NewProfileUpdate = Insertable<ProfileUpdates>;
export declare class ProfileUpdateRepository extends BaseRepository {
    /**
     * Create a new profile update audit record
     */
    create(update: NewProfileUpdate): Promise<ProfileUpdate>;
    /**
     * Get profile updates for a specific client
     */
    getClientUpdates(clientId: string, limit?: number): Promise<ProfileUpdate[]>;
    /**
     * Get recent profile updates across all users (for monitoring)
     */
    getRecentUpdates(limit?: number): Promise<ProfileUpdate[]>;
    /**
     * Get profile updates by source (e.g., 'chat', 'admin', 'api')
     */
    getUpdatesBySource(source: string, limit?: number): Promise<ProfileUpdate[]>;
    /**
     * Count profile updates for a client
     */
    countClientUpdates(clientId: string): Promise<number>;
}
//# sourceMappingURL=profileUpdateRepository.d.ts.map