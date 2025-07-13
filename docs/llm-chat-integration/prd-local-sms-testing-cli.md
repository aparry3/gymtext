# Product Requirements Document: Local SMS Testing CLI

## Overview
This document outlines the requirements for creating a CLI tool to test the `/api/sms` endpoint locally, bypassing the need for Twilio webhooks during development. This will enable developers to simulate SMS interactions without deploying changes or configuring webhook forwarding.

## Problem Statement
Currently, testing SMS functionality requires:
- Deploying changes to production/staging
- Using Twilio webhook forwarding tools (e.g., ngrok)
- Sending actual SMS messages through Twilio
- Waiting for webhook callbacks

This creates a slow feedback loop and makes debugging difficult.

## Proposed Solution
Create a CLI script that simulates Twilio webhook requests to the local `/api/sms` endpoint, allowing developers to:
- Test SMS conversations locally
- Simulate different phone numbers and messages
- Debug the chat service without external dependencies
- Rapidly iterate on conversation flows

## Functional Requirements

### 1. CLI Interface
- **Command**: `npm run sms:test` or `pnpm sms:test`
- **Arguments**:
  - `--phone` or `-p`: Phone number (required)
  - `--message` or `-m`: Message content (required)
  - `--sid`: Optional Message SID (auto-generated if not provided)
  - `--url`: API endpoint URL (defaults to http://localhost:3000/api/sms)

### 2. Usage Examples
```bash
# Basic usage
npm run sms:test -- --phone "+1234567890" --message "What's my workout today?"

# Short flags
npm run sms:test -- -p "+1234567890" -m "Can I skip leg day?"

# With custom message SID
npm run sms:test -- -p "+1234567890" -m "I completed my workout!" --sid "SM123456"

# Custom endpoint (for testing staging)
npm run sms:test -- -p "+1234567890" -m "Hello" --url "https://staging.gymtext.co/api/sms"
```

### 3. Request Simulation
The CLI should:
- Format data as Twilio webhook FormData
- Include all required Twilio webhook fields:
  - `Body`: Message content
  - `From`: Phone number
  - `MessageSid`: Unique message identifier
  - `To`: GymText's Twilio number (can be mocked)
  - Additional Twilio fields as needed
- Send POST request with correct headers
- Parse and display the TwiML response

### 4. Response Handling
- Display the SMS response in a readable format
- Show response time for performance monitoring
- Handle and display errors gracefully
- Option to show raw TwiML response with `--raw` flag

### 5. Interactive Mode (Future Enhancement)
- `npm run sms:chat` for continuous conversation
- Maintains session context
- Allows back-and-forth messaging
- Exit with `quit` or Ctrl+C

## Technical Requirements

### 1. Implementation Details
- **Location**: `/scripts/test-sms.ts`
- **Language**: TypeScript with tsx for execution
- **Dependencies**: 
  - Node.js built-in `fetch` or `axios` for HTTP requests
  - `commander` or `yargs` for CLI argument parsing
  - `chalk` for colored output
  - `xml2js` or similar for parsing TwiML responses

### 2. Package.json Scripts
```json
{
  "scripts": {
    "sms:test": "tsx scripts/test-sms.ts",
    "sms:chat": "tsx scripts/test-sms.ts --interactive"
  }
}
```

### 3. Configuration
- Read Twilio number from environment variables
- Support `.env.local` for local configuration
- Allow overriding defaults via CLI flags

### 4. Error Handling
- Validate phone number format
- Check if local server is running
- Handle network errors gracefully
- Provide helpful error messages

## User Experience

### 1. Success Flow
```
$ npm run sms:test -- -p "+1234567890" -m "What's today's workout?"

📱 Sending SMS to local endpoint...
From: +1234567890
Message: "What's today's workout?"

✅ Response received (124ms):
"Today is leg day! You have: Squats 4x8, Romanian Deadlifts 3x10, Lunges 3x12 each leg. Ready to start?"
```

### 2. Error Flow
```
$ npm run sms:test -- -p "+1234567890" -m "Hello"

📱 Sending SMS to local endpoint...
From: +1234567890
Message: "Hello"

❌ Error: Connection refused
Is your local server running? Try: npm run dev
```

### 3. Verbose Mode
With `--verbose` or `-v` flag:
- Show full request headers
- Display FormData contents
- Show raw TwiML response
- Include timing breakdown

## Benefits
- **Faster Development**: No deployment needed for testing
- **Better Debugging**: Direct access to logs and errors
- **Cost Savings**: No actual SMS charges during development
- **Consistency**: Reproducible test scenarios
- **CI/CD Integration**: Can be used in automated tests

## Implementation Phases

### Phase 1: Basic CLI Tool
- Command-line argument parsing
- FormData request formatting
- Basic response display
- Error handling

### Phase 2: Enhanced Features
- Interactive chat mode
- Response time tracking
- Colored output
- Verbose debugging mode

### Phase 3: Testing Integration
- Integration with test suite
- Fixture support for common scenarios
- Response assertions
- Performance benchmarking

## Success Metrics
- Reduction in SMS testing time
- Fewer production bugs related to SMS functionality
- Developer satisfaction with testing workflow
- Adoption rate among team members

## Security Considerations
- Ensure test script only works with local/staging endpoints by default
- Add confirmation prompt for production URLs
- Don't log sensitive information in verbose mode
- Respect rate limiting even in local testing

## Future Enhancements
- Web UI for SMS testing
- Conversation history browser
- Test scenario recorder/playback
- Integration with Postman/Insomnia
- Mock user profiles for testing