# Plan: Technical Debt Reduction - `any` Type Refactoring

**Objective:** Systematically eliminate `any` type usages across the LodgeFlow codebase and replace them with proper TypeScript types to improve type safety and developer experience.

**Author:** Architect Agent  
**Plan Version:** 1.0  
**Created:** December 3, 2025

---

## Context

- **Entry Point:** `types/index.ts` and `types/clerk.ts` (existing type definitions)
- **Key Dependencies:** `models/` (Mongoose schemas with interfaces), `hooks/`, `components/`, `app/api/`

---

## Phase 1: Audit Summary

### High-Impact Areas by Category

| Category | File Count | `any` Count | Priority |
|----------|-----------|-------------|----------|
| **API Routes** | 12 files | ~25 instances | 🔴 Critical |
| **Hooks** | 2 files | ~6 instances | 🟠 High |
| **Components** | 15 files | ~20 instances | 🟠 High |
| **Types (self)** | 1 file | 5 instances | 🟡 Medium |
| **Tests/Scripts** | 4 files | ~8 instances | 🟢 Low |

### Worst Offenders (Files requiring immediate attention)

1. **`app/api/bookings/route.ts`** — 6 `any` usages
   - `populateBookingsWithClerkCustomers(bookings: any[])`
   - `query: any`, `sort: any`
   - `(booking: any) =>` in filters
   - `error: any` in catch blocks

2. **`app/api/dashboard/route.ts`** — 5 `any` usages
   - `(booking: any)` in map callbacks
   - `(item: any)` in aggregation result handlers

3. **`app/api/cabins/route.ts`** — 4 `any` usages
   - `query: any`, `sort: any`
   - `error: any` in catch blocks

4. **`hooks/useURLFilters.ts`** — 6 `any` usages
   - `defaultValue?: any`
   - `updateFilter: (key, value: any)` signature
   - `result: any`, `defaults: any` intermediate objects

5. **`components/SettingsForm.tsx` + subsections** — 6 `any` usages
   - `handleInputChange(field, value: any)` pattern
   - Propagated to child components (`SettingsBookingSection`, etc.)

6. **`components/BookingForm/` directory** — 5 `any` usages
   - `onInputChange: (field, value: any)`
   - `settings: any` props
   - `isDateUnavailable(date: any)`

7. **`types/clerk.ts`** — 5 `any` usages in Clerk types
   - `phone_numbers: any[]`, `web3_wallets: any[]`, `passkeys: any[]`
   - `saml_accounts: any[]`, `enterprise_accounts: any[]`

---

## Phase 2: Refactoring Strategy

### Step 2.1: Create Missing Shared Types (Foundation)

1. **Create `types/api.ts`** — Define MongoDB query/sort object types:
   ```typescript
   interface CabinQueryFilter {
     name?: { $regex: string; $options: string };
     capacity?: { $lte?: number; $gte?: number };
     discount?: number | { $gt: number };
   }

   interface BookingQueryFilter {
     status?: string;
     cabin?: mongoose.Types.ObjectId;
     customer?: string;
     checkInDate?: { $gte?: Date; $lte?: Date };
     checkOutDate?: { $gte?: Date; $lte?: Date };
   }

   type MongoSortOrder = Record<string, 1 | -1>;
   ```

2. **Create `types/errors.ts`** — Define error handling types:
   ```typescript
   interface MongooseValidationError extends Error {
     name: 'ValidationError';
     errors: Record<string, { message: string }>;
   }

   interface AppError extends Error {
     name: string;
     message: string;
   }
   ```

3. **Extend `types/clerk.ts`** — Replace Clerk `any[]` with proper types or `unknown[]` if Clerk SDK doesn't expose them.

### Step 2.2: Refactor API Routes (High Priority)

1. **`app/api/bookings/route.ts`**:
   - Replace `bookings: any[]` → `IBooking[]` (from model)
   - Replace `query: any` → `BookingQueryFilter`
   - Replace `error: any` → `unknown` with type guard:
     ```typescript
     function isMongooseValidationError(error: unknown): error is MongooseValidationError {
       return error instanceof Error && error.name === 'ValidationError';
     }
     ```

2. **`app/api/cabins/route.ts`**:
   - Same pattern for `query: any`, `sort: any`

3. **`app/api/dashboard/route.ts`**:
   - Define aggregation result types:
     ```typescript
     interface OccupancyDataItem {
       _id: string;
       totalGuests: number;
       totalCapacity: number;
     }

     interface RevenueDataItem {
       _id: { week: number; year: number };
       totalRevenue: number;
       bookingCount: number;
     }
     ```
   - Replace `booking: any` → `IBooking` with populated cabin type

### Step 2.3: Refactor Hooks (Medium-High Priority)

1. **`hooks/useURLFilters.ts`**:
   - Replace `defaultValue?: any` → use generic constraint `T[keyof T]`
   - Replace `value: any` in update functions → same generic approach:
     ```typescript
     updateFilter: <K extends keyof T>(key: K, value: T[K], addToHistory?: boolean) => void;
     ```

### Step 2.4: Refactor Component Props (Medium Priority)

1. **`components/BookingForm/types.ts`** and related:
   - Replace `value: any` → `BookingFormData[keyof BookingFormData]`
   - Or use generic pattern:
     ```typescript
     onInputChange: <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => void;
     ```

2. **`components/SettingsForm/` sections**:
   - Replace `value: any` → `AppSettings[keyof AppSettings]`

3. **`components/AreaChart.tsx`, `components/DurationChart.tsx`**:
   - Import proper Recharts tooltip types:
     ```typescript
     import { TooltipProps } from 'recharts';
     const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => { ... }
     ```

### Step 2.5: Handle UI Component Callbacks (Lower Priority)

1. **`CabinFilters.tsx`, `BookingsFilters.tsx`**:
   - Replace `onSelectionChange={(keys: any)}` → `Selection` type from HeroUI/NextUI:
     ```typescript
     import { Selection } from '@heroui/react';
     onSelectionChange={(keys: Selection) => { ... }}
     ```

2. **`as any` type casts**:
   - Review and fix legitimate type mismatches (e.g., status color mapping)
   - Create proper union types for status colors

---

## Phase 3: Verification

1. **Run TypeScript Compiler**:
   ```bash
   pnpm tsc --noEmit
   ```

2. **Run ESLint** with `@typescript-eslint/no-explicit-any` rule (if enabled):
   ```bash
   pnpm lint
   ```

3. **Run Existing Tests**:
   ```bash
   pnpm test
   ```

4. **Manual Smoke Test**: Verify key flows (create booking, view dashboard, filter cabins).

---

## Unknowns / Risks

| Risk | Mitigation |
|------|------------|
| **Clerk SDK types may be incomplete** | Use `unknown` with type guards or cast to `PhoneNumber[]` etc. if documented |
| **Mongoose aggregation results are untyped** | Define explicit result interfaces matching `$group`/`$project` output |
| **HeroUI/NextUI `Selection` type behavior** | Verify import path and handle `Set<Key>` vs `"all"` union |
| **Breaking existing functionality during refactor** | Refactor one file at a time, run tests between changes |
| **Generic constraints may be complex in `useURLFilters`** | Consider keeping `any` internally but exposing strict external types |

---

## Recommended Execution Order

1. ✅ **Phase 1**: Complete (this audit)
2. 🔜 **Phase 2.1**: Create shared type definitions (1-2 hours)
3. 🔜 **Phase 2.2**: API routes (3-4 hours) — highest ROI
4. 🔜 **Phase 2.3**: Hooks (1-2 hours)
5. 🔜 **Phase 2.4-2.5**: Components (2-3 hours)
6. 🔜 **Phase 3**: Verification (~1 hour)

**Total estimated effort**: 8-12 hours of focused refactoring.

---

## Progress Tracking

- [x] Phase 2.1: Create `types/api.ts`
- [x] Phase 2.1: Create `types/errors.ts`
- [x] Phase 2.1: Update `types/clerk.ts`
- [x] Phase 2.2: Refactor `app/api/bookings/route.ts`
- [x] Phase 2.2: Refactor `app/api/cabins/route.ts`
- [x] Phase 2.2: Refactor `app/api/dashboard/route.ts`
- [x] Phase 2.2: Refactor `app/api/dining/route.ts`
- [x] Phase 2.2: Refactor `app/api/settings/route.ts`
- [x] Phase 2.2: Refactor `app/api/customers/*.ts` routes
- [x] Phase 2.2: Refactor `app/api/cabins/[id]/route.ts` and `availability/route.ts`
- [x] Phase 2.3: Refactor `hooks/useURLFilters.ts`
- [x] Phase 2.3: Refactor `hooks/useCustomers.ts`
- [x] Phase 2.3: Refactor `hooks/useBookings.ts` (added CreateBookingInput/UpdateBookingInput types)
- [x] Phase 2.4: Refactor `components/BookingForm/` (types.ts, PaymentInformation.tsx, BookingDatesGuests.tsx, PriceBreakdown.tsx)
- [x] Phase 2.4: Refactor `components/BookingForm.tsx` and `components/BookingFormRefactored.tsx`
- [x] Phase 2.4: Refactor `components/SettingsForm/` (SettingsBookingSection.tsx)
- [x] Phase 2.4: Refactor chart components (AreaChart.tsx, DurationChart.tsx)
- [x] Phase 2.4: Add index signatures to filter types in `types/index.ts`
- [x] Phase 2.5: Refactor filter components (BookingsFilters.tsx, CabinFilters.tsx)
- [x] Phase 2.5: Refactor dining form components (DiningBasicInfo.tsx, DiningServingDetails.tsx)
- [x] Phase 2.5: Refactor experience components (AddExperienceForm.tsx, AddExperienceModal.tsx, EditExperienceForm.tsx)
- [x] Phase 2.5: Refactor misc components (DeletionModal.tsx, GuestRecentBookingCard.tsx, TodayActivity.tsx)
- [x] Phase 2.5: Refactor page components (bookings/*.tsx, dining/page.tsx, experiences/page.tsx, guests/*.tsx)
- [x] Phase 2.5: Remove remaining `as any` and `: any` casts
- [x] Phase 2.5: Fix utility functions (bookingUtils.ts, utilityFunctions.ts - added ChipColor return types)
- [x] Phase 2.5: Fix models (Booking.ts - findOverlapping query type)
- [x] Phase 3: TypeScript verification (✅ `pnpm tsc --noEmit` passes)
- [x] Phase 3: Build verification (✅ `pnpm build` passes)
- [x] Phase 3: ESLint verification (✅ `pnpm lint` passes - test files excluded)
- [ ] Phase 3: Test suite pass
- [ ] Phase 3: Manual smoke test

---

## Summary of Changes Made

### New Type Definitions Created
- `types/api.ts`: MongoDB query filters, sort types, aggregation result types, API input types (CreateBookingInput, UpdateBookingInput)
- `types/errors.ts`: Error handling types and type guards (isMongooseValidationError, getErrorMessage)

### Files Refactored (45+ files total)

**API Routes:**
- `app/api/bookings/route.ts`
- `app/api/cabins/route.ts`, `route_new.ts`
- `app/api/cabins/[id]/route.ts`, `availability/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/dining/route.ts`
- `app/api/settings/route.ts`
- `app/api/customers/route.ts`, `[id]/route.ts`, `[id]/lock/route.ts`

**Hooks:**
- `hooks/useURLFilters.ts`
- `hooks/useCustomers.ts`
- `hooks/useBookings.ts`

**Components:**
- `components/BookingForm.tsx`, `BookingFormRefactored.tsx`, `BookingFormFields.tsx`
- `components/BookingForm/` (types.ts, PaymentInformation.tsx, BookingDatesGuests.tsx, PriceBreakdown.tsx)
- `components/BookingsTable/` (BookingCard.tsx, BookingTableCell.tsx)
- `components/SettingsForm/SettingsBookingSection.tsx`
- `components/AreaChart.tsx`, `DurationChart.tsx`
- `components/BookingsFilters.tsx`, `CabinFilters.tsx`
- `components/DiningForm/` (DiningBasicInfo.tsx, DiningServingDetails.tsx)
- `components/AddExperienceForm.tsx`, `AddExperienceModal.tsx`, `EditExperienceForm.tsx`
- `components/EditExperienceForm/types.ts`
- `components/DeletionModal.tsx`, `GuestRecentBookingCard.tsx`, `TodayActivity.tsx`

**Pages:**
- `app/(dashboard)/bookings/page.tsx`, `[id]/edit/page.tsx`, `new/page.tsx`
- `app/(dashboard)/dining/page.tsx`
- `app/(dashboard)/experiences/page.tsx`
- `app/(dashboard)/guests/page.tsx`, `[id]/page.tsx`

**Types:**
- `types/index.ts` (added FilterValue, index signatures to filter interfaces)
- `types/clerk.ts` (replaced any[] with unknown[])

**Utilities:**
- `utils/bookingUtils.ts` (added ChipColor return type)
- `utils/utilityFunctions.ts` (added ChipColor return type)

**Models:**
- `models/Booking.ts` (typed findOverlapping query)
