// A utility for development-only logging.
// These logs will be stripped out in production builds.

export const devLog = (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  };
  
  export const devWarn = (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  };
  
  export const devError = (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  };
  