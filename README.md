# Star Habit - Family Habit Tracker App

A mobile-first React application built with TypeScript, Vite, Capacitor, and Supabase for managing family habits and rewards.

## 🚀 Features

- **Family Habit Tracking**: Create and manage habits for children with visual progress tracking
- **Reward System**: Set up rewards that children can earn through completing habits
- **Parent Dashboard**: Admin interface for parents to manage tasks and rewards
- **Child Interface**: Simple, gamified interface for children to track their progress
- **Real-time Updates**: Live synchronization across devices using Supabase
- **Mobile App**: Native Android and iOS apps built with Capacitor
- **Deep Linking**: Password reset links open directly in the mobile app

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, DaisyUI
- **Build Tool**: Vite
- **Mobile**: Capacitor (Android & iOS)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📱 Getting Started

### Prerequisites
- Node.js 18+
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd star-habit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Mobile Development**
   ```bash
   # Add platforms
   npx cap add android
   npx cap add ios

   # Build and sync
   npm run build
   npx cap sync
   ```

## 📱 Building for Production

### Android APK
```bash
npm run build:android
```

### Web Deployment
```bash
npm run build
npm run deploy:netlify
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL migrations in `supabase_schema.sql`
3. Configure authentication settings
4. Update environment variables

### Deep Linking
- Custom URL scheme: `starhabit://`
- Configured for password reset flows
- Android intent filters in `AndroidManifest.xml`

## 📋 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:android` - Build Android APK
- `npm run lint` - Run ESLint
- `npm run deploy:netlify` - Deploy to Netlify

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── design-system/   # Design system components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── admin/           # Parent dashboard pages
│   ├── child/           # Child interface pages
│   └── onboarding/      # Onboarding flow
├── services/            # API services
├── store/               # State management (Zustand)
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.