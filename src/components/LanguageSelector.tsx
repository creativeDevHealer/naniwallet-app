import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation, LocaleCode, getLanguageName } from '../i18n';
import { useLocale } from '../context/LocaleContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t, isRTL, getTextAlign } = useTranslation();
  const { locale, setLocale } = useLocale();

  const languages: LocaleCode[] = ['en', 'so', 'ar', 'sw'];

  const handleLanguageSelect = async (newLocale: LocaleCode) => {
    await setLocale(newLocale);
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxHeight: '60%',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: getTextAlign('center'),
    },
    languageItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    languageItemActive: {
      backgroundColor: theme.colors.primary + '20',
    },
    languageText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      textAlign: getTextAlign('left'),
    },
    languageTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    checkIcon: {
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    closeButton: {
      marginTop: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('language')}</Text>
          
          <FlatList
            data={languages}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  item === locale && styles.languageItemActive
                ]}
                onPress={() => handleLanguageSelect(item)}
              >
                <Text style={[
                  styles.languageText,
                  item === locale && styles.languageTextActive
                ]}>
                  {getLanguageName(item)}
                </Text>
                {item === locale && (
                  <Icon
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageSelector;
