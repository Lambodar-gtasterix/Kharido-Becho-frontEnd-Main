import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors } from '@theme/colors';
import { EntityType, useEntityImageUpload } from '../../hooks/useEntityImageUpload';

const { width } = Dimensions.get('window');

type PhotoUploadScreenProps = {
  entityType: EntityType;
  entityId: number;
  title?: string;
  maxPhotos?: number;
  onBack: () => void;
  onSuccess: (images: string[]) => void;
};

const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  entityType,
  entityId,
  title,
  maxPhotos = 10,
  onBack,
  onSuccess,
}) => {
  const { uploading, uploadProgress, uploadFromAssets } = useEntityImageUpload({
    entityType,
    entityId,
    onSuccess,
    maxPhotos,
  });

  const handleTakePhoto = async () => {
    if (uploading) return;

    console.log('[CAMERA] Opening camera...');

    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: false,
        cameraType: 'back',
      });

      console.log('[CAMERA] Response:', res);

      if (res.didCancel) {
        console.log('[CAMERA] User cancelled');
        return;
      }

      if (res.errorCode) {
        console.error('[CAMERA] Error code:', res.errorCode);
        if (res.errorCode === 'camera_unavailable') {
          Alert.alert('Error', 'Camera is not available on this device');
        } else if (res.errorCode === 'permission') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        } else {
          Alert.alert('Error', res.errorMessage || 'Failed to open camera');
        }
        return;
      }

      if (res.assets?.length) {
        console.log('[CAMERA] Got assets:', res.assets.length);
        await uploadFromAssets(res.assets);
      }
    } catch (error: any) {
      console.error('[CAMERA ERROR]', error);
      Alert.alert('Error', error?.message || 'Failed to open camera');
    }
  };

  const handlePickGallery = async () => {
    if (uploading) return;

    console.log('[GALLERY] Opening gallery...');

    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: maxPhotos,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      console.log('[GALLERY] Response:', res);

      if (res.didCancel) {
        console.log('[GALLERY] User cancelled');
        return;
      }

      if (res.errorCode) {
        console.error('[GALLERY] Error code:', res.errorCode);
        if (res.errorCode === 'permission') {
          Alert.alert('Permission Denied', 'Storage permission is required to access photos');
        } else {
          Alert.alert('Error', res.errorMessage || 'Failed to open gallery');
        }
        return;
      }

      if (res.assets?.length) {
        console.log('[GALLERY] Got assets:', res.assets.length);
        await uploadFromAssets(res.assets);
      }
    } catch (error: any) {
      console.error('[GALLERY ERROR]', error);
      Alert.alert('Error', error?.message || 'Failed to open gallery');
    }
  };

  const displayTitle = title || `Upload ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Photos`;
  const percent = uploadProgress && uploadProgress.total > 0
    ? Math.min((uploadProgress.uploaded / uploadProgress.total) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            disabled={uploading}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{displayTitle}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Large Upload Area */}
          <View style={styles.uploadArea}>
            <View style={styles.cameraIconContainer}>
              <Icon name="camera-outline" size={64} color={colors.textTertiary} />
            </View>
            <Text style={styles.uploadTitle}>Add Photos</Text>
            <Text style={styles.uploadSubtitle}>
              You can add up to {maxPhotos} photos
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, uploading && styles.buttonDisabled]}
              onPress={handleTakePhoto}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <Icon name="camera" size={24} color={colors.surface} />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, uploading && styles.buttonDisabled]}
              onPress={handlePickGallery}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <Icon name="image-multiple-outline" size={24} color={colors.secondary} />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Simple Hint */}
          <Text style={styles.hintText}>
            Clear photos help you get better responses
          </Text>
        </View>

        {/* Upload Progress Overlay */}
        {uploading && uploadProgress && (
          <View style={styles.uploadOverlay}>
            <View style={styles.progressCard}>
              <View style={styles.progressIconContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
              </View>

              <Text style={styles.progressTitle}>Uploading Photos</Text>
              <Text style={styles.progressCount}>
                {uploadProgress.uploaded} of {uploadProgress.total}
              </Text>

              {uploadProgress.current && (
                <Text style={styles.progressCurrent} numberOfLines={1}>
                  {uploadProgress.current}
                </Text>
              )}

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
              </View>

              <View style={styles.progressStats}>
                <Text style={styles.progressPercentage}>{Math.round(percent)}%</Text>
                <Text style={styles.progressHint}>Please wait...</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PhotoUploadScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  uploadArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  cameraIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  hintText: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    width: width * 0.85,
    maxWidth: 380,
    alignItems: 'center',
  },
  progressIconContainer: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 8,
  },
  progressCurrent: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressHint: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
