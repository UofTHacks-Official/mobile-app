import React from 'react';
import { View, Image } from 'react-native';

interface CompositePhotoViewProps {
  frontPhotoUrl: string;
  backPhotoUrl: string;
}

export default function CompositePhotoView({ 
  frontPhotoUrl, 
  backPhotoUrl 
}: CompositePhotoViewProps) {
  
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
          position: 'relative'
        }}>
        {/* Back Camera Photo (Main/Background) */}
        <Image
          source={{ uri: backPhotoUrl }}
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
            source={{ uri: frontPhotoUrl }}
            style={{ 
              width: 96, 
              height: 128
            }}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}