/**
 * Chat Agent Services Index
 *
 * Exports for chat agent functionality.
 * The orchestration layer is in orchestration/chatService.ts.
 */

// Chat agent service (pure agent layer)
export { createChatAgentService } from './chatAgentService';
export type { ChatAgentServiceInstance, ChatAgentResult } from './chatAgentService';

// Chat tools
export { createChatTools } from './tools';
export type { ChatToolContext, ChatToolDeps } from './tools';

// Types
export type * from './types';
