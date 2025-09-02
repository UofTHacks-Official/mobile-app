import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useTheme } from '@/context/themeContext';
import { cn, getThemeStyles } from '@/utils/theme';

interface DualCameraProps {
  onPhotosCapture: (frontPhoto: string, backPhoto: string) => void;
  isProcessing?: boolean;
}

function DualCamera({ onPhotosCapture, isProcessing = false }: DualCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentCamera, setCurrentCamera] = useState<CameraType>('front');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Check permissions
  if (!permission) {
    return (
      <View className="w-80 h-80 bg-gray-200 rounded-2xl items-center justify-center">
        <Text className="text-gray-500">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="w-80 h-80 bg-gray-100 rounded-2xl items-center justify-center p-4">
        <Text className="text-center mb-4 text-gray-700">
          Camera access needed
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing || isProcessing) return;

    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo) {
        Alert.alert('Error', 'Failed to capture photo');
        return;
      }

      if (currentCamera === 'front') {
        // First photo (front camera) captured
        setFrontPhoto(photo.uri);
        setCurrentCamera('back');
        Alert.alert(
          'Selfie Captured!', 
          'Flipping to back camera for the second photo',
          [{ text: 'OK' }]
        );
      } else {
        // Second photo (back camera) captured - combine both
        if (frontPhoto) {
          onPhotosCapture(frontPhoto, photo.uri);
          // Reset for next capture
          setFrontPhoto(null);
          setCurrentCamera('front');
        } else {
          Alert.alert('Error', 'Front photo not found. Please retake both photos.');
        }
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const resetCapture = () => {
    setFrontPhoto(null);
    setCurrentCamera('front');
  };

  const switchCamera = () => {
    setCurrentCamera(currentCamera === 'front' ? 'back' : 'front');
  };

  return (
    <View className="items-center">
      {/* Larger Camera Square */}
      <View className="w-96 h-96 rounded-2xl overflow-hidden bg-black mb-6">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={currentCamera}
        />
      </View>
      
      {/* Take Photo Button Below Camera */}
      <TouchableOpacity
        onPress={capturePhoto}
        disabled={isCapturing || isProcessing}
        className={(isCapturing || isProcessing) 
          ? "w-20 h-20 rounded-full border-4 border-gray-400 items-center justify-center bg-gray-500"
          : "w-20 h-20 rounded-full border-4 border-gray-400 items-center justify-center bg-transparent"
        }
      >
        <View className="w-16 h-16 rounded-full bg-gray-600" />
      </TouchableOpacity>
    </View>
  );
}

DualCamera.displayName = 'DualCamera';

export default DualCamera;