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

- [ ] Phase 2.1: Create `types/api.ts`
- [ ] Phase 2.1: Create `types/errors.ts`
- [ ] Phase 2.1: Update `types/clerk.ts`
- [ ] Phase 2.2: Refactor `app/api/bookings/route.ts`
- [ ] Phase 2.2: Refactor `app/api/cabins/route.ts`
- [ ] Phase 2.2: Refactor `app/api/dashboard/route.ts`
- [ ] Phase 2.2: Refactor remaining API routes
- [ ] Phase 2.3: Refactor `hooks/useURLFilters.ts`
- [ ] Phase 2.4: Refactor `components/BookingForm/`
- [ ] Phase 2.4: Refactor `components/SettingsForm/`
- [ ] Phase 2.4: Refactor chart components
- [ ] Phase 2.5: Refactor filter components
- [ ] Phase 2.5: Remove `as any` casts
- [ ] Phase 3: TypeScript verification
- [ ] Phase 3: ESLint verification
- [ ] Phase 3: Test suite pass
- [ ] Phase 3: Manual smoke test
