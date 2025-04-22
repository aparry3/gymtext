import { db } from '../../clients/dbClient';
import { ProgramOutline } from '../../../shared/types/schema';

export async function getLatestProgramOutline(userId: string): Promise<ProgramOutline | null> {
  const result = await db.selectFrom('program_outlines')
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .select('outline')
    .executeTakeFirst();

  return result?.outline || null;
}

export async function createProgramOutline(userId: string, outline: ProgramOutline): Promise<void> {
  await db.insertInto('program_outlines')
    .values({ 
      user_id: userId, 
      outline, 
      created_at: new Date().toISOString() 
    })
    .execute();
} 