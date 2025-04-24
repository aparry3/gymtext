// import { ChatOpenAI } from '@langchain/openai';
// import { updatePrompt } from '../prompts/templates';
// import { recall } from '../db/vector/memoryTools';
// import { UpdateContext } from '../types/updateContext';


// const llm = new ChatOpenAI({ temperature: 0.3, modelName: 'gpt-4o-mini' });

// export async function processUpdate(userId: string, message: string) {
//   const context = await recall.invoke({userId, text: message});
//   const formattedContext = context.map(record => record.metadata as unknown as UpdateContext);
//   const prompt = updatePrompt(message, formattedContext);
//   const resp = await llm.invoke(prompt);
//   const content = typeof resp.content === 'string' ? resp.content : JSON.stringify(resp.content);
//   return JSON.parse(content);
// } 