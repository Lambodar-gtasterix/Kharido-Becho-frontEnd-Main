import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { uploadCarImages } from '../api/CarsApi/uploadImages';
import { uploadMobileImages } from '../api/MobilesApi';
import { uploadLaptopImages } from '../api/LaptopsApi';
import { uploadBikeImages } from '../api/BikesApi';
import { ensureOverlayReady } from '@shared/utils';

export type EntityType = 'car' | 'mobile' | 'laptop' | 'bike';

export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadProgressState = {
  total: number;
  uploaded: number;
  current?: string | null;
};

type UseEntityImageUploadParams = {
  entityType: EntityType;
  entityId: number;
  onSuccess: (images: string[]) => void;
  maxPhotos?: number;
};

const uploadFunctions = {
  car: uploadCarImages,
  mobile: uploadMobileImages,
  laptop: uploadLaptopImages,
  bike: uploadBikeImages,
};

export const useEntityImageUpload = ({
  entityType,
  entityId,
  onSuccess,
  maxPhotos = 10,
}: UseEntityImageUploadParams) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);

  const uploadFromAssets = useCallback(
    async (assets: Asset[]) => {
      if (uploading) return;

      if (!entityId) {
        Alert.alert('Error', `Missing ${entityType} id`);
        return;
      }

      // Filter out videos and keep only images
      const validAssets = (assets || []).filter((asset) => {
        const isImage = asset.type?.startsWith('image/');
        return isImage && !!asset?.uri;
      });

      if (validAssets.length === 0) {
        Alert.alert('Error', 'No photo selected. Only images are allowed.');
        return;
      }

      // Enforce max photos
      if (validAssets.length > maxPhotos) {
        Alert.alert(
          'Too Many Photos',
          `You can only upload up to ${maxPhotos} photos. Only the first ${maxPhotos} will be uploaded.`,
        );
        validAssets.splice(maxPhotos);
      }

      setUploading(true);
      setUploadProgress({ total: validAssets.length, uploaded: 0, current: 'Starting...' });

      try {
        await ensureOverlayReady();

        const files: RNFile[] = validAssets.map((asset, index) => ({
          uri: asset.uri!,
          name: asset.fileName ?? `${entityType}_${Date.now()}_${index}.jpg`,
          type: asset.type ?? 'image/jpeg',
        }));

        const uploadedUrls: string[] = [];
        const seenUrls = new Set<string>();
        const failedFiles: { name: string; error: string }[] = [];

        const uploadFn = uploadFunctions[entityType];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          setUploadProgress({
            total: files.length,
            uploaded: i,
            current: file.name || `Image ${i + 1}`,
          });

          try {
            const result = await uploadFn(entityId, [file]);

            // Handle different response formats
            let urls: string[] = [];

            if (Array.isArray(result)) {
              // Car, Mobile, Bike format: returns string[]
              urls = result;
            } else if (result && typeof result === 'object' && 'imageUrls' in result) {
              // Laptop format: returns { imageUrls: string[], ... }
              urls = Array.isArray(result.imageUrls) ? result.imageUrls : [];
            }

            urls.forEach((url) => {
              if (typeof url === 'string' && url.trim().length && !seenUrls.has(url)) {
                seenUrls.add(url);
                uploadedUrls.push(url);
              }
            });
          } catch (error: any) {
            console.error(`[${entityType.toUpperCase()} UPLOAD ERROR]`, error?.message || error);
            failedFiles.push({
              name: file.name || `Image ${i + 1}`,
              error: error?.message || 'Upload failed',
            });
          }
        }

        setUploadProgress({
          total: files.length,
          uploaded: files.length,
          current: 'Complete',
        });

        if (uploadedUrls.length === 0) {
          const firstError = failedFiles[0]?.error || 'All uploads failed';
          throw new Error(firstError);
        }

        const successCount = uploadedUrls.length;
        const failCount = failedFiles.length;

        if (failCount > 0) {
          Alert.alert(
            'Partial Success',
            `${successCount} of ${files.length} images uploaded successfully.\n${failCount} failed.`,
            [
              {
                text: 'Continue Anyway',
                onPress: () => onSuccess(uploadedUrls),
              },
              { text: 'Retry Failed', style: 'cancel' },
            ],
          );
        } else {
          Alert.alert('Success', `All ${successCount} images uploaded successfully!`);
          onSuccess(uploadedUrls);
        }
      } catch (error: any) {
        console.error(`[${entityType.toUpperCase()} UPLOAD FAILED]`, error?.response?.data || error?.message || error);
        Alert.alert('Upload Failed', error?.message || 'Network error. Please try again.', [
          { text: 'Retry', onPress: () => uploadFromAssets(assets) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [uploading, entityId, entityType, maxPhotos, onSuccess],
  );

  return {
    uploading,
    uploadProgress,
    uploadFromAssets,
  };
};
