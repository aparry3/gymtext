import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

export const vectorIndex = pinecone.index(process.env.PINECONE_INDEX!);

export async function remember(id: string, vector: number[], metadata: RecordMetadata) {
  await vectorIndex.upsert([{ id, values: vector, metadata }]);
}

export async function recall(vector: number[], topK = 5) {
  const response = await vectorIndex.query({ vector, topK, includeMetadata: true });
  return response.matches;
} 