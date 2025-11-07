import { AgentConfig } from "@/server/agents/base";
import type { z } from 'zod';

export interface StructuredPlanConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  schema: TSchema;
  agentConfig?: AgentConfig;
  operationName: string;
}
