import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Removed DateTimePicker - using custom implementation

interface KYCPersonalInfoScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const KYCPersonalInfoScreen: React.FC<KYCPersonalInfoScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { email, fullName, phoneNumber } = route.params || {};

  const [formData, setFormData] = useState({
    firstName: fullName?.split(' ')[0] || '',
    lastName: fullName?.split(' ').slice(1).join(' ') || '',
    dateOfBirth: new Date(),
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  
  // Custom date picker state
  const [tempDate, setTempDate] = useState({
    day: formData.dateOfBirth.getDate(),
    month: formData.dateOfBirth.getMonth(),
    year: formData.dateOfBirth.getFullYear()
  });

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
    'Bolivia', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile',
    'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador',
    'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Germany',
    'Ghana', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon',
    'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
    'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
    'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain',
    'Sri Lanka', 'Sweden', 'Switzerland', 'Tanzania', 'Thailand', 'Turkey',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
    'Vietnam', 'Yemen', 'Zimbabwe'
  ].sort();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate age (must be 18+)
    const today = new Date();
    const age = today.getFullYear() - formData.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - formData.dateOfBirth.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < formData.dateOfBirth.getDate()) ? age - 1 : age;
    
    if (actualAge < 18) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: string) => {
    handleInputChange('country', country);
    setShowCountryPicker(false);
    setCountrySearchQuery('');
  };

  // Custom date picker helpers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(tempDate.month, tempDate.year);
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const handleDateConfirm = () => {
    const newDate = new Date(tempDate.year, tempDate.month, tempDate.day);
    handleInputChange('dateOfBirth', newDate);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    // Reset to current date
    setTempDate({
      day: formData.dateOfBirth.getDate(),
      month: formData.dateOfBirth.getMonth(),
      year: formData.dateOfBirth.getFullYear()
    });
    setShowDatePicker(false);
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Format the date for storage
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0] // YYYY-MM-DD format
      };
      
      navigation.navigate('KYCDocumentUpload', {
        email,
        fullName,
        phoneNumber,
        personalInfo: formattedData
      });
    }, 1000);
  };

  const renderInput = (
    label: string,
    field: string,
    placeholder: string,
    keyboardType: any = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

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
      width: '33%', // Step 1 of 3
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
    formContainer: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    inputContainer: {
      marginBottom: 20,
    },
    halfWidth: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    input: {
      paddingVertical: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    multilineInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
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
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    datePickerIcon: {
      marginRight: 12,
    },
    datePickerText: {
      flex: 1,
      fontSize: 16,
    },
    countryPickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    countryPickerIcon: {
      marginRight: 12,
    },
    countryPickerText: {
      flex: 1,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginHorizontal: 20,
      marginVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    countryList: {
      flex: 1,
    },
    countryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedCountryItem: {
      backgroundColor: theme.colors.primary + '10',
    },
    countryItemName: {
      fontSize: 16,
      color: theme.colors.text,
    },
    datePickerContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: 5,
    },
    pickerLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    pickerScrollView: {
      maxHeight: 300,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    selectedPickerItem: {
      backgroundColor: theme.colors.primary + '15',
    },
    pickerItemText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    selectedPickerItemText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    confirmButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    confirmButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <Text style={styles.stepText}>Step 1</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.stepText}>of 3</Text>
            </View>
            
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.subtitle}>
              Please provide your personal details as they appear on your official documents.
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Icon name="info-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              All information must match your government-issued ID that you'll upload in the next step.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                {renderInput('First Name', 'firstName', 'John')}
              </View>
              <View style={styles.halfWidth}>
                {renderInput('Last Name', 'lastName', 'Doe')}
              </View>
            </View>

            {/* Date of Birth Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.datePickerButton}>
                  <Icon name="event" size={20} color={theme.colors.textSecondary} style={styles.datePickerIcon} />
                  <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>

            {renderInput('Street Address', 'address', 'Enter your full address', 'default', true)}
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                {renderInput('City', 'city', 'New York')}
              </View>
              <View style={styles.halfWidth}>
                {renderInput('Postal Code', 'postalCode', '12345')}
              </View>
            </View>

            {/* Country Searchable Select */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Country</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, errors.country && styles.inputError]}
                onPress={() => setShowCountryPicker(true)}
              >
                <View style={styles.countryPickerButton}>
                  <Icon name="public" size={20} color={theme.colors.textSecondary} style={styles.countryPickerIcon} />
                  <Text style={[
                    styles.countryPickerText,
                    { color: formData.country ? theme.colors.text : theme.colors.textSecondary }
                  ]}>
                    {formData.country || 'Select your country'}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
              {errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                isLoading && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? 'Processing...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDateCancel}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDateCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateConfirm}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContainer}>
            {/* Month Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Month</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerItem,
                      tempDate.month === index && styles.selectedPickerItem
                    ]}
                    onPress={() => setTempDate(prev => ({ ...prev, month: index }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.month === index && styles.selectedPickerItemText
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Day</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {generateDays().map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      tempDate.day === day && styles.selectedPickerItem
                    ]}
                    onPress={() => setTempDate(prev => ({ ...prev, day }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.day === day && styles.selectedPickerItemText
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Year</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {generateYears().map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      tempDate.year === year && styles.selectedPickerItem
                    ]}
                    onPress={() => setTempDate(prev => ({ ...prev, year }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.year === year && styles.selectedPickerItemText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor={theme.colors.textSecondary}
              value={countrySearchQuery}
              onChangeText={setCountrySearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.country === item && styles.selectedCountryItem
                ]}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryItemName}>{item}</Text>
                {formData.country === item && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.countryList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
