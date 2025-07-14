import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

export const vectorIndex = pinecone.index(process.env.PINECONE_INDEX!);

export async function remember(userId: string, id: string, vector: number[], metadata: RecordMetadata) {
  await vectorIndex.namespace(userId).upsert([{ id, values: vector, metadata: {...metadata, timestamp: new Date().toISOString()} }]);
}

export async function recall(userId: string, vector: number[], topK = 5) {
  const response = await vectorIndex.namespace(userId).query({ vector, topK, includeValues: false, includeMetadata: true });
  return response.matches;
} 