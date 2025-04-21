import { OpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { outlinePrompt, weeklyPrompt, updatePrompt } from '../prompts/templates';
import { recall, remember } from '../db/vector/memoryTools';
import { db } from '../clients/dbClient';

const llm = new OpenAI({ temperature: 0.7, modelName: 'gpt-4o-mini' });

export async function onboardUser(user: {
  id: string; name: string; age: number; gender: string;
  skill_level: string; exercise_frequency: string; goals: string;
}) {
  await db.insertInto('fitness_profiles')
    .values({ user_id: user.id, fitness_goals: user.goals, skill_level: user.skill_level,
      exercise_frequency: user.exercise_frequency, gender: user.gender, age: user.age,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .execute();

  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromTemplate(outlinePrompt(user)),
    llm
  ]);
  const resp = await chain.invoke({});
  const outline = JSON.parse(resp).outline;

  await db.insertInto('program_outlines')
    .values({ user_id: user.id, outline, created_at: new Date().toISOString() })
    .execute();

  await remember(user.id, `Outline: ${resp}`);
  return outline;
}

export async function generateWeeklyPlan(userId: string) {
  const outline = await db.selectFrom('program_outlines')
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .select('outline')
    .executeTakeFirst();

  if (!outline) throw new Error('No program outline found');

  const pastWeeks = await recall(userId, 'past weeks');
  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromTemplate(weeklyPrompt(outline.outline, pastWeeks)),
    llm
  ]);
  const resp = await chain.invoke({});
  return JSON.parse(resp);
}

export async function processUpdate(userId: string, message: string) {
  const context = await recall(userId, message);
  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromTemplate(updatePrompt(message, context)),
    llm
  ]);
  const resp = await chain.invoke({});
  return JSON.parse(resp);
} 