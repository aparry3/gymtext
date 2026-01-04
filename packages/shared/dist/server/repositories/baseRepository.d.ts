import { Kysely } from 'kysely';
import { DB } from '../models/_types';
/**
 * Base Repository
 *
 * Provides database access for all repositories.
 *
 * Supports two patterns:
 * 1. Default singleton (backward compatible): new UserRepository()
 * 2. Explicit db injection (for context switching): new UserRepository(ctx.db)
 *
 * For the admin app with environment switching, always pass ctx.db explicitly.
 */
export declare abstract class BaseRepository {
    protected db: Kysely<DB>;
    /**
     * Create a repository instance
     * @param db - Optional database instance. If not provided, uses the default singleton.
     */
    constructor(db?: Kysely<DB>);
}
/**
 * Type for the database instance (for type exports)
 */
export type DatabaseInstance = Kysely<DB>;
//# sourceMappingURL=baseRepository.d.ts.map