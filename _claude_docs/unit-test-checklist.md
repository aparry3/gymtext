# Unit Test Implementation Checklist

## Quick Reference Progress Tracker

### 📊 Overall Progress
- [ ] Test infrastructure setup complete
- [ ] Mock factories created
- [ ] Custom matchers implemented
- [ ] CI/CD test pipeline configured

---

## 🔴 PHASE 1: Repositories (Days 1-5)

### Day 1: Setup & Base Repository
- [ ] Create test directory structure
- [ ] Set up database mock factory
- [ ] Test baseRepository.ts
- [ ] Create UserBuilder fixture

### Day 2: User & Conversation Repos
- [ ] Test userRepository.ts (8 test cases)
- [ ] Test conversationRepository.ts (5 test cases)
- [ ] Create ConversationBuilder fixture

### Day 3: Message & Fitness Plan Repos
- [ ] Test messageRepository.ts (5 test cases)
- [ ] Test fitnessPlanRepository.ts (5 test cases)
- [ ] Create MessageBuilder & FitnessPlanBuilder fixtures

### Day 4: Workout-Related Repos
- [ ] Test mesocycleRepository.ts (4 test cases)
- [ ] Test microcycleRepository.ts (4 test cases)
- [ ] Test workoutInstanceRepository.ts (5 test cases)

### Day 5: Repository Review & Coverage
- [ ] Achieve 90% repository coverage
- [ ] Fix any failing tests
- [ ] Document any technical decisions

---

## 🟡 PHASE 2: Services (Days 6-15)

### Day 6-7: Conversation Services
- [ ] Test conversationService.ts
  - [ ] Message handling flow
  - [ ] Error scenarios
  - [ ] Rate limiting
- [ ] Test messageService.ts
  - [ ] Message persistence
  - [ ] Token counting

### Day 8-9: Chat & Context Services
- [ ] Test chatService.ts
  - [ ] Mock LLM setup
  - [ ] Response generation
  - [ ] Context injection
- [ ] Test contextService.ts
  - [ ] Context building
  - [ ] Context merging

### Day 10-11: Fitness Services
- [ ] Test fitnessPlanService.ts
  - [ ] Plan generation (mocked)
  - [ ] Plan activation
  - [ ] Progress tracking
- [ ] Test mesocycleService.ts
  - [ ] Phase progression
  - [ ] Volume calculations

### Day 12-13: External Integration Services
- [ ] Test twilioService.ts
  - [ ] Mock Twilio client
  - [ ] SMS sending
  - [ ] Phone validation
- [ ] Test memoryService.ts
  - [ ] Mock vector DB
  - [ ] Memory retrieval

### Day 14-15: Service Review & Coverage
- [ ] Test promptService.ts
- [ ] Achieve 85% service coverage
- [ ] Integration test planning

---

## 🟢 PHASE 3: Agents (Days 16-20)

### Day 16: Base Agent & Chat
- [ ] Test base.ts agent class
- [ ] Test chat/chain.ts
  - [ ] Mock LLM responses
  - [ ] Context usage

### Day 17: Message Generation Agents
- [ ] Test welcomeMessage/chain.ts
- [ ] Test dailyMessage/chain.ts
  - [ ] Workout formatting
  - [ ] Rest day handling

### Day 18-19: Planning Agents
- [ ] Test fitnessPlan/chain.ts
  - [ ] Complex plan mocking
  - [ ] Validation logic
- [ ] Test mesocycleBreakdown/chain.ts
  - [ ] Breakdown logic
  - [ ] Exercise selection

### Day 20: Agent Review & Coverage
- [ ] Achieve 80% agent coverage
- [ ] Test all prompt templates
- [ ] Document AI mocking strategy

---

## 🔵 PHASE 4: Utilities & Polish (Days 21-25)

### Day 21: Utility Testing
- [ ] Test circuitBreaker.ts
- [ ] Test token-manager.ts
- [ ] Other utility functions

### Day 22-23: Error Handling & Edge Cases
- [ ] Add error scenario tests
- [ ] Test concurrent operations
- [ ] Test boundary conditions

### Day 24: Performance & Coverage
- [ ] Run coverage reports
- [ ] Optimize slow tests
- [ ] Add missing test cases

### Day 25: Documentation & Handoff
- [ ] Update test documentation
- [ ] Create testing guide
- [ ] Set up CI/CD hooks

---

## 📋 Definition of Done

### For Each Component:
- [ ] All test cases pass
- [ ] Coverage meets target
- [ ] Mocks are properly isolated
- [ ] Tests run in < 1 second
- [ ] Clear test descriptions
- [ ] No console warnings

### For Each Phase:
- [ ] Coverage target achieved
- [ ] All fixtures created
- [ ] Documentation updated
- [ ] Code review completed

---

## 🚀 Quick Commands

```bash
# Run specific test file
pnpm test userRepository

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run tests matching pattern
pnpm test -t "should create user"

# Debug specific test
node --inspect-brk node_modules/.bin/vitest userRepository.test.ts
```

---

## 📈 Coverage Tracking

| Component | Target | Current | Status |
|-----------|--------|---------|---------|
| Repositories | 90% | 0% | 🔴 Not Started |
| Services | 85% | 0% | 🔴 Not Started |
| Agents | 80% | 0% | 🔴 Not Started |
| Utilities | 95% | 0% | 🔴 Not Started |
| **Overall** | **85%** | **0%** | **🔴 Not Started** |

---

*Update this checklist daily to track progress. Mark items complete with [x] and update coverage percentages as you go.*