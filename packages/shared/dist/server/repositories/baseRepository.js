import { postgresDb } from '@/server/connections/postgres/postgres';
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
export class BaseRepository {
    db;
    /**
     * Create a repository instance
     * @param db - Optional database instance. If not provided, uses the default singleton.
     */
    constructor(db = postgresDb) {
        this.db = db;
    }
}
