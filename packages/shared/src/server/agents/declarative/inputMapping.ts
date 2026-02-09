import type { InputMapping, MappingContext } from './types';

/**
 * Resolve a dot-path against the mapping context
 *
 * Supports paths like:
 * - "result.overview" -> ctx.result.overview
 * - "user.name" -> ctx.user.name
 * - "extras.absoluteWeek" -> ctx.extras.absoluteWeek
 * - "parentInput" -> ctx.parentInput (no sub-path)
 * - "now" -> ctx.now (no sub-path)
 */
function resolveDotPath(ctx: MappingContext, path: string): unknown {
  const [root, ...rest] = path.split('.');
  let value: unknown;

  switch (root) {
    case 'result':
      value = ctx.result;
      break;
    case 'user':
      value = ctx.user;
      break;
    case 'extras':
      value = ctx.extras;
      break;
    case 'parentInput':
      return ctx.parentInput;
    case 'now':
      return ctx.now;
    default:
      return undefined;
  }

  for (const segment of rest) {
    if (value == null) return undefined;
    value = (value as Record<string, unknown>)[segment];
  }

  return value;
}

/**
 * Resolve an input mapping against a mapping context
 *
 * Iterates mapping entries:
 * - $-prefixed string values are resolved via dot-path extraction
 * - Nested objects are resolved recursively
 * - Literal strings (no $ prefix) are passed as-is
 *
 * @param mapping - Declarative input mapping from DB config
 * @param ctx - Mapping context with result, user, extras, parentInput, now
 * @returns Resolved key-value pairs for the sub-agent
 */
export function resolveInputMapping(
  mapping: InputMapping,
  ctx: MappingContext
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(mapping)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      // $-reference: resolve from context
      const path = value.slice(1); // remove $
      resolved[key] = resolveDotPath(ctx, path);
    } else if (typeof value === 'object' && value !== null) {
      // Nested mapping
      resolved[key] = resolveInputMapping(value as InputMapping, ctx);
    } else {
      // Literal value
      resolved[key] = value;
    }
  }

  return resolved;
}
