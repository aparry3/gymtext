import { BaseRepository } from '@/server/repositories/baseRepository';
export declare class AdminActivityLogRepository extends BaseRepository {
    log(params: {
        actorClientId?: string | null;
        targetClientId: string;
        action: string;
        payload?: unknown;
        result: 'success' | 'failure';
        errorMessage?: string | null;
    }): Promise<void>;
    listForClient(targetClientId: string, options?: {
        page?: number;
        pageSize?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        errorMessage: string | null;
        result: string;
        action: string;
        actorClientId: string | null;
        payload: string | number | boolean | import("..").JsonArray | import("..").JsonObject | null;
        targetClientId: string;
    }[]>;
}
//# sourceMappingURL=adminActivityLogRepository.d.ts.map