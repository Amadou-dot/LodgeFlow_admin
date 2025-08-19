# Quick MongoDB Atlas Setup for LodgeFlow

Since MongoDB isn't installed locally, here's the fastest way to get your database running:

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create Free Account**

   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create a Cluster**

   - Choose "Build a Database"
   - Select "M0 Sandbox" (Free tier)
   - Choose your preferred region
   - Name your cluster (e.g., "lodgeflow")

3. **Setup Database Access**

   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username/password (save these!)
   - Set "Built-in Role" to "Atlas Admin"

4. **Setup Network Access**

   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Click "Confirm"

5. **Get Connection String**

   - Go to "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

6. **Update Environment**
   - Update your `.env.local` with the Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/lodgeflow?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB (Advanced)

If you prefer local development:

1. **Install MongoDB Community Server**

   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for Windows

2. **Start MongoDB Service**

   ```powershell
   # Start MongoDB service
   net start MongoDB
   ```

3. **Keep current .env.local**
   - Your current local URI should work: `mongodb://localhost:27017/lodgeflow`

## Test Your Setup

Once you have MongoDB running (Atlas or local):

```bash
# Test connection
pnpm tsx scripts/test-connection.ts

# If successful, seed the database
pnpm seed

# Start the development server
pnpm dev
```

## Next Steps

After setting up MongoDB:

1. Run the connection test
2. Seed the database with sample data
3. Test the application with real MongoDB data
4. All your existing UI will now work with the database!
