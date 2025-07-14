# GymText Current Architecture Analysis

## Overview

This document provides a comprehensive analysis of GymText's current architecture, focusing on the agent system, chat functionality, and workout data structures. This analysis serves as a reference for future development and system improvements.

## System Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Kysely ORM
- **AI/LLM**: Google Gemini 2.0 Flash (primary), OpenAI (embeddings)
- **Vector Database**: Pinecone
- **SMS**: Twilio
- **Payments**: Stripe

## Agent System Architecture

### Current Implementation
The system uses a **decomposed agent architecture** with two main agents:

1. **Fitness Outline Agent** (`fitnessOutlineAgent.ts`)
   - Handles user onboarding and initial workout plan creation
   - Stores user fitness profile and workout outline in Pinecone
   - Generates and sends welcome SMS

2. **Workout Generator Agent** (`workoutGeneratorAgent.ts`)
   - Generates weekly workout plans
   - Retrieves context from vector database
   - Sends daily workouts via SMS

### Agent Communication Pattern
- No direct inter-agent communication
- Shared state through:
  - PostgreSQL (user data)
  - Pinecone vector database (fitness profiles, workout outlines)
- Event-driven through API endpoints

### Agent Workflow

#### Onboarding Flow:
```
API Request (/api/agent - action: "onboard")
    ↓
Fitness Outline Agent
    ↓
Fetch User Profile from PostgreSQL
    ↓
Generate Fitness Summary
    ↓
Store in Pinecone Vector DB
    ↓
Generate Workout Outline with LLM
    ↓
Store Outline in Vector DB
    ↓
Send Welcome SMS
```

#### Workout Generation Flow:
```
API Request (/api/agent - action: "weekly")
    ↓
Workout Generator Agent
    ↓
Recall Workout Outline from Vector DB
    ↓
Generate Daily Workouts with LLM
    ↓
Send Today's Workout via SMS
```

### Key Design Decisions
- **Stateless agents**: Each execution retrieves full context
- **Vector storage as shared memory**: Pinecone acts as long-term memory
- **Simple orchestration**: No complex state machine or workflow engine
- **LangChain for structure**: Uses RunnableSequence for step composition

## Chat/Conversation System

### Architecture Components

#### 1. SMS Handler (`/api/sms/route.ts`)
- Entry point for all incoming SMS messages
- Validates user registration
- Triggers message storage and response generation
- Returns TwiML response to Twilio

#### 2. Conversation Storage Service
- **Circuit Breaker Pattern**: Protects against storage failures
- **Non-blocking Operations**: SMS delivery continues even if storage fails
- **Conversation Management**: 
  - Creates new conversations after 30-minute gaps
  - Tracks message count and timestamps
  - Marks old conversations as inactive

#### 3. Conversation Context Service
- **Context Building**:
  - Recent message history (5 messages default)
  - User fitness profile
  - Workout history (last 3 workouts)
  - Conversation metadata
- **Caching Support**: Redis implementation planned for Phase 2.5
- **Token Management**: Handles message truncation for LLM limits

#### 4. Chat Service
- **LLM Integration**: Google Gemini 2.0 Flash
- **Token Limits**: 
  - Max output: 1000 tokens
  - SMS max length: 1600 characters
- **System Prompt**: Fitness coach personality from templates

### Message Flow
```
Incoming SMS
    ↓
Twilio Webhook → /api/sms/route.ts
    ↓
User Validation
    ↓
Store Inbound Message (Non-blocking)
    ↓
Build Conversation Context
    ↓
Generate AI Response
    ↓
Store Outbound Message (Non-blocking)
    ↓
Send TwiML Response
```

### Database Schema

#### conversations
- `id`: UUID primary key
- `user_id`: References users
- `started_at`, `last_message_at`: Timestamps
- `status`: active/inactive/archived
- `message_count`: Integer
- `metadata`: JSONB

#### messages
- `id`: UUID primary key
- `conversation_id`: References conversations
- `direction`: inbound/outbound
- `content`: Text
- `twilio_message_sid`: String
- Indexed for performance

#### conversation_topics
- Future feature for AI-driven topic extraction
- `topic`: String
- `confidence`: Float

## Workout Data Architecture

### Data Model Hierarchy

```
Workout Programs (multi-week plans)
    ↓
Program Phases (e.g., "Strength Building")
    ↓
Program Weeks
    ↓
Program Sessions (individual workouts)
    ↓
Exercise Blocks (main/accessory/core)
    ↓
Exercises with Sets/Reps/Intensity
```

### Database Tables

#### workouts
- Stores individual workout sessions
- `exercises`: JSONB field with structured exercise data
- Can be standalone or linked to program sessions

#### workout_logs
- Tracks user completion and feedback
- Links to specific workouts
- Stores rating (1-5) and text feedback

#### workout_programs
- Multi-week structured programs
- Program types: strength, hypertrophy, endurance, hybrid
- Goals stored as JSONB with primary/secondary objectives

#### program_sessions
- Individual training sessions within programs
- Detailed exercise structure in JSONB

### Exercise Data Structure

```json
{
  "blockType": "main",
  "blockLabel": "A",
  "exercises": [
    {
      "name": "Barbell Bench Press",
      "category": "compound",
      "sets": [
        {
          "setNumber": 1,
          "reps": "5",
          "intensity": "70%"
        }
      ],
      "equipmentNeeded": ["barbell", "bench"]
    }
  ]
}
```

### Current vs Planned Implementation

**Current (AI-Generated)**:
- Simple text-based workout descriptions
- Basic equipment list
- Generated dynamically by agents

**Database Support (Programs)**:
- Highly structured exercise data
- Progressive overload tracking
- Multi-phase programming
- Detailed set/rep/intensity prescriptions

## Key Architectural Insights

### Strengths
1. **Resilient Design**: Circuit breakers, non-blocking operations
2. **Flexible Data Model**: JSONB allows evolving exercise structures
3. **Clean Separation**: Agents, chat, and data layers are well-separated
4. **Extensible**: Easy to add new agents or conversation features

### Current Limitations
1. **Simple Workout Generation**: Text-based vs structured data
2. **No Agent Orchestration**: Limited complex workflow support
3. **Missing Features**: 
   - No workout delivery tracking implementation
   - No program progression logic
   - Limited context window for conversations

### Architecture Patterns
1. **Event-Driven**: API endpoints trigger agent actions
2. **Shared Nothing**: Agents don't share runtime state
3. **Repository Pattern**: Clean data access through services
4. **Factory Pattern**: LLM and vector store creation

## Future Considerations

### Immediate Improvements
1. Implement structured workout generation in agents
2. Add workout delivery tracking
3. Enhance conversation context with more history

### Medium-term Enhancements
1. Redis caching for conversation contexts
2. Agent orchestration for complex workflows
3. Program progression automation
4. AI-driven conversation summarization

### Long-term Vision
1. Multi-modal interactions (images, voice)
2. Real-time workout adjustments
3. Advanced analytics and insights
4. Integration with wearables/fitness apps

## Configuration

### Key Environment Variables
- `CONVERSATION_TIMEOUT_MINUTES`: 30 (default)
- `ENABLE_CONVERSATION_STORAGE`: true
- `LLM_MAX_OUTPUT_TOKENS`: 1000
- `SMS_MAX_LENGTH`: 1600
- `CONTEXT_MESSAGE_HISTORY_LIMIT`: 5

### Feature Flags
- Conversation storage (enabled)
- Redis caching (planned)
- AI summarization (planned)

## Technical Debt

1. **CLAUDE.md Discrepancy**: Documentation mentions non-existent files
2. **Type Generation**: workout_deliveries in types but not migrations
3. **Token Counting**: Tiktoken disabled, using estimation
4. **Error Handling**: Some areas need more robust error recovery

## Conclusion

GymText has a solid foundation with clear separation of concerns and resilient design patterns. The main opportunity is bridging the gap between the simple AI-generated workouts and the sophisticated program structure already supported by the database. The conversation system is well-designed for future enhancements while maintaining current functionality.