// A utility for development-only logging.
// These logs will be stripped out in production builds.

export const devLog = (...args: any[]) => {
  if (__DEV__) {
    console.log('[DEV]', ...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (__DEV__) {
    console.warn('[DEV WARN]', ...args);
  }
};

export const devError = (...args: any[]) => {
  if (__DEV__) {
    console.error('[DEV ERROR]', ...args);
  }
};

// Enhanced logging with context
export const devLogWithContext = (context: string, message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[DEV ${context}]`, message, data);
  }
};

// Production-safe error logging (for crash reporting)
export const prodError = (message: string, error?: Error, context?: any) => {
  if (__DEV__) {
    console.error('[PROD ERROR]', message, error, context);
  } else {
    // In production, send to crash reporting service
    // crashlytics().recordError(error || new Error(message));
  }
};
  