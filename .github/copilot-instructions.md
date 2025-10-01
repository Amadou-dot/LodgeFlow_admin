# LodgeFlow AI Coding Assistant Guide

## Project Overview
LodgeFlow is a hotel management system built with Next.js 15 (App Router), HeroUI v2, MongoDB, and Clerk authentication. The system manages cabins, bookings, customers, dining, and experiences for a lodge/hotel business.

## Architecture & Tech Stack

### Core Technologies
- **Frontend**: Next.js 15 with App Router, TypeScript, HeroUI v2 components, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose ODM
- **Authentication**: Clerk (customers stored as Clerk users, no local Customer model)
- **State Management**: SWR for data fetching, React Query for mutations
- **Styling**: Tailwind CSS with `tailwind-variants` for component variants
- **Testing**: Jest with React Testing Library

### Project Structure
```
app/
├── (auth)/           # Auth-protected routes
├── (dashboard)/      # Main dashboard routes
├── api/             # API routes (bookings, cabins, customers, etc.)
├── layout.tsx       # Root layout with Clerk provider
└── providers.tsx    # Theme and query client providers

components/          # Shared UI components
├── *Form/           # Complex forms in subdirectories
├── primitives.ts    # Tailwind variants for consistent styling
└── DashboardLayout.tsx  # Main dashboard shell

models/             # Mongoose schemas (Booking, Cabin, Dining, Experience, Settings)
types/              # TypeScript type definitions
lib/                # Utilities (MongoDB connection, Clerk helpers, auth)
hooks/              # Custom hooks for data fetching with SWR
```

## Key Patterns & Conventions

### Data Fetching Architecture
- **SWR hooks** in `hooks/` directory for GET operations: `useBookings()`, `useCabins()`, etc.
- **React Query mutations** for POST/PUT/DELETE operations within SWR hooks
- API responses follow format: `{ success: boolean, data: any, message?: string }`
- Pagination handled in hooks with URL search params

### Customer/Authentication System
- **No local Customer model** - customers are Clerk users
- Bookings reference `customer: string` (Clerk user ID)
- Use `getClerkUser(userId)` from `lib/clerk-users.ts` to fetch customer data
- Customer stats updated via `updateCustomerStats()` after booking operations

### Component Patterns
- **Form components** in subdirectories: `BookingForm/`, `DiningForm/`, etc.
- **HeroUI components** with consistent theming via `primitives.ts`
- **DashboardLayout** wrapper for all authenticated pages
- Use `tailwind-variants` for component styling variants

### Database Patterns
- **MongoDB connection** via `lib/mongodb.ts` with global caching
- **Mongoose models** in `models/` directory with proper TypeScript interfaces
- **Population** patterns for related data (bookings populate cabin details)
- Environment fallback: `MONGODB_URI` defaults to localhost for development

## Development Workflows

### Scripts
```bash
pnpm dev                    # Development with Turbopack
pnpm seed                   # Seed database with sample data
pnpm test                   # Run Jest tests
pnpm extract:all            # Extract data from all collections
pnpm clerk:users            # Create/manage Clerk users
```

### Testing
- **Jest configuration** in `jest.config.js` with Next.js integration
- **Test utilities** in `__tests__/test-utils.tsx`
- **Coverage collection** from components/, app/, hooks/, utils/
- Some UI tests are skipped due to complexity (marked in config)

### Code Quality
- **ESLint** with Next.js, TypeScript, and Prettier configs
- **Pre-commit hooks** with lint-staged and Husky
- **Path aliases**: Use `@/` for root imports

## Model Relationships

### Core Entities
- **Booking**: References Cabin (ObjectId) and Customer (Clerk user ID string)
- **Cabin**: Standalone entity with capacity, pricing, amenities
- **Dining**: Standalone dining reservation system
- **Experience**: Additional services/activities
- **Settings**: Global business rules and configurations

### Data Flow
1. **Bookings** are central - connect Clerk customers to Cabins
2. **Customer stats** are computed from Booking aggregations
3. **Populated responses** include full Cabin and Customer details
4. **Status transitions**: unconfirmed → confirmed → checked-in → checked-out

## Environment Setup
- **Required**: `MONGODB_URI`, Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- **MongoDB**: Supports both Atlas cloud and local MongoDB
- **Development**: Uses fallback localhost MongoDB connection

## Common Gotchas
- **Clerk integration**: Always use Clerk user IDs for customer references
- **Date handling**: API returns strings, convert to Date objects as needed
- **HeroUI**: Requires specific `pnpm` configuration in `.npmrc`
- **Type safety**: Use `PopulatedBooking` type for API responses with populated data
- **SWR keys**: Use consistent URL-based keys for cache invalidation

## When Adding Features
1. **Models**: Add to `models/` with proper TypeScript interfaces
2. **Types**: Export from `types/index.ts` for consistency  
3. **API routes**: Follow existing error handling and response format
4. **Hooks**: Create SWR hook in `hooks/` directory
5. **Components**: Use HeroUI components with `primitives.ts` variants
6. **Tests**: Add to `__tests__/` with proper mocking for Clerk/MongoDB