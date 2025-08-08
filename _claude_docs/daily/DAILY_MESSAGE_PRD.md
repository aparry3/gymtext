# Daily Workout Message Timing Feature - Product Requirements Document

## 1. Executive Summary

This document outlines the requirements for implementing a user-configurable daily workout message delivery time feature for GymText. Users will be able to select their preferred time to receive their daily workout messages, enhancing personalization and improving engagement rates.

## 2. Feature Overview

### 2.1 Problem Statement
Currently, daily workout messages are sent at a fixed time that may not align with users' workout schedules or preferences. This can lead to:
- Messages being ignored or forgotten
- Reduced workout completion rates
- Poor user experience for users in different time zones

### 2.2 Solution
Allow users to choose their preferred time to receive daily workout messages, with delivery scheduled according to their local timezone.

### 2.3 Goals
- Increase user engagement with daily workout messages
- Improve workout completion rates
- Enhance user satisfaction through personalization
- Support users across different time zones

## 3. User Stories

### 3.1 As a new user
- I want to select my preferred workout message time during signup
- So that I receive messages when I'm most likely to work out

### 3.2 As an existing user
- I want to change my daily message delivery time
- So that I can adjust my schedule as my routine changes

### 3.3 As a user traveling across time zones
- I want my messages to arrive at the same local time
- So that my workout routine isn't disrupted

## 4. Functional Requirements

### 4.1 Signup Flow
- **FR-1**: Add time preference selector to signup form
- **FR-2**: Display time in 12-hour format with AM/PM
- **FR-3**: Default selection to 8:00 AM
- **FR-4**: Time selection limited to hourly intervals (e.g., 6:00 AM, 7:00 AM, etc.)
- **FR-5**: Auto-detect user's timezone from browser

### 4.2 User Profile
- **FR-6**: Display current message delivery time in profile settings
- **FR-7**: Allow users to update delivery time preference
- **FR-8**: Show timezone information with option to update
- **FR-9**: Changes take effect starting the next day

### 4.3 Message Delivery
- **FR-10**: Messages sent within 5 minutes of selected hour
- **FR-11**: Respect user's local timezone for delivery
- **FR-12**: Handle daylight saving time transitions automatically

## 5. Technical Requirements

### 5.1 Data Model Changes

#### User Table Updates
```sql
ALTER TABLE users ADD COLUMN preferred_send_hour INTEGER DEFAULT 8;
-- Values: 0-23 representing hour in 24-hour format

ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Los_Angeles';
-- IANA timezone format (e.g., 'America/New_York', 'Europe/London')
```

### 5.2 API Endpoints

#### Get User Preferences
```
GET /api/user/preferences
Response: {
  "preferredSendHour": 8,
  "timezone": "America/New_York",
  "localTime": "8:00 AM EST"
}
```

#### Update User Preferences
```
PUT /api/user/preferences
Body: {
  "preferredSendHour": 9,
  "timezone": "America/New_York"
}
```

### 5.3 Scheduling System
- **TR-1**: Implement hourly job that queries users by preferred send hour
- **TR-2**: Convert user's preferred hour to UTC for scheduling
- **TR-3**: Batch process users in the same hour window
- **TR-4**: Integration with existing Twilio SMS service

## 6. UI/UX Requirements

### 6.1 Signup Form
- Time selector dropdown with hourly options
- Clear labeling: "When would you like to receive your daily workout?"
- Timezone display: "Your timezone: America/New_York"
- Info tooltip explaining the daily message feature

### 6.2 Profile Settings
- Dedicated section: "Daily Message Preferences"
- Current setting display with edit button
- Time format toggle (12hr/24hr) - future enhancement
- Save confirmation with next delivery time preview

### 6.3 Visual Design
- Consistent with existing form styling
- Mobile-responsive time selector
- Clear visual feedback for changes

## 7. Edge Cases & Considerations

### 7.1 Timezone Handling
- **EC-1**: User moves to different timezone
- **EC-2**: Daylight saving time transitions
- **EC-3**: Invalid timezone data
- **EC-4**: Countries with half-hour timezone offsets (future consideration)

### 7.2 Delivery Failures
- **EC-5**: Message fails to send at scheduled time
- **EC-6**: User's phone number becomes invalid
- **EC-7**: Twilio service disruption

### 7.3 Data Validation
- **EC-8**: Ensure hour value is between 0-23
- **EC-9**: Validate timezone against IANA database
- **EC-10**: Handle missing preference data gracefully

## 8. Success Metrics

### 8.1 Adoption Metrics
- % of new users selecting non-default time
- % of existing users updating their preference
- Distribution of selected times

### 8.2 Engagement Metrics
- Message open/response rate by delivery time
- Workout completion rate correlation with message timing
- User retention improvement

### 8.3 Technical Metrics
- Message delivery accuracy (% delivered within 5-minute window)
- System performance during peak delivery hours
- Error rate for timezone-related issues

## 9. Implementation Plan

### 9.1 Phase 1: Database & Backend (Week 1-2)
- Database schema updates
- API endpoint implementation
- Scheduling system development

### 9.2 Phase 2: Frontend (Week 3-4)
- Signup form enhancement
- Profile settings UI
- Timezone detection implementation

### 9.3 Phase 3: Testing & Rollout (Week 5)
- End-to-end testing
- Timezone edge case testing
- Gradual rollout to user segments

## 10. Out of Scope

### 10.1 Current Release
- Minute-level precision (hour-only for v1)
- Multiple daily messages
- Day-of-week preferences
- Workout-specific timing
- Push notifications (SMS only)

### 10.2 Explicitly Not Included
- Retroactive message rescheduling
- Bulk time updates for admin
- Time preference analytics dashboard
- A/B testing framework for optimal times

## 11. Future Enhancements

### 11.1 Near-term (3-6 months)
- Minute-level precision (e.g., 7:30 AM)
- Smart time suggestions based on workout completion patterns
- Holiday/weekend different timing

### 11.2 Long-term (6-12 months)
- Multiple daily messages (morning reminder, evening summary)
- AI-powered optimal time prediction
- Integration with calendar apps
- Weather-based timing adjustments

## 12. Security & Privacy Considerations

### 12.1 Data Protection
- Timezone data is not considered PII
- Time preferences stored encrypted at rest
- No exposure of user preferences in public APIs

### 12.2 Compliance
- GDPR: Time preference included in data export
- User consent maintained for message delivery
- Clear opt-out mechanism preserved

## 13. Dependencies

### 13.1 External Services
- Twilio SMS API (existing integration)
- IANA Timezone Database
- Browser Geolocation API (for timezone detection)

### 13.2 Internal Systems
- User authentication system
- Daily message generation service
- Fitness plan scheduling system

## 14. Acceptance Criteria

### 14.1 Feature Complete When:
- [ ] Users can select preferred hour during signup
- [ ] Existing users can update preference in profile
- [ ] Messages delivered at selected time ±5 minutes
- [ ] Timezone changes handled correctly
- [ ] All error cases handled gracefully
- [ ] Feature flag for gradual rollout implemented

### 14.2 Quality Standards
- [ ] Unit test coverage >80%
- [ ] Integration tests for all timezone scenarios
- [ ] Load testing for peak delivery hours
- [ ] Accessibility standards met (WCAG 2.1 AA)

## 15. References

### 15.1 Related Documents
- Existing Daily Message Agent implementation
- User Profile Schema documentation
- Twilio Integration guide

### 15.2 Technical Resources
- IANA Timezone Database: https://www.iana.org/time-zones
- Moment.js Timezone: https://momentjs.com/timezone/
- Twilio Scheduling Best Practices

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Author**: Product Team  
**Status**: Ready for Review