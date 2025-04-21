import { OpenAIEmbeddings } from '@langchain/openai';
import { recall as vectorRecall, remember as vectorRemember } from '../../clients/vectorClient';

const embedder = new OpenAIEmbeddings();

export async function recall(userId: string, text: string) {
  const vec = await embedder.embedQuery(text);
  return vectorRecall(vec);
}

export async function remember(userId: string, text: string, metadata = {}) {
  const vec = await embedder.embedQuery(text);
  await vectorRemember(`${userId}:${Date.now()}`, vec, { userId, text, ...metadata });
} 