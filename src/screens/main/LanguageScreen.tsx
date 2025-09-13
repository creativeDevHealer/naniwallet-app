import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { t } from '../../i18n';
import { useLocale, LocaleCode } from '../../context/LocaleContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LANG_OPTIONS: { code: LocaleCode; label: string }[] = [
  { code: 'en', label: 'English (US)' },
  { code: 'so', label: 'Somali' },
  { code: 'ar', label: 'العربية' },
  { code: 'sw', label: 'Kiswahili' },
];

interface Props { navigation: any }

export const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [current, setCurrent] = useState<LocaleCode>(locale);

  useEffect(() => { setCurrent(locale); }, [locale]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: theme.colors.text },
    back: { padding: 8 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    label: { color: theme.colors.text, fontSize: 16 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('language_screen_title', locale)}</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView>
        {LANG_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.code} style={styles.row} onPress={async () => { await setLocale(opt.code); navigation.goBack(); }}>
            <Text style={styles.label}>{opt.label}</Text>
            {current === opt.code && <Icon name="check" size={20} color={theme.colors.primary} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};


