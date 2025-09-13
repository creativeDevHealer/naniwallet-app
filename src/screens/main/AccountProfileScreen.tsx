import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props { navigation: any }

export const AccountProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [fullName, setFullName] = useState<string | undefined>(user?.fullName);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(user?.phoneNumber);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsed = JSON.parse(data);
          if (!fullName && parsed?.fullName) setFullName(parsed.fullName);
          if (!phoneNumber && parsed?.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        }
      } catch {}
    };
    if (!fullName || !phoneNumber) loadFromStorage();
  }, [fullName, phoneNumber]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: theme.colors.text },
    back: { padding: 8 },
    content: { padding: 20 },
    avatarWrap: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
    avatarContainer: { width: 120, height: 120, position: 'relative' },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    avatarInitial: { color: theme.colors.primary, fontSize: 44, fontWeight: '800' },
    editButton: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 2,
    },
    sectionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    sectionIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.textSecondary + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sectionLabel: { color: theme.colors.text, fontWeight: '700', marginBottom: 6 },
    sectionValue: { color: theme.colors.text },
    closeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: theme.colors.border },
    closeLeft: { flexDirection: 'row', alignItems: 'center' },
    closeIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B6B33', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    closeText: { color: theme.colors.text, fontWeight: '600' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Account details</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
              <Icon name="edit" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionIconWrap}>
            <Icon name="person" size={18} color={theme.colors.text} />
          </View>
          <View>
            <Text style={styles.sectionLabel}>Full Name</Text>
            <Text style={styles.sectionValue}>{fullName || '-'}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionIconWrap}>
            <Icon name="mail" size={18} color={theme.colors.text} />
          </View>
          <View>
            <Text style={styles.sectionLabel}>Email</Text>
            <Text style={styles.sectionValue}>{user?.email || '-'}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionIconWrap}>
            <Icon name="phone" size={18} color={theme.colors.text} />
          </View>
          <View>
            <Text style={styles.sectionLabel}>Phone Number</Text>
            <Text style={styles.sectionValue}>{phoneNumber || user?.phoneNumber || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeRow} activeOpacity={0.8}>
          <View style={styles.closeLeft}>
            <View style={styles.closeIconWrap}>
              <Icon name="block" size={18} color="#FF6B6B" />
            </View>
            <Text style={styles.closeText}>Close account</Text>
          </View>
          <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


