# Plan: LodgeFlow Comprehensive Improvements

**Objective:** Address security vulnerabilities, performance issues, outdated packages, and code quality problems identified in the January 2026 codebase audit.

**Author:** Claude Code
**Plan Version:** 1.0
**Created:** January 7, 2026

---

## Context

- **Entry Points:** `app/api/` (API routes), `components/` (UI), `hooks/` (data fetching)
- **Key Dependencies:** Next.js 16, HeroUI, Clerk, MongoDB/Mongoose, SWR, TanStack Query
- **Previous Work:** TypeScript `any` refactoring completed (see `current-plan.md`)

---

## Priority Matrix

| Priority | Category | Impact | Effort |
|----------|----------|--------|--------|
| 🔴 P0 | Security | Critical | Medium |
| 🟠 P1 | Performance | High | High |
| 🟡 P2 | Package Updates | Medium | Low |
| 🟢 P3 | Code Quality | Low | Medium |

---

## Phase 1: Security Hardening (P0)

### 1.1 Add Authentication to All API Routes

**Problem:** GET endpoints don't verify user authentication, allowing data enumeration.

**Files to modify:**
- `app/api/bookings/route.ts` - GET handler
- `app/api/bookings/by-email/route.ts` - Entire file (high risk)
- `app/api/bookings/[id]/route.ts` - GET handler
- `app/api/cabins/route.ts` - GET handler
- `app/api/customers/route.ts` - GET handler
- `app/api/customers/[id]/route.ts` - GET handler
- `app/api/dashboard/route.ts` - GET handler
- `app/api/dining/route.ts` - GET handler
- `app/api/experiences/route.ts` - GET handler
- `app/api/settings/route.ts` - GET handler

**Implementation:**
```typescript
// Add to top of each GET handler
import { auth } from '@clerk/nextjs/server';
import { hasAuthorizedRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const { userId, has } = await auth();

  if (!userId || !hasAuthorizedRole(has)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  // ... rest of handler
}
```

**Verification:**
- [ ] Test unauthenticated requests return 401
- [ ] Test authenticated requests work correctly
- [ ] Test role-based access (admin vs staff vs customer)

---

### 1.2 Sanitize Search Input (Regex Injection)

**Problem:** User input used directly in MongoDB regex queries.

**Files to modify:**
- `app/api/cabins/route.ts` (line ~24)
- `app/api/bookings/route.ts` (search handling)
- `app/api/customers/route.ts` (search handling)
- `app/api/dining/route.ts` (if search exists)

**Implementation:**
```typescript
// Create utility in lib/api-utils.ts
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Usage in routes
import { escapeRegex } from '@/lib/api-utils';

if (search) {
  const safeSearch = escapeRegex(search);
  query.name = { $regex: safeSearch, $options: 'i' };
}
```

**Verification:**
- [ ] Test search with special characters: `test.*`, `test$`, `test()`
- [ ] Verify normal searches still work

---

### 1.3 Add Request Validation with Zod

**Problem:** POST/PUT endpoints accept body without schema validation.

**Files to create:**
- `lib/validations/booking.ts`
- `lib/validations/cabin.ts`
- `lib/validations/customer.ts`
- `lib/validations/index.ts`

**Files to modify:**
- `app/api/bookings/route.ts` - POST handler
- `app/api/bookings/[id]/route.ts` - PUT handler
- `app/api/cabins/route.ts` - POST handler
- `app/api/customers/route.ts` - POST handler

**Implementation:**
```typescript
// lib/validations/booking.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  cabin: z.string().min(1, 'Cabin is required'),
  customer: z.string().min(1, 'Customer is required'),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  numGuests: z.number().min(1).max(20),
  status: z.enum(['unconfirmed', 'confirmed', 'checked-in', 'checked-out', 'cancelled']).optional(),
  extras: z.object({
    hasBreakfast: z.boolean().optional(),
    hasPets: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasEarlyCheckIn: z.boolean().optional(),
    hasLateCheckOut: z.boolean().optional(),
  }).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// Usage in route
import { createBookingSchema } from '@/lib/validations/booking';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = createBookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten() },
      { status: 400 }
    );
  }

  // Use result.data (typed and validated)
}
```

**Package to add:**
```bash
pnpm add zod
```

**Verification:**
- [ ] Test invalid payloads rejected with clear errors
- [ ] Test valid payloads accepted
- [ ] Test edge cases (empty strings, wrong types)

---

### 1.4 Add Rate Limiting

**Problem:** No rate limiting on mutation endpoints.

**Implementation option 1 - Simple in-memory (dev/small scale):**
```typescript
// lib/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
```

**Implementation option 2 - Production (Upstash Redis):**
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**Files to modify:**
- `app/api/bookings/route.ts` - POST
- `app/api/customers/route.ts` - POST
- `app/api/send/*/route.ts` - All email endpoints

**Verification:**
- [ ] Test rate limit kicks in after threshold
- [ ] Test different users have separate limits
- [ ] Test limits reset after window

---

## Phase 2: Performance Optimization (P1)

### 2.1 Fix N+1 Query Problem (Clerk User Fetching)

**Problem:** `populateBookingsWithClerkCustomers` fetches users one-by-one.

**File:** `app/api/bookings/route.ts` (lines 71-117)

**Solution A - Batch Fetching:**
```typescript
// lib/clerk-users.ts - Add batch function
export async function getClerkUsersBatch(
  userIds: string[]
): Promise<Map<string, Customer>> {
  const uniqueIds = [...new Set(userIds)];
  const results = new Map<string, Customer>();

  // Clerk doesn't support batch fetch, but we can parallelize with limit
  const chunks = chunkArray(uniqueIds, API_CONFIG.CLERK_CONCURRENT_LIMIT);

  for (const chunk of chunks) {
    const users = await Promise.all(
      chunk.map(id => getClerkUser(id).catch(() => null))
    );
    chunk.forEach((id, i) => {
      if (users[i]) results.set(id, users[i]);
    });
  }

  return results;
}

// Usage
const customerIds = bookings.map(b => b.customer);
const customerMap = await getClerkUsersBatch(customerIds);

const populatedBookings = bookings.map(booking => ({
  ...booking.toObject(),
  customer: customerMap.get(booking.customer) || fallbackCustomer,
}));
```

**Solution B - Caching Layer (Recommended for production):**
```typescript
// lib/cache.ts
const userCache = new Map<string, { user: Customer; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedClerkUser(userId: string): Promise<Customer | null> {
  const cached = userCache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return cached.user;
  }

  const user = await getClerkUser(userId);
  if (user) {
    userCache.set(userId, { user, expiry: Date.now() + CACHE_TTL });
  }
  return user;
}
```

**Verification:**
- [ ] Measure API response time before/after
- [ ] Verify cache invalidation works
- [ ] Test with 100+ bookings

---

### 2.2 Move Search Filtering to Database

**Problem:** Search fetches ALL records, filters in memory.

**File:** `app/api/bookings/route.ts` (lines 142-184)

**Current (inefficient):**
```typescript
if (search) {
  const allBookings = await Booking.find(query).populate('cabin');
  const populated = await populateBookingsWithClerkCustomers(allBookings);
  const filtered = populated.filter(b =>
    b.customer?.fullName?.includes(search) ||
    b.cabin?.name?.includes(search)
  );
}
```

**Solution - Two-phase query:**
```typescript
if (search) {
  // Phase 1: Find matching cabins
  const matchingCabins = await Cabin.find({
    name: { $regex: escapeRegex(search), $options: 'i' }
  }).select('_id');

  // Phase 2: Query bookings with cabin filter
  const cabinIds = matchingCabins.map(c => c._id);
  query.$or = [
    { cabin: { $in: cabinIds } },
    // For customer search, we need a different approach since they're in Clerk
  ];
}
```

**For customer search (requires Customer collection sync):**
```typescript
// Option 1: Create lightweight Customer collection for search
// This syncs essential fields from Clerk for efficient searching

// models/CustomerIndex.ts
const CustomerIndexSchema = new Schema({
  clerkUserId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, index: 'text' },
  email: { type: String, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Sync on Clerk webhook or periodic job
```

**Verification:**
- [ ] Test search performance with 1000+ bookings
- [ ] Verify search results are accurate
- [ ] Test pagination works with search

---

### 2.3 Consolidate Database Aggregations

**Problem:** Multiple separate queries for related data.

**File:** `app/api/customers/[id]/route.ts` (lines 35-65)

**Current:**
```typescript
const totalBookings = await Booking.countDocuments({ customer: clerkUserId });
const revenueResult = await Booking.aggregate([...]);
const bookings = await Booking.find({ customer: clerkUserId });
const avgStay = bookings.reduce(...) / bookings.length;
```

**Solution - Single aggregation:**
```typescript
const [stats] = await Booking.aggregate([
  { $match: { customer: clerkUserId } },
  {
    $group: {
      _id: null,
      totalBookings: { $sum: 1 },
      totalRevenue: {
        $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] }
      },
      totalNights: { $sum: '$numNights' },
      completedBookings: {
        $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
      },
    }
  },
  {
    $project: {
      _id: 0,
      totalBookings: 1,
      totalRevenue: 1,
      averageStayLength: {
        $cond: [
          { $gt: ['$totalBookings', 0] },
          { $divide: ['$totalNights', '$totalBookings'] },
          0
        ]
      },
      completedBookings: 1,
    }
  }
]);
```

**Verification:**
- [ ] Compare results with current implementation
- [ ] Measure query time improvement
- [ ] Test with customers having 0, 1, many bookings

---

### 2.4 Add Component Memoization

**Problem:** Unnecessary re-renders in form components.

**Files to modify:**
- `components/BookingForm.tsx`
- `components/BookingFormFields.tsx`
- `components/AddGuestForm.tsx`
- `components/SettingsForm.tsx`

**Implementation:**
```typescript
// Before
const handleInputChange = (field: string, value: unknown) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

// After
const handleInputChange = useCallback((field: string, value: unknown) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);

// Memoize expensive computations
const totalPrice = useMemo(() => {
  return calculateTotalPrice(formData, settings);
}, [formData.cabinPrice, formData.numNights, formData.extras, settings]);

// Memoize child components that receive callbacks
const MemoizedPriceBreakdown = memo(PriceBreakdown);
```

**Verification:**
- [ ] Use React DevTools Profiler to measure re-renders
- [ ] Verify form still works correctly
- [ ] Test performance with React strict mode

---

## Phase 3: Package Updates (P2)

### 3.1 Safe Updates (No Breaking Changes)

```bash
# Run all safe updates at once
pnpm update @heroui/accordion @heroui/autocomplete @heroui/avatar @heroui/button \
  @heroui/card @heroui/checkbox @heroui/chip @heroui/code @heroui/date-picker \
  @heroui/divider @heroui/input @heroui/kbd @heroui/link @heroui/listbox \
  @heroui/modal @heroui/navbar @heroui/number-input @heroui/pagination \
  @heroui/select @heroui/snippet @heroui/spinner @heroui/switch @heroui/system \
  @heroui/table @heroui/tabs @heroui/theme @heroui/toast @heroui/user \
  @heroui/use-infinite-scroll

# Update utility packages
pnpm update @clerk/backend @clerk/nextjs @clerk/themes \
  @tanstack/react-query @tanstack/react-query-devtools \
  recharts resend swr mongoose next lucide-react \
  tailwindcss @tailwindcss/postcss postcss \
  prettier typescript eslint @eslint/js \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  @testing-library/react @testing-library/jest-dom \
  date-fns dotenv clsx
```

**Verification:**
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] Manual smoke test of key flows

---

### 3.2 HeroUI Dropdown Beta → Stable

```bash
# Update dropdown from beta to stable
pnpm remove @heroui/dropdown
pnpm add @heroui/dropdown@latest
```

**Files to check:**
- Any component using `@heroui/dropdown`
- Check for API changes in HeroUI changelog

**Verification:**
- [ ] All dropdowns render correctly
- [ ] Selection events work
- [ ] Styling matches theme

---

### 3.3 Move Faker to DevDependencies

```bash
pnpm remove @faker-js/faker
pnpm add -D @faker-js/faker
```

**Verification:**
- [ ] `pnpm build` still works (faker not bundled in production)
- [ ] `pnpm seed` still works

---

### 3.4 Deferred Updates (Breaking Changes - Evaluate Later)

| Package | Current | Latest | Action |
|---------|---------|--------|--------|
| `react` | 18.3.1 | 19.x | **Wait** - Evaluate React 19 migration separately |
| `framer-motion` | 11.x | 12.x | **Wait** - Major API changes |
| `mongodb` | 6.x | 7.x | **Wait** - Driver breaking changes |
| `mongoose` | 8.x | 9.x | **Wait** - ORM breaking changes |
| `tailwind-variants` | 2.x | 3.x | **Wait** - API changes |
| `jspdf` | 3.x | 4.x | **Evaluate** - Check PDF generation still works |

---

## Phase 4: Code Quality (P3)

### 4.1 Extract Duplicate Code

**Create shared utilities:**

```typescript
// lib/api-utils.ts - Add these functions

/**
 * Standard API error response
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, extra?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    ...extra,
  });
}

/**
 * Parse pagination parameters with defaults
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(
    API_CONFIG.MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('limit') || String(API_CONFIG.DEFAULT_PAGE_SIZE)))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
```

**Files to refactor:**
- `app/api/bookings/route.ts`
- `app/api/customers/route.ts`
- `app/api/cabins/route.ts`
- `app/api/dining/route.ts`
- `app/api/experiences/route.ts`

---

### 4.2 Standardize API Response Format

**Current inconsistency:**
```typescript
// Some routes
return NextResponse.json({ success: true, data: result });

// Other routes
return new Response(JSON.stringify({ success: true, data: result }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});
```

**Standard format:**
```typescript
// Always use NextResponse.json() with consistent structure
return NextResponse.json({
  success: true,
  data: result,
  pagination: paginationMeta, // if applicable
});

// Errors
return NextResponse.json({
  success: false,
  error: 'Human readable message',
  code: 'VALIDATION_ERROR', // optional machine-readable code
}, { status: 400 });
```

---

### 4.3 Clean Up Unused Code

**Files with unused code:**
- `app/api/dashboard/route.ts` - Remove unused `clerkClient` import, commented code
- `app/(dashboard)/layout.tsx` - Fix extra whitespace in className

**Run lint to find more:**
```bash
pnpm lint
```

---

### 4.4 Consolidate Data Fetching Strategy

**Current state:** Mix of SWR (reads) and TanStack Query (mutations)

**Recommendation:** Keep both but document the pattern clearly:
- SWR: All GET requests (automatic revalidation, deduplication)
- TanStack Query: All mutations (optimistic updates, cache invalidation)

**Document in code:**
```typescript
// hooks/useBookings.ts
/**
 * Booking data fetching hook using SWR
 *
 * Pattern: SWR for reads, TanStack Query for mutations
 * - SWR handles caching, revalidation, and deduplication
 * - Mutations invalidate SWR cache via mutate()
 */
```

---

### 4.5 Fix Component Prop Drilling

**File:** `components/BookingFormFields.tsx`

**Current:** 18+ individual props

**Solution - Group related props:**
```typescript
// Before
interface BookingFormFieldsProps {
  cabinId: string;
  customerId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numGuests: number;
  onCabinChange: (id: string) => void;
  onCustomerChange: (id: string) => void;
  // ... 12 more props
}

// After
interface BookingFormFieldsProps {
  formData: BookingFormData;
  handlers: BookingFormHandlers;
  options: {
    cabins: Cabin[];
    customers: Customer[];
    settings: Settings;
  };
  state: {
    isLoading: boolean;
    errors: Record<string, string>;
  };
}

interface BookingFormHandlers {
  onFieldChange: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}
```

---

### 4.6 Add Missing Environment Variable Validation

**Create:** `lib/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

**Usage:**
```typescript
// Instead of process.env.MONGODB_URI
import { env } from '@/lib/env';
const uri = env.MONGODB_URI; // Typed and validated
```

---

## Phase 5: Documentation & Testing (P3)

### 5.1 Add API Documentation

**Create:** `docs/api.md` or use OpenAPI spec

Document each endpoint:
- Method, path
- Authentication required
- Request body schema
- Response schema
- Example requests/responses

### 5.2 Add Missing Tests

**Priority test coverage:**
1. API route handlers (unit tests)
2. Validation schemas (unit tests)
3. Custom hooks (integration tests)
4. Critical user flows (e2e tests)

---

## Execution Checklist

### Phase 1: Security (Week 1) ✅ COMPLETED
- [x] 1.1 Add auth to all API routes
- [x] 1.2 Sanitize search inputs
- [x] 1.3 Add Zod validation
- [x] 1.4 Add rate limiting
- [x] Verify: TypeScript + Build pass

### Phase 2: Performance (Week 2) ✅ COMPLETED
- [x] 2.1 Fix N+1 Clerk queries (added getClerkUsersBatch function)
- [x] 2.2 Move search to database (cabin search, partial customer search)
- [x] 2.3 Consolidate aggregations (customers/[id], dashboard routes)
- [x] 2.4 Add memoization (useBookingForm handlers with useCallback/useMemo)
- [x] Verify: Build passes

### Phase 3: Package Updates (Week 2-3) ✅ COMPLETED
- [x] 3.1 Run safe updates (HeroUI, Clerk, TanStack, etc.)
- [x] 3.2 Update HeroUI dropdown (from beta to 2.3.29 stable)
- [x] 3.3 Move faker to devDeps (also updated to v10.2.0)
- [x] Verify: Build passes

### Phase 4: Code Quality (Week 3-4) ✅ COMPLETED
- [x] 4.1 Extract duplicate code (added parsePagination, buildPaginationMeta, createPaginatedResponse)
- [x] 4.2 Standardize responses (updated cabins, dining routes to use createSuccessResponse/createErrorResponse)
- [x] 4.3 Clean up unused code (fixed whitespace in dashboard layout)
- [x] 4.4 Document data fetching (added strategy docs to useBookings.ts)
- [x] 4.5 Fix prop drilling (added organized interface docs to BookingFormFields)
- [x] 4.6 Add env validation (created lib/env.ts with type-safe config)
- [x] Verify: TypeScript + build pass

### Phase 5: Documentation & Testing ✅ COMPLETED
- [x] 5.1 API documentation (created docs/api.md with comprehensive endpoint docs)
- [x] 5.2 Add validation tests (170 tests for all Zod schemas in __tests__/validations/)
- [x] 5.3 Add API route tests (tests for cabins, dining, settings routes in __tests__/api/)
- [x] Verify: All 235 tests pass

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Auth changes break existing flows | Test each route individually, add auth gradually |
| Package updates cause regressions | Update in small batches, run full test suite |
| Performance changes alter behavior | Compare API responses before/after |
| Zod validation too strict | Start permissive, tighten gradually |
| Cache introduces stale data | Set appropriate TTLs, add cache invalidation |

---

## Success Metrics

1. **Security:** All API routes require authentication
2. **Performance:** Booking list API < 500ms for 100 records
3. **Packages:** No critical/high vulnerabilities in `pnpm audit`
4. **Quality:** Zero ESLint errors, 80%+ test coverage on critical paths
5. **Types:** Zero `any` types in new code

---

## Notes

- Start with Phase 1 (Security) - highest impact, manageable scope
- Phase 2 can run partially in parallel with Phase 3
- Phase 4 is lower priority but improves maintainability
- Consider feature flags for major changes
- Keep `current-plan.md` for reference on TypeScript work already done
