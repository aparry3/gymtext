# Phone Number Cleanup and Standardization Plan

## Executive Summary

This document outlines the plan to clean up duplicate phone number fields in the user model and ensure consistent US-based phone number formatting throughout the GymText application. Since backward compatibility is not required, we will consolidate to a single `phoneNumber` field and implement consistent +1 (US) phone number formatting.

## Current State Analysis

### Database Schema (✅ Already Correct)
- **users** table has `phone_number` column (varchar(20), not null, unique)
- No duplicate `phone` column in database

### Code Issues Identified

#### 1. Schema Duplication
**Location**: `src/server/models/user/schemas.ts`
- Lines 10-12: Defines both `phoneNumber` and `phone` fields
- Lines 229-231: `CreateUserSchema` accepts either field
- Comment indicates backward compatibility, but it's no longer needed

#### 2. Inconsistent Phone Formatting Logic
**Multiple implementations exist:**

**SignUp Component** (`src/components/pages/SignUp/index.tsx`):
- Lines 58, 169, 171, 183: Adds `+1` prefix if not present
- ✅ **Correct US formatting**

**Common Utils** (`scripts/utils/common.ts`):
- Lines 127-142: `parsePhoneNumber()` function 
- Adds `+1` for 10-digit numbers, `+` for others
- ✅ **Correct US formatting**

**UserInfoPatchTool** (`src/server/agents/tools/userInfoPatchTool.ts`):
- Lines 7-14: `normalizePhoneNumber()` function
- Only adds `+` prefix, doesn't enforce US format
- ❌ **Incorrect - not US-specific**

**User Model** (`src/server/models/user/index.ts`):
- Lines 76-80: Basic regex validation
- Doesn't enforce US format or +1 prefix
- ❌ **Incomplete validation**

#### 3. Mixed Field Usage
- Repository uses `phoneNumber` consistently
- Some tools accept both `phone` and `phoneNumber`
- Schema validation allows both fields

## Goals and Requirements

### Primary Goals
1. **Eliminate Duplicate Fields**: Remove `phone` field, keep only `phoneNumber`
2. **Standardize US Format**: All phone numbers must be `+1XXXXXXXXXX` format
3. **Consistent Validation**: Single source of truth for phone number validation
4. **No Breaking Changes**: Database schema already correct, only code changes needed

### Requirements
- All users are US-based (`+1` country code)
- Input formats supported:
  - `3392223571` → `+13392223571`
  - `13392223571` → `+13392223571`
  - `+13392223571` → `+13392223571` (no change)
- Reject invalid formats (non-US country codes, invalid lengths)

## Implementation Plan

### Phase 1: Create Centralized Phone Utilities

**File**: `src/shared/utils/phoneUtils.ts` (new)

```typescript
// Centralized phone number utilities
export function normalizeUSPhoneNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  
  // Remove all non-numeric characters
  const digits = input.replace(/\D/g, '');
  
  // Handle different input formats
  if (digits.length === 10) {
    // US number without country code: 3392223571
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code: 13392223571
    return `+${digits}`;
  } else if (input.startsWith('+1') && digits.length === 11) {
    // Already formatted: +13392223571
    return input;
  }
  
  // Invalid format
  return null;
}

export function validateUSPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  
  // Must start with +1 and have exactly 11 digits after +
  const e164USRegex = /^\+1[2-9]\d{2}[2-9]\d{6}$/;
  return e164USRegex.test(phone);
}

export function isUSPhoneNumber(phone: string): boolean {
  return phone.startsWith('+1') && validateUSPhoneNumber(phone);
}
```

### Phase 2: Update Schema and Types

#### 2.1 Update User Schemas
**File**: `src/server/models/user/schemas.ts`

**Changes:**
1. **Remove** `phone` field from `UserSchema` (line 12)
2. **Update** `CreateUserSchema` to only accept `phoneNumber` (remove line 231)
3. **Add** phone validation using new utility
4. **Remove** backward compatibility comments

#### 2.2 Update Schema Validation
```typescript
// In UserSchema - replace lines 10-12
phoneNumber: z.string()
  .transform(normalizeUSPhoneNumber)
  .refine(validateUSPhoneNumber, 'Must be a valid US phone number'),

// Remove phone field entirely
```

### Phase 3: Update Existing Phone Logic

#### 3.1 Update UserInfoPatchTool
**File**: `src/server/agents/tools/userInfoPatchTool.ts`

**Changes:**
- Replace `normalizePhoneNumber()` (lines 7-14) with import from `phoneUtils.ts`
- Remove `phone` parameter support (lines 32-33, 36, 57)
- Update schema to only accept `phoneNumber` (line 107)

#### 3.2 Update User Model Validation
**File**: `src/server/models/user/index.ts`

**Changes:**
- Replace `isValidPhoneNumber()` method (lines 76-80) with `validateUSPhoneNumber`
- Import from new phoneUtils

#### 3.3 Consolidate Frontend Logic
**File**: `src/components/pages/SignUp/index.tsx`

**Changes:**
- Replace inline phone formatting (lines 58, 169, 171, 183) with `normalizeUSPhoneNumber`
- Add better validation feedback

### Phase 4: Update All File References

#### 4.1 API Routes
**Files to update:**
- `src/app/api/checkout/route.ts` (line 34: change from `phone` to `phoneNumber`)

#### 4.2 Test Files
**Files to update:**
- Update all test fixtures in `tests/fixtures/users.ts`
- Update test utilities in `tests/utils/`
- Update all test files that reference `phone` field

#### 4.3 Script Files
**Files to update:**
- All files in `scripts/` directory
- Replace `parsePhoneNumber` in `scripts/utils/common.ts` with import

### Phase 5: Frontend Components

#### 5.1 Profile Components
**Files to check/update:**
- `src/components/pages/chat/profile/sections/PersonalInfoSection.tsx`
- `src/components/pages/chat/profile/hooks/useProfileData.tsx`

### Phase 6: Database Type Generation

#### 6.1 Update Database Types
**File**: `src/server/models/_types.ts`

Ensure the generated types reflect `phoneNumber` field only (should already be correct since DB schema is correct).

## Testing Strategy

### Unit Tests
1. **Phone Utilities Tests**
   - Test all input formats (`3392223571`, `13392223571`, `+13392223571`)
   - Test invalid formats (too short, too long, non-US country codes)
   - Test edge cases (null, empty string, special characters)

2. **Schema Validation Tests**
   - Test updated UserSchema validation
   - Test CreateUserSchema validation
   - Ensure `phone` field is rejected

3. **UserInfoPatchTool Tests**
   - Update existing tests to remove `phone` field support
   - Test phone number normalization

### Integration Tests
1. **API Endpoint Tests**
   - Test user creation with various phone formats
   - Test user updates via PATCH operations
   - Ensure consistent phone formatting in responses

2. **SignUp Flow Tests**
   - Test complete signup flow with different phone formats
   - Test validation error messages

### Migration Tests
1. **No Database Migration Needed** - schema already correct
2. **Data Validation** - verify all existing phone numbers are properly formatted

## Implementation Progress

### Phase 1: Create Centralized Phone Utilities ✅ COMPLETED
**Status**: COMPLETED on 2025-09-06

✅ **Created `phoneUtils.ts`** - Centralized utilities at `src/shared/utils/phoneUtils.ts`
- `normalizeUSPhoneNumber()` - Handles all input formats (10-digit, 11-digit, +1 prefix)
- `validateUSPhoneNumber()` - Strict E.164 US validation with area code validation
- `isUSPhoneNumber()` - Quick +1 prefix check
- `formatUSPhoneForDisplay()` - Pretty formatting for UI display
- `createNormalizedUSPhone()` - Branded type for type safety
- Added comprehensive JSDoc documentation
- Includes proper area code validation (2-9 for first digit)

**Files Created:**
- ✅ `src/shared/utils/phoneUtils.ts`

**Next**: Phase 2 - Update Schema and Types

## Implementation Order

### Priority 1: Core Infrastructure  
1. ✅ **Create `phoneUtils.ts`** - Centralized utilities (COMPLETED)
2. 🚧 **Update User Schema** - Remove duplicate fields  
3. 🚧 **Update User Model** - Use new validation

### Priority 2: Tools and Agents  
4. ✅ **Update UserInfoPatchTool** - Remove phone support
5. ✅ **Update API Routes** - Use phoneNumber consistently

### Priority 3: Frontend
6. ✅ **Update SignUp Component** - Use centralized utils
7. ✅ **Update Profile Components** - Remove phone references

### Priority 4: Testing and Scripts
8. ✅ **Update Test Files** - Fix failing tests
9. ✅ **Update Script Files** - Use consistent formatting
10. ✅ **Add Comprehensive Tests** - Cover all scenarios

## Risk Assessment

### Low Risk
- **Database Changes**: None required - schema already correct
- **Breaking API Changes**: Internal only, no external API impact
- **Data Loss**: No data at risk - consolidating fields only

### Medium Risk
- **Test Failures**: Many tests may need updates due to schema changes
- **Integration Issues**: Need to verify all phone number handling paths

### Mitigation Strategies
1. **Comprehensive Testing**: Update all tests before deployment
2. **Gradual Rollout**: Test in development/staging thoroughly
3. **Validation**: Add strict validation to catch issues early
4. **Monitoring**: Watch for validation errors in production logs

## Success Criteria

### Technical Goals
- [ ] No duplicate phone/phoneNumber fields in schemas
- [ ] All phone numbers consistently formatted as `+1XXXXXXXXXX`  
- [ ] Single source of truth for phone validation
- [ ] All tests passing
- [ ] No linting errors

### Business Goals  
- [ ] All existing users continue working without issues
- [ ] New user registration handles various input formats correctly
- [ ] SMS delivery continues working (depends on consistent formatting)
- [ ] Profile updates handle phone numbers correctly

## Post-Implementation Tasks

1. **Documentation Updates**
   - Update CLAUDE.md with new phone number standards
   - Update API documentation if applicable

2. **Monitoring**
   - Monitor user registration success rates
   - Watch for phone validation errors in logs
   - Verify SMS delivery continues working

3. **Code Quality**
   - Run full lint and type check
   - Ensure build passes
   - Update any documentation references

## Files Requiring Changes

### High Priority (Core Logic)
- `src/shared/utils/phoneUtils.ts` (new)
- `src/server/models/user/schemas.ts`
- `src/server/models/user/index.ts` 
- `src/server/agents/tools/userInfoPatchTool.ts`

### Medium Priority (Integration)
- `src/components/pages/SignUp/index.tsx`
- `src/app/api/checkout/route.ts`
- Test files (multiple)

### Lower Priority (Cleanup)
- Script files (multiple)
- Documentation updates
- Type definitions verification

---

**Next Steps**: Begin implementation with Phase 1 (centralized utilities) and proceed systematically through each phase, ensuring comprehensive testing at each step.