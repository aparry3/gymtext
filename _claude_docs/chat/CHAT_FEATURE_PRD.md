# GymText Onboarding Chat Feature - Product Requirements Document

## Executive Summary

This PRD outlines the requirements for adding a web-based onboarding chat feature to GymText. The chat interface serves exclusively as a user onboarding tool to gather fitness information, build user profiles, and convert visitors into paying subscribers. Once users complete signup, all coaching interactions move to SMS - the chat is not an ongoing coaching interface.

## 1. Background & Strategic Context

### 1.1 Current State Analysis

**Existing Architecture to Leverage:**
- UserProfileAgent for extracting user information
- Fitness profile system with automatic updates  
- Profile patch service for building user profiles
- Authentication and user management system

**Key Strengths to Leverage:**
- Mature UserProfileAgent with specialized prompts for information extraction
- Robust fitness profile system that can be built incrementally through conversation
- Existing signup flow and subscription management via Stripe
- SMS infrastructure ready to take over post-signup

### 1.2 Market Research Insights

Based on analysis of successful onboarding chat interfaces, key features include:
- **Conversational Information Gathering**: Natural dialogue flow for collecting user data
- **Progressive Disclosure**: Revealing information requirements gradually to avoid overwhelming users
- **Real-time Validation**: Immediate feedback on provided information
- **Clear Progress Indicators**: Users understand how much of the onboarding remains
- **Conversion Optimization**: Strategic placement of signup prompts and calls-to-action

## 2. Product Vision & Goals

### 2.1 Vision Statement
Enable potential GymText users to easily discover their fitness needs, build a comprehensive fitness profile, and convert to SMS-based coaching through an intuitive onboarding chat experience that feels personal and engaging while efficiently gathering the information needed for personalized coaching.

### 2.2 Success Metrics
- **Conversion Rate**: 15% of chat users complete signup within 24 hours
- **Profile Completeness**: 80% of users provide sufficient data for personalized coaching
- **Onboarding Completion**: 70% of users complete the full onboarding flow
- **User Satisfaction**: >4.0/5.0 rating for onboarding experience
- **Time to Signup**: Average time from chat start to signup < 10 minutes

### 2.3 Anti-Goals
- Provide ongoing coaching through chat (SMS is the only coaching channel)
- Generate workout plans or daily coaching in the chat interface
- Create complex user dashboards or progress tracking features
- Duplicate existing agent logic or profile management
- Support existing user login (this is for new user onboarding only)

## 3. User Experience Requirements

### 3.1 User Journey Flow

```
Landing Page → "Try Free Chat" CTA → Onboarding Chat Interface
                                            ↓
                                    Information Gathering
                                   (Goals, Experience, etc.)
                                            ↓
                                    Profile Building
                                   (Real-time updates)
                                            ↓
                                   Personalized Preview
                                  (Show coaching approach)
                                            ↓
                                      Signup CTA
                                            ↓
                              Stripe Checkout → SMS Onboarding
```

### 3.2 Chat Interface Design Specifications

#### 3.2.1 Layout Architecture
```
┌─────────────────────────────────────────────────┐
│                  Header                         │
│  GymText Logo                    [Progress: 3/5]│
├─────────────────────────────────────────────────┤
│                                                 │
│              Conversation Area                  │
│  ┌─ Message History ─────────────────────────┐  │
│  │ [AI: "Tell me about your fitness goals"]  │  │
│  │ [User: "I want to build muscle"]          │  │
│  │ [AI: "Great! What's your experience?"]    │  │
│  │ [Profile Update: Experience Level added]   │  │
│  └─────────────────────────────────────────────┘  │
│                                                 │
│  ┌─ Input Area ───────────────────────────────┐  │
│  │ Share your fitness background...     [Send]│  │
│  │ [Quick Actions: Beginner | Some | Experienced]│
│  └─────────────────────────────────────────────┘  │
│              [Start Your Coaching] CTA          │
└─────────────────────────────────────────────────┘
```

#### 3.2.2 Message Types & Styling
- **User Messages**: Right-aligned, blue bubble, simple user icon
- **AI Messages**: Left-aligned, gray bubble, GymText logo
- **Profile Updates**: Center-aligned, subtle green background for profile confirmations
- **Progress Indicators**: Visual progress bar showing onboarding completion

#### 3.2.3 Quick Actions
Pre-defined buttons for common onboarding responses:
- Experience Level: "Beginner | Some Experience | Very Experienced"
- Fitness Goals: "Build Muscle | Lose Weight | Get Stronger | Stay Healthy"
- Workout Frequency: "2-3 times/week | 4-5 times/week | Daily"
- Available Equipment: "Home/Bodyweight | Gym Access | Basic Equipment"
- Time Commitment: "15-30 min | 30-45 min | 45+ min"

### 3.3 Mobile Responsiveness
- Touch-optimized quick action buttons for easy selection
- Large, clear text input for comfortable typing
- Responsive layout adapting to screen size
- Optimized for mobile-first experience since most users will discover via mobile

## 4. Technical Architecture

### 4.1 Frontend Architecture

#### 4.1.1 Technology Stack
- **Framework**: Next.js 15 with App Router (consistent with existing architecture)
- **UI Components**: Extend existing Tailwind CSS v4 design system
- **State Management**: Simple React useState for onboarding flow state
- **Profile Building**: Real-time updates via existing profile patch service
- **Animations**: Minimal animations for smooth message appearance

#### 4.1.2 Component Structure
```
src/app/onboarding/
├── page.tsx                    # Main onboarding chat interface
├── components/
│   ├── OnboardingChat.tsx      # Main chat container
│   ├── MessageList.tsx         # Message history display
│   ├── MessageBubble.tsx       # Individual message component
│   ├── InputArea.tsx           # Message input and quick actions
│   ├── ProgressIndicator.tsx   # Onboarding progress bar
│   ├── ProfileSummary.tsx      # Shows building profile info
│   └── SignupCTA.tsx          # Conversion call-to-action
├── hooks/
│   ├── useOnboarding.ts       # Onboarding flow state
│   └── useProfileBuilder.ts   # Profile building logic
└── types/
    └── onboarding.ts          # Onboarding-specific types
```

### 4.2 Backend Architecture Enhancements

#### 4.2.1 API Route Extensions
```
src/app/api/onboarding/
├── chat/
│   └── route.ts              # POST: Send onboarding message
├── profile/
│   └── route.ts              # GET: Current profile, POST: Update profile
└── signup/
    └── route.ts              # POST: Complete signup and redirect to Stripe
```

#### 4.2.2 Service Layer Integration

**New OnboardingService** (`src/server/services/onboardingService.ts`):
```typescript
interface OnboardingService {
  // Handle onboarding conversation flow
  handleOnboardingMessage(sessionId: string, message: string): Promise<OnboardingResponse>
  
  // Get current profile building state
  getProfileBuildingState(sessionId: string): Promise<ProfileBuildingState>
  
  // Complete onboarding and prepare for signup
  completeOnboarding(sessionId: string): Promise<OnboardingCompletion>
}

interface OnboardingResponse {
  message: string;
  profileUpdated: boolean;
  suggestions?: QuickAction[];
  progressStep?: number;
  readyForSignup?: boolean;
}
```

#### 4.2.3 Session Management
- **Session Storage**: Temporary session storage for onboarding state (not persistent users)
- **Profile Building**: Incrementally build profile during conversation
- **Conversion Tracking**: Track onboarding completion and signup conversion
- **Cleanup**: Clear session data after signup completion or timeout

### 4.3 Database Schema Extensions

#### 4.3.1 Minimal Database Changes
For onboarding chat, we primarily need:
- Temporary session storage (Redis or in-memory)
- Use existing `fitness_profiles` structure for building profiles
- Only create `users` record upon successful signup

#### 4.3.2 New Table: Onboarding Sessions
```sql
CREATE TABLE onboarding_sessions (
    id varchar(255) PRIMARY KEY,
    profile_data jsonb DEFAULT '{}',
    messages jsonb DEFAULT '[]',
    progress_step integer DEFAULT 1,
    created_at timestamp DEFAULT NOW(),
    expires_at timestamp DEFAULT NOW() + INTERVAL '24 hours'
);
```

### 4.4 Agent Integration Strategy

#### 4.4.1 Focus on Profile Building Agent
The onboarding chat will primarily use:

1. **UserProfileAgent** (`src/server/agents/profile/chain.ts`)
   - Extract and update profile information from onboarding conversation
   - Return confidence scores and update summaries
   - Use existing profilePatchTool integration
   - Guide conversation toward missing profile data

2. **OnboardingChatAgent** (new agent focused on conversion)
   - Generate engaging onboarding questions
   - Explain fitness coaching approach
   - Create urgency and desire for signup
   - Avoid generating workouts or coaching content

#### 4.4.2 Onboarding-Specific Agent Response

**Onboarding Response Format**:
```typescript
interface OnboardingAgentResponse {
  message: string;
  profileUpdated: boolean;
  suggestions?: QuickAction[];
  progressStep?: number;
  readyForSignup?: boolean;
  signupMessage?: string;
}
```

**New Agent: OnboardingChatAgent**
```typescript
// src/server/agents/onboarding/chain.ts
export const onboardingChatAgent = async ({
  sessionData,
  userMessage,
  profileState
}: {
  sessionData: OnboardingSession;
  userMessage: string;
  profileState: PartialFitnessProfile;
}): Promise<OnboardingAgentResponse>
```

## 5. Feature Specifications

### 5.1 Core Onboarding Features

#### 5.1.1 Onboarding Flow
1. **Welcome Message**: Introduction to GymText coaching approach
2. **Information Gathering**: Progressive questions about fitness background
3. **Profile Building**: Real-time profile construction from responses
4. **Progress Tracking**: Visual indicator of onboarding completion
5. **Conversion Moment**: Strategic signup prompts when profile is sufficient

#### 5.1.2 Session Management
- **Anonymous Sessions**: No login required for onboarding
- **Session Persistence**: Maintain conversation during browser session
- **Timeout Handling**: Clear expired sessions automatically
- **Conversion Tracking**: Track successful signups from chat

#### 5.1.3 Profile Building Integration
- **Incremental Updates**: Build profile piece by piece through conversation
- **Update Confirmations**: Show users what information was captured
- **Completeness Indicators**: Visual progress toward signup readiness
- **Profile Preview**: Show users their building fitness profile

### 5.2 Conversion Features

#### 5.2.1 Profile Preview
```typescript
interface ProfilePreview {
  completeness: number; // 0-100%
  goals: string[];
  experience: string;
  equipment: string[];
  schedule: string;
  readyForCoaching: boolean;
}
```

#### 5.2.2 Coaching Preview
- **Sample Coaching Style**: Show how GymText would coach this user
- **Personalization Examples**: Demonstrate how their profile affects coaching
- **Success Stories**: Relevant testimonials based on their goals
- **Value Proposition**: Clear benefits of SMS coaching approach

#### 5.2.3 Smart Conversion
Based on profile completeness and user engagement:
- **Timely Signup Prompts**: Show signup CTA when profile is sufficient
- **Urgency Creation**: Limited-time offers or waitlist positioning
- **Social Proof**: Show how many people like them have succeeded
- **Objection Handling**: Address common concerns about SMS coaching

### 5.3 Signup Integration

#### 5.3.1 Stripe Integration
- **Seamless Checkout**: Direct integration with existing Stripe setup
- **Profile Transfer**: Built profile data transfers to user account
- **Subscription Creation**: Automatic subscription activation
- **Onboarding Handoff**: Smooth transition from chat to SMS coaching

#### 5.3.2 SMS Onboarding Setup
- **Phone Verification**: Collect and verify phone number for SMS
- **Welcome Message**: Immediate SMS welcome after signup
- **Coach Introduction**: Introduce the SMS coaching experience
- **First Workout Scheduling**: Setup initial coaching session

## 6. User Interface Specifications

### 6.1 Visual Design System

#### 6.1.1 Color Palette (Extend Existing)
```css
:root {
  /* Existing GymText Colors */
  --primary: #4338ca;      /* Existing purple from signup form */
  --primary-hover: #3730a3;
  --text-primary: #2d3748; /* Existing dark text */
  --text-secondary: #7a8599; /* Existing light text */
  --accent: #f6ad55;       /* Existing orange from landing */
  
  /* New Chat-Specific Colors */
  --chat-user-bg: #4338ca;
  --chat-user-text: #ffffff;
  --chat-ai-bg: #f7fafc;
  --chat-ai-text: #2d3748;
  --chat-system-bg: #fed7d7;
  --chat-system-text: #9b2c2c;
}
```

#### 6.1.2 Typography
- **Headlines**: Existing Bebas Neue font for headers
- **Body Text**: Default system font stack for readability
- **Code/Workouts**: Monospace font for exercise details
- **Emphasis**: Bold for exercise names, metrics

#### 6.1.3 Component Styling
```css
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.workout-preview {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}
```

### 6.2 Responsive Design

#### 6.2.1 Breakpoints
- **Mobile**: < 768px (Single column, full-width messages)
- **Tablet**: 768px - 1024px (Compact sidebar, optimized touch)
- **Desktop**: > 1024px (Full sidebar, keyboard shortcuts)

#### 6.2.2 Mobile Optimizations
- **Touch Targets**: Minimum 44px for buttons and links
- **Swipe Gestures**: Swipe to reveal message timestamps
- **Virtual Keyboard**: Adjust layout when keyboard appears
- **Scroll Behavior**: Smooth scrolling to new messages

## 7. Data Flow & Integration

### 7.1 User Authentication

#### 7.1.1 Authentication Strategy
```typescript
// Leverage existing user system
interface ChatAuthFlow {
  // Check if user has active session
  checkExistingAuth(): Promise<User | null>;
  
  // For new users, redirect to existing signup
  redirectToSignup(): void;
  
  // For existing users without web access, simple verification
  verifyPhoneNumber(phone: string): Promise<VerificationResult>;
}
```

#### 7.1.2 Session Management
- **JWT Tokens**: Reuse existing authentication system
- **Session Persistence**: Remember user across browser sessions
- **Security**: CSRF protection, secure headers
- **Logout**: Clear session and redirect appropriately

### 7.2 Profile Synchronization

#### 7.2.1 Real-time Profile Updates
```typescript
interface ProfileSyncService {
  // Listen for profile changes from any source
  onProfileUpdate(userId: string, callback: (update: ProfileUpdate) => void): void;
  
  // Sync profile changes to connected chat sessions
  broadcastProfileUpdate(userId: string, update: ProfileUpdate): void;
  
  // Merge profile updates from chat with existing data
  mergeProfileUpdate(userId: string, updates: Partial<FitnessProfile>): Promise<FitnessProfile>;
}
```

#### 7.2.2 Conflict Resolution
- **Last Writer Wins**: Most recent update takes precedence
- **Field-Level Merging**: Merge at individual field level
- **User Confirmation**: Prompt for confirmation on significant changes
- **Change History**: Track all profile modifications with timestamps

### 7.3 Context Management

#### 7.3.1 Enhanced Context Service
```typescript
interface WebChatContext extends ConversationContext {
  // Existing context data
  conversationId: string;
  recentMessages: RecentMessage[];
  userProfile: UserContextProfile;
  
  // Web-specific additions
  activeWorkout?: WorkoutInstance;
  progressTrends?: ProgressMetrics;
  upcomingSchedule?: ScheduledWorkout[];
  recentAchievements?: Achievement[];
}
```

#### 7.3.2 Context Caching Strategy
- **In-Memory Cache**: Recent conversation context
- **Redis Cache**: Session-specific data with TTL
- **Database Fallback**: Persistent context storage
- **Cache Invalidation**: Smart invalidation on profile updates

## 8. Implementation Timeline

### 8.1 Phase 1: Core Infrastructure (Weeks 1-2)
**Week 1: Backend Foundation**
- Create onboarding API routes (`/api/onboarding/*`)
- Create OnboardingService for session management
- Set up session storage (Redis or in-memory)
- Database schema for onboarding sessions

**Week 2: Agent Integration**
- Create OnboardingChatAgent for conversion-focused responses
- Enhance UserProfileAgent for onboarding context
- Test profile building flow
- Profile patch service integration

### 8.2 Phase 2: UI & Conversion (Weeks 3-4)
**Week 3: Core Components**
- OnboardingChat component with messaging
- MessageList and MessageBubble components
- ProgressIndicator and ProfileSummary
- Quick action buttons for common responses

**Week 4: Conversion Features**
- SignupCTA component with Stripe integration
- Profile preview and coaching examples
- Mobile-optimized responsive layout
- Conversion tracking and analytics

### 8.3 Phase 3: Polish & Launch (Weeks 5-6)
**Week 5: Testing & Optimization**
- Cross-browser testing
- Mobile responsiveness testing
- Conversion funnel optimization
- Performance optimization

**Week 6: Launch Preparation**
- A/B testing setup for conversion optimization
- Analytics integration
- Launch strategy execution
- Monitoring and feedback collection

## 9. Success Metrics & Analytics

### 9.1 Key Performance Indicators

#### 9.1.1 Conversion Metrics
- **Signup Conversion Rate**: % of chat users who complete signup
- **Time to Conversion**: Average time from chat start to signup
- **Profile Completeness at Signup**: % of sufficient profile data collected
- **Cart Abandonment**: % who reach signup but don't complete payment

#### 9.1.2 Engagement Metrics
- **Session Duration**: Time spent in onboarding chat
- **Messages per Session**: Conversation depth before signup/exit
- **Quick Action Usage**: Frequency of quick response clicks
- **Onboarding Completion**: % who complete full profile building

#### 9.1.3 Quality Metrics
- **Profile Accuracy**: Quality of information gathered during onboarding
- **User Satisfaction**: Rating of onboarding experience
- **Agent Response Quality**: Relevance of onboarding questions and responses
- **Technical Performance**: Load times, error rates, mobile performance

### 9.2 Analytics Implementation

#### 9.2.1 Event Tracking
```typescript
interface OnboardingAnalyticsEvent {
  // User actions
  'onboarding_started': { source: string; timestamp: number };
  'message_sent': { messageLength: number; stepNumber: number };
  'quick_action_used': { actionType: string; stepNumber: number };
  'profile_field_updated': { fieldName: string; stepNumber: number };
  'signup_attempted': { profileCompleteness: number };
  'signup_completed': { conversionTime: number; totalMessages: number };
  
  // System events
  'agent_response_time': { responseTime: number; stepNumber: number };
  'session_expired': { duration: number; lastStep: number };
  'error_occurred': { errorType: string; stepNumber: number };
}
```

#### 9.2.2 A/B Testing Framework
- **Conversation Flow**: Test different question sequences
- **Signup CTAs**: Test placement and messaging of signup prompts
- **Quick Actions**: Test different response options
- **Conversion Timing**: Test when to show signup opportunities

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

#### 10.1.1 High Priority Risks
**Risk: Poor Conversion Rates**
- **Impact**: Low ROI on development investment, poor user acquisition
- **Mitigation**: Extensive A/B testing, conversion optimization, user feedback
- **Monitoring**: Conversion rates, drop-off points, user feedback

**Risk: Agent Response Quality**
- **Impact**: Poor onboarding experience, users don't complete signup
- **Mitigation**: Extensive testing of onboarding prompts, gradual rollout
- **Monitoring**: User satisfaction scores, completion rates

**Risk: Session Management Issues**
- **Impact**: Lost progress, poor user experience, data loss
- **Mitigation**: Robust session storage, clear timeout handling
- **Monitoring**: Session timeout rates, data loss incidents

#### 10.1.2 Medium Priority Risks
**Risk: Mobile Performance**
- **Impact**: Slow loading, poor user experience on mobile
- **Mitigation**: Progressive loading, code splitting, performance budgets
- **Monitoring**: Core Web Vitals, mobile-specific analytics

**Risk: Authentication Complexity**
- **Impact**: User friction, abandoned signups
- **Mitigation**: Seamless integration with existing auth, clear user flows
- **Monitoring**: Authentication success rates, user drop-off points

### 10.2 Business Risks

#### 10.2.1 User Adoption Risk
**Risk**: Users prefer direct signup over chat onboarding
- **Mitigation**: A/B testing, clear value proposition for chat experience
- **Strategy**: Position chat as personalized onboarding, not required step

**Risk**: Chat doesn't improve conversion vs direct signup
- **Mitigation**: Careful conversion tracking, quick iteration based on data
- **Strategy**: Focus on qualifying leads and improving signup quality

### 10.3 Mitigation Strategies

#### 10.3.1 Gradual Rollout Plan
1. **Beta Group**: Internal testing with team members
2. **Early Adopters**: 5% of active users with high engagement
3. **Segment Rollout**: 25% of users, monitor key metrics
4. **Full Launch**: 100% availability with feature flags

#### 10.3.2 Fallback Mechanisms
- **SMS Fallback**: Auto-redirect to SMS signup if chat fails
- **Simplified UI**: Graceful degradation for older browsers
- **Error Recovery**: Clear error messages with suggested actions
- **Support Integration**: Easy escalation to human support

## 11. Security & Privacy Considerations

### 11.1 Data Protection

#### 11.1.1 Message Security
- **Encryption**: TLS 1.3 for all WebSocket connections
- **Data Minimization**: Store only necessary message content
- **Retention Policy**: Align with existing SMS message retention
- **PII Handling**: Mask sensitive information in logs

#### 11.1.2 Authentication Security
- **JWT Security**: Short-lived tokens with refresh mechanism
- **Rate Limiting**: Prevent abuse of chat endpoints
- **CSRF Protection**: Include CSRF tokens for state-changing operations
- **Session Security**: Secure cookie flags, proper session invalidation

### 11.2 Privacy Compliance

#### 11.2.1 GDPR/CCPA Compliance
- **Data Portability**: Export chat history feature
- **Right to Deletion**: Include chat messages in user deletion
- **Consent Management**: Clear opt-in for chat feature
- **Data Processing**: Update privacy policy to include chat processing

#### 11.2.2 User Control
- **Message Deletion**: Allow users to delete specific messages
- **Data Download**: Export all chat data
- **Privacy Settings**: Control message retention periods
- **Opt-out**: Easy way to disable chat and return to SMS-only

## 12. Launch Strategy

### 12.1 Go-to-Market Approach

#### 12.1.1 Target User Segments
**Primary: New Visitors**
- First-time visitors to landing page
- Users who found GymText through marketing
- People researching fitness coaching options

**Secondary: Returning Visitors**
- Users who visited but didn't signup initially
- People comparing different fitness solutions
- Users who need more information before committing

**Tertiary: Referral Traffic**
- Users referred by existing customers
- People who heard about GymText through word-of-mouth
- Users with specific fitness goals mentioned by referrer

#### 12.1.2 Positioning Strategy
**Key Messages:**
- "Discover your personalized fitness plan in minutes"
- "Chat with an AI coach to build your perfect workout strategy"
- "Get to know GymText before you commit"
- "Personalized coaching starts with understanding you"

**Differentiation:**
- First fitness platform offering AI-powered onboarding chat
- Builds comprehensive profile through natural conversation
- Seamless transition from discovery to SMS coaching
- Removes friction from traditional signup forms

### 12.2 Launch Tactics

#### 12.2.1 Pre-Launch (2 weeks before)
- **Conversion Testing**: A/B test different onboarding flows
- **Content Creation**: Landing page copy, chat introduction sequences
- **Analytics Setup**: Ensure all conversion tracking is properly configured
- **Performance Testing**: Test chat performance under load

#### 12.2.2 Launch Week
- **Landing Page Integration**: Add "Try Free Chat" CTA to landing page
- **Marketing Campaigns**: Update ads to highlight interactive onboarding
- **Conversion Monitoring**: Close monitoring of signup conversion rates
- **Quick Iteration**: Rapid adjustments based on initial conversion data

#### 12.2.3 Post-Launch (4 weeks)
- **Conversion Optimization**: Continuous A/B testing and improvement
- **User Journey Analysis**: Deep dive into drop-off points and friction
- **Onboarding Refinement**: Improve questions and conversation flow
- **Success Metrics**: Measure impact on overall signup quality and quantity

## 13. Future Roadmap

### 13.1 Short-term Enhancements (Q1 2025)

#### 13.1.1 Advanced Onboarding Features
- **Goal Visualization**: Show users what their success could look like
- **Coaching Previews**: More detailed examples of GymText's coaching style
- **Social Proof Integration**: Dynamic testimonials based on user profile
- **Objection Handling**: Smarter responses to common concerns about SMS coaching

#### 13.1.2 Conversion Optimization
- **Dynamic Pricing**: Show different pricing based on user profile
- **Waitlist Features**: Create urgency through waitlist positioning
- **Referral Integration**: Allow users to get discounts for referrals during onboarding
- **Multi-step Checkout**: Reduce friction in the signup process

### 13.2 Medium-term Vision (Q2-Q3 2025)

#### 13.2.1 Personalization Engine
- **Adaptive Questioning**: AI that learns which questions work best for conversion
- **Profile Prediction**: Predict likely user needs based on partial information
- **Conversation Branching**: Multiple conversation paths based on user type
- **Success Likelihood Scoring**: Identify users most likely to succeed with coaching

#### 13.2.2 Integration Expansion
- **Fitness App Integration**: Connect with popular fitness tracking apps
- **Wearable Data**: Use existing fitness data to enhance onboarding
- **Calendar Integration**: Understand user schedule before coaching starts
- **Health Platform Sync**: Connect with Apple Health, Google Fit during onboarding

### 13.3 Long-term Aspirations (Q4 2025+)

#### 13.3.1 Platform Evolution
- **Voice Onboarding**: Voice-based onboarding for accessibility
- **Video Integration**: Show personalized workout examples during onboarding
- **Multi-language Support**: Onboarding in multiple languages
- **Local Adaptation**: Culturally adapted onboarding for different regions

#### 13.3.2 Business Model Evolution
- **White Label Onboarding**: License onboarding chat to other fitness businesses
- **Lead Generation**: High-quality fitness leads for partner businesses
- **Data Insights**: Anonymous insights about fitness onboarding best practices
- **Corporate Wellness Onboarding**: B2B onboarding flows for company wellness programs

## 14. Appendices

### 14.1 Technical Specifications Reference

#### 14.1.1 API Endpoint Specifications
```typescript
// POST /api/onboarding/chat
interface OnboardingMessageRequest {
  sessionId: string;
  message: string;
}

interface OnboardingMessageResponse {
  response: string;
  profileUpdated: boolean;
  suggestions?: QuickAction[];
  progressStep?: number;
  readyForSignup?: boolean;
}

// GET /api/onboarding/profile
interface OnboardingProfileResponse {
  profileData: PartialFitnessProfile;
  completeness: number;
  readyForSignup: boolean;
}

// POST /api/onboarding/signup
interface OnboardingSignupRequest {
  sessionId: string;
  phoneNumber: string;
  email: string;
}
```

#### 14.1.2 Session Data Format
```typescript
interface OnboardingSession {
  id: string;
  profileData: PartialFitnessProfile;
  messages: OnboardingMessage[];
  progressStep: number;
  startedAt: string;
  lastActiveAt: string;
  readyForSignup: boolean;
}
```

### 14.2 Design System Components

#### 14.2.1 Component Library
```typescript
// Core onboarding components
interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  profileUpdated?: boolean;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
}

interface SignupCTAProps {
  profileCompleteness: number;
  readyForSignup: boolean;
  onSignup: () => void;
}
```

### 14.3 Testing Specifications

#### 14.3.1 Test Coverage Requirements
- **Unit Tests**: >90% coverage for onboarding components and services
- **Integration Tests**: Full onboarding journey testing
- **E2E Tests**: Cross-browser compatibility testing
- **Conversion Tests**: A/B testing for different onboarding flows
- **Performance Tests**: Chat responsiveness under load

#### 14.3.2 User Acceptance Criteria
```gherkin
Feature: Onboarding Chat Interface
  Scenario: User completes onboarding
    Given I am on the landing page
    When I click "Try Free Chat"
    Then I should see a welcome message
    When I answer the onboarding questions
    Then I should see my profile being built
    And I should see progress toward completion
    When my profile is sufficient for coaching
    Then I should see a signup call-to-action
    When I complete signup
    Then I should be redirected to Stripe checkout
```

---

**Document Version**: 2.0 (Onboarding-Focused Revision)  
**Last Updated**: 2025-08-20  
**Next Review**: 2025-09-20  
**Owner**: GymText Product Team  
**Stakeholders**: Engineering, Design, Marketing, Growth