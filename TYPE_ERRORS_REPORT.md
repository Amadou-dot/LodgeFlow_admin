# TypeScript Errors Report

**Generated:** October 25, 2025  
**Total Errors:** 57 errors in 24 files  
**Check Command:** `pnpm check:types`

## Summary by Category

### Critical Issues (Need Immediate Fix)

#### 1. **AddExperienceForm.tsx** - 17 Type Errors
The FormData interface change broke multiple property accesses. Fields are trying to access properties that don't exist on the `{}` type.

**Root Cause:** FormData type definition doesn't match the actual form structure.

**Files Affected:**
- `components/AddExperienceForm.tsx` (17 errors)
- `components/AddExperienceModal.tsx` (1 error)
- `__tests__/AddExperienceForm.simple.test.tsx` (3 errors)
- `__tests__/AddExperienceForm.test.tsx` (6 errors)

**Example Errors:**
```typescript
// Line 63: Type '{}' is not assignable to type 'string'
value={formData.title || ''}

// Line 130: Cannot create Set from '{}'
new Set(formData.seasonalAvailability)

// Line 233: Type 'string | string[]' is not assignable
value={formData.includes || ''}
```

**Impact:** AddExperienceForm component is completely broken.

---

#### 2. **experienceUtils.test.ts** - 2 Type Errors
Test is passing partial objects that don't satisfy the full `IExperience` interface.

```typescript
// Line 24: Missing required properties
const experience = { available: ['Summer', 'Fall'] };
expect(isExperienceAvailable(experience, new Date())).toBe(true);
```

**Impact:** Tests will fail to compile.

---

### Minor Issues (Unused Variables - Low Priority)

These are unused variables that trigger the `noUnusedLocals` and `noUnusedParameters` TypeScript flags we enabled.

#### API Routes (12 errors)
- `app/api/cabins/[id]/route.ts` - unused `request` parameter (2)
- `app/api/customers/[id]/lock/route.ts` - unused `request`, `lockedUser`, `unlockedUser` (4)
- `app/api/customers/[id]/route.ts` - unused `request` parameter (2)
- `app/api/dashboard/route.ts` - unused `sixMonthsAgo` (1)
- `app/api/dining/[id]/route.ts` - unused `request` parameter (2)
- `app/api/experiences/[id]/route.ts` - unused `request` parameter (2)

#### Components (11 errors)
- `components/ActivityCard.tsx` - unused `handleView` (1)
- `components/BookingDetails/BookingDetailsHeader.tsx` - unused `onBookingUpdated` (1)
- `components/BookingForm/BookingDatesGuests.tsx` - unused `dateString`, `validateDateRange` (2)
- `components/BookingFormFields.tsx` - unused `isCustomerOpen` (1)
- `components/BookingFormRefactored.tsx` - unused `hasMore`, `onLoadMore` (2)
- `components/DeletionModal.tsx` - unused `result` (1)
- `components/DiningCard.tsx` - unused `isLoading` (1)
- `components/ExperienceGrid.tsx` - unused `onClose` (1)
- `components/icons.tsx` - unused `props` (1)
- `components/sidebar.tsx` - unused `theme` (1)

#### Scripts (2 errors)
- `scripts/add-profile-images.ts` - unused `initials` (1)
- `scripts/migrate-customer-revenue.ts` - unused `completedBookings` (1)

#### Utils (1 error)
- `utils/bookingUtils.ts` - unused `isBefore` import (1)

---

## Recommended Actions

### Immediate (High Priority)

1. **Fix AddExperienceForm FormData Type**
   - Review `components/AddExperienceForm/types.ts`
   - Ensure FormData interface matches actual form structure
   - Fix all property accesses in AddExperienceForm.tsx
   - Update tests with proper mock data

2. **Fix experienceUtils Tests**
   - Create proper Experience mock objects with all required fields
   - Or use `Partial<Experience>` in the utility function signature

### Short-term (Medium Priority)

3. **Clean Up Unused Variables in Components**
   - Remove or prefix with underscore: `_onClose`, `_request`, etc.
   - Or disable the rule if intentionally unused (API route signatures)

### Optional (Low Priority)

4. **Clean Up Unused Variables in Scripts**
   - These don't affect runtime but keep code clean

---

## Files by Error Count

```
17 errors - components/AddExperienceForm.tsx
 6 errors - __tests__/AddExperienceForm.test.tsx
 4 errors - app/api/customers/[id]/lock/route.ts
 3 errors - __tests__/AddExperienceForm.simple.test.tsx
 2 errors - app/api/cabins/[id]/route.ts
 2 errors - app/api/customers/[id]/route.ts
 2 errors - app/api/dining/[id]/route.ts
 2 errors - app/api/experiences/[id]/route.ts
 2 errors - __tests__/experienceUtils.test.ts
 2 errors - components/BookingForm/BookingDatesGuests.tsx
 2 errors - components/BookingFormRefactored.tsx
 1 error  - 13 other files
```

---

## How to Run Type Checking

```bash
# Check all files
pnpm check:types

# Check specific files
pnpm check:types components/AddExperienceForm.tsx

# Alternative: Use TypeScript directly
npx tsc --noEmit
```

---

## Notes

- Most errors (57 total) are from the FormData interface change (27 errors related to AddExperienceForm)
- The remaining 30 errors are mostly unused variable warnings from strict TypeScript flags
- The type safety improvements are working correctly - these errors were always present but now visible
- The unused variable errors are actually beneficial as they help identify dead code
