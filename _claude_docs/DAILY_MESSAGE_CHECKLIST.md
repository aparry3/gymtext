# Daily Message Timing Implementation Checklist

This checklist tracks the implementation of the daily message timing feature based on the approved RFC (Option 1: Hourly Cron with UTC Conversion).

## Pre-Implementation Tasks

- [ ] Review and approve the implementation RFC
- [ ] Confirm Vercel plan supports cron jobs
- [ ] Set up development environment for testing cron jobs locally
- [ ] Choose timezone library (date-fns-tz or luxon)
- [ ] Create feature flag for gradual rollout

## Phase 1: Database and Model Updates

### 1.1 Database Migration
- [x] Create migration file for timezone and preferred_send_hour columns
  - [x] Add `preferred_send_hour` column (INTEGER, 0-23, default 8)
  - [x] Add `timezone` column (VARCHAR(50), default 'America/New_York')
  - [x] Add CHECK constraints for valid values
  - [ ] Add IANA timezone validation constraint using `pg_timezone_names` (moved to app layer)
  - [x] Create indexes on both new columns
- [x] Run migration in development environment
- [x] Test rollback functionality
- [ ] Verify PostgreSQL timezone support with `SELECT * FROM pg_timezone_names`

### 1.2 TypeScript Types and Models
- [x] Update database types after running codegen
  - [x] Run `pnpm db:codegen`
  - [x] Verify new columns appear in generated types
- [x] Update User model interface to include new fields
- [x] Update UserWithProfile interface if needed
- [x] Add timezone validation constants/enums
  - [x] Create IANA timezone constants for common zones
  - [ ] Add timezone validation function using Luxon (placeholder created)
  - [x] Create TypeScript type for valid timezones

### 1.3 Repository Layer Updates
- [x] Add method to UserRepository for querying by send hour
- [x] Add method to update user preferences
- [x] Create efficient query for timezone-based user selection
- [ ] Add unit tests for new repository methods

## Phase 2: Service Layer Implementation

### 2.1 Create DailyMessageService
- [x] Create `src/server/services/dailyMessageService.ts`
- [x] Implement core methods:
  - [x] `processHourlyBatch()` - Main entry point for cron
  - [x] `getUsersForHour(utcHour: number)` - Timezone-aware user query
  - [x] `processBatch(users: User[], batchSize: number)` - Batch processor
  - [x] `sendDailyMessage(user: UserWithProfile)` - Individual message sender
- [x] Add error handling and retry logic
- [x] Implement batch size limits and timeouts

### 2.2 Integrate with Existing Services
- [x] Import and use existing MessageService methods
- [x] Use WorkoutService to get today's workout for each user
- [x] Add logging for monitoring and debugging
- [x] Handle edge cases (no workout, inactive subscription, etc.)

### 2.3 Timezone Utilities
- [x] Install Luxon library: `pnpm add luxon @types/luxon`
- [x] Create timezone helper functions
  - [x] `isValidIANATimezone(timezone: string): boolean` using Luxon's IANAZone
  - [x] `getLocalHourForTimezone(utcDate: Date, timezone: string): number`
  - [x] `convertPreferredHourToUTC(localHour: number, timezone: string): number`
  - [x] `getCommonTimezones(): string[]` for UI selection
  - [x] `getAllUTCHoursForLocalHour()` for DST handling
- [ ] Add comprehensive timezone tests
  - [ ] Test valid IANA timezone validation
  - [ ] Test invalid timezone rejection
  - [ ] Test DST transitions for major timezones
- [x] Handle DST transitions properly

## Phase 3: API Endpoints

### 3.1 Cron Endpoint
- [x] Create `/api/cron/daily-messages/route.ts`
- [x] Implement GET handler for Vercel cron
- [x] Add authentication check for cron secret
- [x] Call DailyMessageService.processHourlyBatch()
- [x] Return metrics (processed, failed, duration)
- [x] Add comprehensive error handling
- [x] Set appropriate timeout for function

### 3.2 User Preference Endpoints
- [x] Create `/api/user/preferences/route.ts`
- [x] Implement GET endpoint
  - [x] Return current preferences
  - [x] Include formatted local time display
- [x] Implement PUT endpoint
  - [x] Validate timezone input against IANA database
  - [x] Use Luxon's IANAZone.isValidZone() for validation
  - [x] Validate hour input (0-23)
  - [x] Update user record
  - [x] Return updated preferences
  - [x] Return error for invalid IANA timezone
- [ ] Add authentication middleware (mock auth for now)
- [ ] Add rate limiting if needed

### 3.3 Environment Variables
- [x] Add `CRON_SECRET` to `.env.example`
- [ ] Add `CRON_SECRET` to Vercel environment variables (deployment step)
- [x] Document the purpose of new environment variables

## Phase 4: Vercel Configuration

### 4.1 Cron Job Setup
- [ ] Create `vercel.json` in project root
- [ ] Add cron configuration:
  ```json
  {
    "crons": [{
      "path": "/api/cron/daily-messages",
      "schedule": "0 * * * *"
    }]
  }
  ```
- [ ] Deploy to Vercel to test cron registration
- [ ] Verify cron appears in Vercel dashboard

### 4.2 Function Configuration
- [ ] Set appropriate timeout for cron function
- [ ] Configure memory limits if needed
- [ ] Test function logs in Vercel dashboard

## Phase 5: Frontend Updates

### 5.1 Signup Flow Enhancement
- [ ] Add timezone detection to signup form
  - [ ] Use browser API: `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - [ ] Validate detected timezone is IANA compliant
  - [ ] Show detected timezone to user
  - [ ] Provide dropdown with common IANA timezones as fallback
- [ ] Add preferred time selector
  - [ ] Create hour dropdown (12-hour format with AM/PM)
  - [ ] Default to 8:00 AM
  - [ ] Add explanatory text about daily messages
- [ ] Update form validation
  - [ ] Ensure timezone is valid IANA identifier
  - [ ] Validate hour is 0-23
- [ ] Update signup API call to include new fields

### 5.2 User Profile Settings
- [ ] Create settings section for "Daily Message Preferences"
- [ ] Display current settings
  - [ ] Show time in user's local format
  - [ ] Show timezone with friendly name
  - [ ] Show next message delivery time
- [ ] Add edit functionality
  - [ ] Time selector component
  - [ ] Timezone selector (if allowing changes)
  - [ ] Save button with loading state
- [ ] Add success/error notifications
- [ ] Update profile API integration

### 5.3 UI Components
- [ ] Create reusable TimeSelector component
- [ ] Create TimezoneDisplay component
- [ ] Ensure mobile responsiveness
- [ ] Add loading states
- [ ] Add error states

## Phase 6: Testing

### 6.1 Unit Tests
- [ ] Database migration tests
- [ ] Repository method tests
- [ ] Timezone utility function tests
- [ ] Service layer tests with mocked dependencies
- [ ] API endpoint tests
- [ ] Frontend component tests

### 6.2 Integration Tests
- [ ] End-to-end cron job execution
- [ ] User preference update flow
- [ ] Message delivery with different timezones
- [ ] DST transition handling
- [ ] Error scenarios and retries

### 6.3 Manual Testing
- [ ] Test with users in different IANA timezones
  - [ ] America/New_York
  - [ ] Europe/London
  - [ ] Asia/Tokyo
  - [ ] Australia/Sydney
- [ ] Test timezone edge cases
  - [ ] UTC+14 (Pacific/Kiritimati)
  - [ ] UTC-12 (Etc/GMT+12)
  - [ ] Half-hour timezones (Asia/Kolkata, UTC+5:30)
  - [ ] 45-minute offset (Asia/Kathmandu, UTC+5:45)
- [ ] Test during DST transitions
  - [ ] Spring forward (2nd Sunday in March for US)
  - [ ] Fall back (1st Sunday in November for US)
- [ ] Test with invalid timezone data
  - [ ] Non-IANA strings (e.g., "EST", "PST")
  - [ ] Malformed strings
  - [ ] Empty/null values
- [ ] Test cron job reliability over 24 hours

## Phase 7: Monitoring and Observability

### 7.1 Logging
- [ ] Add structured logging to cron endpoint
- [ ] Log batch processing metrics
- [ ] Log individual message failures
- [ ] Set up log aggregation/search

### 7.2 Metrics and Alerts
- [ ] Track success rate by hour
- [ ] Monitor message delivery latency
- [ ] Set up alerts for:
  - [ ] Cron job failures
  - [ ] Low success rates
  - [ ] High latency
  - [ ] Unexpected user counts
- [ ] Create dashboard for daily message metrics

### 7.3 Error Tracking
- [ ] Integrate error tracking (Sentry, etc.)
- [ ] Add context to errors (user timezone, hour, etc.)
- [ ] Set up error notifications

## Phase 8: Documentation

### 8.1 Technical Documentation
- [ ] Update API documentation
- [ ] Document timezone handling approach
- [ ] Add cron job troubleshooting guide
- [ ] Update database schema documentation

### 8.2 User Documentation
- [ ] Create help article for message timing feature
- [ ] Add FAQ entries
- [ ] Update onboarding documentation

### 8.3 Operational Documentation
- [ ] Create runbook for cron job issues
- [ ] Document manual intervention procedures
- [ ] Add monitoring dashboard guide

## Phase 9: Deployment and Rollout

### 9.1 Pre-deployment
- [ ] Run full test suite
- [ ] Review code with team
- [ ] Ensure feature flag is OFF
- [ ] Prepare rollback plan

### 9.2 Production Deployment
- [ ] Deploy database migration
- [ ] Deploy application code
- [ ] Verify cron job registration
- [ ] Test with internal users

### 9.3 Gradual Rollout
- [ ] Enable for 1% of users
- [ ] Monitor metrics for 24 hours
- [ ] Enable for 10% of users
- [ ] Monitor for 48 hours
- [ ] Enable for 50% of users
- [ ] Monitor for 48 hours
- [ ] Enable for 100% of users

### 9.4 Post-deployment
- [ ] Send notification to existing users about new feature
- [ ] Monitor support tickets
- [ ] Gather user feedback
- [ ] Plan iteration based on feedback

## Phase 10: Cleanup and Optimization

### 10.1 Code Cleanup
- [ ] Remove feature flag code
- [ ] Clean up any temporary migrations
- [ ] Optimize database queries based on real usage

### 10.2 Performance Optimization
- [ ] Analyze cron job execution times
- [ ] Optimize batch sizes based on data
- [ ] Consider caching frequently accessed data

### 10.3 Future Enhancements Planning
- [ ] Document lessons learned
- [ ] Create tickets for future improvements
- [ ] Update product roadmap

## Success Criteria

- [ ] All existing users have default preferences set
- [ ] New users can select time during signup
- [ ] Messages delivered within 5 minutes of selected time
- [ ] 95%+ success rate for message delivery
- [ ] No significant increase in error rates
- [ ] Positive user feedback

## Risk Mitigation

- [ ] Rollback plan documented and tested
- [ ] Feature flag allows instant disable
- [ ] Rate limiting prevents runaway costs
- [ ] Monitoring alerts team to issues quickly

---

**Checklist Version**: 1.0  
**Based on RFC**: DAILY_MESSAGE_IMPL_RFC.md v1.0  
**Last Updated**: 2025-07-28  
**Status**: Phase 3 Complete - API Endpoints