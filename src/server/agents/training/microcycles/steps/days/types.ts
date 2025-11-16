import { AgentConfig } from "@/server/agents/base";

export interface DaysExtractionConfig {
  agentConfig?: AgentConfig;
  operationName: string;
}

export interface DayOverviews {
  mondayOverview: string;
  tuesdayOverview: string;
  wednesdayOverview: string;
  thursdayOverview: string;
  fridayOverview: string;
  saturdayOverview: string;
  sundayOverview: string;
}
