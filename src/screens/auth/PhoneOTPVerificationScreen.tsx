import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PhoneOTPVerificationScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

// Country codes data
const countryCodes = [
  { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: '+40', country: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: '+359', country: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+385', country: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: '+386', country: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: '+421', country: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+370', country: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: '+353', country: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: '+30', country: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: '+357', country: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+356', country: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: '+352', country: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+377', country: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: '+378', country: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: '+39', country: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: '+376', country: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+375', country: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: '+370', country: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: '+20', country: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: '+964', country: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: '+963', country: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: '+961', country: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+962', country: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: '+970', country: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: '+218', country: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: '+216', country: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+213', country: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: '+212', country: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: '+222', country: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+220', country: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: '+221', country: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: '+224', country: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: '+225', country: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: '+230', country: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+231', country: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: '+232', country: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+233', country: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+235', country: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: '+236', country: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+237', country: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+238', country: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+239', country: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: '+240', country: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+241', country: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'CG', name: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+243', country: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: '+244', country: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: '+245', country: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+246', country: 'IO', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+248', country: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+249', country: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: '+250', country: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+251', country: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+252', country: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: '+257', country: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: '+258', country: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+260', country: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: '+261', country: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', country: 'RE', name: 'Réunion', flag: '🇷🇪' },
  { code: '+263', country: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', country: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: '+265', country: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: '+266', country: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', country: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', country: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: '+290', country: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
  { code: '+291', country: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+297', country: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: '+298', country: 'FO', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+299', country: 'GL', name: 'Greenland', flag: '🇬🇱' },
  { code: '+30', country: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
  { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: '+350', country: 'GI', name: 'Gibraltar', flag: '🇬🇮' },
  { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: '+352', country: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+353', country: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: '+354', country: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: '+355', country: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: '+356', country: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: '+357', country: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: '+359', country: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+36', country: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: '+370', country: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: '+373', country: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: '+374', country: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: '+375', country: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: '+376', country: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: '+377', country: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: '+378', country: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+381', country: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: '+382', country: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: '+383', country: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: '+385', country: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: '+386', country: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: '+387', country: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+389', country: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: '+40', country: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+420', country: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+421', country: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: '+500', country: 'FK', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: '+501', country: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: '+508', country: 'PM', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+509', country: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: '+51', country: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: '+53', country: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+590', country: 'GP', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+591', country: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+592', country: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: '+593', country: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+594', country: 'GF', name: 'French Guiana', flag: '🇬🇫' },
  { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+596', country: 'MQ', name: 'Martinique', flag: '🇲🇶' },
  { code: '+597', country: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+599', country: 'CW', name: 'Curaçao', flag: '🇨🇼' },
  { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: '+670', country: 'TL', name: 'East Timor', flag: '🇹🇱' },
  { code: '+672', country: 'NF', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: '+673', country: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: '+674', country: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: '+675', country: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+676', country: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: '+677', country: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+678', country: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+679', country: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: '+680', country: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: '+681', country: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+682', country: 'CK', name: 'Cook Islands', flag: '🇨🇰' },
  { code: '+683', country: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: '+684', country: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: '+685', country: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: '+686', country: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+687', country: 'NC', name: 'New Caledonia', flag: '🇳🇨' },
  { code: '+688', country: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+689', country: 'PF', name: 'French Polynesia', flag: '🇵🇫' },
  { code: '+690', country: 'TK', name: 'Tokelau', flag: '🇹🇰' },
  { code: '+691', country: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: '+692', country: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+7', country: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: '+84', country: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
  { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+886', country: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+93', country: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+95', country: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+960', country: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: '+961', country: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+962', country: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: '+963', country: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: '+964', country: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+967', country: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: '+970', country: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: '+971', country: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: '+973', country: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: '+975', country: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: '+976', country: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+977', country: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: '+992', country: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: '+993', country: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+994', country: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+995', country: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: '+996', country: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+998', country: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
];

export const PhoneOTPVerificationScreen: React.FC<PhoneOTPVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { sendPhoneOTP, verifyPhoneOTPAndCreateAccount } = useAuth();
  const { email, fullName, password } = route.params || {};
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default to US
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handlePhoneNumberChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
  };

  const getFullPhoneNumber = () => {
    return `${selectedCountry.code}${phoneNumber}`;
  };

  const handleSendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    const fullPhoneNumber = getFullPhoneNumber();

    try {
      setIsLoading(true);
      console.log('📱 Sending phone OTP to:', fullPhoneNumber);
      
      await sendPhoneOTP(fullPhoneNumber);
      setOtpSent(true);
      setResendTimer(60);
      setCanResend(false);
      
      Alert.alert(
        'OTP Sent!',
        `A verification code has been sent to ${fullPhoneNumber}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Phone OTP send error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPhoneOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Verifying phone OTP:', otpCode);
      
      await verifyPhoneOTPAndCreateAccount(email, password, fullName, getFullPhoneNumber(), otpCode);
      
      console.log('✅ Phone OTP verified and account created, navigating to KYC...');
      
      // Navigate to KYC onboarding instead of directly to wallet setup
      navigation.navigate('KYCWelcome', {
        email: email,
        fullName: fullName,
        phoneNumber: getFullPhoneNumber()
      });
      
      console.log('🧭 Navigation to KYCWelcome completed');
    } catch (error: any) {
      console.error('❌ Phone OTP verification error:', error);
      Alert.alert('Verification Failed', error.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      await sendPhoneOTP(getFullPhoneNumber());
      setResendTimer(60);
      setCanResend(false);
      
      // Clear the OTP input fields
      setOtp(['', '', '', '', '', '']);
      
      // Focus on the first OTP input
      inputRefs.current[0]?.focus();
      
      Alert.alert('OTP Resent', 'A new verification code has been sent');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setIsResending(false);
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
      paddingTop: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
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
    phoneSection: {
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 24,
    },
    phoneLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    phoneInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    inputIcon: {
      marginRight: 12,
    },
    countryCodeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      marginRight: 12,
    },
    countryFlag: {
      fontSize: 18,
      marginRight: 6,
    },
    countryCode: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 4,
    },
    phoneInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    sendButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 8,
      lineHeight: 20,
    },
    otpSection: {
      marginBottom: 32,
    },
    otpHeader: {
      alignItems: 'center',
      marginBottom: 32,
    },
    successIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    otpLabel: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    otpSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    otpInput: {
      width: (width - 80) / 6,
      height: 56,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    otpInputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    verifyButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    verifyButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    resendButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    resendTimer: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
    backButton: {
      position: 'absolute',
      top: 35,
      left: 20,
      padding: 8,
      zIndex: 1,
    },
    // Modal styles
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
    countryList: {
      flex: 1,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedCountryItem: {
      backgroundColor: theme.colors.primary + '10',
    },
    countryItemFlag: {
      fontSize: 24,
      marginRight: 16,
    },
    countryItemInfo: {
      flex: 1,
    },
    countryItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    countryItemCode: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone Number</Text>
            <Text style={styles.subtitle}>
              We'll send a verification code to your phone number
            </Text>
          </View>

          {!otpSent ? (
            <View style={styles.phoneSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.phoneLabel}>Phone Number</Text>
                <View style={styles.phoneInputWrapper}>
                  <TouchableOpacity 
                    style={styles.countryCodeButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <Icon name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="1234567890"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="phone-pad"
                    maxLength={15}
                    autoFocus
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!phoneNumber || phoneNumber.length < 7 || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={handleSendPhoneOTP}
                disabled={!phoneNumber || phoneNumber.length < 7 || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Icon name="hourglass-empty" size={20} color={theme.colors.white} />
                    <Text style={styles.sendButtonText}>Sending...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Icon name="send" size={20} color={theme.colors.white} />
                    <Text style={styles.sendButtonText}>Send Verification Code</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.infoContainer}>
                <Icon name="info-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  We'll send a 6-digit code via SMS to verify your number
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <View style={styles.successIconContainer}>
                  <Icon name="sms" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                    <Text style={styles.otpSubtitle}>
                      We sent a 6-digit code to {getFullPhoneNumber()}
                    </Text>
              </View>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFocused
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (otp.join('').length !== 6 || isLoading) && styles.verifyButtonDisabled
                ]}
                onPress={handleVerifyPhoneOTP}
                disabled={otp.join('').length !== 6 || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Icon name="hourglass-empty" size={20} color={theme.colors.white} />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Icon name="check-circle" size={20} color={theme.colors.white} />
                    <Text style={styles.verifyButtonText}>Verify & Create Account</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={isResending}
                    activeOpacity={0.7}
                  >
                    <Icon name="refresh" size={16} color={theme.colors.primary} />
                    <Text style={styles.resendButtonText}>
                      {isResending ? 'Resending...' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.timerContainer}>
                    <Icon name="timer" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.resendTimer}>
                      Resend code in {resendTimer}s
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
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
          
          <ScrollView style={styles.countryList}>
            {countryCodes.map((country, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.countryItem,
                  selectedCountry.code === country.code && styles.selectedCountryItem
                ]}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryItemFlag}>{country.flag}</Text>
                <View style={styles.countryItemInfo}>
                  <Text style={styles.countryItemName}>{country.name}</Text>
                  <Text style={styles.countryItemCode}>{country.code}</Text>
                </View>
                {selectedCountry.code === country.code && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
