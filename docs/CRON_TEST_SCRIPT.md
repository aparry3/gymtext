# Cron Test Script Guide

This guide explains how to use the `test:cron` script to test the daily message functionality in GymText.

## Overview

The cron test script (`scripts/test-cron-daily-messages.ts`) allows you to test the daily message sending functionality without waiting for the actual cron schedule. It simulates different times and dates to verify that users receive their workout messages correctly.

## Basic Usage

### Quick Test (Dry Run)

To test without actually sending SMS messages:

```bash
pnpm test:cron --hour 12
```

This runs a dry run for UTC hour 12 (8 AM EDT / 9 AM EST).

### Send Real SMS Messages

To actually send SMS messages to users:

```bash
pnpm test:cron --hour 12 --no-dry-run
```

**⚠️ WARNING**: This will send real SMS messages via Twilio! Use with caution.

## Understanding Timezones

The script works with UTC hours. You need to convert your users' local preferred hours to UTC:

| User Timezone | Preferred Hour | UTC Hour (EDT) | UTC Hour (EST) |
|--------------|---------------|----------------|----------------|
| America/New_York | 8 AM | 12 | 13 |
| America/Chicago | 8 AM | 13 | 14 |
| America/Denver | 8 AM | 14 | 15 |
| America/Los_Angeles | 8 AM | 15 | 16 |

## Command Options

### Basic Options

- `--hour <hour>` or `-H <hour>`: Test specific UTC hour (0-23)
- `--date <date>` or `-d <date>`: Test specific date (ISO format: YYYY-MM-DD)
- `--users <users>` or `-u <users>`: Test specific users (comma-separated IDs)
- `--dry-run` (default): Run without sending actual messages
- `--no-dry-run`: Send actual messages (use with caution!)
- `--verbose` or `-v`: Show detailed output including errors

### Test Suites

- `--suite full` or `-s full`: Run comprehensive test suite
- `--suite hours` or `-s hours`: Test all 24 hours
- `--suite timezones` or `-s timezones`: Test major timezone coverage

## Examples

### Test Current Hour

```bash
# Dry run for current UTC hour
pnpm test:cron
```

### Test Specific Hour

```bash
# Test 8 AM EDT (12 UTC) with dry run
pnpm test:cron --hour 12

# Test 8 AM EDT and actually send messages
pnpm test:cron --hour 12 --no-dry-run
```

### Test Specific Date and Hour

```bash
# Test August 8, 2025 at 8 AM EDT (dry run)
pnpm test:cron --date "2025-08-08" --hour 12

# Same but send real messages
pnpm test:cron --date "2025-08-08" --hour 12 --no-dry-run
```

### Test Specific Users

```bash
# Test only specific users (dry run)
pnpm test:cron --hour 12 --users "user-id-1,user-id-2"

# Send real messages to specific users
pnpm test:cron --hour 12 --users "user-id-1" --no-dry-run
```

### Verbose Output

```bash
# See detailed error messages
pnpm test:cron --hour 12 --verbose
```

### Run Test Suites

```bash
# Test all hours of the day (always dry run)
pnpm test:cron --suite hours

# Test major timezones
pnpm test:cron --suite timezones

# Run full test suite
pnpm test:cron --suite full
```

## Troubleshooting

### "No users found"

This means no users have their preferred send hour matching the UTC hour you're testing. Check:

1. **User timezone**: What timezone is the user in?
2. **Preferred hour**: What local hour does the user want messages?
3. **UTC conversion**: What UTC hour corresponds to that local hour?

Example debugging:
```bash
# For a user in America/New_York wanting messages at 8 AM:
# - During EDT (summer): 8 AM = 12 UTC
# - During EST (winter): 8 AM = 13 UTC
pnpm test:cron --hour 12  # For EDT
pnpm test:cron --hour 13  # For EST
```

### "No workout scheduled for today"

This means the user doesn't have a workout for the date being tested. Either:
- Create a workout for that date
- Test with a date that has workouts

```bash
# Test with a specific date that has workouts
pnpm test:cron --date "2025-08-08" --hour 12
```

### Environment Variables

Make sure your `.env.local` file contains:
- `DATABASE_URL`: PostgreSQL connection string
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_NUMBER`: Your Twilio phone number
- `OPENAI_API_KEY` or `GOOGLE_API_KEY`: For AI message generation

## Safety Tips

1. **Always test with dry run first**: Use `--dry-run` (default) to verify everything works before sending real messages.

2. **Test with specific users**: Use `--users` to limit testing to yourself or test accounts.

3. **Check the warning**: When using `--no-dry-run`, the script shows a 3-second warning before sending messages.

4. **Monitor costs**: Sending SMS messages costs money through Twilio.

## Understanding Output

The script displays results in a table format:

```
┌───────────┬──────────────────────┐
│ Metric    │ Value                │
├───────────┼──────────────────────┤
│ Status    │ ✓ Success            │
│ Processed │ 1                    │  <- Users who received messages
│ Failed    │ 0                    │  <- Users with errors
│ Duration  │ 1691ms               │  <- Processing time
│ Test Hour │ 12                   │  <- UTC hour tested
│ Mode      │ DRY RUN              │  <- Dry run or live mode
└───────────┴──────────────────────┘
```

- **Processed**: Number of users successfully processed
- **Failed**: Number of users where message sending failed
- **Mode**: "DRY RUN" means no actual messages sent

## Development Notes

The test script bypasses the CRON_SECRET authentication when `testMode=true` in development. In production, the actual cron endpoint requires proper authentication from Vercel.

## Related Documentation

- [VERCEL_CRON_DEPLOYMENT.md](./VERCEL_CRON_DEPLOYMENT.md) - Setting up production cron jobs
- [TESTING.md](./TESTING.md) - General testing guidelines