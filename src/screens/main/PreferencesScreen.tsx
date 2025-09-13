import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Switch, BackHandler } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props { navigation: any }

export const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, setThemeMode } = useTheme();
  const { locale } = useLocale();
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
  const [currentTheme, setCurrentTheme] = useState<'Auto' | 'Light' | 'Dark'>('Auto');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('pref_hide_balances');
      setHideBalances(saved === 'true');
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme === 'light') setCurrentTheme('Light');
      else if (savedTheme === 'dark') setCurrentTheme('Dark');
      else setCurrentTheme('Auto');
    })();
  }, []);

  const persistHideBalances = async (value: boolean) => {
    setHideBalances(value);
    await AsyncStorage.setItem('pref_hide_balances', value ? 'true' : 'false');
  };

  // Close theme sheet on hardware back instead of propagating to Home's handler
  useEffect(() => {
    if (!themeSheetOpen) return;
    const onBack = () => {
      setThemeSheetOpen(false);
      return true; // consume back press
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [themeSheetOpen]);
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: theme.colors.text },
    back: { padding: 8 },
    content: { padding: 20 },
    text: { color: theme.colors.text },
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
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="attach-money" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('currency', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>USD</Text>
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

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }} onPress={() => setThemeSheetOpen(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="brightness-6" size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text }}>{t('theme', locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, marginRight: 6 }}>{currentTheme}</Text>
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

      {themeSheetOpen && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <View style={{ width: 44, height: 3, backgroundColor: theme.colors.border, borderRadius: 2 }} />
          </View>
          <Text style={{ textAlign: 'center', paddingVertical: 12, color: theme.colors.text, fontWeight: '600' }}>Theme</Text>
          {([
            { label: 'Light', icon: 'wb-sunny', value: 'light' },
            { label: 'Dark', icon: 'nightlight', value: 'dark' },
            { label: 'Auto', icon: 'brightness-6', value: 'auto' },
          ] as const).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}
              onPress={async () => {
                setThemeMode(opt.value as any);
                await AsyncStorage.setItem('themeMode', opt.value);
                setCurrentTheme(opt.label as any);
                setThemeSheetOpen(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={opt.icon} size={22} color={theme.colors.text} style={{ marginRight: 12 }} />
                <Text style={{ color: theme.colors.text }}>{opt.label}</Text>
              </View>
              {currentTheme.toLowerCase() === opt.value && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <View style={{ height: 12 }} />
        </View>
      )}
    </SafeAreaView>
  );
};


