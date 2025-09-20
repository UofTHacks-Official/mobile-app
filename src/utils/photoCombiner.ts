import { manipulateAsync, SaveFormat, FlipType } from "expo-image-manipulator";

export interface CombinedPhotoResult {
  uri: string;
  width: number;
  height: number;
}

export class PhotoCombiner {
  /**
   * Combines front and back photos BeReal-style
   * Front photo as small overlay on top-left of back photo
   */
  static async combinePhotos(
    frontPhotoUri: string,
    backPhotoUri: string
  ): Promise<CombinedPhotoResult> {
    try {
      // First, process the back photo (main image)
      const backPhoto = await manipulateAsync(
        backPhotoUri,
        [
          { resize: { width: 1080 } }, // Standard size
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Process the front photo (overlay) - make it smaller and round
      const _frontPhoto = await manipulateAsync(
        frontPhotoUri,
        [{ resize: { width: 300 } }, { flip: FlipType.Horizontal }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // For now, return the back photo as main
      // TODO: Implement actual photo overlaying/compositing

      return {
        uri: backPhoto.uri,
        width: backPhoto.width,
        height: backPhoto.height,
      };
    } catch (error) {
      console.error("Photo combination failed:", error);
      throw new Error(`Failed to combine photos: ${error}`);
    }
  }

  /**
   * Save individual photos with metadata
   */
  static async savePhotosIndividually(
    frontPhotoUri: string,
    backPhotoUri: string
  ): Promise<{
    frontPhoto: CombinedPhotoResult;
    backPhoto: CombinedPhotoResult;
  }> {
    try {
      // Process front photo
      const frontPhoto = await manipulateAsync(
        frontPhotoUri,
        [{ resize: { width: 800 } }, { flip: FlipType.Horizontal }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Process back photo
      const backPhoto = await manipulateAsync(
        backPhotoUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      return {
        frontPhoto: {
          uri: frontPhoto.uri,
          width: frontPhoto.width,
          height: frontPhoto.height,
        },
        backPhoto: {
          uri: backPhoto.uri,
          width: backPhoto.width,
          height: backPhoto.height,
        },
      };
    } catch (error) {
      console.error("Photo processing failed:", error);
      throw new Error(`Failed to process photos: ${error}`);
    }
  }
}
