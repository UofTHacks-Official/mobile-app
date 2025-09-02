import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/themeContext';
import { cn, getThemeStyles } from '@/utils/theme';
import { PhotoStorageService, PhotoPair } from '@/services/photoStorage';
import CompositePhotoView from '@/components/photobooth/CompositePhotoView';

export default function GalleryPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [photoPairs, setPhotoPairs] = useState<PhotoPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGallery = async () => {
    try {
      const photos = await PhotoStorageService.getPhotoGallery();
      setPhotoPairs(photos);
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

  useEffect(() => {
    loadGallery();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className={cn("mt-4", themeStyles.text)}>Loading gallery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1">
        <Text className={cn("text-2xl font-bold text-center py-4", themeStyles.text)}>
          BeReal Gallery
        </Text>
        
        {photoPairs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className={cn("text-gray-500 text-center")}>
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
          >
            {photoPairs.map((photo, index) => (
              <View key={photo.photoId} className="mb-8">
                <CompositePhotoView
                  frontPhotoUrl={photo.frontPhotoUrl}
                  backPhotoUrl={photo.backPhotoUrl}
                />
                <Text className={cn("text-center mt-2 text-sm", themeStyles.text)}>
                  {photo.timestamp.toLocaleDateString()} {photo.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}