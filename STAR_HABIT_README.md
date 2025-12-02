# 🌟 Star Habit - Family Task Management App

A modern, family-oriented mobile app that helps parents create and manage task-based reward systems for their children. Built with React, TypeScript, Capacitor, and Supabase.

## ✨ Features

### 👨‍👩‍👧‍👦 Family Management
- **Multi-child support** - Manage multiple children in one family
- **Parent controls** - PIN-protected parental access
- **Family profiles** - Customizable family information

### 📝 Task Management
- **Visual task creation** - Easy-to-use interface for creating tasks
- **Task categories** - Organize tasks by type (chores, homework, etc.)
- **Task verification** - Parent approval system for completed tasks
- **Recurring tasks** - Set up daily, weekly, or custom recurring tasks

### 🎁 Reward System
- **Digital currency** - Star-based reward system
- **Reward catalog** - Pre-defined and custom rewards
- **Redemption tracking** - Monitor reward usage and history
- **Balance management** - Track each child's star balance

### 👶 Child Interface
- **Child-friendly UI** - Simple, engaging interface for children
- **Progress tracking** - Visual progress indicators
- **Achievement badges** - Gamification elements
- **Age-appropriate design** - Designed for children 6-12 years old

### 👨‍👩‍👧 Parent Dashboard
- **Real-time monitoring** - Live updates on task completion
- **Analytics & reporting** - Detailed family activity reports
- **Settings management** - Family and app configuration
- **Notification system** - Alerts for task completion and verification

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Framer Motion** - Smooth animations and transitions
- **React Router v7** - Declarative routing
- **Recharts** - Data visualization components

### Mobile
- **Capacitor** - Native mobile app framework
- **Android & iOS support** - Cross-platform compatibility
- **Native APIs** - Camera, notifications, status bar
- **Deep linking** - Password reset and app navigation

### Backend
- **Supabase** - Open source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Real-time subscriptions** - Live data synchronization
- **Authentication** - Secure user management
- **File storage** - Image and media uploads

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Zustand** - Lightweight state management
- **React Query** - Server state management

## 📱 Mobile Features

### Native Capabilities
- **Push Notifications** - Task reminders and updates
- **Camera Integration** - Photo proof for task completion
- **Offline Support** - Basic functionality without internet
- **App Shortcuts** - Quick access to common actions

### Deep Linking
- **Password Reset** - Direct app opening from email links
- **Universal Links** - iOS universal link support
- **App Links** - Android app link verification
- **Custom URL Schemes** - Fallback deep linking

## 🔒 Security & Privacy

### Data Protection
- **End-to-end encryption** - Secure data transmission
- **GDPR compliance** - European privacy regulations
- **Children's privacy** - COPPA compliance considerations
- **Data minimization** - Only collect necessary information

### Authentication
- **Secure login** - Email/password authentication
- **Session management** - Automatic token refresh
- **PIN protection** - Additional parental security
- **Account recovery** - Secure password reset flow

## 🎨 Design Philosophy

### User Experience
- **Mobile-first design** - Optimized for mobile devices
- **Intuitive navigation** - Easy-to-understand interface
- **Progressive disclosure** - Show complexity gradually
- **Accessibility** - Screen reader and keyboard support

### Visual Design
- **Clean aesthetics** - Modern, family-friendly design
- **Consistent branding** - Star-themed visual identity
- **Responsive layout** - Adapts to different screen sizes
- **Dark mode support** - Comfortable viewing in all conditions

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Android Studio (for Android development)
- Xcode (for iOS development)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd star-habit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Add mobile platforms**
   ```bash
   npx cap add android
   npx cap add ios
   ```

6. **Build and run**
   ```bash
   npm run build
   npx cap sync
   npx cap run android  # or ios
   ```

## 📊 Database Schema

### Core Tables
- **profiles** - User profile information
- **children** - Child account details
- **tasks** - Task definitions and templates
- **child_tasks_log** - Task completion records
- **rewards** - Available rewards
- **coin_transactions** - Star balance transactions
- **task_verifications** - Parent verification queue

### Relationships
- Users have multiple children
- Tasks belong to parents and can be assigned to children
- Children earn stars through completed tasks
- Stars can be redeemed for rewards

## 🔄 Development Workflow

### Branch Strategy
- **main** - Production-ready code
- **develop** - Integration branch
- **feature/*** - Feature development
- **bugfix/*** - Bug fixes
- **hotfix/*** - Critical production fixes

### Code Quality
- **TypeScript strict mode** - Type safety
- **ESLint configuration** - Code consistency
- **Pre-commit hooks** - Automated quality checks
- **Unit testing** - Component and utility testing

### Deployment
- **Staging environment** - Pre-production testing
- **Production deployment** - Automated CI/CD
- **Rollback capability** - Quick reversion if needed
- **Monitoring** - Error tracking and analytics

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic task and reward management
- ✅ Parent and child interfaces
- ✅ Mobile app deployment
- ✅ Real-time synchronization

### Phase 2 (Upcoming)
- 🔄 Advanced analytics and reporting
- 🔄 Social features (family sharing)
- 🔄 Integration with external services
- 🔄 Advanced gamification features

### Phase 3 (Future)
- 📋 AI-powered task suggestions
- 📋 Voice commands and accessibility
- 📋 Multi-language support
- 📋 Advanced customization options

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines for details on how to get involved.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, feature requests, or bug reports, please contact the development team.

---

**Built with ❤️ for families everywhere**
