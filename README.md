<p align="center">
  <img src="https://raw.githubusercontent.com/Amadou-dot/assets/main/banners/lodgeflow-banner.png" 
       alt="LodgeFlow Banner" 
       width="100%" />
</p>

<h1 align="center">🏨 LodgeFlow – Hotel Management System</h1>

<p align="center">
  <a href="https://lodgeflow-admin.aseck.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Preview-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Preview"/>
  </a>
  <a href="https://github.com/Amadou-dot/LodgeFlow_admin" target="_blank">
    <img src="https://img.shields.io/badge/Source%20Code-181717?style=for-the-badge&logo=github&logoColor=white" alt="Source Code"/>
  </a>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
</p>

<p align="center">
  A modern hotel management dashboard built with Next.js 15, HeroUI, and MongoDB. Features comprehensive cabin management, booking system, customer profiles, and business analytics.
</p>

---

## ✨ Features

- **📊 Dashboard**: Real-time statistics, revenue charts, occupancy rates
- **🏠 Cabin Management**: CRUD operations, filtering, capacity management
- **📅 Booking System**: Reservation management, status tracking, payment processing
- **👥 Customer Profiles**: Guest information, booking history, preferences
- **⚙️ Settings**: Business rules, pricing, policies configuration
- **🌙 Dark Mode**: Full theme support with smooth transitions
- **📱 Mobile Responsive**: Optimized for all device sizes

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) • [HeroUI v2](https://heroui.com/) • [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [MongoDB](https://mongodb.com/) • [Mongoose ODM](https://mongoosejs.com/)
- **Tools**: [TypeScript](https://www.typescriptlang.org/) • [SWR](https://swr.vercel.app/) • [Recharts](https://recharts.org/)

## � Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB (Atlas or local installation)

### Installation

```bash
# Clone the repository
git clone https://github.com/Amadou-dot/LodgeFlow_admin.git
cd LodgeFlow_admin

# Install dependencies
pnpm install
```

### Database Setup

**MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Add to `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/lodgeflow
```

**Local MongoDB**
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. Use the default local configuration

### Initialize & Run

```bash
# Test database connection
pnpm tsx scripts/test-connection.ts

# Seed with sample data
pnpm seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## � Project Structure

```
app/
├── (auth)/           # Auth-protected routes
├── (dashboard)/      # Main dashboard routes
├── api/             # API routes
└── layout.tsx       # Root layout

components/          # Reusable UI components
hooks/              # Custom React hooks
models/             # MongoDB schemas
types/              # TypeScript definitions
lib/                # Utilities & configurations
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Amadou-dot">Amadou</a>
</p>
