import { describe, it, expect } from 'vitest';
import { resolveTemplate } from './templateEngine';

// ---------------------------------------------------------------------------
// 1. Backward compatibility – simple {{var}} substitution
// ---------------------------------------------------------------------------
describe('backward compatibility – simple variable substitution', () => {
  it('replaces a string variable', () => {
    expect(resolveTemplate('Hello {{name}}!', { name: 'Alice' })).toBe('Hello Alice!');
  });

  it('replaces a number variable', () => {
    expect(resolveTemplate('Age: {{age}}', { age: 30 })).toBe('Age: 30');
  });

  it('replaces a boolean variable (true)', () => {
    expect(resolveTemplate('Active: {{active}}', { active: true })).toBe('Active: true');
  });

  it('replaces a boolean variable (false)', () => {
    expect(resolveTemplate('Active: {{active}}', { active: false })).toBe('Active: false');
  });

  it('replaces null with empty string', () => {
    expect(resolveTemplate('Value: {{val}}', { val: null })).toBe('Value: ');
  });

  it('replaces undefined (missing key) with empty string', () => {
    expect(resolveTemplate('Value: {{missing}}', {})).toBe('Value: ');
  });

  it('JSON-stringifies an object value', () => {
    expect(resolveTemplate('Data: {{obj}}', { obj: { a: 1 } })).toBe('Data: {"a":1}');
  });

  it('JSON-stringifies an array value', () => {
    expect(resolveTemplate('List: {{arr}}', { arr: [1, 2, 3] })).toBe('List: [1,2,3]');
  });

  it('handles multiple variables in one template', () => {
    expect(resolveTemplate('{{first}} {{last}}', { first: 'Jane', last: 'Doe' })).toBe(
      'Jane Doe'
    );
  });

  it('returns plain text unchanged when no variables', () => {
    expect(resolveTemplate('no vars here', {})).toBe('no vars here');
  });

  it('returns empty string for empty template', () => {
    expect(resolveTemplate('', {})).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 2. Dot notation
// ---------------------------------------------------------------------------
describe('dot notation', () => {
  it('resolves a simple nested property', () => {
    expect(resolveTemplate('{{obj.prop}}', { obj: { prop: 'value' } })).toBe('value');
  });

  it('resolves deeply nested properties', () => {
    expect(
      resolveTemplate('{{a.b.c}}', { a: { b: { c: 'deep' } } })
    ).toBe('deep');
  });

  it('returns empty string for missing intermediate path', () => {
    expect(resolveTemplate('{{a.b.c}}', { a: {} })).toBe('');
  });

  it('returns empty string when root is missing', () => {
    expect(resolveTemplate('{{x.y}}', {})).toBe('');
  });

  it('returns empty string when intermediate is null', () => {
    expect(resolveTemplate('{{a.b}}', { a: null })).toBe('');
  });

  it('returns empty string when intermediate is a primitive', () => {
    expect(resolveTemplate('{{a.b}}', { a: 42 })).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 3. Array indexing
// ---------------------------------------------------------------------------
describe('array indexing', () => {
  it('accesses element at index 0', () => {
    expect(resolveTemplate('{{arr.0}}', { arr: ['first', 'second'] })).toBe('first');
  });

  it('accesses element at index 1', () => {
    expect(resolveTemplate('{{arr.1}}', { arr: ['first', 'second'] })).toBe('second');
  });

  it('returns empty string for out-of-bounds index', () => {
    expect(resolveTemplate('{{arr.5}}', { arr: ['only'] })).toBe('');
  });

  it('accesses nested property of array element', () => {
    expect(
      resolveTemplate('{{items.0.name}}', { items: [{ name: 'Item A' }] })
    ).toBe('Item A');
  });

  it('accesses nested array index via dot notation', () => {
    expect(
      resolveTemplate('{{days.0}}', { days: ['Monday', 'Tuesday', 'Wednesday'] })
    ).toBe('Monday');
  });
});

// ---------------------------------------------------------------------------
// 4. Conditionals (#if / else / /if)
// ---------------------------------------------------------------------------
describe('conditionals', () => {
  it('renders body when condition is truthy string', () => {
    expect(resolveTemplate('{{#if name}}Hi {{name}}{{/if}}', { name: 'Bob' })).toBe('Hi Bob');
  });

  it('renders nothing when condition is falsy (undefined)', () => {
    expect(resolveTemplate('{{#if name}}Hi {{name}}{{/if}}', {})).toBe('');
  });

  it('renders nothing when condition is falsy (null)', () => {
    expect(resolveTemplate('{{#if val}}yes{{/if}}', { val: null })).toBe('');
  });

  it('renders nothing when condition is falsy (false)', () => {
    expect(resolveTemplate('{{#if val}}yes{{/if}}', { val: false })).toBe('');
  });

  it('renders nothing when condition is falsy (0)', () => {
    expect(resolveTemplate('{{#if val}}yes{{/if}}', { val: 0 })).toBe('');
  });

  it('renders nothing when condition is falsy (empty string)', () => {
    expect(resolveTemplate('{{#if val}}yes{{/if}}', { val: '' })).toBe('');
  });

  it('renders nothing when condition is falsy (empty array)', () => {
    expect(resolveTemplate('{{#if val}}yes{{/if}}', { val: [] })).toBe('');
  });

  it('renders body when condition is truthy (non-empty array)', () => {
    expect(resolveTemplate('{{#if items}}has items{{/if}}', { items: [1] })).toBe('has items');
  });

  it('renders body when condition is truthy (number > 0)', () => {
    expect(resolveTemplate('{{#if count}}count={{count}}{{/if}}', { count: 5 })).toBe('count=5');
  });

  it('renders body when condition is truthy (object)', () => {
    expect(resolveTemplate('{{#if obj}}yes{{/if}}', { obj: {} })).toBe('yes');
  });

  it('renders else branch when condition is falsy', () => {
    expect(
      resolveTemplate('{{#if val}}yes{{else}}no{{/if}}', { val: false })
    ).toBe('no');
  });

  it('renders body (not else) when condition is truthy', () => {
    expect(
      resolveTemplate('{{#if val}}yes{{else}}no{{/if}}', { val: true })
    ).toBe('yes');
  });

  it('handles nested if inside if', () => {
    const template = '{{#if a}}A{{#if b}}B{{/if}}{{/if}}';
    expect(resolveTemplate(template, { a: true, b: true })).toBe('AB');
    expect(resolveTemplate(template, { a: true, b: false })).toBe('A');
    expect(resolveTemplate(template, { a: false, b: true })).toBe('');
  });

  it('handles dot-notation paths in conditions', () => {
    expect(
      resolveTemplate('{{#if user.name}}{{user.name}}{{/if}}', { user: { name: 'Eve' } })
    ).toBe('Eve');
  });

  it('handles dot-notation falsy condition', () => {
    expect(
      resolveTemplate('{{#if user.name}}{{user.name}}{{/if}}', { user: {} })
    ).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 5. Loops (#each / /each)
// ---------------------------------------------------------------------------
describe('loops', () => {
  it('iterates over array with {{this}}', () => {
    expect(
      resolveTemplate('{{#each items}}{{this}}{{/each}}', { items: ['a', 'b', 'c'] })
    ).toBe('abc');
  });

  it('provides {{@index}} (0-based)', () => {
    expect(
      resolveTemplate('{{#each items}}{{@index}}:{{this}} {{/each}}', {
        items: ['x', 'y'],
      })
    ).toBe('0:x 1:y ');
  });

  it('uses custom separator', () => {
    expect(
      resolveTemplate('{{#each items separator=", "}}{{this}}{{/each}}', {
        items: ['a', 'b', 'c'],
      })
    ).toBe('a, b, c');
  });

  it('uses newline separator via \\n', () => {
    expect(
      resolveTemplate('{{#each items separator="\\n"}}{{this}}{{/each}}', {
        items: ['line1', 'line2'],
      })
    ).toBe('line1\nline2');
  });

  it('produces nothing for empty array', () => {
    expect(resolveTemplate('{{#each items}}{{this}}{{/each}}', { items: [] })).toBe('');
  });

  it('produces nothing for undefined path', () => {
    expect(resolveTemplate('{{#each missing}}{{this}}{{/each}}', {})).toBe('');
  });

  it('produces nothing for non-array value', () => {
    expect(resolveTemplate('{{#each val}}{{this}}{{/each}}', { val: 'string' })).toBe('');
  });

  it('spreads object item properties into child scope', () => {
    expect(
      resolveTemplate('{{#each people}}{{name}} {{/each}}', {
        people: [{ name: 'Alice' }, { name: 'Bob' }],
      })
    ).toBe('Alice Bob ');
  });

  it('allows {{this}} to access the full item when item is an object', () => {
    expect(
      resolveTemplate('{{#each items}}{{this}}{{/each}}', {
        items: [{ a: 1 }],
      })
    ).toBe('{"a":1}');
  });
});

// ---------------------------------------------------------------------------
// 6. Nesting – #if inside #each, #each inside #if
// ---------------------------------------------------------------------------
describe('nesting', () => {
  it('#if inside #each', () => {
    const template = '{{#each users}}{{#if active}}{{name}} {{/if}}{{/each}}';
    const data = {
      users: [
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
        { name: 'Carol', active: true },
      ],
    };
    expect(resolveTemplate(template, data)).toBe('Alice Carol ');
  });

  it('#each inside #if', () => {
    const template = '{{#if showItems}}Items: {{#each items}}{{this}}{{/each}}{{/if}}';
    expect(
      resolveTemplate(template, { showItems: true, items: ['a', 'b'] })
    ).toBe('Items: ab');
    expect(
      resolveTemplate(template, { showItems: false, items: ['a', 'b'] })
    ).toBe('');
  });

  it('#if with else inside #each', () => {
    const template =
      '{{#each items}}{{#if enabled}}ON{{else}}OFF{{/if}} {{/each}}';
    const data = {
      items: [{ enabled: true }, { enabled: false }, { enabled: true }],
    };
    expect(resolveTemplate(template, data)).toBe('ON OFF ON ');
  });

  it('deeply nested: #each > #if > #each', () => {
    const template =
      '{{#each groups}}{{#if items}}{{#each items}}{{this}}{{/each}}{{/if}}|{{/each}}';
    const data = {
      groups: [
        { items: ['a', 'b'] },
        { items: [] },
        { items: ['c'] },
      ],
    };
    expect(resolveTemplate(template, data)).toBe('ab||c|');
  });
});

// ---------------------------------------------------------------------------
// 7. Real-world templates
// ---------------------------------------------------------------------------
describe('real-world templates', () => {
  it('user template – all fields present', () => {
    const template =
      '<User>\n{{#if user.name}}<Name>{{user.name}}</Name>\n{{/if}}{{#if user.gender}}<Gender>{{user.gender}}</Gender>\n{{/if}}{{#if user.age}}<Age>{{user.age}}</Age>\n{{/if}}</User>';

    const result = resolveTemplate(template, {
      user: { name: 'Jane', gender: 'female', age: 28 },
    });

    expect(result).toBe(
      '<User>\n<Name>Jane</Name>\n<Gender>female</Gender>\n<Age>28</Age>\n</User>'
    );
  });

  it('user template – some fields missing', () => {
    const template =
      '<User>\n{{#if user.name}}<Name>{{user.name}}</Name>\n{{/if}}{{#if user.gender}}<Gender>{{user.gender}}</Gender>\n{{/if}}{{#if user.age}}<Age>{{user.age}}</Age>\n{{/if}}</User>';

    const result = resolveTemplate(template, { user: { name: 'Jane' } });

    expect(result).toBe('<User>\n<Name>Jane</Name>\n</User>');
  });

  it('user template – no fields present', () => {
    const template =
      '<User>\n{{#if user.name}}<Name>{{user.name}}</Name>\n{{/if}}{{#if user.gender}}<Gender>{{user.gender}}</Gender>\n{{/if}}{{#if user.age}}<Age>{{user.age}}</Age>\n{{/if}}</User>';

    const result = resolveTemplate(template, { user: {} });

    expect(result).toBe('<User>\n</User>');
  });

  it('exercises template', () => {
    const template =
      '<AvailableExercises>\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}\n</AvailableExercises>';

    const result = resolveTemplate(template, {
      exercises: [{ name: 'Squat' }, { name: 'Bench Press' }, { name: 'Deadlift' }],
    });

    expect(result).toBe(
      '<AvailableExercises>\n- Squat\n- Bench Press\n- Deadlift\n</AvailableExercises>'
    );
  });

  it('exercises template – empty list', () => {
    const template =
      '<AvailableExercises>\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}\n</AvailableExercises>';

    const result = resolveTemplate(template, { exercises: [] });

    expect(result).toBe('<AvailableExercises>\n\n</AvailableExercises>');
  });

  it('microcycle template', () => {
    const template =
      '<CurrentMicrocycle>\nWeek Overview: {{#if microcycle.description}}{{microcycle.description}}{{else}}N/A{{/if}}\nIs Deload: {{microcycle.isDeload}}\nAbsolute Week: {{microcycle.absoluteWeek}}\nDays:\nMonday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\n</CurrentMicrocycle>';

    const result = resolveTemplate(template, {
      microcycle: {
        description: 'Heavy volume week',
        isDeload: false,
        absoluteWeek: 3,
        days: ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Rest'],
      },
    });

    expect(result).toBe(
      '<CurrentMicrocycle>\nWeek Overview: Heavy volume week\nIs Deload: false\nAbsolute Week: 3\nDays:\nMonday: Push\nTuesday: Pull\n</CurrentMicrocycle>'
    );
  });

  it('microcycle template – missing description shows N/A', () => {
    const template =
      '<CurrentMicrocycle>\nWeek Overview: {{#if microcycle.description}}{{microcycle.description}}{{else}}N/A{{/if}}\nIs Deload: {{microcycle.isDeload}}\nAbsolute Week: {{microcycle.absoluteWeek}}\nDays:\nMonday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\n</CurrentMicrocycle>';

    const result = resolveTemplate(template, {
      microcycle: {
        isDeload: true,
        absoluteWeek: 4,
        days: ['Rest', 'Light Push'],
      },
    });

    expect(result).toBe(
      '<CurrentMicrocycle>\nWeek Overview: N/A\nIs Deload: true\nAbsolute Week: 4\nDays:\nMonday: Rest\nTuesday: Light Push\n</CurrentMicrocycle>'
    );
  });
});

// ---------------------------------------------------------------------------
// 8. Error cases
// ---------------------------------------------------------------------------
describe('error cases', () => {
  it('throws on unclosed {{#if}}', () => {
    expect(() => resolveTemplate('{{#if val}}hello', { val: true })).toThrow(
      /Expected \{\{\/if\}\} but reached end of template/
    );
  });

  it('throws on unclosed {{#each}}', () => {
    expect(() => resolveTemplate('{{#each items}}item', { items: [1] })).toThrow(
      /Expected \{\{\/each\}\} but reached end of template/
    );
  });

  it('throws on unexpected {{/if}} without matching open', () => {
    expect(() => resolveTemplate('hello{{/if}}', {})).toThrow(/Unexpected CLOSE_IF/);
  });

  it('throws on unexpected {{else}} without matching #if', () => {
    expect(() => resolveTemplate('hello{{else}}world', {})).toThrow(/Unexpected ELSE/);
  });

  it('throws on unexpected {{/each}} without matching open', () => {
    expect(() => resolveTemplate('hello{{/each}}', {})).toThrow(/Unexpected CLOSE_EACH/);
  });

  it('throws on unclosed #if when #each is closed properly', () => {
    expect(() =>
      resolveTemplate('{{#each items}}{{#if val}}hi{{/each}}', { items: [1], val: true })
    ).toThrow();
  });
});
