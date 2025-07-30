# Vercel Cron Job Deployment Guide

This guide covers deploying and configuring the daily message cron job on Vercel.

## Prerequisites

- Vercel account
- Project already deployed to Vercel
- Vercel CLI installed (optional): `npm i -g vercel`

## Configuration

### 1. Environment Variables

Add the following environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following:

```
CRON_SECRET=<generate-a-secure-random-string>
```

Generate a secure secret using:
```bash
openssl rand -base64 32
```

### 2. Cron Job Configuration

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-messages",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs the job every hour at minute 0 (e.g., 1:00, 2:00, 3:00...).

### 3. Function Timeout

The function timeout is set to 300 seconds (5 minutes) in `vercel.json`:

```json
{
  "functions": {
    "src/app/api/cron/daily-messages/route.ts": {
      "maxDuration": 300
    }
  }
}
```

**Note**: The maximum timeout depends on your Vercel plan:
- Hobby: 10 seconds (may need to upgrade)
- Pro: 15 minutes
- Enterprise: 15 minutes+

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. Push your changes to your connected Git repository
2. Vercel will automatically deploy and register the cron job
3. Verify in Vercel dashboard under "Functions" → "Cron Jobs"

### Option 2: Manual Deployment

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Verification

### 1. Check Cron Registration

After deployment:
1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on "Functions" tab
4. Select "Cron Jobs"
5. You should see your `/api/cron/daily-messages` endpoint listed

### 2. Test Locally

```bash
# Make sure you have CRON_SECRET in .env.local
pnpm tsx scripts/test-daily-messages.ts
```

### 3. Manual Trigger in Vercel

In the Vercel dashboard:
1. Go to Functions → Cron Jobs
2. Find your cron job
3. Click the "..." menu
4. Select "Trigger"

### 4. Monitor Logs

View execution logs:
1. Go to Functions → Logs
2. Filter by `/api/cron/daily-messages`
3. Check for successful executions

## Troubleshooting

### Cron Job Not Appearing

- Ensure `vercel.json` is in the root directory
- Check that the path matches your API route exactly
- Redeploy after adding/modifying `vercel.json`

### Authentication Errors

- Verify CRON_SECRET is set in Vercel environment variables
- Ensure it matches between your local `.env.local` and Vercel
- Check that the cron endpoint is using the correct header format

### Timeout Issues

- Monitor execution time in logs
- Consider increasing batch size if processing is too slow
- Upgrade Vercel plan if you need longer timeouts

### No Messages Being Sent

1. Check that users have:
   - Active subscriptions
   - Valid timezone settings
   - Scheduled workouts
2. Verify Twilio credentials are set correctly
3. Check logs for specific error messages

## Monitoring

### Key Metrics to Track

- Success rate: `processed / (processed + failed)`
- Average duration per batch
- Error frequency and types
- Peak processing hours

### Recommended Monitoring Setup

1. Set up Vercel Analytics for basic metrics
2. Consider integrating with external monitoring:
   - Sentry for error tracking
   - Datadog/New Relic for performance monitoring
   - Custom webhooks for critical failures

## Best Practices

1. **Idempotency**: Ensure messages aren't sent twice if cron runs overlap
2. **Error Handling**: Log all errors with context for debugging
3. **Batch Size**: Start small (10-20) and increase based on performance
4. **Time Windows**: Consider user's local time to avoid late-night messages
5. **Monitoring**: Set up alerts for failed runs or low success rates

## Cron Schedule Reference

Common schedules:
- Every hour: `0 * * * *`
- Every 30 minutes: `*/30 * * * *`
- Every day at 8 AM UTC: `0 8 * * *`
- Every weekday at 6 AM UTC: `0 6 * * 1-5`

Use [crontab.guru](https://crontab.guru) to validate your cron expressions.

## Security Notes

- Never expose CRON_SECRET in client-side code
- Use environment variables for all sensitive data
- Consider IP allowlisting if Vercel supports it for your plan
- Regularly rotate the CRON_SECRET