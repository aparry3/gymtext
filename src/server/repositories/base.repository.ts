import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';

export abstract class BaseRepository {
  protected db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }
}