import { OpenAIEmbeddings } from '@langchain/openai';
import { recall as vectorRecall, remember as vectorRemember } from '../../clients/vectorClient';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { RecordMetadata } from '@pinecone-database/pinecone';
import { ScoredPineconeRecord } from '@pinecone-database/pinecone';

// Use the latest text-embedding-3-large model with 3072 dimensions
const embedder = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  dimensions: 1536
});

export async function recall(input: {userId: string, text: string}): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
  const vec = await embedder.embedQuery(input.text);
  return vectorRecall(input.userId, vec);
}

export async function remember(input: {userId: string, key: string, text: string, metadata?: RecordMetadata}) {
  const vec = await embedder.embedQuery(input.text);
  await vectorRemember(input.userId, input.key, vec, { userId: input.userId, text: input.text, ...(input.metadata || {}) });
} 

export const recallTool = tool(recall, {
  name: 'recall',
  description: 'Recall a memory from the vector database about userId',
  schema: z.object({
    userId: z.string(),
    text: z.string(),
  }),
})

export const rememberTool = tool(remember, {
  name: 'remember',
  description: 'Store a memory to the vector database about userId',
  schema: z.object({
    userId: z.string(),
    text: z.string(),
    metadata: z.record(z.string(), z.any())
  }),
})