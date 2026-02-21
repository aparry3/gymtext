# Troubleshooting

Common issues and solutions for GymText development.

## Build Issues

### "TypeScript errors after migration"

**Solution:**
```bash
pnpm db:codegen
```

### "Build fails with missing env var"

**Solution:**
Check `turbo.json` includes the variable in the task's `env` array.

### "Next.js build fails"

**Solution:**
1. Ensure `source .env.local` is run before build
2. Verify all required env vars are set

## Database Issues

### "Database does not exist"

**Solution:**
```bash
createdb gymtext
pnpm migrate:up
```

### "Connection refused"

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Start if needed: `brew services start postgresql`
3. Verify `DATABASE_URL` is correct

### "Migration failed"

**Solution:**
```bash
# Check migration status
# Review error message
# Fix migration if needed
pnpm migrate:down  # If partial success
pnpm migrate:up    # Retry
```

### "Column does not exist"

**Solution:**
1. Run pending migrations: `pnpm migrate:up`
2. Or create new migration to add column

## Runtime Issues

### "Session error"

**Solution:**
Ensure `SESSION_ENCRYPTION_KEY` is set (32+ characters).

### "Twilio webhook fails"

**Solution:**
1. Verify Twilio credentials
2. Check webhook URL is accessible
3. Use ngrok for local testing

### "Agent not found"

**Solution:**
```bash
# List agents
pnpm agent:list

# Check agent exists
pnpm agent:get agent-id
```

## Development Server Issues

### "Port already in use"

**Solution:**
```bash
# Find process
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### "Hot reload not working"

**Solution:**
```bash
# Clear .next cache
rm -rf apps/*/.next
pnpm dev
```

## Testing Issues

### "SMS test fails"

**Solution:**
1. Verify Twilio credentials in `.env.local`
2. Check Twilio number is valid
3. Use test credentials for testing

### "Tests fail randomly"

**Solution:**
Check for:
- Race conditions in async code
- Missing mock cleanup
- Database state not reset between tests

## Agent Issues

### "Agent returns wrong response"

**Solution:**
1. Check agent definition: `pnpm agent:get agent-id`
2. Review prompt in database
3. Test with simpler input

### "Tool execution fails"

**Solution:**
Check tool is registered in Tool Registry:
```typescript
// packages/shared/src/server/agents/tools/toolRegistry.ts
```

### "Context missing"

**Solution:**
Check context provider is registered:
```typescript
// packages/shared/src/server/agents/context/contextRegistry.ts
```

## Getting Help

### Debug Logging

Enable debug logging in your environment:

```bash
DEBUG=gymtext:* pnpm dev
```

### Check Logs

- **API routes**: Check terminal output
- **Database**: Check PostgreSQL logs
- **Twilio**: Check Twilio console

### Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Type errors | `pnpm db:codegen` |
| Build fails | `source .env.local && pnpm build` |
| DB issues | Check `DATABASE_URL`, restart PostgreSQL |
| Agent issues | `pnpm agent:list` to verify |

## Related Documentation

- [Getting Started](../development/getting-started.md) - Quick start
- [Local Setup](../development/local-setup.md) - Setup guide
- [Environment Variables](./environment-variables.md) - Env var reference
