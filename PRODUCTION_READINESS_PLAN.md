# Production Readiness Plan for UofT Hacks Mobile App

Based on analysis of the React Native Expo codebase, here's a comprehensive production readiness plan following industry best practices.

## 🔍 Current State Analysis

**Strengths:**
- ✅ Modern Expo SDK 53 with new architecture enabled
- ✅ TypeScript with strict mode
- ✅ Expo Router for file-based routing
- ✅ TanStack Query for state management
- ✅ Well-organized folder structure
- ✅ NativeWind for styling
- ✅ Proper environment configuration

**Critical Issues Identified:**
- ❌ No testing infrastructure
- ❌ Missing error boundaries
- ❌ No performance monitoring
- ❌ Inconsistent error handling
- ❌ Missing accessibility features
- ❌ No CI/CD pipeline
- ❌ Potential security vulnerabilities
- ❌ Missing analytics/crash reporting

## 🚀 Phase 1: Foundation & Security (Weeks 1-2)

### 1.1 Testing Infrastructure

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
```

**Tasks:**
- Set up Jest with React Native Testing Library
- Create test utilities and custom render functions
- Write unit tests for utilities, hooks, and components
- Add integration tests for critical user flows
- Set up test coverage reporting (minimum 80%)

**Example Test Setup:**

```typescript
// src/test-utils/setup.ts
import '@testing-library/jest-native/extend-expect';

// src/test-utils/render.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../src/context/themeContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
```

### 1.2 Error Boundaries & Error Handling

```tsx
// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// src/components/common/DefaultErrorFallback.tsx
const DefaultErrorFallback = ({ onReset }: { onReset: () => void }) => (
  <View className="flex-1 justify-center items-center p-4">
    <Text className="text-xl font-bold mb-4">Something went wrong</Text>
    <Text className="text-gray-600 mb-6 text-center">
      We're sorry, but something unexpected happened. Please try again.
    </Text>
    <TouchableOpacity 
      onPress={onReset}
      className="bg-blue-500 px-6 py-3 rounded-lg"
    >
      <Text className="text-white font-semibold">Try Again</Text>
    </TouchableOpacity>
  </View>
);
```

### 1.3 Security Enhancements

**Tasks:**
- Implement certificate pinning
- Add biometric authentication for sensitive operations
- Secure token storage improvements
- Input validation and sanitization
- API rate limiting implementation

```typescript
// src/utils/security/validation.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// src/utils/security/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';

export const authenticateWithBiometrics = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to continue',
    fallbackLabel: 'Use password',
  });

  return result.success;
};
```

## 🎯 Phase 2: Performance & User Experience (Weeks 3-4)

### 2.1 Performance Monitoring

```bash
npm install @react-native-community/netinfo react-native-performance
```

**Implementation:**

```typescript
// src/hooks/usePerformance.ts
import { useEffect } from 'react';

export const usePerformanceTracking = (screenName: string) => {
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const loadTime = Date.now() - startTime;
      // Log to analytics service
      console.log(`Screen ${screenName} loaded in ${loadTime}ms`);
    };
  }, [screenName]);
};

// src/components/common/LazyComponent.tsx
import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  }>
    {children}
  </Suspense>
);

export default LazyWrapper;
```

### 2.2 Accessibility (a11y)

```tsx
// Enhanced component example
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Navigate to schedule"
  accessibilityRole="button"
  accessibilityHint="Opens the event schedule"
  accessibilityState={{ selected: isSelected }}
>
  <Text>Schedule</Text>
</TouchableOpacity>

// src/utils/accessibility.ts
export const a11yProps = {
  button: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),
  heading: (level: 1 | 2 | 3) => ({
    accessible: true,
    accessibilityRole: 'header' as const,
    accessibilityLevel: level,
  }),
};
```

**Tasks:**
- Add accessibility labels and hints to all interactive elements
- Implement proper focus management
- Add screen reader support
- Test with iOS VoiceOver and Android TalkBack
- Color contrast compliance (WCAG AA)

### 2.3 Offline Support

```bash
npm install @tanstack/react-query-persist-client-core
```

**Features:**

```typescript
// src/hooks/useOfflineSupport.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      if (state.isConnected) {
        // Refetch when coming back online
        queryClient.refetchQueries();
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return { isOnline };
};

// src/utils/storage/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineStorage = {
  async set(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  
  async get<T>(key: string): Promise<T | null> {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
```

## 🔧 Phase 3: Code Quality & Architecture (Weeks 5-6)

### 3.1 Enhanced TypeScript Configuration

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "jsx": "react-jsx",
    "module": "es2022",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3.2 Linting & Code Standards

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-native prettier
```

**Enhanced ESLint config:**

```javascript
// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'error',
      'react-native/no-inline-styles': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
```

**Prettier config:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3.3 State Management Improvements

```tsx
// src/stores/appStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'participant';
}

interface AppStore {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        theme: 'system',
        isOnline: true,
        notifications: [],
        
        setUser: (user) => set({ user }, false, 'setUser'),
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        setOnlineStatus: (isOnline) => set({ isOnline }, false, 'setOnlineStatus'),
        addNotification: (notification) => 
          set((state) => ({
            notifications: [...state.notifications, notification]
          }), false, 'addNotification'),
        removeNotification: (id) => 
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }), false, 'removeNotification'),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ user: state.user, theme: state.theme }),
      }
    )
  )
);
```

## 📊 Phase 4: Monitoring & Analytics (Week 7)

### 4.1 Crash Reporting & Analytics

```bash
npm install @bugsnag/react-native @segment/analytics-react-native
```

**Implementation:**

```typescript
// src/services/analytics.ts
import { Analytics } from '@segment/analytics-react-native';
import Bugsnag from '@bugsnag/react-native';

export const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY!,
});

export const crashReporting = {
  recordError: (error: Error, metadata?: Record<string, any>) => {
    Bugsnag.notify(error, (report) => {
      if (metadata) {
        report.addMetadata('custom', metadata);
      }
    });
  },
  
  setUser: (user: { id: string; email: string }) => {
    Bugsnag.setUser(user.id, user.email);
  },
  
  leaveBreadcrumb: (message: string, metadata?: Record<string, any>) => {
    Bugsnag.leaveBreadcrumb(message, metadata);
  },
};

// src/hooks/useAnalytics.ts
import { useCallback } from 'react';
import { analytics } from '../services/analytics';

export const useAnalytics = () => {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  const screen = useCallback((name: string, properties?: Record<string, any>) => {
    analytics.screen(name, properties);
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.identify(userId, traits);
  }, []);

  return { track, screen, identify };
};
```

### 4.2 Performance Metrics

```typescript
// src/services/performance.ts
export class PerformanceMonitor {
  private static measurements: Record<string, number> = {};

  static startMeasurement(key: string): void {
    this.measurements[key] = Date.now();
  }

  static endMeasurement(key: string): number {
    const startTime = this.measurements[key];
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    delete this.measurements[key];
    
    // Log to analytics
    analytics.track('Performance Measurement', {
      operation: key,
      duration,
    });
    
    return duration;
  }

  static measureAsync<T>(key: string, operation: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startMeasurement(key);
      try {
        const result = await operation();
        this.endMeasurement(key);
        resolve(result);
      } catch (error) {
        this.endMeasurement(key);
        reject(error);
      }
    });
  }
}
```

## 🚦 Phase 5: Deployment & CI/CD (Week 8)

### 5.1 EAS Build & Submit Configuration

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "NODE_ENV": "staging"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "NODE_ENV": "production"
      },
      "cache": {
        "disabled": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 5.2 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run tsc

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build preview
        run: eas build --platform all --profile preview --non-interactive

  build-and-deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build production
        run: eas build --platform all --profile production --non-interactive

      - name: Submit to app stores
        run: eas submit --platform all --profile production --non-interactive
```

## 📱 Phase 6: App Store Optimization (Week 9)

### 6.1 App Store Preparation

**Checklist:**
- [ ] Optimize app metadata and descriptions
- [ ] Create compelling screenshots and videos
- [ ] Implement proper app icons for all sizes
- [ ] Add privacy policy and terms of service
- [ ] Configure app store connect properly
- [ ] Set up app store review guidelines compliance

### 6.2 Feature Flags Implementation

```typescript
// src/utils/featureFlags.ts
import { createContext, useContext, ReactNode } from 'react';

interface FeatureFlags {
  newScheduleView: boolean;
  improvedHackerBucks: boolean;
  betaFeatures: boolean;
  offlineMode: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlags>({
  newScheduleView: false,
  improvedHackerBucks: false,
  betaFeatures: false,
  offlineMode: false,
});

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const flags: FeatureFlags = {
    newScheduleView: process.env.EXPO_PUBLIC_FEATURE_NEW_SCHEDULE === 'true',
    improvedHackerBucks: process.env.EXPO_PUBLIC_FEATURE_IMPROVED_HACKER_BUCKS === 'true',
    betaFeatures: process.env.EXPO_PUBLIC_BETA_FEATURES === 'true',
    offlineMode: process.env.EXPO_PUBLIC_OFFLINE_MODE === 'true',
  };

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlags => useContext(FeatureFlagsContext);

// Usage in components
const ScheduleScreen = () => {
  const { newScheduleView } = useFeatureFlags();
  
  return newScheduleView ? <NewScheduleView /> : <LegacyScheduleView />;
};
```

## 🎨 Phase 7: Polish & Final Optimizations (Week 10)

### 7.1 UI/UX Improvements

```typescript
// src/components/common/LoadingState.tsx
import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

export const SkeletonLoader = ({ width = '100%', height = 20 }) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 1000, loop: true }}
    style={{
      width,
      height,
      backgroundColor: '#E1E5E9',
      borderRadius: 4,
    }}
  />
);

// src/design-system/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// src/design-system/typography.ts
export const typography = {
  h1: 'text-3xl font-onest-bold',
  h2: 'text-2xl font-onest-semibold',
  h3: 'text-xl font-onest-medium',
  body: 'text-base font-opensans-regular',
  caption: 'text-sm font-opensans-regular',
} as const;
```

### 7.2 Performance Final Pass

```bash
# Bundle analysis
npx expo export --platform web
npx webpack-bundle-analyzer web-build/static/js/*.js

# Performance profiling
npm install --save-dev @react-native-community/cli-doctor
npx react-native doctor
```

## 📋 Implementation Checklist

### Week 1-2: Foundation
- [ ] Set up Jest and React Native Testing Library
- [ ] Write unit tests for core utilities and hooks
- [ ] Implement error boundaries throughout app
- [ ] Add input validation with Zod
- [ ] Set up biometric authentication
- [ ] Secure token storage improvements
- [ ] Basic accessibility audit and fixes

### Week 3-4: Performance
- [ ] Performance monitoring integration
- [ ] Implement lazy loading for screens
- [ ] Add offline support with query persistence
- [ ] Optimize image loading with expo-image
- [ ] Memory leak detection and fixes
- [ ] Network connectivity monitoring

### Week 5-6: Code Quality
- [ ] Enhanced TypeScript configuration
- [ ] Comprehensive ESLint and Prettier setup
- [ ] Code formatting automation
- [ ] State management optimization with Zustand
- [ ] API layer improvements with better error handling
- [ ] Component documentation with Storybook

### Week 7: Monitoring
- [ ] Bugsnag crash reporting integration
- [ ] Segment analytics implementation
- [ ] Performance metrics collection
- [ ] User behavior tracking
- [ ] Error monitoring dashboard setup

### Week 8: Deployment
- [ ] EAS build configuration for all environments
- [ ] GitHub Actions CI/CD pipeline
- [ ] Environment management and secrets
- [ ] Beta testing deployment automation
- [ ] Production build verification

### Week 9: App Store
- [ ] App store metadata optimization
- [ ] Screenshots and promotional videos
- [ ] Privacy policy and terms of service
- [ ] App store review guidelines compliance
- [ ] Feature flags implementation
- [ ] Beta testing with TestFlight/Play Console

### Week 10: Polish
- [ ] Final UI/UX review and improvements
- [ ] Performance optimization and bundle analysis
- [ ] Comprehensive bug fixes and testing
- [ ] Documentation updates
- [ ] Production release preparation

## 🔗 Key Dependencies to Add

```json
{
  "dependencies": {
    "@bugsnag/react-native": "^7.20.0",
    "@react-native-community/netinfo": "^11.0.0",
    "@segment/analytics-react-native": "^2.15.0",
    "react-native-keychain": "^8.2.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-local-authentication": "^14.0.0",
    "expo-image": "~1.10.0",
    "moti": "^0.27.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@testing-library/jest-native": "^5.4.0",
    "jest-expo": "^50.0.0",
    "prettier": "^3.0.0",
    "eslint-plugin-react-native": "^4.1.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

## 📖 Additional Scripts for package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "build:all": "eas build --platform all",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "submit:all": "eas submit --platform all"
  }
}
```

This comprehensive plan will systematically transform your UofT Hacks mobile app into a production-ready, scalable, and maintainable React Native application following industry best practices. Each phase builds upon the previous one, ensuring a methodical approach to achieving production readiness while maintaining app functionality throughout the process.