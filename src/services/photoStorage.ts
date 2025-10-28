// React Native polyfill for crypto (MUST be first)
import "react-native-get-random-values";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.EXPO_PUBLIC_CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || "";

export interface PhotoUploadResult {
  frontPhotoUrl: string;
  backPhotoUrl: string;
  photoId: string;
}

export interface PhotoPair {
  photoId: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  timestamp: Date;
}

export interface PaginatedPhotoResult {
  photos: PhotoPair[];
  nextToken?: string;
  hasMore: boolean;
}
export class PhotoStorageService {
  static async uploadPhoto(
    photoUri: string,
    fileName: string
  ): Promise<string> {
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
        ContentType: "image/jpeg",
      });

      await r2Client.send(command);

      // Return public URL using the actual public development URL
      const publicUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/${fileName}`;
      return publicUrl;
    } catch (error: any) {
      console.error("R2 upload failed:", error);
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
      // Use reverse timestamp so S3's lexicographic order = newest first
      // This enables efficient S3 pagination without fetching all photos
      const reverseTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const photoId = `photobooth_${reverseTimestamp}`;

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
      console.error("Photobooth upload failed:", error);
      throw error;
    }
  }

  /**
   * List and group all photobooth photos from R2
   */
  static async getPhotoGallery(): Promise<PhotoPair[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "photos/",
      });

      const response = await r2Client.send(command);

      if (!response.Contents) {
        return [];
      }

      // Group photos by photoId
      const photoMap = new Map<string, Partial<PhotoPair>>();

      response.Contents.forEach((obj) => {
        if (!obj.Key || !obj.LastModified) return;

        // Parse filename: photos/photobooth_1725220857_front.jpg
        const match = obj.Key.match(
          /photos\/photobooth_(\d+)_(front|back)\.jpg$/
        );
        if (!match) return;

        const [, timestampStr, type] = match;
        const photoId = `photobooth_${timestampStr}`;
        const timestampNum = parseInt(timestampStr);

        // Detect if this is a reverse timestamp (much larger number)
        // Reverse timestamps are > 7000000000000000 (year ~2191)
        const isReverse = timestampNum > 7000000000000000;
        const actualTimestamp = isReverse
          ? Number.MAX_SAFE_INTEGER - timestampNum
          : timestampNum;

        if (!photoMap.has(photoId)) {
          photoMap.set(photoId, {
            photoId,
            timestamp: new Date(actualTimestamp),
          });
        }

        const photo = photoMap.get(photoId)!;
        const publicUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/${obj.Key}`;

        if (type === "front") {
          photo.frontPhotoUrl = publicUrl;
        } else {
          photo.backPhotoUrl = publicUrl;
        }
      });

      // Filter complete pairs only (both front and back photos exist)
      const completePairs: PhotoPair[] = [];
      photoMap.forEach((photo) => {
        if (photo.frontPhotoUrl && photo.backPhotoUrl) {
          completePairs.push(photo as PhotoPair);
        }
      });

      // Sort by timestamp (newest first)
      return completePairs.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    } catch (error) {
      console.error("Failed to fetch photo gallery:", error);
      throw new Error("Failed to fetch photo gallery");
    }
  }

  /**
   * Get paginated photo gallery (most recent photos first)
   * Uses S3 pagination efficiently with reverse timestamps
   */
  static async getPhotoGalleryPaginated(
    maxKeys: number = 5,
    continuationToken?: string
  ): Promise<PaginatedPhotoResult> {
    try {
      // Fetch enough to account for incomplete pairs
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "photos/",
        MaxKeys: maxKeys * 4,
        ContinuationToken: continuationToken,
      });

      const response = await r2Client.send(command);

      if (!response.Contents) {
        return {
          photos: [],
          nextToken: undefined,
          hasMore: false,
        };
      }

      // Group photos by photoId
      const photoMap = new Map<string, Partial<PhotoPair>>();

      response.Contents.forEach((obj) => {
        if (!obj.Key) return;

        const match = obj.Key.match(
          /photos\/photobooth_(\d+)_(front|back)\.jpg$/
        );
        if (!match) return;

        const [, timestampStr, type] = match;
        const photoId = `photobooth_${timestampStr}`;
        const timestampNum = parseInt(timestampStr);

        // Detect if this is a reverse timestamp
        const isReverse = timestampNum > 7000000000000000;
        const actualTimestamp = isReverse
          ? Number.MAX_SAFE_INTEGER - timestampNum
          : timestampNum;

        if (!photoMap.has(photoId)) {
          photoMap.set(photoId, {
            photoId,
            timestamp: new Date(actualTimestamp),
          });
        }

        const photo = photoMap.get(photoId)!;
        const publicUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/${obj.Key}`;

        if (type === "front") {
          photo.frontPhotoUrl = publicUrl;
        } else {
          photo.backPhotoUrl = publicUrl;
        }
      });

      // Filter complete pairs only
      const completePairs: PhotoPair[] = [];
      photoMap.forEach((photo) => {
        if (photo.frontPhotoUrl && photo.backPhotoUrl) {
          completePairs.push(photo as PhotoPair);
        }
      });

      // Sort by timestamp (reverse timestamps already in correct S3 order, but handle mixed old/new)
      completePairs.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      // Take only requested number
      const paginatedPhotos = completePairs.slice(0, maxKeys);

      return {
        photos: paginatedPhotos,
        nextToken: response.NextContinuationToken,
        hasMore: response.IsTruncated || false,
      };
    } catch (error) {
      console.error("Failed to fetch paginated photo gallery:", error);
      throw new Error("Failed to fetch paginated photo gallery");
    }
  }
}
