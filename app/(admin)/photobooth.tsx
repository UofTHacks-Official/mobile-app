import { useState } from "react";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Text, View, TouchableOpacity, Alert, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Images, Camera } from "lucide-react-native";
import { useCallback } from "react";
import DualCamera from "../../src/components/photobooth/DualCamera";
import CompositePhoto from "../../src/components/photobooth/CompositePhoto";
import { PhotoStorageService, PhotoPair, PaginatedPhotoResult } from "../../src/services/photoStorage";
import CompositePhotoView from "../../src/components/photobooth/CompositePhotoView";
import { useBottomNavBarStore } from '@/reducers/bottomNavBar';
import { useScrollNavBar } from '@/utils/navigation';

export default function PhotoboothPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<{
    front: string;
    back: string;
  } | null>(null);
  
  // Gallery state
  const [viewMode, setViewMode] = useState<'camera' | 'gallery'>('camera');
  const [photoPairs, setPhotoPairs] = useState<PhotoPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Bottom nav bar controls
  const { showNavBar, setPhotoboothViewMode } = useBottomNavBarStore();
  const { handleScroll } = useScrollNavBar();

  // Clear captured photos when page comes into focus
  useFocusEffect(
    useCallback(() => {
      setCapturedPhotos(null);
      setPhotoboothViewMode(viewMode); // Sync store with current view mode
      if (viewMode === 'gallery') {
        loadGallery();
      }
    }, [viewMode, setPhotoboothViewMode])
  );

  const handlePhotosCapture = async (frontPhoto: string, backPhoto: string) => {
    try {
      setIsProcessing(true);
      
      // Store the photos to show composite view
      setCapturedPhotos({
        front: frontPhoto,
        back: backPhoto
      });
      
    } catch (error) {
      console.error('Photo processing error:', error);
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
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
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
      const result = await PhotoStorageService.uploadPhotoboothPhotos(
        capturedPhotos.front, 
        capturedPhotos.back
      );
      
      Alert.alert(
        "Photos Saved!",
        `Your BeReal-style photos have been uploaded successfully!`,
        [
          {
            text: "Take Another",
            onPress: () => setCapturedPhotos(null)
          },
          {
            text: "View Gallery",
            onPress: () => {
              setCapturedPhotos(null);
              setViewMode('gallery');
              loadGallery();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert("Error", "Failed to upload photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'camera') {
      setViewMode('gallery');
      setPhotoboothViewMode('gallery');
      loadGallery();
    } else {
      setViewMode('camera');
      setPhotoboothViewMode('camera');
      showNavBar(); // Ensure nav bar is visible when returning to camera
    }
  };

  // Render gallery view
  const renderGallery = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={themeStyles.iconColor} />
          <Text className={cn("mt-4", themeStyles.primaryText)}>Loading gallery...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <Text className={cn("text-2xl font-bold text-center py-4", themeStyles.primaryText)}>
          Feed
        </Text>
        
        {photoPairs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className={cn("text-center", themeStyles.secondaryText)}>
              No photos yet. Take your first BeReal!
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 16, alignItems: 'center' }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {photoPairs.map((photo, index) => (
              <View key={photo.photoId} className="mb-8">
                <CompositePhotoView
                  frontPhotoUrl={photo.frontPhotoUrl}
                  backPhotoUrl={photo.backPhotoUrl}
                />
                <Text className={cn("text-center mt-2 text-sm", themeStyles.secondaryText)}>
                  {photo.timestamp.toLocaleDateString()} {photo.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
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
              backgroundColor: '#75EDEF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}
          >
            {viewMode === 'camera' ? (
              <>
                <Images size={18} color="#000" strokeWidth={2} />
                <Text style={{ color: '#000', fontWeight: '600', fontSize: 14 }}>Gallery</Text>
              </>
            ) : (
              <>
                <Camera size={18} color="#000" strokeWidth={2} />
                <Text style={{ color: '#000', fontWeight: '600', fontSize: 14 }}>Camera</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'gallery' ? (
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