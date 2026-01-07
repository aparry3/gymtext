// Main exports
export { ContextService, createContextService, type ContextServiceDeps } from './contextService';
export { ContextType, type ContextExtras, type ResolvedContextData } from './types';

// Re-export builders for direct use when needed
// Note: SnippetType, ExperienceLevel, and EXPERIENCE_SNIPPETS are exported via builders
export * from './builders';
