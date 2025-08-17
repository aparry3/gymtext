# Chat Interface Product Requirements Document

## Overview
Build a conversational chat interface at `/chat` that provides an AI-powered onboarding experience for users to create their fitness profile through natural conversation rather than traditional forms.

## User Experience Requirements

### Initial State
- Clean, centered interface similar to ChatGPT/Claude
- Single text input box in center of screen
- Placeholder text: "What are your fitness goals?"
- Minimalist design matching existing application aesthetic

### Active Chat State
- Transition to full chat interface after first message
- Message history displayed above input
- User messages aligned right
- AI assistant messages aligned left
- Real-time streaming responses with typing indicators
- Persistent input box at bottom of screen
- Auto-scroll to latest message

## Technical Requirements

### Frontend Components
- **Location**: `/app/chat/page.tsx`
- **Components**: 
  - `ChatInterface` - Main container component
  - `MessageList` - Displays conversation history
  - `MessageInput` - Input field with send functionality
  - `Message` - Individual message component
  - `StreamingMessage` - Component for displaying streaming responses

### Backend Architecture

#### API Route
- **Location**: `/app/api/chat/route.ts`
- **Method**: POST with streaming response
- **Responsibilities**:
  - Validate incoming messages
  - Call chat service
  - Return streaming response

#### Service Layer
- **Location**: `/server/services/chatInterfaceService.ts`
- **Responsibilities**:
  - Orchestrate conversation flow
  - Manage session state
  - Delegate LLM interactions to agents
  - Handle business logic for profile creation

#### Agent Layer
- **Location**: `/server/agents/onboarding/chain.ts`
- **Responsibilities**:
  - LLM prompt management
  - Conversation context handling
  - Streaming response generation
  - Tool integration for profile saving

### Data Flow
1. User enters message in chat interface
2. Frontend sends POST to `/api/chat`
3. API route calls `ChatInterfaceService`
4. Service delegates to onboarding agent
5. Agent processes with LLM and returns streaming response
6. Service handles any business logic
7. API streams response back to frontend
8. Frontend displays streaming message in real-time

## Functional Requirements

### Phase 1: Basic Chat Experience
- Accept user input
- Generate contextual responses about fitness goals
- Maintain conversation history in session
- Display streaming responses
- Basic error handling

### Phase 2: Profile Building (Future)
- Integrate LangChain tools for data extraction
- Save user account via `UserRepository`
- Save fitness profile via `FitnessProfileRepository`
- Progressive information gathering
- Validation of collected data

### Phase 3: Advanced Features (Future)
- Multi-modal inputs (voice, images)
- Progress indicators for profile completion
- Smart suggestions based on partial information
- Integration with existing SMS chat history

## Non-Functional Requirements

### Performance
- Response streaming starts within 1 second
- Smooth typing animation
- No UI blocking during message processing
- Efficient message history rendering

### User Experience
- Mobile-responsive design
- Keyboard shortcuts (Enter to send)
- Clear visual feedback for all actions
- Graceful error handling with user-friendly messages

### Security
- Input sanitization
- Rate limiting
- Authentication integration (when available)
- Secure session management

## Technical Specifications

### LLM Provider
- Use existing provider infrastructure (Google Gemini/OpenAI)
- Leverage streaming capabilities
- Implement through agent pattern per architecture

### State Management
- Session-based conversation storage
- Local state for UI interactions
- Consider Redux/Zustand for complex state (Phase 2+)

### Database Schema (Phase 2)
- Leverage existing tables:
  - `conversations` - Store chat conversations
  - `messages` - Individual messages
  - `users` - User accounts
  - `fitness_profiles` - Generated profiles

## Implementation Guidelines

### Follow Existing Patterns
- Use repository pattern for data access
- Implement service layer for business logic
- Create dedicated agent for LLM interactions
- Maintain TypeScript type safety throughout

### Code Organization
```
src/
├── app/
│   └── chat/
│       ├── page.tsx           # Main chat page
│       └── components/        # Chat-specific components
├── app/api/
│   └── chat/
│       └── route.ts          # Chat API endpoint
├── server/
│   ├── agents/
│   │   └── onboarding/
│   │       └── chain.ts      # Onboarding chat agent
│   └── services/
│       └── chatInterfaceService.ts  # Chat business logic
```

### Testing Requirements
- Unit tests for service layer
- Component tests for UI elements
- Integration tests for chat flow
- Mock agent responses for testing

## Success Metrics
- User engagement rate with chat vs traditional forms
- Profile completion rate
- Quality of extracted fitness information
- User satisfaction scores
- Time to profile completion

## Dependencies
- Existing agent architecture
- Repository layer for data persistence
- LLM provider infrastructure
- Streaming API support in chosen LLM provider

## Risks and Mitigations
- **Risk**: Incomplete information extraction
  - **Mitigation**: Implement validation and follow-up questions
- **Risk**: Poor mobile experience
  - **Mitigation**: Mobile-first design approach
- **Risk**: LLM response latency
  - **Mitigation**: Streaming responses and loading states
- **Risk**: Context loss in long conversations
  - **Mitigation**: Implement conversation summarization

## Future Considerations
- Voice input/output capabilities
- Integration with fitness tracking devices
- Personalized conversation styles
- Multi-language support
- Export conversation history
- Integration with SMS chat for unified experience