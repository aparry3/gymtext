#!/usr/bin/env tsx
import { z } from 'zod';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { initializeModel } from '@/server/agents/base';

// Schema for generating plan description and reasoning
const BackfillSchema = z.object({
  planDescription: z.string().describe("Long-form explanation of how the plan is structured"),
  reasoning: z.string().describe("Detailed rationale explaining all decisions made")
});

interface FitnessPlan {
  id: string;
  clientId: string;
  programType: string;
  lengthWeeks: number | null;
  mesocycles: any;
  overview: string | null;
  notes: string | null;
  goalStatement: string | null;
}

const generateDescriptionAndReasoning = async (plan: FitnessPlan) => {
  const prompt = `
You are an elite fitness coach reviewing an existing fitness plan. Generate a comprehensive description and reasoning for this plan.

<Existing Plan Data>
Program Type: ${plan.programType}
Duration: ${plan.lengthWeeks} weeks
Mesocycles: ${JSON.stringify(plan.mesocycles, null, 2)}
Overview: ${plan.overview || 'Not provided'}
Goal: ${plan.goalStatement || 'Not provided'}
Notes: ${plan.notes || 'Not provided'}
</Existing Plan Data>

<Task>
Generate two components:
1. planDescription - A detailed explanation (300-500 words) of how this plan is structured, how phases build on each other, and how it addresses the user's goals
2. reasoning - A comprehensive explanation (400-600 words) documenting all the decisions that went into this plan structure
</Task>

<Guidelines for planDescription>
- Explain the overall program structure and duration
- Detail each mesocycle phase and its purpose
- Explain how phases progressively build on each other
- Address the training focus areas in each phase
- Mention any special considerations (deload weeks, equipment, etc.)
- Connect the structure to the stated goals

<Guidelines for reasoning>
- Why this specific program type (${plan.programType})
- Why this duration (${plan.lengthWeeks} weeks)
- Rationale for each mesocycle:
  * Why this phase is included
  * Why this specific duration
  * Why these focus areas
  * Why positioned at this point
- Explain deload placement decisions
- Address how we're accommodating any constraints mentioned in notes
- Explain the progressive overload strategy

Return a JSON object with planDescription and reasoning fields.
`;

  const model = initializeModel(BackfillSchema);
  const result = await model.invoke(prompt);
  return result;
};

async function backfillFitnessPlans() {
  console.log('Starting fitness plan backfill...\n');

  try {
    // Fetch all fitness plans that need backfilling
    const plans = await postgresDb
      .selectFrom('fitnessPlans')
      .selectAll()
      .where((eb) => eb.or([
        eb('description', 'is', null),
        eb('message', 'is', null)
      ]))
      .execute();

    console.log(`Found ${plans.length} fitness plans needing backfill\n`);

    if (plans.length === 0) {
      console.log('No plans to backfill. Exiting.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const plan of plans) {
      try {
        console.log(`Processing plan ${plan.id}...`);

        const result = await generateDescriptionAndReasoning({
          id: plan.id,
          clientId: plan.clientId,
          programType: plan.programType,
          lengthWeeks: plan.lengthWeeks,
          mesocycles: plan.mesocycles,
          overview: '', // Field removed in schema simplification
          notes: plan.notes,
          goalStatement: plan.goalStatement,
        });

        // Update the database with new schema fields
        await postgresDb
          .updateTable('fitnessPlans')
          .set({
            description: result.planDescription,
            message: result.reasoning, // Map reasoning to message field
            updatedAt: new Date(),
          })
          .where('id', '=', plan.id)
          .execute();

        console.log(`✓ Successfully backfilled plan ${plan.id}\n`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error processing plan ${plan.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Backfill Summary ===');
    console.log(`Total plans processed: ${plans.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error('Fatal error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillFitnessPlans()
  .then(() => {
    console.log('\nBackfill complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });
