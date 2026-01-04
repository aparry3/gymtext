import { RecordMetadata } from '@pinecone-database/pinecone';
export declare const vectorIndex: import("@pinecone-database/pinecone").Index<RecordMetadata>;
export declare function remember(userId: string, id: string, vector: number[], metadata: RecordMetadata): Promise<void>;
export declare function recall(userId: string, vector: number[], topK?: number): Promise<import("@pinecone-database/pinecone").ScoredPineconeRecord<RecordMetadata>[]>;
//# sourceMappingURL=vector.d.ts.map