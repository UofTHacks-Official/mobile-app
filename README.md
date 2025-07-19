# UofTHacks Mobile App

## Overview

This is the official mobile application for UofTHacks, built with Expo and React Native. It provides a seamless experience for hackers, volunteers, and administrators, offering features such as event schedules, hackerbucks management, and user authentication.

## Key Technologies

*   **Expo**: A framework and platform for universal React applications.
*   **React Native**: For building native mobile apps using JavaScript and React.
*   **TypeScript**: For type-safe and robust code.
*   **NativeWind**: A utility-first CSS framework for React Native, powered by Tailwind CSS.
*   **Expo Router**: A file-based router for Expo and React Native, enabling intuitive navigation based on your file system.
*   **Zustand**: A fast, small, and scalable bear-bones state-management solution.
*   **Axios**: For making HTTP requests to the backend API.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   **Node.js**: Ensure you have Node.js (LTS version recommended) installed. [Download Node.js](https://nodejs.org/)
*   **Yarn (Recommended)** or npm: For package management.
*   **Expo Go app**: Install on your mobile device ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) / [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
*   **Development Environment**: An iOS Simulator (requires Xcode on macOS) or Android Emulator (requires Android Studio) is recommended for development.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mobile
    ```
2.  **Install dependencies:**
    ```bash
    yarn install
    # or npm install
    ```

### Running the App

To start the development server:

```bash
npx expo start
```

This command will open the Expo Dev Tools in your browser. From there, you can:

*   Press `i` to open the app in an iOS Simulator (macOS only).
*   Press `a` to open the app in an Android Emulator.
*   Scan the QR code with the Expo Go app on your physical device.

## Project Structure

The project follows a clear and organized structure, primarily leveraging Expo Router's file-based routing.

```
./
├── app/
│   ├── _layout.tsx             # Root layout for the app (e.g., navigation, global providers)
│   ├── _redirect.tsx           # Handles initial redirects (e.g., authentication checks)
│   ├── globals.css             # Global Tailwind CSS styles
│   ├── index.tsx               # Main entry point/home screen
│   ├── _queries/               # Data fetching queries (e.g., React Query hooks)
│   │   └── user.ts
│   ├── _requests/              # API request configurations and services (e.g., Axios instances)
│   │   ├── axios.ts
│   │   ├── axiosConfig.ts      # Axios interceptors for token handling
│   │   └── ...
│   ├── _types/                 # TypeScript type definitions
│   │   └── ...
│   ├── _utils/                 # Utility functions and helpers
│   │   ├── eventEmitter.ts
│   │   ├── fonts.ts
│   │   ├── hackerbucks/
│   │   │   └── format.ts
│   │   └── tokens/
│   │       ├── secureStorage.ts # Secure storage for tokens
│   │       └── ...
│   ├── (admin)/                # Grouped routes for admin functionalities
│   │   ├── _layout.tsx         # Layout specific to admin routes
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   ├── qr.tsx
│   │   ├── schedule.tsx
│   │   └── hackerbucks/        # Hackerbucks related admin screens
│   │       ├── _layout.tsx
│   │       ├── confirmHBucks.tsx
│   │       ├── index.tsx
│   │       ├── sendHbucks.tsx
│   │       └── success.tsx
│   ├── auth/                   # Authentication related screens
│   │   ├── camera.tsx
│   │   ├── confirmPhone.tsx
│   │   ├── confirmSignIn.tsx
│   │   ├── notification.tsx
│   │   ├── selectRole.tsx
│   │   ├── signInAdmin.tsx
│   │   ├── signInVolunteer.tsx
│   │   └── signUp.tsx
│   ├── components/             # Reusable UI components
│   │   ├── FontExample.tsx
│   │   ├── scanner.tsx
│   │   ├── bottom/
│   │   │   └── bottomNavBar.tsx
│   │   ├── config/
│   │   │   └── toastconfig.tsx
│   │   ├── hacker_bucks/
│   │   │   └── keyboard.tsx
│   │   ├── loading/
│   │   │   └── loading.tsx
│   │   └── schedule/
│   │       ├── CurrentTimeIndicator.tsx
│   │       ├── DayColumn.tsx
│   │       ├── Event.tsx
│   │       ├── EventModal.tsx
│   │       └── TimeSlot.tsx
│   ├── context/                # React Context providers
│   │   └── authContext.tsx
│   ├── reducers/               # Zustand stores/reducers
│   │   └── hackerbucks.ts
│   └── volunteer/              # Grouped routes for volunteer functionalities
│       └── index.tsx
├── assets/                     # Static assets like fonts and images
│   ├── fonts/
│   └── images/
├── babel.config.js             # Babel configuration
├── eas.json                    # Expo Application Services configuration
├── eslint.config.js            # ESLint configuration
├── metro.config.js             # Metro bundler configuration
├── package.json                # Project dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration (including custom colors)
├── tsconfig.json               # TypeScript configuration
└── ...
```

### Expo Router Conventions

*   **File-based Routing**: Each file in the `app/` directory (e.g., `app/index.tsx`) automatically becomes a route (e.g., `/`).
*   **Layout Files (`_layout.tsx`)**: Files named `_layout.tsx` define shared UI for a group of routes within their directory. They do not create a URL segment.
*   **Grouped Routes (`(folder-name)`)**: Directories enclosed in parentheses, like `(admin)/`, are used to group routes without adding a segment to the URL path. This is useful for applying common layouts or organizing related screens.
*   **Private Files/Folders (`_folder-name`)**: Directories or files prefixed with an underscore (e.g., `_utils/`, `_types/`) are not treated as routes. They are used for organizing code that supports the routes but isn't directly part of the navigation hierarchy.

## Authentication Flow

The app utilizes a robust token-based authentication system with automatic token refresh to ensure a smooth user experience:

1.  **Login**: Upon successful login, both an `access token` and a `refresh token` are securely stored on the device.
2.  **API Requests**: The `access token` is automatically attached to all outgoing API requests.
3.  **Token Expiration Handling**: If an `access token` expires (indicated by a `401 Unauthorized` response from the API):
    *   The failed request is temporarily queued.
    *   The `refresh token` is used to obtain a new `access token` from the authentication server.
    *   Once a new `access token` is acquired, the original queued request is retried with the new token.
    *   Any other pending queued requests are then processed.

This mechanism ensures that users do not need to re-authenticate frequently due to token expiry.

### Token Storage

Tokens are securely stored using Expo's `SecureStore`:

*   **Access Token**: Used for API authentication (typically short-lived, e.g., 1 hour).
*   **Refresh Token**: Used to obtain new access tokens (longer-lived, e.g., 24 hours).

## Styling

This project uses **NativeWind** for styling, which brings the power of Tailwind CSS to React Native. Styles are defined using Tailwind's utility classes directly within your JSX.

### Color Palette

The project utilizes a custom color palette defined in `tailwind.config.js`. This ensures consistent branding throughout the application. Key colors include:

*   **Primary**: `uoft_primary_blue` (#2A398C)
*   **Secondary**: `uoft__orange` (#FF6F51)
*   **Accents**: `uoft_accent_purple` (#E9B6F7), `uoft_accent_red` (#F85C5C), `uoft_accent_cream` (#F3E7E3)
*   **Neutrals**: `uoft_black` (#181818), `uoft_white` (#F6F6F6), `uoft_stark_white` (#FFFFFF), `uoft_grey_light` (#C6C6C6), `uoft_grey_medium` (#A0A0A0), `uoft_grey_lighter` (#E0E0E0)

For design references, you can view the Figma file: [UofTHacks Admin Portal Figma](https://www.figma.com/design/JAjBHJM4XPAmJBVFqFRMdb/admin-portal?node-id=153-2066&t=nNqdgXeCxlmdAdlw-1)

## Important Files and Directories

*   `app/_requests/axiosConfig.ts`: Centralized configuration for Axios, including interceptors for token refresh and error handling.
*   `app/_utils/tokens/secureStorage.ts`: Handles the secure storage and retrieval of authentication tokens.
*   `app/reducers/hackerbucks.ts`: Zustand store for managing HackerBucks related state.
*   `app/context/authContext.tsx`: React Context for managing user authentication state globally.
*   `app/(admin)/`: Contains all screens and logic specific to the administrator interface.
*   `app/auth/`: Contains all screens and logic related to user authentication (sign-in, sign-up, etc.).
*   `app/components/`: Houses reusable UI components used across the application.

