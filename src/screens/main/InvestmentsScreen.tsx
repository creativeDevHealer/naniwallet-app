import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InvestmentsScreenProps {
  navigation: any;
}

export const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale } = useLocale();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    placeholderCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    placeholderIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    placeholderTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    placeholderDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    comingSoonBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    comingSoonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    featuresList: {
      marginTop: 24,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
  });

  const features = [
    { icon: 'trending-up', text: t('halal_investments', locale) },
    { icon: 'account-balance', text: t('portfolio_management', locale) },
    { icon: 'analytics', text: t('investment_analytics', locale) },
    { icon: 'security', text: t('secure_investing', locale) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('investments', locale)}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Icon name="trending-up" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.placeholderTitle}>
            {t('investments_coming_soon', locale)}
          </Text>
          <Text style={styles.placeholderDescription}>
            {t('investments_description', locale)}
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>
              {t('coming_soon', locale)}
            </Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          <Text style={[styles.placeholderTitle, { fontSize: 20, marginBottom: 16 }]}>
            {t('planned_features', locale)}
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon
                name={feature.icon}
                size={24}
                color={theme.colors.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
