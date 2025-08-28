# Profile Agent Issues and Solution

## Current Issues Identified

### 1. Incomplete System Prompt Context
- The system prompt is built using only `currentProfile` but not `currentUser` 
- The agent receives `currentUser` as a parameter but never uses it in prompt generation
- This means the AI has no context about the user's current name, email, or phone number when making update decisions

### 2. Missing Tool Documentation in System Prompt
- The system prompt only mentions the `update_user_profile` tool (line 23 in prompts.ts)
- However, the agent has access to TWO tools:
  - `update_user_profile` (profilePatchTool) - for fitness-related information
  - `update_user_info` (userInfoPatchTool) - for contact information (name, email, phone)
- The agent doesn't know about the second tool, leading to missed opportunities for contact info updates

### 3. Tool Purpose Separation
From analyzing the tools, they serve distinct purposes:

**profilePatchTool** (`update_user_profile`):
- Fitness profile information (goals, availability, equipment, metrics, constraints)
- Uses FitnessProfile schema
- Confidence threshold: 0.75+

**userInfoPatchTool** (`update_user_info`):  
- Contact information (name, email, phoneNumber)
- Uses User schema subset
- Confidence threshold: 0.75+
- Handles phone number normalization

## Proposed Solution

### 1. Update System Prompt Builder
Modify `buildUserProfileSystemPrompt()` to accept both `currentProfile` AND `currentUser`:

```typescript
export const buildUserProfileSystemPrompt = (
  currentProfile: Partial<FitnessProfile> | null,
  currentUser: Partial<User> | null = null
): string => {
  // Include both profile AND user context in prompt
}
```

### 2. Enhanced System Prompt Content
The system prompt should:
- Document BOTH available tools and their purposes
- Include current user contact information context
- Clarify when to use each tool
- Maintain existing confidence scoring guidelines

### 3. Update Chain Implementation
Modify the agent chain to pass `currentUser` to the prompt builder:

```typescript
// Current (line 91):
const systemPrompt = buildUserProfileSystemPrompt(currentProfile);

// Updated:
const systemPrompt = buildUserProfileSystemPrompt(currentProfile, currentUser);
```

## Benefits of This Approach

1. **Complete Context**: AI can make better decisions with full user information
2. **Contact Info Updates**: Can extract and update user contact details from conversations
3. **Tool Awareness**: AI knows about both tools and their specific purposes
4. **Backwards Compatible**: Existing functionality remains unchanged
5. **Type Safety**: Leverages existing schemas and validation

## Implementation Priority

**High Priority**:
- Update system prompt to include both tools
- Pass currentUser to prompt builder
- Add currentUser context to prompt

**Medium Priority**:  
- Enhanced examples in prompt for contact info extraction
- Better tool selection guidance in prompt

This solution addresses the core issues while maintaining the existing architecture and improving the agent's capability to handle both fitness and contact information updates.