import { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';
import { postgresDb } from '@/server/connections/postgres';

export abstract class BaseRepository {
  protected db: Kysely<DB>;

  constructor(db: Kysely<DB> = postgresDb) {
    this.db = db;
  }
}