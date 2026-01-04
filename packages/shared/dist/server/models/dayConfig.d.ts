/**
 * Day Config Model
 *
 * Represents configuration for a specific day (date).
 * Used for setting day-specific images, themes, and other customizations.
 * Supports global, group, and user-level scoping for future extensibility.
 */
import { Selectable, Insertable, Updateable } from 'kysely';
import { DayConfigs } from './_types';
/**
 * Type for selecting day configs from the database
 */
export type DayConfig = Selectable<DayConfigs>;
/**
 * Type for inserting day configs into the database
 */
export type NewDayConfig = Insertable<DayConfigs>;
/**
 * Type for updating day configs in the database
 */
export type DayConfigUpdate = Updateable<DayConfigs>;
/**
 * Scope types for day configurations
 */
export type ScopeType = 'global' | 'group' | 'user';
/**
 * Configuration options stored in the config JSON column.
 * Add new fields here as needed - no migration required.
 */
export interface DayConfigOptions {
    /** CDN URL for the day's image (from Vercel Blob) */
    imageUrl?: string;
    /** Display name for the image */
    imageName?: string;
}
/**
 * Day config with typed config field
 */
export interface DayConfigWithTypedConfig extends Omit<DayConfig, 'config'> {
    config: DayConfigOptions;
}
//# sourceMappingURL=dayConfig.d.ts.map