import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface KYCWelcomeScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const KYCWelcomeScreen: React.FC<KYCWelcomeScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { email, fullName, phoneNumber } = route.params || {};

  const kycSteps = [
    {
      icon: 'person',
      title: 'Personal Information',
      description: 'Provide your basic details and address information'
    },
    {
      icon: 'description',
      title: 'Identity Verification',
      description: 'Upload a valid government-issued ID document'
    },
    {
      icon: 'verified-user',
      title: 'Review & Submit',
      description: 'Review your information and complete verification'
    }
  ];

  const handleContinue = () => {
    navigation.navigate('KYCPersonalInfo', {
      email,
      fullName,
      phoneNumber
    });
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
      marginBottom: 40,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    stepsContainer: {
      marginBottom: 40,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    stepIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    stepDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    infoContainer: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    buttonContainer: {
      paddingBottom: 20,
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="verified-user" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            To ensure security and compliance, we need to verify your identity before you can create your wallet.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {kycSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepIconContainer}>
                <Icon name={step.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Why do we need this?</Text>
          <Text style={styles.infoText}>
            Identity verification helps us comply with financial regulations and keeps your account secure. Your information is encrypted and stored safely.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Start Verification</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
