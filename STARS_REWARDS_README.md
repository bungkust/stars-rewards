# 🌟 Stars Rewards - Family Task Management App

A modern, family-oriented mobile app that helps parents create and manage task-based reward systems for their children. Built with React, TypeScript, Capacitor, and Supabase.

## ✨ Features

### 👨‍👩‍👧‍👦 Family Management
- **Multi-child support** - Manage multiple children in one family
- **Parent controls** - PIN-protected parental access
- **Family profiles** - Customizable family information

### 🎯 Task & Reward System
- **Custom tasks** - Create age-appropriate tasks for children
- **Reward system** - Stars-based reward currency
- **Task verification** - Parent approval workflow
- **Progress tracking** - Visual charts and statistics

### 🔐 Security & Privacy
- **Soft delete** - Account deletion with 30-day recovery
- **Forgot password** - Email-based password recovery
- **PIN protection** - Secure parental controls
- **Data encryption** - Secure data storage

### 📱 Cross-Platform
- **iOS & Android** - Native mobile apps via Capacitor
- **Responsive design** - Optimized for all screen sizes
- **Offline-ready** - Core functionality works offline

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Android Studio (for Android builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stars-rewards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Supabase setup**
   ```bash
   # Run the database schema
   # File: supabase_schema.sql
   # File: supabase_migration_soft_delete.sql
   ```

5. **Development**
   ```bash
   npm run dev
   ```

### Building for Production

```bash
# Build web assets
npm run build

# Android build
npm run build:android

# iOS build (requires macOS)
npx cap sync ios
npx cap open ios
```

## 📁 Project Structure

```
src/
├── components/
│   ├── design-system/     # Reusable UI components
│   ├── layout/           # Layout components
│   └── modals/           # Modal dialogs
├── pages/
│   ├── auth/             # Authentication pages
│   ├── child/            # Child-facing pages
│   ├── admin/            # Parent/admin pages
│   ├── onboarding/       # Setup flow
│   └── settings/         # App settings
├── services/             # API services
├── store/               # Zustand state management
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

## 🔐 Authentication Flow

### Sign Up Process
1. **Welcome page** → Basic app introduction
2. **Parent setup** → Create parent account
3. **Family setup** → Family name and PIN
4. **Add children** → Child profiles
5. **First task** → Create first task
6. **First reward** → Create first reward

### Login & Recovery
- **Standard login** → Email + password
- **Forgot password** → Email-based recovery
- **Account deletion** → Soft delete with recovery

## 🎨 UI Components

### Design System
- **Colors**: Primary blue (#2563eb), success green, warning yellow, error red
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Buttons, modals, forms, cards, navigation
- **Animations**: Smooth transitions and micro-interactions

### Key Screens
- **Dashboard** → Child's current tasks and progress
- **Tasks** → Available and completed tasks
- **Rewards** → Available rewards and redemption history
- **Statistics** → Progress charts and analytics
- **Settings** → Account management and preferences

## 🗄️ Database Schema

### Core Tables
- **profiles** → User accounts and family info
- **children** → Child profiles
- **tasks** → Task templates
- **rewards** → Reward templates
- **child_tasks_log** → Task completion records
- **coin_transactions** → Star balance ledger

### Security Features
- **Row Level Security (RLS)** → Users only see their own data
- **Soft delete** → `deleted_at` timestamps instead of hard deletes
- **Audit trail** → Transaction logs for compliance

## 🔧 API & Services

### Supabase Integration
- **Authentication** → Sign up, login, password reset
- **Database** → Real-time data synchronization
- **Storage** → File uploads (future feature)
- **Realtime** → Live updates for task approvals

### Data Services
- **fetchChildren()** → Get family children
- **fetchTasks()** → Get active tasks
- **fetchRewards()** → Get available rewards
- **completeTask()** → Submit task for approval

## 📱 Mobile Development

### Capacitor Configuration
- **Plugins**: Status bar, local notifications
- **Icons**: Adaptive icons for iOS/Android
- **Splash screens**: Branded loading screens
- **Permissions**: Minimal required permissions

### Build Process
```bash
# Generate app icons
npx capacitor-assets generate

# Sync with native projects
npx cap sync android
npx cap sync ios

# Open native IDEs
npx cap open android
npx cap open ios
```

## 🔒 Privacy & Compliance

### GDPR Compliance
- ✅ **Right to erasure** → Soft delete with recovery
- ✅ **Data portability** → Export user data
- ✅ **Consent management** → Clear user agreements

### COPPA Compliance
- ✅ **Parental consent** → Parent account required
- ✅ **Children's data** → No collection without parental oversight
- ✅ **Data minimization** → Only necessary data collected

### Security Features
- ✅ **Data encryption** → TLS in transit, encrypted at rest
- ✅ **Secure auth** → Supabase Auth with JWT tokens
- ✅ **Input validation** → Client and server-side validation

## 📊 Google Play Store

### ✅ Compliance Status
- **Privacy Policy** → Hosted and accessible
- **Data Safety Form** → Completed in Play Console
- **Content Rating** → Everyone (3+)
- **Family Policy** → Compliant with family app requirements

### Store Assets
- **App Icon** → 512x512px
- **Feature Graphic** → 1024x500px
- **Screenshots** → 4-6 high-quality images
- **Description** → Family-focused, positive messaging

### Required Documentation
- `GOOGLE_PLAY_COMPLIANCE.md` → Compliance checklist
- `PLAY_STORE_READINESS.md` → Submission guide
- `PRIVACY_POLICY.md` → Complete privacy policy
- `TERMS_AND_CONDITIONS.md` → Terms of service
- `DATA_SAFETY_FORM.md` → Data safety guide

## 🔧 Development Tools

### Code Quality
- **TypeScript** → Type-safe development
- **ESLint** → Code linting and formatting
- **Prettier** → Code formatting
- **Husky** → Git hooks for quality checks

### Testing & Debugging
- **React DevTools** → Component debugging
- **Capacitor DevTools** → Mobile debugging
- **Supabase Dashboard** → Database monitoring

## 🚀 Deployment

### Web Deployment
```bash
npm run build
# Deploy dist/ folder to hosting service (Vercel, Netlify, etc.)
```

### Mobile Deployment
```bash
# Android
npm run build:android
# Upload app-debug.apk or app-release.apk to Play Store

# iOS (requires macOS)
npx cap sync ios
npx cap open ios
# Build and submit via Xcode/App Store Connect
```

## 📞 Support & Documentation

### User Documentation
- **Onboarding flow** → Guided setup for new users
- **Help sections** → In-app help and FAQs
- **Video tutorials** → Step-by-step guides

### Developer Documentation
- `SOFT_DELETE_IMPLEMENTATION.md` → Soft delete details
- `FORGOT_PASSWORD_IMPLEMENTATION.md` → Password reset flow
- `supabase_schema.sql` → Database schema
- `capacitor.config.json` → Mobile configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React** - UI framework
- **Supabase** - Backend-as-a-Service
- **Capacitor** - Cross-platform mobile development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

---

**Built with ❤️ for families everywhere** 👨‍👩‍👧‍👦
