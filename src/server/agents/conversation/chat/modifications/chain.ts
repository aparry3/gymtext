import { z } from 'zod';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { initializeModel } from '@/server/agents/base';
import type { ChatSubagentInput } from '../baseAgent';
import { MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage } from './prompts';
import { modificationTools } from './tools';
import { generateModifiedWorkoutMessage } from '@/server/agents/messaging/workoutMessage/chain';
import type { SubstituteExerciseResult, ModifyWorkoutResult } from '@/server/services/workoutInstanceService';
import type { ModifyWeekResult } from '@/server/services/microcycleService';
import { WorkoutMessageContext } from '@/server/agents/messaging/workoutMessage/types';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

// Union type for all modification results
type ModificationResult = SubstituteExerciseResult | ModifyWorkoutResult | ModifyWeekResult;

// Output from tool execution step
interface ToolExecutionOutput {
  toolResult: ModificationResult | null;
  toolName: string;
  input: ChatSubagentInput;
}

/**
 * Schema for modifications agent output
 */
export const ModificationsResponseSchema = z.object({
    response: z.string().describe('acknowledgment of the request and a response to the request'),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;

/**
 * Step 1: Tool execution runnable - executes modification tools
 */
const toolExecutionRunnable = (): RunnableLambda<ChatSubagentInput, ToolExecutionOutput> => {
  return RunnableLambda.from(async (input: ChatSubagentInput) => {
    const agentName = 'MODIFICATIONS';

    console.log(`[${agentName}] Processing message:`, {
      message: input.message.substring(0, 100) + (input.message.length > 100 ? '...' : ''),
      primaryIntent: input.triage.intents[0]?.intent,
      confidence: input.triage.intents[0]?.confidence,
    });

    // Initialize model with tools
    const model = initializeModel(undefined, { model: 'gpt-5-nano' });
    const modelWithTools = model.bindTools(modificationTools);

    const systemMessage = {
      role: 'system',
      content: MODIFICATIONS_SYSTEM_PROMPT,
    };

    const userMessage = {
      role: 'user',
      content: buildModificationsUserMessage(input),
    };

    const messages: any[] = [ // eslint-disable-line @typescript-eslint/no-explicit-any
      systemMessage,
      ...ConversationFlowBuilder.toMessageArray(input.previousMessages || []),
      userMessage,
    ];

    // Call model with tools
    const response = await modelWithTools.invoke(messages);

    // Track tool results for message generation
    let toolResult: ModificationResult | null = null;
    let toolName = '';

    // Check if there are tool calls
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`[${agentName}] Tool calls:`, response.tool_calls.map((tc: any) => tc.name)); // eslint-disable-line @typescript-eslint/no-explicit-any

      // Execute each tool call (typically only one for modifications)
      for (const toolCall of response.tool_calls) {
        const tool = modificationTools.find(t => t.name === toolCall.name);

        if (!tool) {
          console.error(`[${agentName}] Tool not found: ${toolCall.name}`);
          continue;
        }

        try {
          console.log(`[${agentName}] Executing tool: ${toolCall.name}`, toolCall.args);
          // Use type assertion to handle union type from modificationTools array
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (tool as any).invoke(toolCall.args) as ModificationResult;
          console.log(`[${agentName}] Tool result:`, result);

          // Store the result for message generation
          toolResult = result;
          toolName = toolCall.name;
        } catch (error) {
          console.error(`[${agentName}] Error executing tool ${toolCall.name}:`, error);
          // Create an error result
          toolResult = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          toolName = toolCall.name;
        }
      }
    }

    return { toolResult, toolName, input };
  });
};

/**
 * Step 2: Message generation runnable - converts tool result to user message
 */
const messageGenerationRunnable = (): RunnableLambda<ToolExecutionOutput, ModificationsResponse> => {
  return RunnableLambda.from(async ({ toolResult, input }: ToolExecutionOutput) => {
    const agentName = 'MODIFICATIONS';

    // If no tool result, return fallback message
    if (!toolResult) {
      return {
        response: 'I tried to make that change but encountered an issue. Please try again or let me know if you need help!',
      };
    }

    // If successful and we have a workout, generate a message with it
    if (toolResult.success && toolResult.workout) {
      const messageContext: WorkoutMessageContext = {
        modificationsApplied: toolResult.modificationsApplied,
        reason: input.message,
      };

      const responseText = await generateModifiedWorkoutMessage(
        input.user,
        toolResult.workout,
        messageContext,
        input.previousMessages
      );

      console.log(`[${agentName}] Generated message from tool result:`, {
        response: responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''),
      });

      return {
        response: responseText,
      };
    }

    // If failed or no workout, provide error message
    const errorMessage = toolResult.error
      ? `I tried to make that change but ran into an issue: ${toolResult.error}`
      : 'I tried to make that change but encountered an issue. Please try again or let me know if you need help!';

    return {
      response: errorMessage,
    };
  });
};

/**
 * Modifications agent runnable - handles workout change and modification requests using tools
 *
 * This is a sequence that:
 * 1. Executes modification tools based on user request
 * 2. Generates a conversational message about the modification using workoutMessageRunnable
 */
export const modificationsAgentRunnable = (): RunnableSequence<ChatSubagentInput, ModificationsResponse> => {
  return RunnableSequence.from([
    toolExecutionRunnable(),
    messageGenerationRunnable(),
  ]);
};
