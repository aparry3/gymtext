# Product Requirements Document: SMS Chat Integration

## Overview
This document outlines the requirements for enhancing the `/api/sms` endpoint to support conversational interactions via SMS using a chat-based LLM, replacing the current simple string concatenation response.

## Current State
The `/api/sms` endpoint currently:
- Receives incoming SMS messages via Twilio webhook
- Extracts user information based on phone number
- Returns a simple concatenated response: `${user.name} said: ${incomingMessage}`
- Returns a signup link for unregistered users

## Proposed Solution
Transform the SMS endpoint into an intelligent conversational interface that:
- Processes incoming messages through a chat LLM
- Maintains conversation context
- Provides personalized fitness-related responses
- Handles various user intents (workout queries, progress updates, modifications)

## Functional Requirements

### 1. LLM Integration
- **Chat Model**: Integrate with OpenAI GPT-4 or Google Gemini (consistent with existing AI agents)
- **Context Management**: Maintain conversation history per user
- **System Prompt**: Define fitness coach persona aligned with GymText's workout generation style

### 2. Conversation Features
- **Workout Queries**: Answer questions about scheduled workouts, exercises, or modifications
- **Progress Tracking**: Accept and process workout completion updates, feedback
- **Exercise Guidance**: Provide form tips, alternatives for exercises
- **Schedule Management**: Handle requests to reschedule or modify workout plans
- **General Fitness Q&A**: Answer fitness-related questions within scope

### 3. Message Processing
- **Input Validation**: Sanitize and validate incoming messages
- **Intent Recognition**: Identify user intent to route appropriately
- **Response Generation**: Generate contextual, helpful responses
- **Character Limits**: Ensure responses fit within SMS constraints (160 characters or multi-part)

### 4. Data Integration
- **User Context**: Access user's fitness profile, current workout plan, history
- **Workout Data**: Reference user's scheduled workouts and exercise library
- **Progress Data**: Include workout logs and completion status

### 5. Error Handling
- **Graceful Degradation**: Fallback responses for LLM failures
- **Rate Limiting**: Prevent abuse of the chat system
- **Unknown Intents**: Helpful responses for out-of-scope queries

## Technical Requirements

### 1. Architecture Changes
- Create new chat service module in `/src/server/services/`
- Implement conversation state management (consider Redis or database storage)
- Add chat-specific prompt templates in `/src/server/prompts/`

### 2. Database Schema
- Add `conversations` table to store chat history
- Include fields: user_id, message_id, role (user/assistant), content, timestamp
- Consider message threading for conversation continuity

### 3. API Modifications
- Enhance `/api/sms/route.ts` to call chat service
- Maintain backward compatibility with Twilio webhook format
- Add proper TypeScript types for chat interactions

### 4. Configuration
- Add environment variables for LLM API configuration
- Configure token limits and response constraints
- Set up conversation retention policies

## User Experience

### 1. Onboarding
- First-time users receive welcome message explaining chat capabilities
- Existing users notified of new chat features

### 2. Example Interactions
```
User: "What's my workout today?"
Bot: "Today is leg day! You have: Squats 4x8, Romanian Deadlifts 3x10, Lunges 3x12 each leg. Ready to start?"

User: "Can I substitute squats?"
Bot: "Sure! Try goblet squats or leg press instead. Both target similar muscles with less strain on your back."

User: "Completed workout, legs are dead 💀"
Bot: "Great job finishing leg day! I've logged your workout. Remember to stretch and hydrate. Rest day tomorrow!"
```

### 3. Response Guidelines
- Keep responses concise and actionable
- Use encouraging, supportive tone
- Include relevant emojis sparingly
- Respect SMS character limits

## Success Metrics
- User engagement rate (messages per user per week)
- Response satisfaction (based on follow-up messages)
- Workout completion rates
- Reduction in support inquiries

## Security & Privacy
- No storage of sensitive health information in messages
- Implement message encryption at rest
- Add rate limiting per phone number
- Log monitoring for abuse detection

## Implementation Phases

### Phase 1: Basic Chat Integration
- LLM integration with simple prompts
- Basic conversation handling
- User context loading

### Phase 2: Enhanced Features
- Conversation memory
- Intent recognition
- Workout data integration

### Phase 3: Advanced Capabilities
- Multi-turn conversations
- Proactive check-ins
- Analytics and insights

## Dependencies
- Existing LLM provider (OpenAI/Gemini) API access
- Database migration for conversation storage
- Potential Redis instance for conversation state

## Out of Scope
- Voice transcription
- Image/media processing
- Real-time coaching during workouts
- Medical/injury advice
- Nutrition planning details