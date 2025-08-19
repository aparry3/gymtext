import { Kysely } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Make mesocycle_id and microcycle_id nullable since the referenced tables no longer exist
  await db.schema
    .alterTable('workout_instances')
    .alterColumn('mesocycle_id', (col) => col.dropNotNull())
    .execute();
    
  await db.schema
    .alterTable('workout_instances')
    .alterColumn('microcycle_id', (col) => col.dropNotNull())
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Restore NOT NULL constraints
  await db.schema
    .alterTable('workout_instances')
    .alterColumn('mesocycle_id', (col) => col.setNotNull())
    .execute();
    
  await db.schema
    .alterTable('workout_instances')
    .alterColumn('microcycle_id', (col) => col.setNotNull())
    .execute();
}