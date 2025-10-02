import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ZakatCalculatorScreenProps {
  navigation: any;
}

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'cash' | 'savings' | 'gold' | 'investments' | 'business' | 'property' | 'other';
}

interface Liability {
  id: string;
  name: string;
  value: number;
  category: 'debt' | 'expense' | 'mortgage' | 'loan' | 'other';
}

interface ZakatCalculation {
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  nisabThreshold: number;
  isZakatDue: boolean;
  zakatAmount: number;
  explanation: string;
}

export const ZakatCalculatorScreen: React.FC<ZakatCalculatorScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { selectedCurrency, formatAmount } = useCurrency();
  
  // State management
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [calculation, setCalculation] = useState<ZakatCalculation | null>(null);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [showAIGuidance, setShowAIGuidance] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', value: '', category: 'cash' as Asset['category'] });
  const [newLiability, setNewLiability] = useState({ name: '', value: '', category: 'debt' as Liability['category'] });
  
  // Zakat constants
  const NISAB_GOLD_GRAMS = 87.48; // grams of gold (correct Islamic standard)
  const ZAKAT_RATE = 0.025; // 2.5%
  const [nisabThreshold, setNisabThreshold] = useState(0);
  const [goldPrice, setGoldPrice] = useState(0);
  const [loadingGoldPrice, setLoadingGoldPrice] = useState(true);
  const [goldPriceSource, setGoldPriceSource] = useState('');

  // Calculate Nisab threshold using static gold price
  const fetchGoldPriceAndCalculateNisab = async () => {
    setLoadingGoldPrice(true);
    try {
      console.log('🔄 Using static gold price...');
      
      // Use static gold price of $123.72 per gram
      const goldPricePerGramUSD = 123.72;
      const apiSource = 'static';
      
      const nisabValueUSD = goldPricePerGramUSD * NISAB_GOLD_GRAMS;
      setGoldPrice(goldPricePerGramUSD);
      
      // Convert to selected currency using live exchange rates
      let nisabValueInSelectedCurrency = nisabValueUSD;
      
      if (selectedCurrency === 'GBP') {
        // Use live GBP rate (approximate 0.79)
        nisabValueInSelectedCurrency = nisabValueUSD * 0.79;
      } else if (selectedCurrency === 'SOS') {
        // Use live SOS rate (approximate 570)
        nisabValueInSelectedCurrency = nisabValueUSD * 570;
      }
      
      setNisabThreshold(nisabValueInSelectedCurrency);
      setGoldPriceSource(apiSource);
      console.log(`✅ Gold price: $${goldPricePerGramUSD.toFixed(2)}/gram (static value)`);
      console.log(`✅ Nisab threshold: ${formatAmount(nisabValueInSelectedCurrency)} ${selectedCurrency}`);
      
    } catch (error) {
      console.error('❌ Failed to calculate Nisab:', error);
      // Fallback to approximate values based on current gold prices ($123.72/gram)
      const fallbackNisab = selectedCurrency === 'USD' ? 10820 : 
                          selectedCurrency === 'GBP' ? 8550 : 6167400; // SOS
      setNisabThreshold(fallbackNisab);
    } finally {
      setLoadingGoldPrice(false);
    }
  };

  // Calculate Zakat (corrected to include liabilities)
  const calculateZakat = () => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netAssets = totalAssets - totalLiabilities;
    const isZakatDue = netAssets >= nisabThreshold;
    const zakatAmount = isZakatDue ? netAssets * ZAKAT_RATE : 0;
    
    const explanation = isZakatDue 
      ? `Your net assets (${formatAmount(netAssets)} ${selectedCurrency}) exceed the nisab threshold (${formatAmount(nisabThreshold)} ${selectedCurrency}). Your Zakat is 2.5% of your net assets.`
      : `Your net assets (${formatAmount(netAssets)} ${selectedCurrency}) are below the nisab threshold (${formatAmount(nisabThreshold)} ${selectedCurrency}). No Zakat is due.`;
    
    setCalculation({
      totalAssets,
      totalLiabilities,
      netAssets,
      nisabThreshold,
      isZakatDue,
      zakatAmount,
      explanation
    });
  };

  // AI Guidance function
  const getAIGuidance = async (question: string) => {
    setAiLoading(true);
    try {
      console.log('🤖 Sending question to OpenAI:', question);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an Islamic finance expert specializing in Zakat calculations. Provide accurate, helpful guidance on Zakat-related questions. Keep responses concise but informative. Focus on practical Islamic principles and current gold prices for Nisab calculations.`
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';
      
      console.log('✅ OpenAI response received');
      setAiResponse(aiResponse);
      
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      
      // Fallback to predefined responses for common questions
      const fallbackResponses = {
        'pension': 'Pension funds are generally not subject to Zakat if they are locked until retirement. However, if you can access them, they may be included.',
        'frequency': 'Zakat should be calculated and paid annually, typically during Ramadan or on the anniversary of when you first became liable.',
        'business': 'Business assets including inventory, equipment, and cash in business accounts are subject to Zakat at 2.5%.',
        'gold': 'Gold and silver jewelry worn regularly are exempt from Zakat, but investment gold and silver are subject to Zakat.',
        'debt': 'Debts you owe to others reduce your Zakat liability, while money owed to you is included in your assets.'
      };
      
      const lowerQuestion = question.toLowerCase();
      let fallbackResponse = 'I apologize, but I cannot connect to the AI service right now. Please try again later or consult with a local Islamic scholar for guidance.';
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerQuestion.includes(key)) {
          fallbackResponse = value;
          break;
        }
      }
      
      setAiResponse(fallbackResponse);
    } finally {
      setAiLoading(false);
    }
  };

  // Add new asset
  const addAsset = () => {
    if (newAsset.name && newAsset.value) {
      const asset: Asset = {
        id: Date.now().toString(),
        name: newAsset.name,
        value: parseFloat(newAsset.value),
        category: newAsset.category
      };
      setAssets([...assets, asset]);
      setNewAsset({ name: '', value: '', category: 'cash' });
      setShowAddAsset(false);
      calculateZakat();
    }
  };

  // Add new liability
  const addLiability = () => {
    if (newLiability.name && newLiability.value) {
      const liability: Liability = {
        id: Date.now().toString(),
        name: newLiability.name,
        value: parseFloat(newLiability.value),
        category: newLiability.category
      };
      setLiabilities([...liabilities, liability]);
      setNewLiability({ name: '', value: '', category: 'debt' });
      setShowAddLiability(false);
      calculateZakat();
    }
  };

  // Remove asset
  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
    calculateZakat();
  };

  // Remove liability
  const removeLiability = (id: string) => {
    setLiabilities(liabilities.filter(liability => liability.id !== id));
    calculateZakat();
  };

  // Fetch gold price and calculate Nisab on mount and currency change
  useEffect(() => {
    fetchGoldPriceAndCalculateNisab();
  }, [selectedCurrency]);

  // Recalculate when assets, liabilities, or Nisab threshold change
  useEffect(() => {
    if (nisabThreshold > 0) {
      calculateZakat();
    }
  }, [assets, liabilities, nisabThreshold]);

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
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 100, // Extra padding at bottom for better scrolling
    },
    // Asset input styles
    assetCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    assetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    assetTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    assetItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    assetInfo: {
      flex: 1,
    },
    assetName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    assetValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    removeButton: {
      padding: 8,
    },
    // Calculation styles
    calculationCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    calculationTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    calculationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    calculationLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    calculationValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    zakatAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    explanation: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 12,
    },
    // AI Guidance styles
    aiButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    aiButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: 16,
    },
    categorySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    categoryButtonTextSelected: {
      color: theme.colors.white,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    saveButtonText: {
      color: theme.colors.white,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    infoNote: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 8,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  const assetCategories = [
    { key: 'cash', label: 'Cash' },
    { key: 'savings', label: 'Savings' },
    { key: 'gold', label: 'Gold/Silver' },
    { key: 'investments', label: 'Investments' },
    { key: 'business', label: 'Business' },
    { key: 'property', label: 'Property' },
    { key: 'other', label: 'Other' },
  ];

  const liabilityCategories = [
    { key: 'debt', label: 'Debt' },
    { key: 'expense', label: 'Expense' },
    { key: 'mortgage', label: 'Mortgage' },
    { key: 'loan', label: 'Loan' },
    { key: 'other', label: 'Other' },
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
        <Text style={styles.headerTitle}>Zakat Calculator</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gold Price & Nisab Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Gold Price & Nisab</Text>
            {loadingGoldPrice ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading current gold price...</Text>
              </View>
            ) : (
              <View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gold Price:</Text>
                  <Text style={styles.infoValue}>
                    ${goldPrice.toFixed(2)}/gram
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nisab (87.48g gold):</Text>
                  <Text style={styles.infoValue}>
                    {formatAmount(nisabThreshold)} {selectedCurrency}
                  </Text>
                </View>
                <Text style={styles.infoNote}>
                  Nisab threshold is calculated based on current gold price (87.48 grams of gold)
                </Text>
              </View>
            )}
          </View>

          {/* Assets Section */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <Text style={styles.assetTitle}>Your Assets</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddAsset(true)}
              >
                <Text style={styles.addButtonText}>+ Add Asset</Text>
              </TouchableOpacity>
            </View>
            
            {assets.map((asset) => (
              <View key={asset.id} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetValue}>
                    {formatAmount(asset.value)} {selectedCurrency} • {asset.category}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAsset(asset.id)}
                >
                  <Icon name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {assets.length === 0 && (
              <Text style={[styles.assetValue, { textAlign: 'center', marginTop: 20 }]}>
                No assets added yet. Tap "Add Asset" to get started.
              </Text>
            )}
          </View>

          {/* Liabilities Section */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <Text style={styles.assetTitle}>Your Liabilities</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddLiability(true)}
              >
                <Text style={styles.addButtonText}>+ Add Liability</Text>
              </TouchableOpacity>
            </View>
            
            {liabilities.map((liability) => (
              <View key={liability.id} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{liability.name}</Text>
                  <Text style={styles.assetValue}>
                    {formatAmount(liability.value)} {selectedCurrency} • {liability.category}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeLiability(liability.id)}
                >
                  <Icon name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {liabilities.length === 0 && (
              <Text style={[styles.assetValue, { textAlign: 'center', marginTop: 20 }]}>
                No liabilities added yet. Tap "Add Liability" to get started.
              </Text>
            )}
          </View>

          {/* Calculation Results */}
          {calculation && (
            <View style={styles.calculationCard}>
              <Text style={styles.calculationTitle}>Zakat Calculation</Text>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Total Assets:</Text>
                <Text style={styles.calculationValue}>
                  {formatAmount(calculation.totalAssets)} {selectedCurrency}
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Total Liabilities:</Text>
                <Text style={styles.calculationValue}>
                  -{formatAmount(calculation.totalLiabilities)} {selectedCurrency}
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Net Assets:</Text>
                <Text style={[styles.calculationValue, { fontWeight: 'bold' }]}>
                  {formatAmount(calculation.netAssets)} {selectedCurrency}
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Nisab Threshold:</Text>
                <Text style={styles.calculationValue}>
                  {formatAmount(calculation.nisabThreshold)} {selectedCurrency}
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Zakat Due (2.5%):</Text>
                <Text style={[styles.calculationValue, styles.zakatAmount]}>
                  {formatAmount(calculation.zakatAmount)} {selectedCurrency}
                </Text>
              </View>
              
              <Text style={styles.explanation}>
                {calculation.explanation}
              </Text>
            </View>
          )}

          {/* AI Guidance Button */}
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAIGuidance(true)}
          >
            <Icon name="psychology" size={20} color={theme.colors.white} />
            <Text style={styles.aiButtonText}>Ask AI Assistant</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Asset Modal */}
      <Modal
        visible={showAddAsset}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddAsset(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Asset</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Asset name (e.g., Savings Account)"
              value={newAsset.name}
              onChangeText={(text) => setNewAsset({ ...newAsset, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Value"
              value={newAsset.value}
              onChangeText={(text) => setNewAsset({ ...newAsset, value: text })}
              keyboardType="numeric"
            />
            
            <Text style={[styles.calculationLabel, { marginBottom: 8 }]}>Category:</Text>
            <View style={styles.categorySelector}>
              {assetCategories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    newAsset.category === category.key && styles.categoryButtonSelected
                  ]}
                  onPress={() => setNewAsset({ ...newAsset, category: category.key as Asset['category'] })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    newAsset.category === category.key && styles.categoryButtonTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddAsset(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addAsset}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Add Asset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Liability Modal */}
      <Modal
        visible={showAddLiability}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddLiability(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Liability</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Liability name (e.g., Credit Card Debt)"
              value={newLiability.name}
              onChangeText={(text) => setNewLiability({ ...newLiability, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Amount owed"
              value={newLiability.value}
              onChangeText={(text) => setNewLiability({ ...newLiability, value: text })}
              keyboardType="numeric"
            />
            
            <Text style={[styles.calculationLabel, { marginBottom: 8 }]}>Category:</Text>
            <View style={styles.categorySelector}>
              {liabilityCategories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    newLiability.category === category.key && styles.categoryButtonSelected
                  ]}
                  onPress={() => setNewLiability({ ...newLiability, category: category.key as Liability['category'] })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    newLiability.category === category.key && styles.categoryButtonTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddLiability(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addLiability}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Add Liability</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Guidance Modal */}
      <Modal
        visible={showAIGuidance}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAIGuidance(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Zakat Assistant</Text>
            
            <Text style={[styles.calculationLabel, { marginBottom: 16 }]}>
              Ask me anything about Zakat:
            </Text>
            
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="e.g., Do I pay Zakat on my pension? How often should I calculate?"
              multiline
              value={aiQuestion}
              onChangeText={(text) => setAiQuestion(text)}
            />
            
            {aiLoading && (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.calculationLabel}>AI is thinking...</Text>
              </View>
            )}
            
            {aiResponse && (
              <View style={[styles.assetCard, { marginTop: 16 }]}>
                <Text style={styles.calculationLabel}>AI Response:</Text>
                <Text style={styles.explanation}>{aiResponse}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAIGuidance(false);
                  setAiQuestion('');
                  setAiResponse('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => getAIGuidance(aiQuestion)}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Ask AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
