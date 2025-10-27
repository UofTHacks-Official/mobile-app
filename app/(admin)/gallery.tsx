import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { PhotoStorageService, PhotoPair } from "@/services/photoStorage";
import CompositePhotoView from "@/components/photobooth/CompositePhotoView";
import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import UoftDeerBlack from "../../assets/images/icons/uoft-deer-black.svg";
import UoftDeerWhite from "../../assets/images/icons/uoft-deer-white.svg";

export default function GalleryPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [photoPairs, setPhotoPairs] = useState<PhotoPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Bottom nav bar controls
  const { hideNavBar, showNavBar } = useBottomNavBarStore();

  // Scroll tracking refs
  const lastScrollY = useRef(0);
  const scrollY = useRef(0);
  const scrollDirection = useRef<"up" | "down">("up");
  const headerAnimation = useRef(new Animated.Value(1)).current;

  const loadGallery = async () => {
    try {
      const photos = await PhotoStorageService.getPhotoGallery();
      setPhotoPairs(photos);
    } catch (error) {
      console.error("Failed to load gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGallery();
    setRefreshing(false);
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Only trigger if scroll delta is significant enough (prevents jitter)
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && currentScrollY > 50) {
        // Scrolling down and past threshold
        if (scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          hideNavBar();
          setShowHeader(false);
        }
      } else if (scrollDelta < 0) {
        // Scrolling up
        if (scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          showNavBar();
          setShowHeader(true);
        }
      }
    }

    lastScrollY.current = currentScrollY;
    scrollY.current = currentScrollY;
  };

  useEffect(() => {
    loadGallery();

    // Show nav bar when component unmounts
    return () => {
      showNavBar();
    };
  }, [showNavBar]);

  // Also ensure nav bar is shown when component mounts
  useEffect(() => {
    showNavBar();
  }, [showNavBar]);

  // Animate header visibility
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: showHeader ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showHeader, headerAnimation]);

  if (loading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={themeStyles.iconColor} />
          <Text className={cn("mt-4", themeStyles.primaryText)}>
            Loading gallery...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1">
        <Animated.View
          className="items-center overflow-hidden"
          style={{
            opacity: headerAnimation,
            height: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 72],
            }),
            paddingVertical: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 16],
            }),
          }}
        >
          {isDark ? (
            <UoftDeerWhite width={40} height={40} />
          ) : (
            <UoftDeerBlack width={40} height={40} />
          )}
        </Animated.View>

        {photoPairs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className={cn("text-center", themeStyles.secondaryText)}>
              No photos yet. Take your first BeReal!
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingVertical: 16,
              alignItems: "center",
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {photoPairs.map((photo, _index) => (
              <View key={photo.photoId} className="mb-8">
                <CompositePhotoView
                  frontPhotoUrl={photo.frontPhotoUrl}
                  backPhotoUrl={photo.backPhotoUrl}
                  timestamp={photo.timestamp}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
