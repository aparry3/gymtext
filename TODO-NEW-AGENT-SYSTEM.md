# TODO: new-agent-system Launch Checklist

Last updated: 2026-02-23

## Pre-Launch Items

### 1. Structured Workout Output ✨
- [ ] Verify structured JSON output is generated correctly
- [ ] Ensure workout is clickable in UI
- [ ] Test link navigation to workout details

### 2. Message Formatting 📱
- [ ] Verify format includes: day, content, link
- [ ] Onboarding workout message should match daily message format
- [ ] Ensure consistent styling across all workout messages

### 3. Plan + Week Generation 🏋️
- [ ] Review plan generation - avoid overfitting
- [ ] Review week generation - avoid over-prescribing
- [ ] Test with multiple personas to ensure variety and appropriateness

## End-to-End Testing 🧪

Full user journey test:
- [ ] **Signup** - Complete onboarding flow
- [ ] **Messages** - Send/receive chat messages
- [ ] **Daily message** - Receive automated daily workout
- [ ] **Link** - Verify workout link in message
- [ ] **Click on workout** - Navigate to workout details
- [ ] **Track progress** - Log sets/reps/weight
- [ ] **Week message** - Receive weekly summary/next week plan

## Notes

- Use test personas from `scripts/test-users/` for testing
- Run `pnpm test:migration` before major testing sessions
- Document any issues found during E2E testing

## Active PRs

- PR #226 - Documentation updates
- PR #227 - client_id naming fixes
