import { BaseRepository } from '@/server/repositories/baseRepository';

export class AdminActivityLogRepository extends BaseRepository {
  async log(params: {
    actorUserId?: string | null;
    targetUserId: string;
    action: string;
    payload?: unknown;
    result: 'success' | 'failure';
    errorMessage?: string | null;
  }): Promise<void> {
    await this.db
      .insertInto('adminActivityLogs')
      .values({
        actorUserId: params.actorUserId ?? null,
        targetUserId: params.targetUserId,
        action: params.action,
        // JSON stringify/parse to ensure it's JSON-serializable for jsonb
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        payload: JSON.parse(JSON.stringify(params.payload ?? {})),
        result: params.result,
        errorMessage: params.errorMessage ?? null,
      })
      .execute();
  }
}
