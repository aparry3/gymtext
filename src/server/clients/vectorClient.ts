import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();
await pinecone.init({ apiKey: process.env.PINECONE_API_KEY!, environment: process.env.PINECONE_ENV! });
export const vectorIndex = pinecone.Index(process.env.PINECONE_INDEX!);

export async function remember(id: string, vector: number[], metadata: object) {
  await vectorIndex.upsert({ upsertRequest: { vectors: [{ id, values: vector, metadata }] } });
}

export async function recall(vector: number[], topK = 5) {
  const response = await vectorIndex.query({ queryRequest: { vector, topK, includeMetadata: true } });
  return response.matches;
} 