import { Kysely } from 'kysely';
import type { DB } from '@/shared/types/generated';
import { postgresDb } from '@/server/core/database/postgres';

export abstract class BaseRepository {
  protected db: Kysely<DB>;

  constructor(db: Kysely<DB> = postgresDb) {
    this.db = db;
  }
}