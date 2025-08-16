# Product Requirements Document: Daily Workout Message Timing Feature

## Overview

This feature enables GymText users to customize the time they receive their daily workout messages, replacing the current fixed delivery schedule with a personalized timing system. Users can select their preferred delivery hour during signup and modify it later through their profile settings.

## Background & Context

**Business Context**: GymText currently sends daily workout messages at a fixed time for all users. This one-size-fits-all approach doesn't accommodate users' varying schedules, time zones, and workout preferences, potentially reducing engagement and workout completion rates.

**Requestor**: User feature request implied from the need to personalize the fitness coaching experience.

**Business Value**: 
- Increased user engagement by delivering messages when users are most likely to act on them
- Improved workout completion rates through better timing alignment
- Enhanced user satisfaction and retention through personalization
- Competitive advantage through thoughtful user experience

## User Stories

1. **As a new user**, I want to select when I receive my daily workout messages during signup so that I get them at a convenient time from day one.

2. **As an existing user**, I want to change my daily message delivery time through my profile settings so that I can adjust it as my schedule changes.

3. **As a user in any timezone**, I want my selected time to be respected regardless of where I am so that I consistently receive messages at my preferred local time.

4. **As a morning person**, I want to receive my workout at 6 AM so that I can complete it before work.

5. **As an evening exerciser**, I want to receive my workout at 5 PM so that I can work out after my workday ends.

## Functional Requirements

### 1. Time Selection During Signup

**1.1** Add a time selection field to the signup form after the email field
- Label: "When should we send your daily workout? (in your local time)"
- Default value: 8:00 AM
- Format: Hour selection only (no minutes)
- Range: All 24 hours (12 AM - 11 PM)
- Display format: 12-hour with AM/PM

**1.2** Time selection should be optional during signup
- If not selected, default to 8:00 AM in user's timezone
- Must not block signup completion

**1.3** Store the selected time with timezone information
- Capture user's timezone from browser during signup
- Store both preferred hour and timezone in database

### 2. Database Schema Updates

**2.1** Add new columns to the `users` table:
- `preferred_send_hour`: integer (0-23) representing the hour in 24-hour format
- `timezone`: varchar(50) storing IANA timezone identifier (e.g., "America/New_York")
- Both columns should allow NULL values for backward compatibility
- Default `preferred_send_hour` to 8 (8 AM) if NULL
- Default `timezone` to "America/New_York" if NULL

**2.2** Create a database migration to add these columns

### 3. Profile Management

**3.1** Create a user profile API endpoint for viewing settings
- GET `/api/user/profile`
- Returns user info including `preferred_send_hour` and `timezone`
- Requires authentication

**3.2** Create an API endpoint for updating delivery time
- PATCH `/api/user/profile/delivery-time`
- Accepts `preferred_send_hour` (0-23) and optionally `timezone`
- Validates hour is within valid range
- Returns updated user profile
- Requires authentication

### 4. Message Scheduling System

**4.1** Implement a scheduling service that:
- Queries users grouped by their preferred send hour and timezone
- Calculates the correct UTC time for each timezone/hour combination
- Triggers message generation and sending for each group

**4.2** The scheduler should run every hour at the top of the hour

**4.3** Handle timezone considerations:
- Convert user's preferred local hour to UTC for scheduling
- Account for daylight saving time changes
- Use reliable timezone library (e.g., date-fns-tz)

### 5. Message Delivery Integration

**5.1** Modify the daily message service to:
- Accept a list of users to process
- Generate personalized workout messages for each user
- Send messages via the existing Twilio integration
- Log delivery status and timing

**5.2** Ensure message generation respects user context:
- Include appropriate greeting based on time of day
- Consider workout timing in message content

## Non-Functional Requirements

### Performance
- **NFR-1**: Time selection should not add more than 100ms to signup form submission
- **NFR-2**: Scheduling system must process up to 10,000 users per hour without degradation
- **NFR-3**: Message delivery should complete within 5 minutes of scheduled time for 95% of users

### Reliability
- **NFR-4**: System must handle timezone database updates gracefully
- **NFR-5**: Failed message deliveries should be retried up to 3 times
- **NFR-6**: Scheduler must have 99.9% uptime

### Usability
- **NFR-7**: Time selection UI must be intuitive without instructions
- **NFR-8**: Time changes should take effect for the next day's message
- **NFR-9**: Users should receive confirmation when delivery time is updated

### Security
- **NFR-10**: API endpoints must require authentication
- **NFR-11**: Rate limit profile updates to 10 per user per day
- **NFR-12**: Validate all timezone inputs against IANA database

### Scalability
- **NFR-13**: Architecture must support future minute-level precision
- **NFR-14**: System must handle users across all global timezones

## Acceptance Criteria

### For Signup Flow
1. ✓ Time selection field appears on signup form
2. ✓ Field shows 24 hour options in 12-hour AM/PM format
3. ✓ Default selection is 8:00 AM
4. ✓ Form submits successfully with or without time selection
5. ✓ Selected time is stored in database with user record
6. ✓ User's timezone is captured and stored

### For Profile Updates
1. ✓ Authenticated users can retrieve their current delivery time setting
2. ✓ Users can update their preferred delivery hour
3. ✓ API validates hour value is between 0-23
4. ✓ Changes are reflected in the database immediately
5. ✓ Next day's message is sent at the new time

### For Message Delivery
1. ✓ Messages are sent within 5 minutes of user's selected hour
2. ✓ Messages respect user's local timezone
3. ✓ System handles daylight saving time transitions correctly
4. ✓ Failed deliveries are retried appropriately
5. ✓ Delivery logs capture actual send time

## Out of Scope

The following items are explicitly NOT included in this phase:

1. **Minute-level precision**: Users can only select hours, not specific minutes
2. **Multiple daily messages**: This feature is for the single daily workout message only
3. **Day-specific scheduling**: Same time applies to all days of the week
4. **Pause/skip functionality**: Users cannot pause deliveries for specific days
5. **SMS commands**: Users cannot change timing via text message
6. **Retroactive changes**: Time changes don't affect already-sent messages
7. **Time zone selection UI**: System auto-detects timezone, no manual selection
8. **Batch time updates**: No bulk operations for changing multiple users' times
9. **Delivery confirmations**: No read receipts or delivery confirmations to users
10. **Weekend/weekday differentiation**: Same schedule seven days a week

## Open Questions

1. **Q**: Should we send a confirmation message when users update their delivery time?
   - **Consideration**: Could be helpful but might be seen as spam

2. **Q**: How should we handle users who travel across timezones?
   - **Consideration**: Currently would require manual update; auto-detection could be future enhancement

3. **Q**: What happens if a user's selected time has already passed for today when they sign up?
   - **Recommendation**: Send welcome message immediately, start regular schedule tomorrow

4. **Q**: Should we limit how often users can change their delivery time?
   - **Recommendation**: Start with no limit, add if abuse is detected

5. **Q**: How do we handle the transition when this feature launches for existing users?
   - **Recommendation**: Keep existing users at current time, send one-time notification about new feature

## Dependencies

### External Services
- **Twilio API**: Must continue to support current message sending volume
- **Hosting platform**: Must support cron jobs or scheduled functions
- **Timezone database**: Need up-to-date IANA timezone data

### Internal Systems
- **User authentication**: Required for profile management endpoints
- **Database**: PostgreSQL with Kysely ORM
- **Message generation service**: Daily message agent must remain compatible
- **User repository**: Needs updates to support new fields

### Libraries
- **Timezone handling**: date-fns-tz or similar for timezone conversions
- **Scheduling**: node-cron or platform-specific scheduler
- **Validation**: zod for API input validation

## Success Metrics

### Primary Metrics
1. **Adoption Rate**: % of new users who customize their delivery time (target: >40%)
2. **Workout Completion Rate**: % increase in reported workout completions (target: +15%)
3. **User Retention**: 30-day retention improvement (target: +10%)

### Secondary Metrics
1. **Message Open Rate**: % of messages opened within 2 hours of delivery (target: >60%)
2. **Time Change Frequency**: Average number of time changes per user per month (expect: <1)
3. **Support Tickets**: Reduction in timing-related support requests (target: -50%)

### Technical Metrics
1. **Delivery Accuracy**: % of messages delivered within 5 minutes of scheduled time (target: >95%)
2. **System Uptime**: Scheduler availability (target: 99.9%)
3. **API Response Time**: Profile update endpoint response time (target: <200ms p95)

## Next Steps

### Immediate Actions (Week 1)
1. **Technical Review**: Architecture team reviews implementation approach
2. **Database Migration**: Create and test schema migration script
3. **UI/UX Review**: Design team reviews signup form modifications
4. **API Design**: Finalize API endpoint specifications

### Implementation Phase (Weeks 2-4)
1. **Backend Development**: 
   - Database updates
   - API endpoints
   - Scheduling service
2. **Frontend Development**:
   - Signup form updates
   - Profile management UI (if applicable)
3. **Testing**:
   - Unit tests for all new code
   - Integration tests for scheduling system
   - Timezone edge case testing

### Pre-Launch (Week 5)
1. **Load Testing**: Verify system handles expected user volume
2. **Documentation**: Update user guides and API documentation
3. **Monitoring Setup**: Configure alerts for delivery accuracy
4. **Rollout Plan**: Define phased rollout strategy

### Post-Launch
1. **Monitor Metrics**: Track success metrics daily for first week
2. **Gather Feedback**: Survey early adopters
3. **Iterate**: Address any issues or enhancement requests
4. **Plan Phase 2**: Consider minute-precision and other enhancements

## Future Enhancements

Based on user feedback and success metrics, consider these for future phases:

1. **Minute-level precision**: Allow selection of specific minutes (e.g., 6:30 AM)
2. **Multiple daily messages**: Different times for different message types
3. **Smart scheduling**: AI-suggested optimal delivery times based on user behavior
4. **Workout windows**: Delivery time ranges instead of specific times
5. **Calendar integration**: Sync with user's calendar for dynamic scheduling
6. **Weather-based timing**: Adjust outdoor workout delivery based on weather
7. **Progressive timing**: Gradually shift delivery time for habit building
8. **Quiet hours**: Automatic do-not-disturb periods
9. **Batch preferences**: Different times for weekdays vs weekends
10. **Location-based timing**: Auto-adjust when user travels

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Author: Product Management Team*  
*Status: Ready for Engineering Review*