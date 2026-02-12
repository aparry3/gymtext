// dateContext builder is no longer needed - the provider handles template resolution directly.
// This file is kept for backwards compatibility but the builder logic
// has been moved into the dateContext context provider definition.
// The provider uses formatForAI directly and passes formattedDate + timezone to the template.

// Re-export formatForAI for any remaining callers
export { formatForAI } from '@/shared/utils/date';
