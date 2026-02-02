import { z } from 'zod';

/**
 * Agent-Specific Blog Schemas
 *
 * These schemas are for agent output formats only.
 */

// =============================================================================
// Blog Metadata Schema
// =============================================================================

/**
 * Zod schema for Blog Metadata Agent output
 */
export const BlogMetadataSchema = z.object({
  title: z.string().describe('Engaging blog post title'),
  description: z.string().describe('Brief description for listings (1-2 sentences)'),
  tags: z.array(z.string()).describe('Relevant topic tags (lowercase, hyphenated)'),
  metaTitle: z.string().describe('SEO title (max 70 chars)'),
  metaDescription: z.string().describe('SEO description (max 160 chars)'),
});

export type BlogMetadataOutput = z.infer<typeof BlogMetadataSchema>;
