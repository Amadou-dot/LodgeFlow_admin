# LodgeFlow - Hotel Management System
[Live preview](https://loadgeflow-admin.aseck.dev/)

A modern hotel management dashboard built with Next.js 15, HeroUI, and MongoDB. Features comprehensive cabin management, booking system, customer profiles, and business analytics.

## 🚀 Features

- **Dashboard**: Real-time statistics, revenue charts, occupancy rates
- **Cabin Management**: CRUD operations, filtering, capacity management
- **Booking System**: Reservation management, status tracking, payment processing
- **Customer Profiles**: Guest information, booking history, preferences
- **Settings**: Business rules, pricing, policies configuration
- **Dark Mode**: Full theme support with smooth transitions
- **Mobile Responsive**: Optimized for all device sizes

## 🛠 Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [HeroUI v2](https://heroui.com/) - Modern React UI library
- [MongoDB](https://mongodb.com/) - NoSQL database with Mongoose ODM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Data visualization library
- [SWR](https://swr.vercel.app/) - Data fetching and caching
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## 📦 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

**Option A: MongoDB Atlas (Recommended)**

1. Create free account at https://mongodb.com/atlas
2. Create cluster and get connection string
3. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/lodgeflow
```

**Option B: Local MongoDB**

1. Install MongoDB Community Server
2. Start MongoDB service
3. Use existing `.env.local` configuration

### 3. Initialize Database

```bash
# Test connection
pnpm tsx scripts/test-connection.ts

# Seed with sample data
pnpm seed
```

### 4. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your hotel management dashboard!

## 📚 Detailed Setup

For detailed MongoDB setup instructions, see [MONGODB_SETUP.md](./MONGODB_SETUP.md)

## 🎯 Project Structure

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
