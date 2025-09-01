// React Native polyfill for crypto (MUST be first)
import 'react-native-get-random-values';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.EXPO_PUBLIC_CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || '';

export interface PhotoUploadResult {
  frontPhotoUrl: string;
  backPhotoUrl: string;
  photoId: string;
}

export class PhotoStorageService {

  static async uploadPhoto(photoUri: string, fileName: string): Promise<string> {
    try {
      
      // Get photo as ArrayBuffer (React Native compatible)
      const response = await fetch(photoUri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to R2 using AWS SDK
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: uint8Array,
        ContentType: 'image/jpeg',
      });

      await r2Client.send(command);
      
      // Return public URL
      const publicUrl = `https://pub-${process.env.EXPO_PUBLIC_CF_ACCOUNT_ID}.r2.dev/${fileName}`;
      return publicUrl;
      
    } catch (error: any) {
      console.error('R2 upload failed:', error);
      throw new Error(`R2 upload failed: ${error.message || error}`);
    }
  }

  /**
   * Upload both front and back photos from photobooth
   */
  static async uploadPhotoboothPhotos(
    frontPhotoUri: string,
    backPhotoUri: string
  ): Promise<PhotoUploadResult> {
    try {
      const timestamp = Date.now();
      const photoId = `photobooth_${timestamp}`;
      
      const frontFileName = `photos/${photoId}_front.jpg`;
      const backFileName = `photos/${photoId}_back.jpg`;
      
      // Upload both photos in parallel
      const [frontPhotoUrl, backPhotoUrl] = await Promise.all([
        this.uploadPhoto(frontPhotoUri, frontFileName),
        this.uploadPhoto(backPhotoUri, backFileName),
      ]);

      return {
        frontPhotoUrl,
        backPhotoUrl,
        photoId,
      };
      
    } catch (error) {
      console.error('Photobooth upload failed:', error);
      throw error;
    }
  }
}