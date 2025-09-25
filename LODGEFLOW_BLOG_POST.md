# Building LodgeFlow: A Modern Hotel Management System with Next.js 15 and HeroUI

In the hospitality industry, efficient management systems are crucial for delivering exceptional guest experiences while maintaining operational efficiency. Today, I'm excited to share **LodgeFlow**, a comprehensive hotel management dashboard that demonstrates the power of modern web technologies in creating sophisticated business applications.

## Project Overview

LodgeFlow is a full-stack hotel management system built with cutting-edge technologies, designed to handle everything from cabin bookings and guest management to dining reservations and business analytics. The application showcases how modern React frameworks can be leveraged to create enterprise-grade solutions with elegant user interfaces and robust functionality.

### Key Features

- **Real-time Dashboard**: Dynamic statistics, revenue charts, and occupancy tracking
- **Comprehensive Booking System**: Complete reservation management with payment processing
- **Guest Management**: Detailed customer profiles with booking history and preferences
- **Cabin Management**: Full CRUD operations for accommodation inventory
- **Dining & Experience Management**: Restaurant and activity booking integration
- **Business Analytics**: Data visualization with interactive charts and insights
- **Responsive Design**: Optimized for all devices with modern UI components
- **Dark Mode Support**: Complete theme switching with smooth transitions

## Technology Stack

### Frontend Framework: Next.js 15

The foundation of LodgeFlow is built on **Next.js 15**, leveraging the latest App Router for optimal performance and an enhanced developer experience:

```typescript
// app/layout.tsx - Root layout with modern Next.js structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang='en'>
      <head />
      <body
        className={clsx(
          'min-h-screen text-foreground bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <DynamicClerkProvider>{children}</DynamicClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### UI Framework: HeroUI v2

One of the standout aspects of LodgeFlow is its use of **HeroUI v2**, a modern React component library that provides beautiful, accessible components out of the box. The integration showcases how modern UI libraries can accelerate development while maintaining design consistency:

```json
{
  "@heroui/button": "2.2.24",
  "@heroui/card": "^2.2.23",
  "@heroui/table": "^2.2.24",
  "@heroui/modal": "^2.2.21",
  "@heroui/date-picker": "^2.3.27"
}
```

### Authentication: Clerk Integration

Security is paramount in hotel management systems. LodgeFlow implements **Clerk** for robust authentication and user management:

```typescript
// components/DynamicClerkProvider.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export function DynamicClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3b82f6',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
```

### Database: MongoDB with Mongoose

The application uses **MongoDB** as its primary database, providing flexibility for complex data structures common in hospitality management:

```typescript
// lib/mongodb.ts - Connection management with proper caching
async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lodgeflow';

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  return await cached!.promise;
}
```

## Architecture Deep Dive

### Data Models

The application implements well-structured data models that reflect real-world hospitality business logic:

```typescript
// models/Booking.ts - Core booking model
export interface IBooking extends Document {
  _id: string;
  cabin: mongoose.Types.ObjectId;
  customer: string; // Clerk user ID
  checkInDate: Date;
  checkOutDate: Date;
  numNights: number;
  numGuests: number;
  status: 'unconfirmed' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'online';
  extras: {
    hasBreakfast: boolean;
    breakfastPrice: number;
    hasPets: boolean;
    petFee: number;
    // ... additional extras
  };
  observations?: string;
  specialRequests?: string[];
  depositPaid: boolean;
  depositAmount: number;
  remainingAmount: number;
}
```

### Custom Hooks for Data Management

LodgeFlow demonstrates excellent separation of concerns through custom hooks that encapsulate business logic and provide clean APIs:

```typescript
// hooks/useBookings.ts - Centralized booking management
export const useBookings = (filters: BookingsFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const { data, error, isLoading, mutate } = useSWR<BookingsResponse>(
    `/api/bookings?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    bookings: data?.bookings || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
};
```

### API Design

The application implements a robust API layer with proper error handling and data validation:

```typescript
// app/api/bookings/route.ts - RESTful API implementation
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('cabin')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Populate with Clerk customer data
    const populatedBookings = await populateBookingsWithClerkCustomers(bookings);

    return NextResponse.json({
      success: true,
      data: populatedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        limit,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
```

## Component Architecture

### Form Management

The booking form showcases sophisticated form handling with real-time validation and dynamic pricing calculations:

```typescript
// components/BookingForm.tsx - Complex form management
export default function BookingForm({ onSuccess, onCancel, prefillData }: BookingFormProps) {
  const createBooking = useCreateBooking();
  const bookingFormHook = useBookingForm();
  const { validateForm, buildBookingData, handleInputChange } = bookingFormHook;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const bookingData = buildBookingData();
      await createBooking.mutateAsync(bookingData);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <BookingFormFields
        formData={bookingFormHook.formData}
        priceBreakdown={bookingFormHook.priceBreakdown}
        selectedCabin={bookingFormHook.selectedCabin}
        // ... other props
      />
      <FormActions onCancel={onCancel} isLoading={createBooking.isPending} />
    </form>
  );
}
```

### Dashboard Components

The dashboard demonstrates effective data visualization with responsive design:

```typescript
// app/(dashboard)/page.tsx - Main dashboard layout
export default function Dashboard() {
  return (
    <section className='flex flex-col gap-6 md:gap-8'>
      <Title title='Overview' />
      <OverviewInfoCards />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <TodayActivity />
        <DurationChart />
      </div>
      <AreaChart />
    </section>
  );
}
```

## Development Features

### Testing Strategy

LodgeFlow implements comprehensive testing with Jest and React Testing Library:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1"
  }
}
```

### Code Quality Tools

The project maintains high code quality through modern tooling:

```json
{
  "scripts": {
    "lint": "eslint --fix",
    "format": "prettier --write .",
    "ci:check": "npm run format:check && npm run lint && npm run test"
  }
}
```

### Performance Optimization

- **Turbopack**: Utilizing Next.js 15's Turbopack for faster development builds
- **SWR**: Intelligent data fetching with caching and revalidation
- **React Query**: Advanced state management for server state
- **Code Splitting**: Automatic route-based code splitting with Next.js

## Styling and Design System

### Tailwind CSS Integration

LodgeFlow leverages Tailwind CSS for utility-first styling with custom design tokens:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
```

### Theme Management

The application implements sophisticated theme switching with next-themes:

```typescript
// Provider configuration for theme management
<Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
  <DynamicClerkProvider>{children}</DynamicClerkProvider>
</Providers>
```

## Business Logic Implementation

### Customer Statistics Tracking

The system automatically updates customer statistics when bookings are created or modified:

```typescript
// Automatic customer statistics updates
async function updateCustomerStats(customerId: string) {
  const customerBookings = await Booking.find({ customer: customerId });

  const totalBookings = customerBookings.length;
  const totalSpent = customerBookings.reduce(
    (sum, booking) => sum + (booking.totalPrice || 0), 0
  );

  await Customer.findByIdAndUpdate(customerId, {
    totalBookings,
    totalSpent,
    lastBookingDate: sortedBookings[0]?.createdAt || null,
  });
}
```

### Dynamic Pricing System

The application implements complex pricing calculations with multiple factors:

```typescript
// Dynamic pricing with extras and fees
const calculateTotalPrice = (basePrice, extras, numNights) => {
  let total = basePrice * numNights;

  if (extras.hasBreakfast) total += extras.breakfastPrice * numNights;
  if (extras.hasPets) total += extras.petFee;
  if (extras.hasEarlyCheckIn) total += extras.earlyCheckInFee;

  return total;
};
```

## Deployment and DevOps

### Environment Configuration

The project supports multiple deployment environments with proper configuration management:

```bash
# Environment variables structure
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lodgeflow
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Build Optimization

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```

## Key Learning Points

### 1. Modern React Patterns

LodgeFlow demonstrates several modern React patterns:

- **Custom Hooks**: Encapsulating complex business logic
- **Compound Components**: Building flexible, reusable UI components
- **Server Components**: Leveraging Next.js 15's server components for performance
- **Suspense Boundaries**: Proper loading state management

### 2. Data Management Strategy

The application showcases effective data management through:

- **SWR for Client State**: Automatic caching and revalidation
- **React Query for Mutations**: Optimistic updates and error handling
- **MongoDB Integration**: Flexible schema design for complex business data

### 3. User Experience Focus

The application prioritizes user experience through:

- **Responsive Design**: Mobile-first approach with HeroUI components
- **Loading States**: Comprehensive loading and error state management
- **Real-time Updates**: Live data updates for critical business metrics
- **Intuitive Navigation**: Clean, organized interface design

### 4. Developer Experience

- **Type Safety**: Full TypeScript implementation
- **Code Quality**: ESLint, Prettier, and automated testing
- **Modern Tooling**: Turbopack, advanced bundling, and optimization

## Performance Metrics

The application achieves excellent performance through:

- **Fast Development Builds**: Turbopack reduces build times by up to 10x
- **Optimized Bundle Size**: Tree shaking and code splitting
- **Database Optimization**: Connection pooling and query optimization
- **Client-Side Caching**: SWR provides intelligent caching strategies

## Future Enhancements

The LodgeFlow architecture is designed for scalability and future enhancements:

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Mobile Application**: React Native companion app
3. **Advanced Analytics**: Machine learning for demand forecasting
4. **Multi-property Support**: Scaling to hotel chain management
5. **Integration APIs**: Third-party service integrations (payment processors, PMS systems)

## Conclusion

LodgeFlow represents a comprehensive example of modern web application development, showcasing how cutting-edge technologies can be combined to create sophisticated business solutions. The project demonstrates:

- **Technical Excellence**: Modern frameworks and best practices
- **Business Logic**: Real-world hospitality management requirements
- **User Experience**: Intuitive interfaces with responsive design
- **Scalability**: Architecture designed for growth and expansion

The combination of Next.js 15, HeroUI v2, MongoDB, and Clerk creates a powerful foundation for enterprise applications. The emphasis on developer experience through TypeScript, comprehensive testing, and modern tooling ensures maintainable and reliable code.

Whether you're building hospitality management systems or other complex business applications, LodgeFlow serves as an excellent reference implementation of modern web development practices. The project showcases how thoughtful architecture decisions and modern tooling can result in applications that are both powerful for users and maintainable for developers.

## Getting Started

To explore LodgeFlow yourself:

```bash
# Clone and install
git clone https://github.com/Amadou-dot/LodgeFlow_admin.git
cd LodgeFlow_admin
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Add your MongoDB URI and Clerk keys

# Initialize database
pnpm seed

# Start development server
pnpm dev
```

The project is open source and contributions are welcome. Whether you're interested in hospitality management systems, modern React development, or full-stack application architecture, LodgeFlow offers valuable insights and practical implementation examples.

---

*LodgeFlow is actively maintained and represents the evolution of modern web application development. The project continues to incorporate new technologies and patterns as they emerge in the rapidly evolving web development landscape.*
