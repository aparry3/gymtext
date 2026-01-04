import { BaseRepository } from './baseRepository';
import { DayConfig, NewDayConfig, DayConfigUpdate, DayConfigOptions, DayConfigWithTypedConfig } from '../models/dayConfig';
/**
 * Repository for managing day configurations
 * Handles storage and retrieval of day-specific settings
 */
export declare class DayConfigRepository extends BaseRepository {
    /**
     * Get config for a specific date (global scope)
     */
    getByDate(date: Date): Promise<DayConfigWithTypedConfig | null>;
    /**
     * Get configs for a date range (for calendar view)
     */
    getByDateRange(startDate: Date, endDate: Date): Promise<DayConfigWithTypedConfig[]>;
    /**
     * Create a new day config
     */
    create(data: NewDayConfig): Promise<DayConfig>;
    /**
     * Update an existing day config
     */
    update(id: string, data: DayConfigUpdate): Promise<DayConfig>;
    /**
     * Upsert a day config (create or update)
     * For global scope, merges config with existing if present
     */
    upsert(date: Date, config: DayConfigOptions, scopeType?: string, scopeId?: string | null): Promise<DayConfigWithTypedConfig>;
    /**
     * Delete config for a date
     */
    deleteByDate(date: Date, scopeType?: string, scopeId?: string | null): Promise<void>;
    /**
     * Delete config by ID
     */
    deleteById(id: string): Promise<void>;
}
//# sourceMappingURL=dayConfigRepository.d.ts.map