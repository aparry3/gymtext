import { Kysely } from 'kysely';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { DB } from '../models/_types';

export abstract class BaseRepository {
  protected db: Kysely<DB>;

  constructor(db: Kysely<DB> = postgresDb) {
    this.db = db;
  }
}