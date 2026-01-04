import { BaseRepository } from '@/server/repositories/baseRepository';
export class AdminActivityLogRepository extends BaseRepository {
    async log(params) {
        await this.db
            .insertInto('adminActivityLogs')
            .values({
            actorClientId: params.actorClientId ?? null,
            targetClientId: params.targetClientId,
            action: params.action,
            // JSON stringify/parse to ensure it's JSON-serializable for jsonb
            payload: JSON.parse(JSON.stringify(params.payload ?? {})),
            result: params.result,
            errorMessage: params.errorMessage ?? null,
        })
            .execute();
    }
    async listForClient(targetClientId, options = {}) {
        const page = options.page ?? 1;
        const pageSize = options.pageSize ?? 20;
        const rows = await this.db
            .selectFrom('adminActivityLogs')
            .selectAll()
            .where('targetClientId', '=', targetClientId)
            .orderBy('createdAt', 'desc')
            .offset((page - 1) * pageSize)
            .limit(pageSize)
            .execute();
        return rows;
    }
}
