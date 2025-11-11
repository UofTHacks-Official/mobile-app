# UofTHacks Mobile App

> The official mobile application for UofTHacks - Canada's largest student-run hackathon. Built with Expo and React Native.

## Overview

Mobile application for UofTHacks participants, administrators, and volunteers featuring event management, schedule viewing, hackathon currency (HackerBucks) transactions, and role-based access control.

### Key Features

- Interactive schedule with auto-scrolling timeline and event filtering
- HackerBucks digital currency system with QR code integration
- Role-based authentication for participants, volunteers, and administrators
- Photobooth feature with composite photo viewing and sharing
- Dark/light mode support
- Offline support with cached data

## Tech Stack

- **[Expo SDK 54](https://expo.dev/)** - Development platform
- **[React Native](https://reactnative.dev/)** - Cross-platform mobile framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Expo Router](https://expo.github.io/router/)** - File-based routing
- **[TanStack Query](https://tanstack.com/query/)** - Data fetching and caching
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[NativeWind](https://www.nativewind.dev/)** - Tailwind CSS for React Native

## Getting Started

### Prerequisites

- **Node.js** (LTS version 18+) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Expo CLI** - `npm install -g @expo/cli`
- **Development Environment**:
  - iOS: Xcode (macOS only) for iOS Simulator
  - Android: Android Studio for Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mobile-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App

```bash
# Start the development server
npx expo start

# Platform-specific shortcuts
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
```

**Quick Start Options:**

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your device

### Code Quality

**Available Scripts:**

```bash
npm run format        # Auto-format all files
npm run format:check  # Check if files need formatting
npm run type-check    # TypeScript type checking
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run check         # Run type-check + lint together
```

**Pre-commit Hooks:**

- Automatically formats and lints staged files before commit
- Uses Husky + lint-staged

## Project Structure

```
mobile-app/
├── app/                    # Expo Router file-based routing
│   ├── auth/              # Authentication screens
│   ├── (admin)/           # Admin-only routes
│   └── schedule-detail/   # Event detail pages
│
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context providers
│   ├── queries/           # TanStack Query hooks
│   ├── requests/          # API layer
│   ├── reducers/          # Zustand stores
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
│
├── assets/                # Static assets (fonts, images)
└── Configuration files    # package.json, tsconfig.json, etc.
```

## Troubleshooting

**App Won't Start**

```bash
npx expo start --clear
rm -rf node_modules && npm install
```

**Native Module Errors**

```bash
# Rebuild the app
npx expo run:ios
# or
npx expo run:android
```

---

Built by the UofTHacks Team • University of Toronto • 2025
