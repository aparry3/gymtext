# Profile Patch Tool Requirements

## Overview
Create a tool that allows the chat agent to intelligently update user fitness profiles based on conversation context. The tool will apply patches to the user's profile JSONB data and maintain an audit trail in the `profile_updates` table.

## Requirements

### 1. Core Functionality

#### 1.1 Profile Patching
- Accept a partial profile object as a patch
- Deep merge the patch with existing profile data
- Preserve existing data not included in the patch
- Handle nested objects correctly (e.g., `availability.daysPerWeek`)
- Support both setting new fields and updating existing ones
- Handle null values to explicitly clear fields

Example patch:
```json
{
  "availability": {
    "daysPerWeek": 5,
    "preferredTimes": "morning"
  },
  "equipment": {
    "access": "full-gym",
    "location": "Gold's Gym"
  }
}
```

#### 1.2 Audit Trail
Every patch must create a record in `profile_updates` table with:
- `user_id` - The user being updated
- `patch` - The exact patch applied (JSONB)
- `path` - Optional JSON path to the specific field updated
- `source` - Origin of the update ('chat', 'form', 'admin', 'api', 'system')
- `reason` - Optional explanation of why the update was made
- `created_at` - Timestamp of the update

### 2. Implementation Architecture

#### 2.1 Service Layer (`src/server/services/profilePatchService.ts`)
```typescript
class ProfilePatchService {
  async patchProfile(
    userId: string,
    patch: Partial<FitnessProfile>,
    metadata: {
      source: 'chat' | 'form' | 'admin' | 'api' | 'system';
      reason?: string;
      path?: string;
    }
  ): Promise<UserWithProfile>
}
```

#### 2.2 Repository Updates (`src/server/repositories/userRepository.ts`)
- Add method `patchProfile(userId: string, patch: object): Promise<User>`
- Use PostgreSQL JSONB merge operator: `profile = profile || $1::jsonb`
- Return updated user with merged profile

#### 2.3 Repository for Profile Updates (`src/server/repositories/profileUpdateRepository.ts`)
- New repository for the `profile_updates` table
- Method: `create(update: NewProfileUpdate): Promise<ProfileUpdate>`
- Method: `getUserUpdates(userId: string, limit?: number): Promise<ProfileUpdate[]>`

#### 2.4 LangChain Tool (`src/server/agents/tools/profilePatchTool.ts`)
```typescript
const profilePatchTool = new DynamicStructuredTool({
  name: 'update_user_profile',
  description: 'Update user fitness profile based on conversation',
  schema: ProfilePatchSchema,
  func: async ({ updates, reason }) => {
    // Call ProfilePatchService
    // Return confirmation message
  }
});
```

### 3. Validation & Safety

#### 3.1 Input Validation
- Use Zod schemas for patch validation
- Ensure patch conforms to `FitnessProfileSchema.partial()`
- Validate enum values (e.g., `equipment.access`, `preferences.coachingTone`)
- Validate ranges (e.g., `age` between 13-120, `daysPerWeek` between 1-7)

#### 3.2 Conflict Resolution
- Latest update wins (no complex merge conflicts)
- Each patch is atomic and complete
- No field-level locking needed

#### 3.3 Data Integrity
- Never overwrite entire profile, only merge patches
- Preserve fields not mentioned in patch
- Handle deep nesting correctly
- Maintain backward compatibility with legacy fields

### 4. Chat Agent Integration

#### 4.1 When to Use
The chat agent should use this tool when:
- User explicitly provides profile information
- User corrects previous information
- User mentions changes to their situation
- New constraints or preferences are revealed

#### 4.2 Confidence Levels
- 0.9-1.0: Direct, explicit statements ("I go to the gym 5 days a week")
- 0.7-0.89: Strong implications ("I usually work out in the mornings")
- 0.5-0.69: Moderate confidence, context-based inference
- 0.3-0.49: Low confidence, may need clarification
- Below 0.3: Don't update, ask for clarification

#### 4.3 Tool Schema for LLM
```typescript
const ProfilePatchSchema = z.object({
  updates: FitnessProfileSchema.partial(),
  reason: z.string().describe("Brief explanation of why these updates are being made"),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0-1")
});
```

### 5. Examples

#### Example 1: Availability Update
User: "I can now train 5 days a week in the mornings"
```json
{
  "updates": {
    "availability": {
      "daysPerWeek": 5,
      "preferredTimes": "morning"
    }
  },
  "reason": "User updated training availability",
  "confidence": 0.95
}
```

#### Example 2: Equipment Change
User: "I just joined Gold's Gym, so I have access to everything now"
```json
{
  "updates": {
    "equipment": {
      "access": "full-gym",
      "location": "Gold's Gym",
      "items": ["barbell", "dumbbells", "machines", "cables", "cardio"]
    }
  },
  "reason": "User joined a commercial gym",
  "confidence": 1.0
}
```

#### Example 3: Constraint Addition
User: "My lower back has been bothering me lately"
```json
{
  "updates": {
    "constraints": [{
      "id": "constraint_[timestamp]",
      "type": "injury",
      "label": "Lower back discomfort",
      "severity": "mild",
      "affectedAreas": ["lower-back"],
      "status": "active",
      "startDate": "[current_date]"
    }]
  },
  "reason": "User reported lower back discomfort",
  "confidence": 0.75
}
```

### 6. Testing Strategy

#### 6.1 Unit Tests
- Test deep merge logic with various patch scenarios
- Test validation with invalid patches
- Test audit trail creation

#### 6.2 Integration Tests
- Test full flow from chat agent to database
- Test concurrent updates
- Test with real PostgreSQL JSONB operations

#### 6.3 LLM Testing
- Test tool usage in simulated conversations
- Verify appropriate confidence levels
- Test extraction of profile information from natural language

### 7. Migration & Rollout

#### 7.1 Database Already Ready
- `profile_updates` table already exists from migration
- `users.profile` column is JSONB and ready

#### 7.2 Rollout Plan
1. Implement ProfilePatchService and repositories
2. Add comprehensive tests
3. Create LangChain tool
4. Integrate into chat agent with feature flag
5. Test with sample conversations
6. Enable gradually for users

### 8. Monitoring & Observability

#### 8.1 Metrics to Track
- Number of profile updates per user
- Most commonly updated fields
- Update sources distribution
- Failed update attempts

#### 8.2 Logging
- Log all profile patches with user ID and source
- Log validation failures
- Log merge operations for debugging

### 9. Future Enhancements

- Batch updates for multiple fields
- Undo/rollback functionality using profile_updates history
- Automatic profile enrichment from workout completion data
- Profile completeness scoring
- Suggested questions based on missing profile fields
- Profile versioning for A/B testing different structures