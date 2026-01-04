import { Pinecone } from '@pinecone-database/pinecone';
import { getPineconeSecrets } from '@/server/config';
const { apiKey, indexName } = getPineconeSecrets();
const pinecone = new Pinecone({ apiKey });
export const vectorIndex = pinecone.index(indexName);
export async function remember(userId, id, vector, metadata) {
    await vectorIndex.namespace(userId).upsert([{ id, values: vector, metadata: { ...metadata, timestamp: new Date().toISOString() } }]);
}
export async function recall(userId, vector, topK = 5) {
    const response = await vectorIndex.namespace(userId).query({ vector, topK, includeValues: false, includeMetadata: true });
    return response.matches;
}
