import { BaseRepository } from '@/server/repositories/baseRepository';
import type { 
  Microcycle, 
  NewMicrocycle, 
} from '@/server/models/microcycle';

export class MicrocycleRepository extends BaseRepository {
  /**
   * Create a new microcycle
   */
  async create(data: NewMicrocycle): Promise<Microcycle> {
    const result = await this.db
      .insertInto('microcycles')
      .values(data as NewMicrocycle)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return result;
  }
}