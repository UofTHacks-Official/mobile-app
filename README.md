# 🎉 UofTHacks Mobile App

> The official mobile application for UofTHacks - Canada's largest student-run hackathon. Built with Expo and React Native for a seamless cross-platform experience.

## 📱 Overview

This mobile application serves as the central hub for UofTHacks participants, administrators, and volunteers. It provides comprehensive event management, schedule viewing, hackathon currency (HackerBucks) transactions, and user authentication with role-based access control.

### 🎯 Key Features

- **📅 Interactive Schedule**: Auto-scrolling timeline with current time indicators and event filtering
- **💰 HackerBucks System**: Digital currency for hackathon rewards and transactions
- **👤 Role-Based Authentication**: Separate interfaces for participants, volunteers, and administrators
- **📱 QR Code Integration**: Camera-based authentication and transaction system
- **🎊 Delightful UX**: Confetti animations and smooth interactions
- **🌓 Dark/Light Mode**: Automatic theme switching with system preferences
- **📍 Offline Support**: Cached data for essential features when offline

## 🛠 Tech Stack

### Core Technologies

- **[Expo SDK 53](https://expo.dev/)** - Development platform with new architecture
- **[React Native](https://reactnative.dev/)** - Cross-platform mobile development
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript with strict mode
- **[Expo Router](https://expo.github.io/router/)** - File-based routing system

### State Management & Data

- **[TanStack Query](https://tanstack.com/query/)** - Powerful data fetching and caching
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Axios](https://axios-http.com/)** - HTTP client with automatic token refresh

### UI/UX

- **[NativeWind](https://www.nativewind.dev/)** - Tailwind CSS for React Native
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Advanced animations
- **[Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)** - Tactile feedback
- **[React Native Confetti Cannon](https://github.com/VincentCATILLON/react-native-confetti-cannon)** - Celebration animations

### Security & Storage

- **[Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)** - Encrypted token storage
- **[Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)** - Biometric authentication
- **JWT Token Refresh** - Automatic authentication renewal

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS version 18+) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Expo CLI** - `npm install -g @expo/cli`
- **Mobile Device** with [Expo Go](https://expo.dev/client) installed
- **Development Environment**:
  - iOS: Xcode (macOS only) for iOS Simulator
  - Android: Android Studio for Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the App

```bash
# Start the development server
npx expo start

# Platform-specific shortcuts
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web browser
```

**Quick Start Options:**

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

## 📁 Project Structure

```
mobile/
├── 📱 app/                          # Expo Router file-based routing
│   ├── 🏠 index.tsx                 # App entry point with auth redirect
│   ├── 🎨 globals.css               # Global Tailwind styles
│   ├── 🔧 _layout.tsx               # Root layout with providers
│   ├── 🚪 landing.tsx               # Welcome/landing screen
│   │
│   ├── 🔐 auth/                     # Authentication flow
│   │   ├── 📷 camera.tsx            # Camera permissions
│   │   ├── 🎯 selectRole.tsx        # User role selection
│   │   ├── 📧 signInAdmin.tsx       # Admin login
│   │   └── 📱 signUp.tsx            # User registration
│   │
│   ├── 👑 (admin)/                  # Admin-only routes (grouped)
│   │   ├── 🏠 index.tsx             # Admin dashboard
│   │   ├── 📅 schedule.tsx          # Event schedule management
│   │   ├── 👤 profile.tsx           # Admin profile
│   │   ├── 📱 qr.tsx                # QR code scanner
│   │   └── 💰 hackerbucks/          # HackerBucks management
│   │       ├── 🏠 index.tsx         # HackerBucks dashboard
│   │       ├── 📤 sendHbucks.tsx    # Send currency
│   │       ├── ✅ confirmHBucks.tsx # Transaction confirmation
│   │       └── 🎉 success.tsx       # Success screen
│   │
│   └── 📊 schedule-detail/          # Dynamic routes
│       └── [scheduleID].tsx         # Individual event details
│
├── 📦 src/                          # Source code organization
│   ├── 🧩 components/               # Reusable UI components
│   │   ├── ⚡ bottom/bottomNavBar.tsx # Navigation component
│   │   ├── 📅 schedule/             # Schedule-related components
│   │   │   ├── 📍 CurrentTimeIndicator.tsx
│   │   │   ├── 📝 Event.tsx
│   │   │   ├── 🔽 FilterMenu.tsx
│   │   │   └── ⏰ TimeSlot.tsx
│   │   ├── 🎊 onboarding/           # Welcome flow components
│   │   │   ├── 🎯 OnboardingModal.tsx (with confetti!)
│   │   │   └── 📋 OnboardingScreen.tsx
│   │   └── 💰 hacker_bucks/         # Currency components
│   │
│   ├── 🗄️ context/                  # React Context providers
│   │   ├── 🔐 authContext.tsx       # Authentication state
│   │   └── 🌓 themeContext.tsx      # Theme management
│   │
│   ├── 🔄 queries/                  # TanStack Query hooks
│   │   ├── 📅 schedule/             # Schedule data fetching
│   │   ├── 👤 user.ts               # User data queries
│   │   └── 💰 hackerBucks.ts        # Currency queries
│   │
│   ├── 📡 requests/                 # API layer
│   │   ├── 🔧 axios.ts              # Axios instance
│   │   ├── ⚙️ axiosConfig.ts        # Interceptors & token refresh
│   │   └── 🎫 admin.ts              # Admin API endpoints
│   │
│   ├── 🏪 reducers/                 # Zustand stores
│   │   ├── 💰 hackerbucks.ts        # Currency state management
│   │   └── 🧭 bottomNavBar.ts       # Navigation state
│   │
│   ├── 📱 types/                    # TypeScript definitions
│   │   └── 📅 schedule.ts           # Event/schedule types
│   │
│   └── 🛠️ utils/                    # Utility functions
│       ├── 🎨 theme.ts              # Theme utilities
│       ├── 📱 fonts.ts              # Font configuration
│       ├── 🔐 tokens/               # Token management
│       │   ├── 🗄️ secureStorage.ts  # Encrypted storage
│       │   └── 🎫 token.ts          # JWT utilities
│       └── 📹 camera/permissions.ts # Camera access utils
│
├── 🎨 assets/                       # Static assets
│   ├── 🔤 fonts/                    # Custom font files
│   │   ├── Onest-*.ttf             # Modern heading font
│   │   └── OpenSans-*.ttf          # Readable body font
│   └── 🖼️ images/                   # App images & icons
│       ├── 🌅 bg/                   # Background images
│       └── 🐨 animals/              # Cute mascot images
│
├── ⚙️ Configuration Files
├── 📋 package.json                  # Dependencies & scripts
├── 🎨 tailwind.config.js            # Custom color palette
├── 📝 tsconfig.json                 # TypeScript config (strict mode)
├── 🔧 babel.config.js               # Babel configuration
├── 🏗️ eas.json                      # Expo build configuration
├── 🎯 metro.config.js               # Metro bundler config
└── 📖 README.md                     # You are here!
```

### 🗂️ Expo Router Conventions

- **File-based Routing**: `app/screen.tsx` → `/screen`
- **Layout Files**: `_layout.tsx` defines shared UI for route groups
- **Grouped Routes**: `(admin)/` groups routes without URL segments
- **Dynamic Routes**: `[param].tsx` creates dynamic route parameters
- **Private Files**: `_file.tsx` are not treated as routes (utilities)

## 🔐 Authentication System

### Token-Based Authentication Flow

1. **🔑 Login Process**
   - User provides credentials
   - Backend validates and returns JWT tokens
   - Tokens stored securely using Expo SecureStore

2. **🎫 Token Management**
   - **Access Token**: Short-lived (1 hour) for API requests
   - **Refresh Token**: Long-lived (24 hours) for token renewal
   - **Automatic Refresh**: Seamless token renewal on expiry

3. **🔄 Request Interceptor Flow**
   ```typescript
   API Request → 401 Unauthorized → Queue Request →
   Use Refresh Token → Get New Access Token →
   Retry Original Request → Success
   ```

### 🛡️ Security Features

- **🔒 Encrypted Storage**: All tokens stored with Expo SecureStore
- **📱 Biometric Auth**: Touch ID/Face ID for sensitive operations
- **🔄 Auto-refresh**: Transparent token renewal
- **📤 Request Queuing**: Multiple requests handled during refresh
- **🚪 Auto-logout**: Secure cleanup on token expiry

## 🎨 Design System

### Color Palette

Our custom UofT-inspired color system (defined in `tailwind.config.js`):

```javascript
// Primary Colors
uoft_primary_blue: "#2A398C"; // Main brand color
uoft_orange: "#FF6F51"; // Secondary accent

// Accent Colors
uoft_accent_purple: "#E9B6F7"; // Soft purple
uoft_accent_red: "#F85C5C"; // Alert red
uoft_accent_cream: "#F3E7E3"; // Warm cream

// Neutral Colors
uoft_black: "#181818"; // Rich black
uoft_white: "#F6F6F6"; // Soft white
uoft_stark_white: "#FFFFFF"; // Pure white
uoft_grey_light: "#C6C6C6"; // Light grey
uoft_grey_medium: "#A0A0A0"; // Medium grey
uoft_grey_lighter: "#E0E0E0"; // Very light grey
```

### 🎭 Typography System

**Primary Fonts:**

- **Onest**: Modern, geometric font for headings and emphasis
- **Open Sans**: Highly readable font for body text and UI elements

**Usage Examples:**

```tsx
// Headings - Bold and impactful
<Text className="font-onest-bold text-2xl">Main Title</Text>

// Body text - Clear and readable
<Text className="font-opensans text-base">Body content</Text>

// UI elements - Clean and functional
<Text className="font-opensans-semibold text-sm">Button Text</Text>
```

For complete font documentation, see [`FONTS_README.md`](./FONTS_README.md).

### 🎨 Design References

- **Figma Design**: [UofTHacks Admin Portal](https://www.figma.com/design/JAjBHJM4XPAmJBVFqFRMdb/admin-portal?node-id=153-2066&t=nNqdgXeCxlmdAdlw-1)
- **NativeWind Docs**: [Styling with Tailwind CSS](https://www.nativewind.dev/)

## ✨ Key Features Deep Dive

### 📅 Smart Schedule System

- **🕒 Auto-scroll to Current Time**: Opens at current time on cold start
- **🎯 Time-aware Interface**: Red indicator shows current time
- **🔽 Advanced Filtering**: Filter by event type, day, or custom criteria
- **📱 Responsive Design**: Optimized for all screen sizes
- **⚡ Performance Optimized**: Lazy loading and virtualized lists

### 💰 HackerBucks Currency System

- **💸 Digital Transactions**: Send/receive hackathon currency
- **📱 QR Code Integration**: Scan-to-pay functionality
- **📊 Transaction History**: Complete audit trail
- **🔒 Secure Transfers**: Encrypted transaction validation
- **🎊 Success Celebrations**: Confetti animations on successful transactions

### 🎊 Delightful User Experience

- **🎉 Welcome Confetti**: Celebration animation on onboarding
- **📳 Haptic Feedback**: Tactile responses for interactions
- **🌊 Smooth Animations**: 60fps transitions and micro-interactions
- **🎨 Theme Switching**: Seamless dark/light mode transitions
- **📱 Native Feel**: Platform-specific UI patterns

## 🧪 Development Workflow

### 📝 Available Scripts

```bash
# Development
npm start                    # Start Expo development server
npm run android             # Run on Android emulator/device
npm run ios                 # Run on iOS simulator/device
npm run web                 # Run in web browser

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run tsc                 # TypeScript type checking

# Building & Deployment
npm run build:android       # Build Android APK/AAB
npm run build:ios          # Build iOS IPA
npm run submit:android      # Submit to Google Play
npm run submit:ios         # Submit to App Store
```

### 🔧 Development Tools

- **📏 ESLint**: Code linting with React Native rules
- **🎯 TypeScript**: Strict type checking enabled
- **🎨 Prettier**: Consistent code formatting
- **📱 Expo Dev Tools**: Debugging and development utilities
- **🔄 Fast Refresh**: Instant code updates during development

### 🧪 Testing Strategy

```bash
# Unit Tests
npm test                    # Run Jest tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report

# E2E Testing
npm run detox:build         # Build for E2E tests
npm run detox:test          # Run end-to-end tests
```

## 📊 Performance & Optimization

### ⚡ Performance Features

- **🚀 New Architecture**: Expo SDK 53 with enhanced performance
- **📦 Bundle Splitting**: Code splitting for faster loads
- **🗄️ Intelligent Caching**: TanStack Query with offline persistence
- **🖼️ Image Optimization**: Lazy loading and caching
- **📱 Memory Management**: Proper cleanup and leak prevention

### 📈 Monitoring & Analytics

- **🐛 Crash Reporting**: Real-time error tracking
- **📊 Performance Metrics**: App load time and interaction monitoring
- **👤 User Analytics**: Usage patterns and feature adoption
- **🔍 Debug Tools**: Comprehensive logging and debugging

## 🚀 Deployment

### 🏗️ Build Configuration

**Environment Profiles:**

- **Development**: Local testing with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live app store versions

**Build Commands:**

```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# Production builds
eas build --platform all --profile production

# Store submission
eas submit --platform all --profile production
```

### 📱 App Store Deployment

**iOS App Store:**

- Automated builds via EAS Build
- TestFlight beta testing
- App Store Connect integration

**Google Play Store:**

- AAB format for dynamic delivery
- Internal testing tracks
- Staged rollout deployment

## 🤝 Contributing

### 📋 Development Guidelines

1. **🔀 Branching Strategy**

   ```bash
   main                     # Production-ready code
   ├── develop             # Development integration
   ├── feature/new-feature # Feature development
   └── hotfix/urgent-fix   # Production hotfixes
   ```

2. **💻 Code Standards**
   - Follow TypeScript strict mode
   - Use ESLint and Prettier configurations
   - Write meaningful commit messages
   - Add tests for new features

3. **🔍 Pull Request Process**
   - Create feature branch from `develop`
   - Write descriptive PR titles and descriptions
   - Ensure all tests pass
   - Request code review from team members

### 📝 Commit Message Format

```bash
feat: add confetti animation to onboarding modal
fix: resolve schedule auto-scroll timing issue
docs: update README with deployment instructions
refactor: optimize schedule rendering performance
test: add unit tests for auth context
```

## 🔧 Configuration Files

### 📱 Key Configuration Files

- **`app.config.js`**: Expo configuration, plugins, and build settings
- **`eas.json`**: Build profiles and deployment configuration
- **`babel.config.js`**: Babel transpilation settings
- **`metro.config.js`**: Metro bundler configuration
- **`tailwind.config.js`**: Custom Tailwind CSS configuration
- **`tsconfig.json`**: TypeScript compiler options (strict mode)

### 🔐 Environment Variables

```bash
# .env file structure
EXPO_PUBLIC_API_URL=https://api.uofthacks.com
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key
```

## 🐛 Troubleshooting

### 🚨 Common Issues & Solutions

**📱 App Won't Start**

```bash
# Clear Metro cache and node_modules
npx expo start --clear
rm -rf node_modules && npm install
```

**🎨 Fonts Not Loading**

```bash
# Verify fonts in assets/fonts/
# Check app.config.js font configuration
# Clear cache and restart
```

**🔐 Authentication Issues**

```bash
# Check token storage
# Verify API endpoint configuration
# Clear SecureStore data for testing
```

**📅 Schedule Not Updating**

```bash
# Check TanStack Query cache
# Verify API response format
# Clear query cache
```

### 📞 Getting Help

- **📚 Documentation**: Check inline code comments and README files
- **🐛 Bug Reports**: Create issues with detailed reproduction steps
- **💡 Feature Requests**: Open discussions for new feature ideas
- **❓ Questions**: Reach out to the development team

## 📚 Additional Resources

### 📖 Documentation

- **[Production Readiness Plan](./PRODUCTION_READINESS_PLAN.md)**: Comprehensive guide to production deployment
- **[Font Configuration Guide](./FONTS_README.md)**: Complete typography system documentation
- **[Expo Documentation](https://docs.expo.dev/)**: Official Expo framework docs
- **[React Native Docs](https://reactnative.dev/docs/getting-started)**: React Native development guide

### 🔗 Useful Links

- **🎨 [NativeWind](https://www.nativewind.dev/)**: Tailwind CSS for React Native
- **🔄 [TanStack Query](https://tanstack.com/query/)**: Data fetching and state management
- **🐻 [Zustand](https://github.com/pmndrs/zustand)**: Lightweight state management
- **📱 [Expo Router](https://expo.github.io/router/)**: File-based routing system

---

## 🎉 Built with ❤️ by the UofTHacks Team

**🏫 University of Toronto** • **🇨🇦 Toronto, Canada** • **2025**

> Empowering the next generation of innovators through technology and community.

---

_For technical support or questions about this mobile app, please reach out to the UofTHacks development team._
