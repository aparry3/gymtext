# Phase 2 Testing Guide

## Prerequisites

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Ensure database is running**:
   - PostgreSQL should be running locally
   - Run migrations if needed: `npm run migrate:up`

3. **Set up test users** (optional):
   ```bash
   npx tsx scripts/setup-test-users.ts
   ```

## Quick Start Testing

### 1. Automated API Testing

Run the test script to test the complete workflow:

```bash
# Test the full user workflow
npx tsx scripts/test-phase2.ts workflow

# Test individual endpoints
npx tsx scripts/test-phase2.ts endpoints

# Test with a specific user ID
TEST_USER_ID=your-user-id npx tsx scripts/test-phase2.ts
```

### 2. Manual API Testing with curl

#### Step 1: Onboard User (Creates Program)
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "onboard",
    "userId": "YOUR_USER_ID"
  }'
```

#### Step 2: Generate Daily Workout
```bash
curl -X POST http://localhost:3000/api/workouts/daily \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID"
  }'
```

#### Step 3: List User's Programs
```bash
curl -X GET "http://localhost:3000/api/programs?userId=YOUR_USER_ID"
```

#### Step 4: Adapt Program
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "adapt-program",
    "userId": "YOUR_USER_ID",
    "programId": "PROGRAM_ID",
    "reason": "Traveling for 2 weeks",
    "feedback": "Need bodyweight exercises only"
  }'
```

## Testing Scenarios

### Scenario 1: New User Journey
1. Create a new user in the database
2. Run onboarding (should generate a program)
3. Request daily workout
4. Verify workout is from the generated program

### Scenario 2: Program Adaptation
1. Use existing user with active program
2. Request program adaptation for travel
3. Verify program is modified
4. Request daily workout
5. Verify workout reflects adaptations

### Scenario 3: Different User Types
Test with different skill levels and goals:

- **Beginner**: 3 days/week, basic equipment
- **Intermediate**: 4 days/week, home gym
- **Advanced**: 5-6 days/week, full gym
- **Traveler**: Bodyweight focus

### Scenario 4: Edge Cases
1. User without fitness profile
2. Invalid user ID
3. Missing program ID for adaptation
4. Regenerating workouts

## Using Postman or Insomnia

### Import these endpoints:

1. **Onboard User**
   - Method: POST
   - URL: `http://localhost:3000/api/agent`
   - Body:
     ```json
     {
       "action": "onboard",
       "userId": "{{userId}}"
     }
     ```

2. **Generate Daily Workout**
   - Method: POST
   - URL: `http://localhost:3000/api/workouts/daily`
   - Body:
     ```json
     {
       "userId": "{{userId}}"
     }
     ```

3. **Generate Program**
   - Method: POST
   - URL: `http://localhost:3000/api/programs/generate`
   - Body:
     ```json
     {
       "userId": "{{userId}}",
       "preferences": {
         "programType": "strength",
         "duration": 12
       }
     }
     ```

4. **List Programs**
   - Method: GET
   - URL: `http://localhost:3000/api/programs?userId={{userId}}`

5. **Adapt Program**
   - Method: POST
   - URL: `http://localhost:3000/api/agent`
   - Body:
     ```json
     {
       "action": "adapt-program",
       "userId": "{{userId}}",
       "programId": "{{programId}}",
       "reason": "Your adaptation reason",
       "feedback": "User feedback"
     }
     ```

## Debugging Tips

### Check Server Logs
The development server will show:
- API requests received
- Orchestrator mode execution
- AI agent calls
- Any errors

### Common Issues

1. **"User not found"**
   - Ensure user exists in database
   - Check user ID is correct format (UUID)

2. **"No active program found"**
   - User needs to be onboarded first
   - Check if program generation succeeded

3. **"Failed to generate workout session"**
   - Check LLM API keys are configured
   - Verify AI agent responses

4. **Database placeholders**
   - Many responses show "not yet implemented"
   - This is expected until database integration

### Environment Variables
Ensure these are set in `.env.local`:
```
# Required for AI agents
GOOGLE_AI_API_KEY=your-key-here
# OR
OPENAI_API_KEY=your-key-here

# For SMS testing (optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_NUMBER=+1234567890
```

## Expected Responses

### Successful Onboarding
```json
{
  "success": true,
  "message": "User onboarded and program generated successfully",
  "programId": "generated-program-id"
}
```

### Successful Daily Workout
```json
{
  "success": true,
  "message": "Daily workout delivered successfully",
  "workout": {
    "sessionId": "temp-id",
    "programId": "program-123",
    "weekNumber": 1,
    "dayOfWeek": 3,
    "workout": "Formatted workout text...",
    "equipment": ["barbell", "dumbbells"]
  }
}
```

### Program List (Placeholder)
```json
{
  "programs": [],
  "message": "Program listing not yet implemented"
}
```

## Next Steps After Testing

1. **Monitor AI Usage**: Check API usage for OpenAI/Google AI
2. **Review Generated Content**: Ensure workouts make sense
3. **Test SMS Delivery**: If Twilio is configured
4. **Database Integration**: Implement storage layer
5. **Add Automated Tests**: Create Jest/Vitest test suite