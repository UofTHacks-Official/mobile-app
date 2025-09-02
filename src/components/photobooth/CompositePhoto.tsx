import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

interface CompositePhotoProps {
  frontPhotoUri: string;
  backPhotoUri: string;
  onRetake: () => void;
  onSave: () => void;
}

export default function CompositePhoto({ 
  frontPhotoUri, 
  backPhotoUri, 
  onRetake, 
  onSave 
}: CompositePhotoProps) {

  const handleSave = () => {
    onSave();
  };
  
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Composite Photo Display */}
      <View 
        style={{ 
          width: 384, 
          height: 384, 
          borderRadius: 16, 
          overflow: 'hidden', 
          backgroundColor: 'black',
          marginBottom: 24,
          position: 'relative'
        }}>
        {/* Back Camera Photo (Main/Background) */}
        <Image
          source={{ uri: backPhotoUri }}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          resizeMode="cover"
        />
        
        {/* Front Camera Photo (Small Overlay - Top Left) */}
        <View style={{ 
          position: 'absolute',
          top: 16,
          left: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: 'white',
          overflow: 'hidden'
        }}>
          <Image
            source={{ uri: frontPhotoUri }}
            style={{ 
              width: 96, 
              height: 128
            }}
            resizeMode="cover"
          />
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity
          onPress={onRetake}
          style={{
            backgroundColor: '#6b7280',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 24
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}