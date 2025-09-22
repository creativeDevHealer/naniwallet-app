import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutChangeEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageEditor from '@react-native-community/image-editor';
import { useLocale } from '../../context/LocaleContext';
import { t, isRTL, getTextAlign } from '../../i18n';

type DocType = 'id-card' | 'driver-license' | 'passport';
type DocSide = 'front' | 'back';

interface Props {
  navigation: any;
  route: {
    params?: {
      documentType: DocType;        // 'id-card' | 'driver-license' | 'passport'
      side?: DocSide;               // 'front' | 'back'
      onPhotoTaken?: (payload: {
        side: DocSide;
        uri: string;
        cropRectPx: { x: number; y: number; width: number; height: number };
        photo: PhotoFile;
        documentType: DocType;
      }) => void;
    };
  };
}

/**
 * Real-world doc aspect ratios (width/height):
 * - ID/Driver License (ISO/IEC 7810 ID-1): 85.60 × 53.98 mm → ~1.586
 * - Passport data page varies by country; common leaf page ~ 125 × 88 mm → ~1.42
 */
const DOC_ASPECT: Record<DocType, number> = {
  'id-card': 85.6 / 53.98,
  'driver-license': 85.6 / 53.98,
  passport: 125 / 88,
};

export const KYCCameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params ?? {};
  const documentType: DocType = (params as any).documentType ?? 'id-card';
  const side: DocSide = (params as any).side ?? 'front';
  const onPhotoTaken = (params as any).onPhotoTaken;

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { locale } = useLocale();

  // Camera permission & device
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  
  // High-quality camera format for better resolution
  const format = useCameraFormat(device, [
    { photoResolution: 'max' },
    { videoResolution: 'max' },
    { photoAspectRatio: 4/3 },
    { fps: 30 },
  ]);
  
  const cameraRef = useRef<Camera>(null);

  const [torch, setTorch] = useState<'on' | 'off'>('off');
  const [viewW, setViewW] = useState(0);
  const [viewH, setViewH] = useState(0);

  // Use default camera format for natural view

  // Overlay sizing (smaller blue guide frame)
  const overlay = useMemo(() => {
    if (!viewW || !viewH) return null;
    const targetAspect = DOC_ASPECT[documentType];

    // Use 75% of device width for smaller guide frame
    let boxW = viewW * 0.75;
    let boxH = boxW / targetAspect;

    // If too tall, clamp to 55% of screen height and recompute width
    const maxH = viewH * 0.55;
    if (boxH > maxH) {
      boxH = maxH;
      boxW = boxH * targetAspect;
    }

    const x = (viewW - boxW) / 2;
    const y = (viewH - boxH) / 2;

    return { x, y, width: boxW, height: boxH, aspect: targetAspect };
  }, [viewW, viewH, documentType]);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            t('kyc_camera_permission_needed', locale),
            t('kyc_camera_permission_message', locale),
            [{ text: t('kyc_camera_ok', locale), onPress: () => navigation.goBack() }]
          );
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (device) {
      console.log('📱 Camera Device Info:');
      console.log('- Device:', device.name);
      console.log('- Min/Max/Neutral zoom:', device.minZoom, device.maxZoom, device.neutralZoom);
      console.log('- Available formats:', device.formats.length);
    }
    if (format) {
      console.log('📷 Selected High-Quality Format:');
      console.log('- Photo resolution:', format.photoWidth + 'x' + format.photoHeight);
      console.log('- Video resolution:', format.videoWidth + 'x' + format.videoHeight);
      console.log('- FPS:', format.maxFps);
      console.log('- Field of view:', format.fieldOfView + '°');
    }
  }, [device, format]);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewW(width);
    setViewH(height);
  }, []);

  // Utility function for clamping values
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || !overlay) {
      Alert.alert(t('kyc_camera_error', locale), t('kyc_camera_not_ready', locale));
      return;
    }
    
    try {
      console.log('📸 Taking camera photo...');
      console.log('📐 Blue guide area:', overlay);

      // Take photo directly from camera
      const photo = await cameraRef.current.takePhoto();

      console.log('✅ Camera photo taken successfully');
      console.log('📷 Photo info:', {
        path: photo.path,
        width: photo.width,
        height: photo.height
      });

      // Calculate crop area based on camera preview to actual photo mapping
      const photoW = photo.width;
      const photoH = photo.height;
      
      // Camera preview uses "cover" scaling - the image fills the entire view
      // We need to map the overlay coordinates to the actual photo coordinates
      const previewAspect = viewW / viewH;
      const photoAspect = photoW / photoH;
      
      let cropX, cropY, cropW, cropH;
      
      if (photoAspect > previewAspect) {
        // Photo is wider than preview - photo is cropped horizontally in preview
        const scale = photoH / viewH;
        const scaledPhotoW = photoW / scale;
        const offsetX = (scaledPhotoW - viewW) / 2;
        
        cropX = Math.round((overlay.x + offsetX) * scale);
        cropY = Math.round(overlay.y * scale);
        cropW = Math.round(overlay.width * scale);
        cropH = Math.round(overlay.height * scale);
      } else {
        // Photo is taller than preview - photo is cropped vertically in preview  
        const scale = photoW / viewW;
        const scaledPhotoH = photoH / scale;
        const offsetY = (scaledPhotoH - viewH) / 2;
        
        cropX = Math.round(overlay.x * scale);
        cropY = Math.round((overlay.y + offsetY) * scale);
        cropW = Math.round(overlay.width * scale);
        cropH = Math.round(overlay.height * scale);
      }

      // Clamp to photo bounds
      cropX = clamp(cropX, 0, photoW - 1);
      cropY = clamp(cropY, 0, photoH - 1);
      cropW = clamp(cropW, 1, photoW - cropX);
      cropH = clamp(cropH, 1, photoH - cropY);

      const cropData = {
        offset: { x: cropX, y: cropY },
        size: { width: cropW, height: cropH },
      };

      console.log('📐 Photo size:', photoW, 'x', photoH);
      console.log('📐 Preview size:', viewW, 'x', viewH);
      console.log('📐 Aspect ratios - Photo:', photoAspect.toFixed(3), 'Preview:', previewAspect.toFixed(3));
      console.log('✂️ Crop area:', cropData);
      console.log('📊 Crop percentage:', {
        x: ((cropX / photoW) * 100).toFixed(1) + '%',
        y: ((cropY / photoH) * 100).toFixed(1) + '%',
        w: ((cropW / photoW) * 100).toFixed(1) + '%',
        h: ((cropH / photoH) * 100).toFixed(1) + '%'
      });

      // Crop the photo to the blue guide area
      let croppedUri: string;
      try {
        const photoUri = `file://${photo.path}`;
        const res = await ImageEditor.cropImage(photoUri, cropData);
        croppedUri = typeof res === 'string' ? res : (res as any)?.uri;
        console.log('🎯 Crop successful:', croppedUri);
      } catch (cropError) {
        console.warn('⚠️ Crop failed, using full photo:', cropError);
        croppedUri = `file://${photo.path}`;
        cropX = 0;
        cropY = 0;
        cropW = photoW;
        cropH = photoH;
      }

      // Return the cropped image
      if (onPhotoTaken) {
        const pathWithoutProtocol = croppedUri.replace(/^file:\/+/, '');
        onPhotoTaken({
          side,
          uri: croppedUri,
          cropRectPx: { x: cropX, y: cropY, width: cropW, height: cropH },
          photo: {
            ...photo,
            path: pathWithoutProtocol,
            width: cropW,
            height: cropH,
          },
          documentType,
        });
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Camera capture error:', error?.message ?? error);
      
      let errorMessage = t('kyc_camera_failed_photo', locale);
      if (error?.message?.includes('capture')) {
        errorMessage += t('kyc_camera_capture_failed', locale);
      } else if (error?.message?.includes('crop')) {
        errorMessage += t('kyc_camera_crop_failed', locale);
      } else {
        errorMessage += t('kyc_camera_check_permissions', locale);
      }
      
      Alert.alert(t('kyc_camera_error_title', locale), errorMessage, [
        { text: t('kyc_camera_try_again', locale), onPress: () => {} },
        { text: t('kyc_camera_go_back', locale), onPress: () => navigation.goBack() },
      ]);
    }
  }, [cameraRef, documentType, navigation, onPhotoTaken, overlay, side, viewW, viewH, locale]);

  // Render gates
  if (!device) {
    return (
      <Centered dark>
        <Text style={styles.infoText}>{t('kyc_camera_no_device', locale)}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t('kyc_camera_go_back', locale)}</Text>
        </TouchableOpacity>
      </Centered>
    );
  }
  if (!hasPermission) {
    return (
      <Centered dark>
        <Text style={styles.infoText}>{t('kyc_camera_permission_required', locale)}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>{t('kyc_camera_grant_permission', locale)}</Text>
        </TouchableOpacity>
      </Centered>
    );
  }

  return (
    <View style={styles.root} onLayout={onContainerLayout}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

       {isFocused && (
         <Camera
           ref={cameraRef}
           device={device}
           format={format}
           isActive={true}
           photo={true}
           torch={torch}
           zoom={device?.neutralZoom ?? 1}
           style={StyleSheet.absoluteFill}
         />
       )}

      {/* Dark mask + guide box */}
      {overlay && (
        <>
          {/* Mask slabs */}
          <View style={[styles.mask, { left: 0, top: 0, width: viewW, height: overlay.y }]} />
          <View style={[styles.mask, { left: 0, top: overlay.y, width: overlay.x, height: overlay.height }]} />
          <View
            style={[
              styles.guideBox,
              {
                left: overlay.x,
                top: overlay.y,
                width: overlay.width,
                height: overlay.height,
                borderRadius: 10,
              },
            ]}
          />
          <View
            style={[
              styles.mask,
              {
                left: overlay.x + overlay.width,
                top: overlay.y,
                width: viewW - (overlay.x + overlay.width),
                height: overlay.height,
              },
            ]}
          />
          <View
            style={[
              styles.mask,
              { left: 0, top: overlay.y + overlay.height, width: viewW, height: viewH - (overlay.y + overlay.height) },
            ]}
          />

          {/* Hint text */}
          <View style={[styles.hintWrap, { top: overlay.y - 40 }]}>
            <Text style={styles.hintTitle}>
              {documentType === 'passport' 
                ? t('kyc_camera_align_passport', locale) 
                : t('kyc_camera_align_id', locale)}
            </Text>
            <Text style={styles.hintSub}>{t('kyc_camera_hint_subtitle', locale)}</Text>
          </View>
        </>
      )}

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {documentType === 'passport' 
              ? t('kyc_camera_passport', locale)
              : documentType === 'driver-license' 
                ? t('kyc_camera_driver_license', locale)
                : t('kyc_camera_id_card', locale)}
          </Text>
          <Text style={styles.subtitle}>
            {side === 'back' 
              ? t('kyc_camera_back_side', locale) 
              : t('kyc_camera_front_side', locale)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => setTorch((t) => (t === 'on' ? 'off' : 'on'))}
          accessibilityLabel={t('kyc_camera_toggle_torch', locale)}
        >
          <Icon name={torch === 'on' ? 'flash-on' : 'flash-off'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/** Simple centered wrapper */
function Centered({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <View style={[styles.centered, dark && { backgroundColor: '#000' }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Top
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0, right: 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  roundBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  titleBlock: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  // Overlay & mask
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  guideBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#60A5FA', // soft blue
    backgroundColor: 'transparent',
  },
  hintWrap: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  hintTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hintSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

  // Bottom controls
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingTop: 12,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)',
  },
  shutterInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff',
  },

  // Info state
  infoText: { color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});

export default KYCCameraScreen;
