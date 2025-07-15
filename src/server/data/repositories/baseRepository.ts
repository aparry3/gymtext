import { Kysely } from 'kysely';
import { Database } from '@/shared/types/database';
import { postgresDb } from '@/server/core/database/postgres';

export abstract class BaseRepository {
  protected db: Kysely<Database>;

  constructor(db: Kysely<Database> = postgresDb) {
    this.db = db;
  }
}