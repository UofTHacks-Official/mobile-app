require("dotenv").config();

export default ({ config }) => {
  return {
    ...config,
    name: "uoft-hacks",
    slug: "uoft-hacks",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "native",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/moose_splash.png",
      resizeMode: "contain",
      backgroundColor: "#F6F6F6",
    },
    ios: {
      icon: "./assets/images/icon.png",
      supportsTablet: true,
      bundleIdentifier: "com.uofthacks.uoft-hacks",
      buildNumber: "2",
      infoPlist: {
        NSCameraUsageDescription: "This app uses the camera to scan QR codes.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
        monochromeImage: "./assets/images/icon.png",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      package: "com.uofthacks.uofthacks",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/moose_splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F6F6F6",
          dark: {
            image: "./assets/images/moose_splash.png",
            backgroundColor: "#1A1A1A",
          },
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "assets/fonts/Onest-Thin.ttf",
            "assets/fonts/Onest-ExtraLight.ttf",
            "assets/fonts/Onest-Light.ttf",
            "assets/fonts/Onest-Regular.ttf",
            "assets/fonts/Onest-Medium.ttf",
            "assets/fonts/Onest-SemiBold.ttf",
            "assets/fonts/Onest-Bold.ttf",
            "assets/fonts/Onest-ExtraBold.ttf",
            "assets/fonts/Onest-Black.ttf",
            "assets/fonts/OpenSans-Light.ttf",
            "assets/fonts/OpenSans-Regular.ttf",
            "assets/fonts/OpenSans-Medium.ttf",
            "assets/fonts/OpenSans-SemiBold.ttf",
            "assets/fonts/OpenSans-Bold.ttf",
            "assets/fonts/OpenSans-ExtraBold.ttf",
            "assets/fonts/OpenSans_Condensed-Light.ttf",
            "assets/fonts/OpenSans_Condensed-Regular.ttf",
            "assets/fonts/OpenSans_Condensed-Medium.ttf",
            "assets/fonts/OpenSans_Condensed-SemiBold.ttf",
            "assets/fonts/OpenSans_Condensed-Bold.ttf",
            "assets/fonts/OpenSans_Condensed-ExtraBold.ttf",
            "assets/fonts/OpenSans_SemiCondensed-Light.ttf",
            "assets/fonts/OpenSans_SemiCondensed-Regular.ttf",
            "assets/fonts/OpenSans_SemiCondensed-Medium.ttf",
            "assets/fonts/OpenSans_SemiCondensed-SemiBold.ttf",
            "assets/fonts/OpenSans_SemiCondensed-Bold.ttf",
            "assets/fonts/OpenSans_SemiCondensed-ExtraBold.ttf",
            "assets/fonts/OpenSans-VariableFont_wdth,wght.ttf",
            "assets/fonts/OpenSans-Italic-VariableFont_wdth,wght.ttf",
          ],
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow UoftHacks to access your camera",
          microphonePermission: "Allow UoftHacks to access your microphone",
          recordAudioAndroid: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    web: {
      favicon: "./assets/images/icon.png",
    },
    extra: {
      ...config.extra,
      router: {},
      eas: {
        projectId: "19c11133-81b6-44cb-908b-61cf473cbbc9",
      },
    },
    owner: process.env.EXPO_PUBLIC_OWNER,
  };
};
