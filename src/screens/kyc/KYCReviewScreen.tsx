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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import KYCService from '../../services/kycService';

interface KYCReviewScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const KYCReviewScreen: React.FC<KYCReviewScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { user, completeKYCAndLogin } = useAuth();
  const { email, fullName, phoneNumber, personalInfo, documentInfo } = route.params || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const documentTypeNames = {
    passport: 'Passport',
    driving_license: 'Driving License',
    national_id: 'National ID Card',
  };

  const handleSubmitKYC = async () => {
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the terms and conditions to continue');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit KYC data using the KYC service
      const kycService = KYCService.getInstance();
      await kycService.submitKYC(
        personalInfo, 
        documentInfo?.type, 
        documentInfo?.frontImage, 
        documentInfo?.backImage
      );
      
      // Complete KYC and log in the user
      await completeKYCAndLogin();
      
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to submit KYC information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSection = (section: string) => {
    if (section === 'personal') {
      navigation.navigate('KYCPersonalInfo', {
        email,
        fullName,
        phoneNumber,
        editMode: true
      });
    } else if (section === 'document') {
      navigation.navigate('KYCDocumentUpload', {
        email,
        fullName,
        phoneNumber,
        personalInfo,
        editMode: true
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
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
      width: '100%', // Step 3 of 3 - complete
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
    sectionContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primary + '15',
      borderRadius: 8,
    },
    editButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '50',
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
      flex: 2,
      textAlign: 'right',
    },
    documentContainer: {
      marginTop: 8,
    },
    documentImageContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    documentImage: {
      flex: 1,
      height: 120,
      borderRadius: 8,
      backgroundColor: theme.colors.border,
    },
    documentImageLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    termsLink: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    buttonContainer: {
      paddingBottom: 20,
      paddingTop: 20,
    },
    submitButton: {
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
    submitButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonText: {
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
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

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
            <Text style={styles.stepText}>Step 3</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.stepText}>of 3</Text>
          </View>
          
          <Text style={styles.title}>Review & Submit</Text>
          <Text style={styles.subtitle}>
            Please review your information carefully before submitting for verification.
          </Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditSection('personal')}
            >
              <Icon name="edit" size={16} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{`${personalInfo?.firstName} ${personalInfo?.lastName}`}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{personalInfo?.dateOfBirth}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{personalInfo?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{personalInfo?.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Postal Code</Text>
            <Text style={styles.infoValue}>{personalInfo?.postalCode}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>{personalInfo?.country}</Text>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{phoneNumber}</Text>
          </View>
        </View>

        {/* Document Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Identity Document</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditSection('document')}
            >
              <Icon name="edit" size={16} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Document Type</Text>
            <Text style={styles.infoValue}>
              {documentTypeNames[documentInfo?.type as keyof typeof documentTypeNames]}
            </Text>
          </View>

          <View style={styles.documentContainer}>
            <View style={styles.documentImageContainer}>
              <View style={{ flex: 1 }}>
                <Image 
                  source={{ uri: documentInfo?.frontImage }} 
                  style={styles.documentImage} 
                  resizeMode="cover"
                />
                <Text style={styles.documentImageLabel}>Front Side</Text>
              </View>
              {documentInfo?.backImage && (
                <View style={{ flex: 1 }}>
                  <Image 
                    source={{ uri: documentInfo?.backImage }} 
                    style={styles.documentImage} 
                    resizeMode="cover"
                  />
                  <Text style={styles.documentImageLabel}>Back Side</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && (
              <Icon name="check" size={14} color={theme.colors.white} />
            )}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>. I confirm that all information 
            provided is accurate and I consent to the verification of this information.
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!termsAccepted || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitKYC}
            disabled={!termsAccepted || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Icon name="hourglass-empty" size={20} color={theme.colors.white} />
                <Text style={styles.loadingText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
