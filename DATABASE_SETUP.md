# Environment Setup

You have two options for MongoDB:

## Option 1: Local MongoDB (Recommended for Development)
1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use the current `.env.local` with: `MONGODB_URI=mongodb://localhost:27017/thewildoasis`

## Option 2: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `.env.local` with: `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/thewildoasis`

## Running the Seed Script

Once you have MongoDB set up:

```bash
# Seed the database with sample data
pnpm seed
```

This will create:
- 5 sample cabins with different capacities and prices
- 20 sample customers with realistic profiles
- 40 sample bookings with various statuses
- 1 settings configuration

## Development Commands

```bash
# Start development server
pnpm dev

# Seed database
pnpm seed

# Install dependencies
pnpm install
```

## Environment Variables

Create or update `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```
