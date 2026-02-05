/**
 * Blog Metadata Agent Service
 *
 * Handles AI operations for generating blog metadata from content.
 * Takes raw HTML content and outputs structured metadata (title, description, tags, SEO fields).
 */
import { createAgent, PROMPT_IDS, resolveAgentConfig, type AgentServices } from '@/server/agents';
import { BlogMetadataSchema, type BlogMetadataOutput } from '../schemas/blog';

/**
 * Result from the blog metadata generation agent
 */
export interface BlogMetadataResult {
  title: string;
  description: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

/**
 * BlogMetadataAgentServiceInstance interface
 */
export interface BlogMetadataAgentServiceInstance {
  /**
   * Generate metadata for a blog post from its content
   *
   * @param content - HTML content of the blog post
   * @returns Generated metadata (title, description, tags, metaTitle, metaDescription)
   */
  generateMetadata(content: string): Promise<BlogMetadataResult>;
}

/**
 * Strip HTML tags from content for cleaner LLM analysis
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace nbsp
    .replace(/&amp;/g, '&')    // Replace amp
    .replace(/&lt;/g, '<')     // Replace lt
    .replace(/&gt;/g, '>')     // Replace gt
    .replace(/&quot;/g, '"')   // Replace quot
    .replace(/&#39;/g, "'")    // Replace apos
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
}

/**
 * Truncate content if too long (keep under ~8000 chars for token efficiency)
 */
function truncateContent(content: string, maxLength = 8000): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '... [content truncated]';
}

/**
 * Create a BlogMetadataAgentService instance
 *
 * @param agentServices - AgentServices for fetching agent configs
 */
export function createBlogMetadataAgentService(agentServices: AgentServices): BlogMetadataAgentServiceInstance {
  return {
    async generateMetadata(content: string): Promise<BlogMetadataResult> {
      // Fetch config at service layer
      const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
        PROMPT_IDS.BLOG_METADATA,
        agentServices,
        { overrides: { model: 'gpt-5-nano', maxTokens: 1000 } }
      );

      // Strip HTML and truncate for efficient processing
      const cleanContent = truncateContent(stripHtml(content));

      // Create agent with explicit config
      const agent = await createAgent({
        name: PROMPT_IDS.BLOG_METADATA,
        systemPrompt,
        dbUserPrompt,
        schema: BlogMetadataSchema,
      }, modelConfig);

      console.log('[BlogMetadataAgentService] Generating metadata for content:', {
        originalLength: content.length,
        cleanLength: cleanContent.length,
        preview: cleanContent.slice(0, 200) + (cleanContent.length > 200 ? '...' : ''),
      });

      // Invoke with clean content
      const result = await agent.invoke(cleanContent);
      const output = result.response as BlogMetadataOutput;

      console.log('[BlogMetadataAgentService] Generated metadata:', {
        title: output.title,
        tagsCount: output.tags.length,
      });

      return {
        title: output.title,
        description: output.description,
        tags: output.tags,
        metaTitle: output.metaTitle,
        metaDescription: output.metaDescription,
      };
    },
  };
}
