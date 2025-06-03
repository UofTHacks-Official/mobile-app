# UofTHacks Mobile App

## Authentication Flow

The app uses a token-based authentication system with automatic token refresh:

1. When a user logs in, both access and refresh tokens are stored securely
2. The access token is automatically included in all API requests
3. If an access token expires (401 Unauthorized), the system will:
   - Queue the failed request
   - Use the refresh token to get a new access token
   - Retry the original request with the new token
   - Process any other queued requests

This ensures users don't need to re-login when their token expires.

## Token Storage

Tokens are stored securely using Expo's SecureStore:
- Access Token: Used for API authentication (expires in 1 hour)
- Refresh Token: Used to get new access tokens (expires in 24 hours)

## Important Files

- `app/requests/axiosConfig.ts`: Manages API requests and token refresh
- `app/utils/tokens/secureStorage.ts`: Handles secure token storage
- `app/requests/admin.ts`: Contains API endpoints for authentication

# Uoft Hacks Mobile App

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Getting Started: Project Initialization & Setup

### 1. Prerequisites
- **Node.js**: Make sure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **Expo CLI (optional but recommended):**
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go app**: Install on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **iOS Simulator**: Requires Xcode (macOS only)
- **Android Emulator**: Requires Android Studio

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```
This will open the Expo Dev Tools in your browser. You can:
- Press `i` to open in iOS Simulator (macOS only)
- Press `a` to open in Android Emulator
- Scan the QR code with the Expo Go app on your device

### 4. Project Structure
- Main code lives in the **app** directory
- Uses [file-based routing](https://docs.expo.dev/router/introduction/): files in `app/` become routes

### 5. Color Palette
The project uses a custom color palette defined in `tailwind.config.js`. Available colors include:
- Primary: `uoft_primary_blue` (#2A398C)
- Secondary: `uoft_secondary_orange` (#FF6F51)
- Accents: 
  - `uoft_accent_purple` (#E9B6F7)
  - `uoft_accent_red` (#F85C5C)
  - `uoft_accent_cream` (#F3E7E3)
- Neutrals:
  - `uoft_black` (#181818)
  - `uoft_white` (#F6F6F6)
  - `uoft_stark_white` (#FFFFFF)
  - `uoft_grey_light` (#C6C6C6)
  - `uoft_grey_medium` (#A0A0A0)
  - `uoft_grey_lighter` (#E0E0E0)

Figma link: [Figma](https://www.figma.com/design/JAjBHJM4XPAmJBVFqFRMdb/admin-portal?node-id=153-2066&t=nNqdgXeCxlmdAdlw-1)