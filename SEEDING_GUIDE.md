# Database Seeding and Data Extraction Guide

This guide covers the updated seeding workflow for the LodgeFlow application, where user management has been migrated from MongoDB to Clerk.

## 📋 Overview

The seeding system has been updated to accommodate the migration from MongoDB-based user management to Clerk authentication. This separation allows for:

- **MongoDB**: Manages business data (cabins, dining, experiences, bookings, settings)
- **Clerk**: Manages user authentication and profiles
- **Data Extraction**: Scripts to safely extract existing data for migration or backup

## 🗂️ Available Scripts

### Data Extraction Scripts

These scripts extract existing data from your database for backup, migration, or seeding purposes:

```bash
# Extract cabin data
npx tsx scripts/extract-cabins.ts

# Extract dining data
npx tsx scripts/extract-dining.ts

# Extract experiences data
npx tsx scripts/extract-experiences.ts

# Extract settings data (read-only)
npx tsx scripts/extract-settings.ts
```

### User Management

```bash
# Get existing Clerk users
npm run clerk:list
npx tsx scripts/get-clerk-users.ts

# Create new users in Clerk
npm run clerk:users
npx tsx scripts/create-clerk-users.ts

# Verify bookings are using correct user IDs
npx tsx scripts/verify-bookings.ts
```

### Database Seeding

```bash
# Seed database with business data (cabins, dining, experiences, bookings)
npm run seed
# or
npx tsx scripts/seed.ts
```

## 🔄 New Workflow

### 1. **Data Extraction** (Optional)
If you have existing data you want to preserve:

```bash
# Extract all data types
npx tsx scripts/extract-cabins.ts
npx tsx scripts/extract-dining.ts
npx tsx scripts/extract-experiences.ts
npx tsx scripts/extract-settings.ts
```

### 2. **Get Current Clerk Users**
Fetch existing Clerk users for booking associations:

```bash
npm run clerk:list
# or
npx tsx scripts/get-clerk-users.ts
```

This will:
- Fetch all existing users from Clerk
- Generate `clerk-users-list.json` with full user data
- Generate `clerk-user-ids.json` with just the IDs
- Display user summary in console

### 3. **Create Additional Clerk Users** (Optional)
If you need more test users, create new ones:

```bash
npm run clerk:users
# or
npx tsx scripts/create-clerk-users.ts
```

This will:
- Create new sample users in Clerk
- Generate phone numbers and realistic profiles
- Handle phone number validation requirements

### 4. **Seed Database**
Run the main seeding script (automatically uses real Clerk user IDs):

```bash
npm run seed
```

The seed script will:
- Automatically load real Clerk user IDs from `clerk-user-ids.json`
- Fall back to sample IDs if the file doesn't exist
- Create bookings using real Clerk user associations

```bash
npm run seed
```

This will create:
- Settings (1 record)
- Cabins (15 records)
- Experiences (7 records)
- Dining items (varies based on data)
- Bookings (150 records using Clerk user IDs)

## 📊 Data Collections

### **Managed by MongoDB** (Can be added to)
- ✅ **Cabins**: Accommodation inventory
- ✅ **Dining**: Restaurant and menu items
- ✅ **Experiences**: Activities and tours
- ✅ **Bookings**: Reservation records (linked to Clerk users via ID)
- ⚠️ **Settings**: Configuration data (should NOT be changed)

### **Managed by Clerk**
- 👥 **Users**: Authentication and user profiles
- 🔐 **Sessions**: User authentication sessions
- 🛡️ **Permissions**: Role-based access control

## 🔍 Data Relationships

### Before (MongoDB Users)
```
Booking ──► Customer (MongoDB)
         ├─ name, email, phone
         └─ profile data
```

### After (Clerk Users)
```
Booking ──► Clerk User ID (string)
         └─ User data fetched via Clerk API
```

## 🚨 Important Notes

### **Settings Collection**
- **DO NOT MODIFY** the settings collection in production
- Settings contain critical business rules and pricing
- Use extract-settings.ts to backup current settings
- Only modify settings through the admin interface

### **Data Integrity**
- Bookings now reference Clerk user IDs as strings
- Customer statistics are calculated on-demand via Clerk API
- No MongoDB customer records are created or maintained

### **Migration Strategy**
If migrating existing MongoDB customers to Clerk:

1. Extract existing customer data
2. Create corresponding Clerk users
3. Update booking records with new Clerk user IDs
4. Remove old customer collection

## 🛠️ Development Setup

### Environment Variables
Ensure you have the required environment variables:

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/lodgeflow
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Running Scripts
All scripts support TypeScript and can be run directly:

```bash
# Development
npx tsx scripts/[script-name].ts

# Production
npm run seed
```

## 📈 Monitoring and Validation

### After Seeding
Verify your data:

```bash
# Check MongoDB collections
mongo lodgeflow --eval "db.cabins.countDocuments()"
mongo lodgeflow --eval "db.bookings.countDocuments()"
mongo lodgeflow --eval "db.dining.countDocuments()"
mongo lodgeflow --eval "db.experiences.countDocuments()"

# Check Clerk users (via admin dashboard)
# Visit: https://dashboard.clerk.com/last-active?path=users
```

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Issues**
```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ismaster')"
```

**Clerk API Issues**
```bash
# Verify environment variables
echo $CLERK_SECRET_KEY
```

**TypeScript Errors**
```bash
# Clear build cache
rm -rf .next
npm run build
```

### Support

If you encounter issues:
1. Check environment variables are properly set
2. Ensure MongoDB is running and accessible
3. Verify Clerk API keys are valid
4. Review logs for specific error messages

---

**Last Updated**: September 2025
**Applies To**: LodgeFlow v2.0+ (Clerk Integration)
