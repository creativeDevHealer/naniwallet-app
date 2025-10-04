import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Switch, BackHandler, Modal, Animated, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props { navigation: any }

export const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, setThemeMode, changePrimaryColor } = useTheme();
  const { locale } = useLocale();
  const { currency, setCurrency, currencyInfo } = useCurrency();
  const languageLabel = useMemo(() => {
    switch (locale) {
      case 'en':
        return 'English (US)';
      case 'so':
        return 'Somali';
      case 'ar':
        return 'العربية';
      case 'sw':
        return 'Kiswahili';
      default:
        return 'English (US)';
    }
  }, [locale]);
  const [hideBalances, setHideBalances] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'Auto' | 'Light' | 'Dark'>('Auto');
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState<string>('#2E7D32');
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('pref_hide_balances');
      setHideBalances(saved === 'true');
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme === 'light') setCurrentTheme('Light');
      else if (savedTheme === 'dark') setCurrentTheme('Dark');
      else setCurrentTheme('Auto');
      
      const savedPrimaryColor = await AsyncStorage.getItem('primaryColor');
      if (savedPrimaryColor) {
        setCurrentPrimaryColor(savedPrimaryColor);
      }
    })();
  }, []);

  const persistHideBalances = async (value: boolean) => {
    setHideBalances(value);
    await AsyncStorage.setItem('pref_hide_balances', value ? 'true' : 'false');
  };

  // Animation functions
  const showModal = (modalType: 'theme' | 'color' | 'currency') => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    
    switch (modalType) {
      case 'theme':
        setThemeSheetOpen(true);
        break;
      case 'color':
        setColorSheetOpen(true);
        break;
      case 'currency':
        setCurrencySheetOpen(true);
        break;
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setThemeSheetOpen(false);
      setColorSheetOpen(false);
      setCurrencySheetOpen(false);
    });
  };

  // Close sheets on hardware back instead of propagating to Home's handler
  useEffect(() => {
    if (!themeSheetOpen && !colorSheetOpen && !currencySheetOpen) return;
    const onBack = () => {
      hideModal();
      return true; // consume back press
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [themeSheetOpen, colorSheetOpen, currencySheetOpen]);
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: theme.colors.text },
    back: { padding: 8 },
    content: { padding: 20 },
    text: { color: theme.colors.text },
    
    // Modern Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    colorModalContainer: {
      maxHeight: screenHeight * 0.8,
      minHeight: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
    },
    optionsContainer: {
      paddingVertical: 16,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 16,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
    },
    optionItemSelected: {
      backgroundColor: theme.colors.accentLight,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    currencyCode: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    currencyFlag: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    flagEmoji: {
      fontSize: 24,
    },
    
    // Color Modal Styles
    colorScrollContainer: {
      flex: 1,
      maxHeight: 350,
      minHeight: 300,
    },
    colorGridContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 20,
    },
    colorOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 4,
      marginHorizontal: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
    },
    colorOptionSelected: {
      backgroundColor: theme.colors.accentLight,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    colorCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    colorCircleSelected: {
      borderColor: theme.colors.white,
      borderWidth: 3,
    },
    colorLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('preferences', locale)}</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.content}>
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }} onPress={() => showModal('currency')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="attach-money" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('currency', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>{currencyInfo.symbol} {currencyInfo.code}</Text>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }} onPress={() => navigation.navigate('Language')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="language" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('language', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>{languageLabel}</Text>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }} onPress={() => showModal('theme')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="brightness-6" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('theme', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>{currentTheme}</Text>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }} onPress={() => showModal('color')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="palette" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('primary_color', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: currentPrimaryColor, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border }} />
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="format-list-numbered" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('number_format', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>1,234,567.89</Text>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="visibility-off" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('hide_balances', locale)}</Text>
            </View>
            <Switch
              value={hideBalances}
              onValueChange={persistHideBalances}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              thumbColor={hideBalances ? theme.colors.white : theme.colors.surface}
            />
          </View>
        </View>
      </View>

      {/* Modern Theme Modal */}
      <Modal
        visible={themeSheetOpen}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {([
                { label: 'Light', icon: 'wb-sunny', value: 'light', description: 'Always light theme' },
                { label: 'Dark', icon: 'nightlight', value: 'dark', description: 'Always dark theme' },
                { label: 'Auto', icon: 'brightness-6', value: 'auto', description: 'Follow system setting' },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionItem,
                    currentTheme.toLowerCase() === opt.value && styles.optionItemSelected
                  ]}
                  onPress={async () => {
                    setThemeMode(opt.value as any);
                    await AsyncStorage.setItem('themeMode', opt.value);
                    setCurrentTheme(opt.label as any);
                    hideModal();
                  }}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIcon,
                      currentTheme.toLowerCase() === opt.value && { backgroundColor: theme.colors.primary }
                    ]}>
                      <Icon 
                        name={opt.icon} 
                        size={20} 
                        color={currentTheme.toLowerCase() === opt.value ? theme.colors.white : theme.colors.text} 
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionTitle,
                        currentTheme.toLowerCase() === opt.value && { color: theme.colors.primary }
                      ]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionDescription}>{opt.description}</Text>
                    </View>
                  </View>
                  {currentTheme.toLowerCase() === opt.value && (
                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Modern Color Modal */}
      <Modal
        visible={colorSheetOpen}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              styles.colorModalContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Primary Color</Text>
              <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.colorScrollContainer}
              contentContainerStyle={styles.colorGridContainer}
              showsVerticalScrollIndicator={true}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {[
                { name: 'Islamic Green', color: '#2E7D32' },
                { name: 'Ocean Blue', color: '#1976D2' },
                { name: 'Royal Purple', color: '#7B1FA2' },
                { name: 'Sunset Orange', color: '#F57C00' },
                { name: 'Cherry Red', color: '#D32F2F' },
                { name: 'Teal Blue', color: '#00796B' },
                { name: 'Deep Indigo', color: '#303F9F' },
                { name: 'Warm Brown', color: '#5D4037' },
                { name: 'Forest Green', color: '#388E3C' },
                { name: 'Crimson', color: '#C2185B' },
                { name: 'Navy Blue', color: '#1565C0' },
                { name: 'Dark Gray', color: '#424242' },
                { name: 'Gold', color: '#FFD700' },
                { name: 'Silver', color: '#C0C0C0' },
                { name: 'Emerald', color: '#50C878' },
                { name: 'Ruby', color: '#E0115F' },
                { name: 'Sapphire', color: '#0F52BA' },
                { name: 'Amber', color: '#FFBF00' },
                { name: 'Rose Gold', color: '#E8B4B8' },
                { name: 'Platinum', color: '#E5E4E2' },
              ].map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.color}
                  style={[
                    styles.colorOption,
                    currentPrimaryColor === colorOption.color && styles.colorOptionSelected
                  ]}
                  onPress={async () => {
                    changePrimaryColor(colorOption.color);
                    setCurrentPrimaryColor(colorOption.color);
                    hideModal();
                  }}
                >
                  <View style={[
                    styles.colorCircle,
                    { backgroundColor: colorOption.color },
                    currentPrimaryColor === colorOption.color && styles.colorCircleSelected
                  ]}>
                    {currentPrimaryColor === colorOption.color && (
                      <Icon name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text style={[
                    styles.colorLabel,
                    currentPrimaryColor === colorOption.color && { color: theme.colors.primary }
                  ]}>
                    {colorOption.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Modern Currency Modal */}
      <Modal
        visible={currencySheetOpen}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Currency</Text>
              <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {[
                { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', description: 'United States Dollar' },
                { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', description: 'British Pound Sterling' },
                { code: 'SOS', symbol: 'S', name: 'Somali Shilling', flag: '🇸🇴', description: 'Somali Shilling' },
              ].map((currencyOption) => (
                <TouchableOpacity
                  key={currencyOption.code}
                  style={[
                    styles.optionItem,
                    currency === currencyOption.code && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setCurrency(currencyOption.code as any);
                    hideModal();
                  }}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.currencyFlag}>
                      <Text style={styles.flagEmoji}>{currencyOption.flag}</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionTitle,
                        currency === currencyOption.code && { color: theme.colors.primary }
                      ]}>
                        {currencyOption.name}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {currencyOption.description}
                      </Text>
                      <Text style={styles.currencyCode}>
                        {currencyOption.symbol} {currencyOption.code}
                      </Text>
                    </View>
                  </View>
                  {currency === currencyOption.code && (
                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};


