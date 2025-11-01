import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Images, Camera } from "lucide-react-native";
import DualCamera from "../../src/components/photobooth/DualCamera";
import CompositePhoto from "../../src/components/photobooth/CompositePhoto";
import {
  PhotoStorageService,
  PhotoPair,
} from "../../src/services/photoStorage";
import CompositePhotoView from "../../src/components/photobooth/CompositePhotoView";
import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import { useScrollNavBar } from "@/utils/navigation";
import UoftDeerBlack from "../../assets/images/icons/uoft-deer-black.svg";
import UoftDeerWhite from "../../assets/images/icons/uoft-deer-white.svg";

export default function PhotoboothPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<{
    front: string;
    back: string;
  } | null>(null);

  // Gallery state
  const [viewMode, setViewMode] = useState<"camera" | "gallery">("camera");
  const [photoPairs, setPhotoPairs] = useState<PhotoPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Bottom nav bar controls
  const { showNavBar, setPhotoboothViewMode } = useBottomNavBarStore();
  const { handleScroll: handleNavBarScroll } = useScrollNavBar();

  // Header animation
  const headerAnimation = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);

  // Clear captured photos when page comes into focus
  useFocusEffect(
    useCallback(() => {
      setCapturedPhotos(null);
      setPhotoboothViewMode(viewMode); // Sync store with current view mode
      if (viewMode === "gallery") {
        loadGallery();
      }
    }, [viewMode, setPhotoboothViewMode])
  );

  // Animate header visibility
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: showHeader ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showHeader, headerAnimation]);

  const handlePhotosCapture = async (frontPhoto: string, backPhoto: string) => {
    try {
      setIsProcessing(true);

      // Store the photos to show composite view
      setCapturedPhotos({
        front: frontPhoto,
        back: backPhoto,
      });
    } catch (error) {
      console.error("Photo processing error:", error);
      Alert.alert("Error", "Failed to process photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadGallery = async () => {
    try {
      setLoading(true);
      // Use paginated method - shows 5 most recent photos
      const result = await PhotoStorageService.getPhotoGalleryPaginated(5);
      setPhotoPairs(result.photos);
      setNextToken(result.nextToken);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const result = await PhotoStorageService.getPhotoGalleryPaginated(
        5,
        nextToken
      );

      setPhotoPairs((prev) => [...prev, ...result.photos]);
      setNextToken(result.nextToken);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more photos:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleInfiniteScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;
    const isNearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 200;

    // Handle nav bar scroll behavior
    handleNavBarScroll(event);

    // Handle header visibility based on scroll direction
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && currentScrollY > 50) {
        // Scrolling down
        setShowHeader(false);
      } else if (scrollDelta < 0) {
        // Scrolling up
        setShowHeader(true);
      }
    }

    lastScrollY.current = currentScrollY;

    // Handle infinite scroll loading
    if (isNearBottom && hasMore && !loadingMore) {
      loadMorePhotos();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGallery();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!capturedPhotos) return;

    try {
      setIsProcessing(true);

      // Upload photos to Cloudflare R2
      await PhotoStorageService.uploadPhotoboothPhotos(
        capturedPhotos.front,
        capturedPhotos.back
      );

      Alert.alert(
        "Photos Saved!",
        `Your photos have been uploaded successfully!`,
        [
          {
            text: "Take Another",
            onPress: () => setCapturedPhotos(null),
          },
          {
            text: "View Gallery",
            onPress: () => {
              setCapturedPhotos(null);
              setViewMode("gallery");
              loadGallery();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Photo upload error:", error);
      Alert.alert("Error", "Failed to upload photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "camera") {
      setViewMode("gallery");
      setPhotoboothViewMode("gallery");
      loadGallery();
    } else {
      setViewMode("camera");
      setPhotoboothViewMode("camera");
      showNavBar(); // Ensure nav bar is visible when returning to camera
    }
  };

  // Render gallery view
  const renderGallery = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={themeStyles.iconColor} />
          <Text className={cn("mt-4", themeStyles.primaryText)}>
            Loading gallery...
          </Text>
        </View>
      );
    }

    return (
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
              No photos yet. Take your first PhotoBooth Photo!
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
            onScroll={handleInfiniteScroll}
            scrollEventThrottle={16}
          >
            {photoPairs.map((photo) => (
              <View key={photo.photoId} className="mb-8">
                <CompositePhotoView
                  frontPhotoUrl={photo.frontPhotoUrl}
                  backPhotoUrl={photo.backPhotoUrl}
                  timestamp={photo.timestamp}
                />
              </View>
            ))}

            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="large" color={themeStyles.iconColor} />
                <Text className={cn("mt-2 text-sm", themeStyles.secondaryText)}>
                  Loading more photos...
                </Text>
              </View>
            )}

            {/* End of results indicator */}
            {!hasMore && photoPairs.length > 0 && (
              <View className="py-4 items-center">
                <Text className={cn("text-sm", themeStyles.secondaryText)}>
                  You&apos;ve seen all the photos! 🎉
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      {/* Only show toggle button when not in composite photo mode */}
      {!capturedPhotos && (
        <View className="absolute top-16 right-4 z-10">
          <TouchableOpacity
            onPress={toggleViewMode}
            style={{
              backgroundColor: "#75EDEF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {viewMode === "camera" ? (
              <>
                <Images size={18} color="#000" strokeWidth={2} />
                <Text
                  style={{ color: "#000", fontWeight: "600", fontSize: 14 }}
                >
                  Gallery
                </Text>
              </>
            ) : (
              <>
                <Camera size={18} color="#000" strokeWidth={2} />
                <Text
                  style={{ color: "#000", fontWeight: "600", fontSize: 14 }}
                >
                  Camera
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {viewMode === "gallery" ? (
        renderGallery()
      ) : (
        <View className="flex-1 justify-center items-center">
          {capturedPhotos ? (
            <CompositePhoto
              frontPhotoUri={capturedPhotos.front}
              backPhotoUri={capturedPhotos.back}
              onSave={handleSave}
            />
          ) : (
            <DualCamera
              onPhotosCapture={handlePhotosCapture}
              isProcessing={isProcessing}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
