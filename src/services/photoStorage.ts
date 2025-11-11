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
  prompt?: string; // The notification body that prompted this photo
}

export interface PaginatedPhotoResult {
  photos: PhotoPair[];
  nextToken?: string;
  hasMore: boolean;
}
export class PhotoStorageService {
  /**
   * Fetch metadata JSON for a photo pair
   */
  private static async fetchPhotoMetadata(
    photoId: string
  ): Promise<{ prompt?: string } | null> {
    try {
      const metadataFileName = `photos/${photoId}_metadata.json`;

      // Use fetch instead of AWS SDK to avoid Blob issues in React Native
      const metadataUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/${metadataFileName}`;
      const response = await fetch(metadataUrl);

      if (!response.ok) {
        // 404 means no metadata file exists - that's okay
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const metadata = await response.json();
      console.log(`[Metadata] Found for ${photoId}:`, metadata);
      return metadata;
    } catch (_error) {
      // Metadata file doesn't exist or failed to fetch - that's okay
      console.log(`[Metadata] Not found for ${photoId}`);
      return null;
    }
  }

  static async uploadPhoto(
    photoUri: string,
    fileName: string,
    metadata?: Record<string, string>
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
        Metadata: metadata,
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
    backPhotoUri: string,
    prompt?: string
  ): Promise<PhotoUploadResult> {
    try {
      // Use regular timestamp - we'll sort by S3 LastModified instead of filename
      const timestamp = Date.now();
      const photoId = `photobooth_${timestamp}`;

      const frontFileName = `photos/${photoId}_front.jpg`;
      const backFileName = `photos/${photoId}_back.jpg`;
      const metadataFileName = `photos/${photoId}_metadata.json`;

      // Prepare metadata with prompt if provided
      const metadata = prompt ? { prompt } : undefined;

      // Create metadata JSON if we have a prompt
      const uploadPromises: Promise<string>[] = [
        this.uploadPhoto(frontPhotoUri, frontFileName, metadata),
        this.uploadPhoto(backPhotoUri, backFileName, metadata),
      ];

      // Upload metadata JSON file if prompt exists
      if (prompt) {
        const metadataJson = JSON.stringify({ prompt, timestamp });
        const metadataBuffer = new TextEncoder().encode(metadataJson);

        const metadataCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: metadataFileName,
          Body: metadataBuffer,
          ContentType: "application/json",
        });

        uploadPromises.push(
          r2Client.send(metadataCommand).then(() => `metadata uploaded`)
        );
      }

      // Upload both photos (and metadata) in parallel
      const [frontPhotoUrl, backPhotoUrl] = await Promise.all(uploadPromises);

      // Clear cache so gallery refreshes with new photo
      this.clearPhotoCache();

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

        const [, timestamp, type] = match;
        const photoId = `photobooth_${timestamp}`;

        if (!photoMap.has(photoId)) {
          photoMap.set(photoId, {
            photoId,
            timestamp: new Date(parseInt(timestamp)),
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
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error("Failed to fetch photo gallery:", error);
      throw new Error("Failed to fetch photo gallery");
    }
  }

  // Cache for sorted photo IDs to avoid re-sorting on every pagination
  private static sortedPhotoCache: { ids: string[]; timestamp: number } | null =
    null;
  private static CACHE_TTL = 60000; // Cache for 1 minute

  /**
   * Get all photo IDs sorted by timestamp (cached)
   */
  private static async getSortedPhotoIds(): Promise<string[]> {
    // Check cache
    if (
      this.sortedPhotoCache &&
      Date.now() - this.sortedPhotoCache.timestamp < this.CACHE_TTL
    ) {
      return this.sortedPhotoCache.ids;
    }

    // Fetch all photo files from S3
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "photos/",
    });

    const response = await r2Client.send(command);
    if (!response.Contents) return [];

    // Extract unique photo IDs from filenames
    const photoIds = new Set<string>();
    response.Contents.forEach((obj) => {
      if (!obj.Key) return;
      const match = obj.Key.match(
        /photos\/photobooth_(\d+)_(front|back)\.jpg$/
      );
      if (match) {
        photoIds.add(`photobooth_${match[1]}`);
      }
    });

    // Sort photo IDs by timestamp (newest first)
    const sorted = Array.from(photoIds).sort((a, b) => {
      const tsA = parseInt(a.replace("photobooth_", ""));
      const tsB = parseInt(b.replace("photobooth_", ""));
      return tsB - tsA; // Descending (newest first)
    });

    // Cache the result
    this.sortedPhotoCache = { ids: sorted, timestamp: Date.now() };
    return sorted;
  }

  /**
   * Get paginated photo gallery (most recent photos first)
   */
  static async getPhotoGalleryPaginated(
    pageSize: number = 10,
    offset: number = 0
  ): Promise<PaginatedPhotoResult> {
    try {
      // Get sorted photo IDs (cached for efficiency)
      const sortedIds = await this.getSortedPhotoIds();

      // Get the page of photo IDs
      const pageIds = sortedIds.slice(offset, offset + pageSize);

      // Fetch photo pairs for this page
      const photoPairs: PhotoPair[] = [];

      for (const photoId of pageIds) {
        const timestamp = parseInt(photoId.replace("photobooth_", ""));
        const frontUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/photos/${photoId}_front.jpg`;
        const backUrl = `https://pub-8699413992d644f2b85a9b4cb11b2bc5.r2.dev/photos/${photoId}_back.jpg`;

        photoPairs.push({
          photoId,
          frontPhotoUrl: frontUrl,
          backPhotoUrl: backUrl,
          timestamp: new Date(timestamp),
        });
      }

      // Fetch metadata (prompts) for the paginated pairs
      const pairsWithMetadata = await Promise.all(
        photoPairs.map(async (pair) => {
          const metadata = await this.fetchPhotoMetadata(pair.photoId);
          return {
            ...pair,
            prompt: metadata?.prompt,
          };
        })
      );

      return {
        photos: pairsWithMetadata,
        nextToken: (offset + pageSize).toString(),
        hasMore: offset + pageSize < sortedIds.length,
      };
    } catch (error) {
      console.error("Failed to fetch paginated photo gallery:", error);
      throw new Error("Failed to fetch paginated photo gallery");
    }
  }

  /**
   * Clear the photo cache (call this after uploading new photos)
   */
  static clearPhotoCache(): void {
    this.sortedPhotoCache = null;
  }
}
