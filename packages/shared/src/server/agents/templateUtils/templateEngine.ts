// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Token types produced by the tokenizer */
type TokenType =
  | 'TEXT'
  | 'VAR'
  | 'OPEN_IF'
  | 'ELSE'
  | 'CLOSE_IF'
  | 'OPEN_EACH'
  | 'CLOSE_EACH';

interface Token {
  type: TokenType;
  value: string;
  /** For OPEN_EACH – the optional separator string */
  separator?: string;
}

/** AST node types produced by the parser */
type AstNode = TextNode | VarNode | IfNode | EachNode;

interface TextNode {
  kind: 'text';
  value: string;
}

interface VarNode {
  kind: 'var';
  path: string;
}

interface IfNode {
  kind: 'if';
  path: string;
  body: AstNode[];
  elseBody: AstNode[];
}

interface EachNode {
  kind: 'each';
  path: string;
  separator: string;
  body: AstNode[];
}

// ---------------------------------------------------------------------------
// Dot-path resolver
// ---------------------------------------------------------------------------

/**
 * Walk a dot-separated path against a data object.
 * Numeric segments are treated as array indices.
 * Returns `undefined` for missing paths.
 */
function resolvePath(data: unknown, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = data;
  for (const seg of segments) {
    if (current === undefined || current === null) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Splits a template string into a flat token list.
 *
 * Recognised patterns (in order):
 *   {{#if path}}       -> OPEN_IF
 *   {{else}}           -> ELSE
 *   {{/if}}            -> CLOSE_IF
 *   {{#each path}}     -> OPEN_EACH  (with optional separator="…")
 *   {{/each}}          -> CLOSE_EACH
 *   {{path}}           -> VAR  (path may contain dots / digits)
 */
function tokenize(template: string): Token[] {
  const tokens: Token[] = [];

  // Single regex that matches every {{…}} tag. We process the captures below.
  const TAG_RE =
    /\{\{#if\s+([\w.]+)\}\}|\{\{else\}\}|\{\{\/if\}\}|\{\{#each\s+([\w.]+)(?:\s+separator="([^"]*)")?\}\}|\{\{\/each\}\}|\{\{([\w@.]+)\}\}/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_RE.exec(template)) !== null) {
    // Push any literal text before this tag
    if (match.index > lastIndex) {
      tokens.push({ type: 'TEXT', value: template.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      // {{#if path}}
      tokens.push({ type: 'OPEN_IF', value: match[1] });
    } else if (match[0] === '{{else}}') {
      tokens.push({ type: 'ELSE', value: '' });
    } else if (match[0] === '{{/if}}') {
      tokens.push({ type: 'CLOSE_IF', value: '' });
    } else if (match[2] !== undefined) {
      // {{#each path …}}
      tokens.push({
        type: 'OPEN_EACH',
        value: match[2],
        separator: match[3] !== undefined ? match[3] : '',
      });
    } else if (match[0] === '{{/each}}') {
      tokens.push({ type: 'CLOSE_EACH', value: '' });
    } else if (match[4] !== undefined) {
      // {{path}}
      tokens.push({ type: 'VAR', value: match[4] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < template.length) {
    tokens.push({ type: 'TEXT', value: template.slice(lastIndex) });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Parser (recursive descent)
// ---------------------------------------------------------------------------

/**
 * Parse the flat token array into an AST (array of nodes).
 *
 * `stopAt` indicates which closing token the caller expects so we know when
 * to return control.  Top-level calls pass `undefined`.
 */
function parse(
  tokens: Token[],
  pos: { index: number },
  stopAt?: 'CLOSE_IF' | 'ELSE' | 'CLOSE_EACH'
): AstNode[] {
  const nodes: AstNode[] = [];

  while (pos.index < tokens.length) {
    const token = tokens[pos.index];

    // --- Stop tokens ---
    if (stopAt && token.type === stopAt) {
      return nodes;
    }

    // If we hit ELSE or a closing tag we didn't expect, the template is
    // malformed. Let the caller handle it.
    if (
      token.type === 'ELSE' ||
      token.type === 'CLOSE_IF' ||
      token.type === 'CLOSE_EACH'
    ) {
      if (stopAt) {
        // Let the caller handle this token
        return nodes;
      }
      throw new Error(`Unexpected ${token.type} at token index ${pos.index}`);
    }

    // --- TEXT ---
    if (token.type === 'TEXT') {
      nodes.push({ kind: 'text', value: token.value });
      pos.index++;
      continue;
    }

    // --- VAR ---
    if (token.type === 'VAR') {
      nodes.push({ kind: 'var', path: token.value });
      pos.index++;
      continue;
    }

    // --- #if ---
    if (token.type === 'OPEN_IF') {
      const path = token.value;
      pos.index++; // consume OPEN_IF

      const body = parse(tokens, pos, 'CLOSE_IF');

      let elseBody: AstNode[] = [];

      if (pos.index < tokens.length && tokens[pos.index].type === 'ELSE') {
        pos.index++; // consume ELSE
        elseBody = parse(tokens, pos, 'CLOSE_IF');
      }

      if (pos.index >= tokens.length || tokens[pos.index].type !== 'CLOSE_IF') {
        throw new Error(`Unclosed {{#if ${path}}} block`);
      }
      pos.index++; // consume CLOSE_IF

      nodes.push({ kind: 'if', path, body, elseBody });
      continue;
    }

    // --- #each ---
    if (token.type === 'OPEN_EACH') {
      const path = token.value;
      const separator = token.separator ?? '';
      pos.index++; // consume OPEN_EACH

      const body = parse(tokens, pos, 'CLOSE_EACH');

      if (pos.index >= tokens.length || tokens[pos.index].type !== 'CLOSE_EACH') {
        throw new Error(`Unclosed {{#each ${path}}} block`);
      }
      pos.index++; // consume CLOSE_EACH

      nodes.push({ kind: 'each', path, separator, body });
      continue;
    }

    // Fallback – should not happen
    pos.index++;
  }

  if (stopAt) {
    const name = stopAt === 'CLOSE_IF' ? '{{/if}}' : '{{/each}}';
    throw new Error(`Expected ${name} but reached end of template`);
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

/** Convert a resolved value to its string representation */
function valueToString(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/** Determine truthiness for {{#if}} – matches Handlebars-like semantics */
function isTruthy(value: unknown): boolean {
  if (value === undefined || value === null || value === false || value === 0 || value === '') {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  return true;
}

/**
 * Evaluate an array of AST nodes against a data scope.
 */
function evaluate(nodes: AstNode[], data: Record<string, unknown>): string {
  let result = '';

  for (const node of nodes) {
    switch (node.kind) {
      case 'text':
        result += node.value;
        break;

      case 'var':
        result += valueToString(resolvePath(data, node.path));
        break;

      case 'if': {
        const condValue = resolvePath(data, node.path);
        if (isTruthy(condValue)) {
          result += evaluate(node.body, data);
        } else {
          result += evaluate(node.elseBody, data);
        }
        break;
      }

      case 'each': {
        const arrValue = resolvePath(data, node.path);
        if (!Array.isArray(arrValue) || arrValue.length === 0) break;

        const separator = node.separator.replace(/\\n/g, '\n');
        const parts: string[] = [];

        for (let i = 0; i < arrValue.length; i++) {
          const item = arrValue[i];
          // Build a child scope: inherit parent data, add `this` and `@index`
          const childScope: Record<string, unknown> = {
            ...data,
            this: item,
            '@index': i,
          };

          // If the item is an object, spread its properties so {{prop}} works
          // inside the loop body without needing {{this.prop}}.
          if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            Object.assign(childScope, item as Record<string, unknown>);
          }

          parts.push(evaluate(node.body, childScope));
        }

        result += parts.join(separator);
        break;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve a template string with variable substitutions, conditionals, and loops.
 *
 * Supported syntax:
 *   {{path}}                          – variable (dot-notation, array index)
 *   {{#if path}}...{{/if}}            – conditional
 *   {{#if path}}...{{else}}...{{/if}} – conditional with else
 *   {{#each path}}...{{/each}}        – loop over array
 *   {{#each path separator="X"}}      – loop with custom separator
 *   {{this}}, {{@index}}              – loop item and 0-based index
 *
 * @param template - Template string
 * @param data - Key-value data to substitute
 * @returns Resolved template string
 */
export function resolveTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  const tokens = tokenize(template);
  const pos = { index: 0 };
  const ast = parse(tokens, pos, undefined);
  return evaluate(ast, data);
}
