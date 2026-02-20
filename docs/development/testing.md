# Testing

GymText uses multiple testing approaches to ensure code quality.

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing framework |
| **Testing Library** | React component testing |
| **Manual Testing** | SMS/chat flow testing |

## Running Tests

### All Tests

```bash
pnpm test
```

### With UI

```bash
pnpm test:ui
```

### Specific File

```bash
pnpm test path/to/test/file.ts
```

### Watch Mode

```bash
pnpm test --watch
```

## Testing Approaches

### Unit Tests

Test individual functions and components:

```typescript
// example.test.ts
import { describe, it, expect } from 'vitest';

describe('example', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### Integration Tests

Test multiple components together:

```typescript
// services/chatService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('ChatService', () => {
  let chatService: ChatService;
  
  beforeEach(() => {
    chatService = new ChatService(/* mocks */);
  });
  
  it('should process message', async () => {
    const result = await chatService.processMessage(userId, 'Hello');
    expect(result).toBeDefined();
  });
});
```

### Database Testing

Use test database or mock repositories:

```typescript
// Use mock repository
const mockRepo = {
  findById: vi.fn().mockResolvedValue(mockUser),
};

// Or use test database
const testDb = createTestDatabase();
```

## SMS Testing

### Local SMS Testing

Test SMS functionality without real messages:

```bash
pnpm sms:test
```

This allows you to:
- Simulate incoming messages
- Test chat flow
- Debug message processing

### Manual Testing

1. Set up Twilio credentials in `.env.local`
2. Use a Twilio trial account or test numbers
3. Send real messages to test number

### Webhook Testing

Use Twilio's test credentials or ngrok:

```bash
# Expose local server
ngrok http 3000

# Configure Twilio webhook to ngrok URL
```

## Agent Testing

### Testing Agent Definitions

```bash
# List all agents
pnpm agent:list

# Get specific agent
pnpm agent:get chat:generate
```

### Testing Agent Execution

Test agents directly:

```typescript
import { agentRunner } from '@gymtext/shared/server';

const result = await agentRunner.invoke('chat:generate', {
  input: 'What workout should I do?',
  params: { user: mockUser },
});
```

## Best Practices

### Test Organization

```
tests/
├── unit/
│   ├── utils/
│   └── services/
├── integration/
│   ├── api/
│   └── services/
└── fixtures/
    ├── users.json
    └── workouts.json
```

### Naming Conventions

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Fixtures: `*.json` or `*.ts`

### Test Coverage

Aim for:
- **Unit tests**: 80%+ coverage on business logic
- **Integration tests**: Key API endpoints and flows
- **Manual testing**: SMS flows, admin operations

## CI/CD

Tests run automatically on PRs via GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test
```

## Related Documentation

- [Getting Started](./getting-started.md) - Quick start
- [Local Setup](./local-setup.md) - Environment setup
- [Common Workflows](./common-workflows.md) - Development workflows
