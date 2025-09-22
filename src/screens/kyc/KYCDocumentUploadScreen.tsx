import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

interface KYCDocumentUploadScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const KYCDocumentUploadScreen: React.FC<KYCDocumentUploadScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { email, fullName, phoneNumber, personalInfo } = route.params || {};

  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frontImageRotated, setFrontImageRotated] = useState(false);
  const [backImageRotated, setBackImageRotated] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const documentTypes = [
    {
      id: 'passport',
      title: 'Passport',
      description: 'Government-issued passport',
      icon: 'flight-takeoff',
      requiresBack: false,
    },
    {
      id: 'driving_license',
      title: 'Driving License',
      description: 'Valid driving license',
      icon: 'directions-car',
      requiresBack: true,
    },
    {
      id: 'national_id',
      title: 'National ID Card',
      description: 'Government-issued ID card',
      icon: 'badge',
      requiresBack: true,
    },
  ];

  const handleDocumentTypeSelect = (documentType: any) => {
    setSelectedDocumentType(documentType.id);
    setFrontImage(null);
    setBackImage(null);
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs storage access to select photos from your gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled automatically
  };

  const handlePhotoTaken = (side: 'front' | 'back', imageUri: string) => {
    // Check if this is a camera photo (which might need rotation)
    const uriString = typeof imageUri === 'string' ? imageUri : String(imageUri);
    const isCameraPhoto = uriString.includes('Camera') || uriString.includes('photo');
    
    if (side === 'front') {
      setFrontImage(uriString);
      setFrontImageRotated(isCameraPhoto);
    } else {
      setBackImage(uriString);
      setBackImageRotated(isCameraPhoto);
    }
    Alert.alert('Success', `${side} side photo captured successfully!`);
  };

  const openImageViewer = (imageUri: string) => {
    setViewingImage(imageUri);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setViewingImage(null);
  };

  const openCamera = (side: 'front' | 'back') => {
    const selectedDoc = documentTypes.find(doc => doc.id === selectedDocumentType);
    
    // Map document types to match camera screen expectations
    let cameraDocType = 'id-card';
    if (selectedDocumentType === 'driving_license') {
      cameraDocType = 'driver-license';
    } else if (selectedDocumentType === 'passport') {
      cameraDocType = 'passport';
    } else if (selectedDocumentType === 'national_id') {
      cameraDocType = 'id-card';
    }
    
    navigation.navigate('KYCCamera', {
      documentType: cameraDocType,
      side: side,
      onPhotoTaken: (payload: any) => {
        handlePhotoTaken(payload.side, payload.uri);
      }
    });
  };

  const handleImageUpload = (side: 'front' | 'back') => {
    Alert.alert(
      'Upload Document',
      `Please select the ${side} side of your ${selectedDocumentType}`,
      [
        {
          text: 'Camera',
          onPress: () => openCamera(side)
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(side)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const validateImage = (asset: any): boolean => {
    // Check file size (max 5MB)
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert('Error', 'Image size too large. Please select an image smaller than 5MB.');
      return false;
    }

    // Check image dimensions (minimum requirements)
    if (asset.width && asset.height) {
      if (asset.width < 300 || asset.height < 300) {
        Alert.alert('Error', 'Image resolution too low. Please select a higher quality image.');
        return false;
      }
    }

    return true;
  };


  const openGallery = async (side: 'front' | 'back') => {
    // Request storage permission first
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to access photos.');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }
      
      if (response.errorMessage) {
        console.log('Gallery error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to open gallery. Please try again.');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        if (!validateImage(asset)) {
          return;
        }

        const imageUri = asset.uri;
        if (imageUri) {
          if (side === 'front') {
            setFrontImage(imageUri);
          } else {
            setBackImage(imageUri);
          }
          Alert.alert('Success', `${side} side image selected successfully!`);
        }
      }
    });
  };

  const handleContinue = async () => {
    if (!selectedDocumentType) {
      Alert.alert('Error', 'Please select a document type');
      return;
    }

    if (!frontImage) {
      Alert.alert('Error', 'Please upload the front side of your document');
      return;
    }

    const selectedDoc = documentTypes.find(doc => doc.id === selectedDocumentType);
    if (selectedDoc?.requiresBack && !backImage) {
      Alert.alert('Error', 'Please upload the back side of your document');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call for document processing
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('KYCReview', {
        email,
        fullName,
        phoneNumber,
        personalInfo,
        documentInfo: {
          type: selectedDocumentType,
          frontImage,
          backImage,
        }
      });
    }, 2000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 100, // Add bottom padding for scroll
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginHorizontal: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
      width: '66%', // Step 2 of 3
    },
    stepText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    documentTypesContainer: {
      marginBottom: 32,
    },
    documentTypeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    documentTypeItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    documentTypeIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    documentTypeContent: {
      flex: 1,
    },
    documentTypeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    documentTypeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    uploadSection: {
      marginBottom: 32,
    },
    uploadContainer: {
      marginBottom: 20,
    },
    uploadLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    uploadBox: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      borderRadius: 16,
      minHeight: 250,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    uploadBoxActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '05',
    },
    uploadedImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: theme.colors.border + '20',
    },
    rotatedImage: {
      transform: [{ rotate: '-90deg' }],
    },
    uploadIcon: {
      marginBottom: 12,
    },
    uploadText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    uploadSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    retakeButtonContainer: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      right: 8,
      alignItems: 'center',
    },
    retakeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    retakeButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    infoContainer: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 8,
      lineHeight: 20,
    },
    tipsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 12,
      lineHeight: 20,
    },
    buttonContainer: {
      paddingBottom: 20,
      paddingTop: 20,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    continueButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      position: 'absolute',
      top: 35,
      left: 20,
      padding: 8,
      zIndex: 1,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    uploadEmptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      paddingHorizontal: 24,
    },
    viewImageOverlay: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewImageText: {
      color: theme.colors.white,
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
    imageViewerContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageViewerBackground: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    imageViewerContent: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 8,
    },
    fullSizeImage: {
      width: '100%',
      height: '80%',
      borderRadius: 8,
    },
    imageViewerHint: {
      color: theme.colors.white,
      fontSize: 14,
      marginTop: 20,
      textAlign: 'center',
      opacity: 0.7,
    },
  });

  const selectedDoc = documentTypes.find(doc => doc.id === selectedDocumentType);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>Step 2</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.stepText}>of 3</Text>
          </View>
          
          <Text style={styles.title}>Upload ID Document</Text>
          <Text style={styles.subtitle}>
            Please upload a clear photo of your government-issued ID document.
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Icon name="info-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            Ensure the document is clear, well-lit, and all corners are visible. The information must match what you entered previously.
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📸 Photo Tips for Best Results:</Text>
          <View style={styles.tipItem}>
            <Icon name="photo-library" size={16} color={theme.colors.primary} />
            <Text style={styles.tipText}>Use Gallery option for reliable photo selection</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="wb-sunny" size={16} color={theme.colors.primary} />
            <Text style={styles.tipText}>Use good lighting - avoid shadows</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="center-focus-strong" size={16} color={theme.colors.primary} />
            <Text style={styles.tipText}>Keep document flat and all corners visible</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="high-quality" size={16} color={theme.colors.primary} />
            <Text style={styles.tipText}>Ensure text is clear and readable</Text>
          </View>
        </View>

        <View style={styles.documentTypesContainer}>
          <Text style={styles.sectionTitle}>Select Document Type</Text>
          {documentTypes.map((docType) => (
            <TouchableOpacity
              key={docType.id}
              style={[
                styles.documentTypeItem,
                selectedDocumentType === docType.id && styles.documentTypeItemSelected
              ]}
              onPress={() => handleDocumentTypeSelect(docType)}
              activeOpacity={0.7}
            >
              <View style={styles.documentTypeIcon}>
                <Icon name={docType.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.documentTypeContent}>
                <Text style={styles.documentTypeTitle}>{docType.title}</Text>
                <Text style={styles.documentTypeDescription}>{docType.description}</Text>
              </View>
              {selectedDocumentType === docType.id && (
                <Icon name="check-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedDocumentType && (
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload Document</Text>
            
            {/* Front Side Upload */}
            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Front Side</Text>
              <View style={[styles.uploadBox, frontImage && styles.uploadBoxActive]}>
                  {frontImage ? (
                    <>
                      <TouchableOpacity 
                        style={styles.imageContainer}
                        onPress={() => openImageViewer(frontImage)}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: frontImage }} 
                          style={[
                            styles.uploadedImage,
                            frontImageRotated && styles.rotatedImage
                          ]}
                          resizeMode="contain"
                        />
                        <View style={styles.viewImageOverlay}>
                          <Icon name="zoom-in" size={20} color={theme.colors.white} />
                          <Text style={styles.viewImageText}>Tap to view</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.retakeButtonContainer}>
                        <TouchableOpacity style={styles.retakeButton} onPress={() => handleImageUpload('front')}>
                          <Icon name="refresh" size={16} color={theme.colors.text} />
                          <Text style={styles.retakeButtonText}>Retake Photo</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadEmptyContainer}
                      onPress={() => handleImageUpload('front')}
                      activeOpacity={0.7}
                    >
                      <Icon name="add-a-photo" size={48} color={theme.colors.primary} style={styles.uploadIcon} />
                      <Text style={styles.uploadText}>Take Photo or Select from Gallery</Text>
                      <Text style={styles.uploadSubtext}>Front side of your {selectedDoc?.title}</Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>

            {/* Back Side Upload (if required) */}
            {selectedDoc?.requiresBack && (
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadLabel}>Back Side</Text>
                <View style={[styles.uploadBox, backImage && styles.uploadBoxActive]}>
                  {backImage ? (
                    <>
                      <TouchableOpacity 
                        style={styles.imageContainer}
                        onPress={() => openImageViewer(backImage)}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: backImage }} 
                          style={[
                            styles.uploadedImage,
                            backImageRotated && styles.rotatedImage
                          ]}
                          resizeMode="contain"
                        />
                        <View style={styles.viewImageOverlay}>
                          <Icon name="zoom-in" size={20} color={theme.colors.white} />
                          <Text style={styles.viewImageText}>Tap to view</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.retakeButtonContainer}>
                        <TouchableOpacity style={styles.retakeButton} onPress={() => handleImageUpload('back')}>
                          <Icon name="refresh" size={16} color={theme.colors.text} />
                          <Text style={styles.retakeButtonText}>Retake Photo</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadEmptyContainer}
                      onPress={() => handleImageUpload('back')}
                      activeOpacity={0.7}
                    >
                      <Icon name="add-a-photo" size={48} color={theme.colors.primary} style={styles.uploadIcon} />
                      <Text style={styles.uploadText}>Take Photo or Select from Gallery</Text>
                      <Text style={styles.uploadSubtext}>Back side of your {selectedDoc?.title}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedDocumentType || !frontImage || (selectedDoc?.requiresBack && !backImage) || isLoading) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedDocumentType || !frontImage || (selectedDoc?.requiresBack && !backImage) || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Processing Document...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity 
            style={styles.imageViewerBackground}
            onPress={closeImageViewer}
            activeOpacity={1}
          >
            <View style={styles.imageViewerContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeImageViewer}
              >
                <Icon name="close" size={24} color={theme.colors.white} />
              </TouchableOpacity>
              
              {viewingImage && (
                <Image 
                  source={{ uri: viewingImage }} 
                  style={styles.fullSizeImage}
                  resizeMode="contain"
                />
              )}
              
              <Text style={styles.imageViewerHint}>
                Tap anywhere to close
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
