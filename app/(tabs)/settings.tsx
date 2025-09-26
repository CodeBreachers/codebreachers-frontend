import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { RootState } from '@/store';
import { setMonthlyBudget } from '@/store/energySlice';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// Screen dimensions for responsive design

// Add impulse configuration interface
interface ImpulseConfig {
  impulsesPerKwh: number;
  kwhPerImpulse: number;
  inputMethod: 'impulses_per_kwh' | 'kwh_per_impulse';
}

const Settings = () => {
  const billingInfo = useSelector((state: RootState) => state.energy.billingInfo);
  const dispatch = useDispatch();
  
  // State for budget modal
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'slider' | 'input' | 'presets'>('slider');
  
  // State for impulse configuration modal
  const [isImpulseModalVisible, setIsImpulseModalVisible] = useState(false);
  const [impulseConfig, setImpulseConfig] = useState<ImpulseConfig>({
    impulsesPerKwh: 1000, // Default: 1000 impulses = 1 kWh
    kwhPerImpulse: 0.001, // Default: 1 impulse = 0.001 kWh
    inputMethod: 'impulses_per_kwh'
  });
  const [impulseInputValue, setImpulseInputValue] = useState('1000');
  const [selectedImpulsePreset, setSelectedImpulsePreset] = useState<string | null>(null);
  
  // Animation values
  const slideAnimation = new Animated.Value(0);
  const fadeAnimation = new Animated.Value(0);
  const impulseSlideAnimation = new Animated.Value(0);
  const impulseFadeAnimation = new Animated.Value(0);

  const budgetPresets = [
    { label: 'Budget', amount: 500, color: '#4CAF50', icon: 'leaf' },
    { label: 'Moderate', amount: 750, color: '#FF9800', icon: 'house' },
    { label: 'Premium', amount: 1000, color: '#F44336', icon: 'star' },
    { label: 'Unlimited', amount: 1500, color: '#9C27B0', icon: 'infinity' },
  ];

  // Common impulse configuration presets
  const impulsePresets = [
    { label: 'Standard', impulsesPerKwh: 3200, color: '#4CAF50', icon: 'bolt' },
    { label: 'High Precision', impulsesPerKwh: 1000, color: '#2196F3', icon: 'gauge' },
    { label: 'Low Precision', impulsesPerKwh: 800, color: '#FF9800', icon: 'speedometer' },
    { label: 'Ultra High', impulsesPerKwh: 400, color: '#9C27B0', icon: 'star' },
  ];

  const handleSetBudget = () => {
    setIsBudgetModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBudgetConfirm = () => {
    const newBudget = parseFloat(budgetAmount);
    if (isNaN(newBudget) || newBudget <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }

    dispatch(setMonthlyBudget(newBudget));

    // Show success animation
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsBudgetModalVisible(false);
    });
  };

  const handlePresetSelect = (preset: typeof budgetPresets[0]) => {
    setSelectedPreset(preset.label);
    setBudgetAmount(preset.amount.toString());
    setInputMethod('presets');
  };



  const handleInputChange = (text: string) => {
    setBudgetAmount(text);
    setSelectedPreset(null);
    setInputMethod('input');
  };

  const getSmartSuggestion = () => {
    const currentUsage = billingInfo.weeklyCost;
    if (currentUsage < 1000) return { amount: 800, message: 'Based on your usage, we suggest ₹800' };
    if (currentUsage < 1500) return { amount: 1200, message: 'Based on your usage, we suggest ₹1200' };
    return { amount: 1800, message: 'Based on your usage, we suggest ₹1800' };
  };

  const smartSuggestion = getSmartSuggestion();

  const handleConfigureDevice = () => {
    setIsImpulseModalVisible(true);
    Animated.parallel([
      Animated.timing(impulseSlideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(impulseFadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImpulseInputChange = (text: string) => {
    setImpulseInputValue(text);
    setSelectedImpulsePreset(null);
    
    const value = parseFloat(text);
    if (!isNaN(value) && value > 0) {
      if (impulseConfig.inputMethod === 'impulses_per_kwh') {
        setImpulseConfig({
          ...impulseConfig,
          impulsesPerKwh: value,
          kwhPerImpulse: 1 / value
        });
      } else {
        setImpulseConfig({
          ...impulseConfig,
          kwhPerImpulse: value,
          impulsesPerKwh: 1 / value
        });
      }
    }
  };

  const handleImpulsePresetSelect = (preset: typeof impulsePresets[0]) => {
    setSelectedImpulsePreset(preset.label);
    setImpulseInputValue(preset.impulsesPerKwh.toString());
    // Don't update impulseConfig here - only update on button click
  };


  const handleImpulseConfirm = () => {
    const value = parseFloat(impulseInputValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid impulse configuration');
      return;
    }

    // Update the impulse configuration with the current input value
    const newConfig = {
      impulsesPerKwh: value,
      kwhPerImpulse: 1 / value,
      inputMethod: 'impulses_per_kwh' as const
    };
    
    setImpulseConfig(newConfig);

    // Here you would typically save to Redux store or make API call
    console.log('Impulse configuration saved:', newConfig);

    // Show success animation
    Animated.sequence([
      Animated.timing(impulseSlideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(impulseFadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsImpulseModalVisible(false);
    });
  };

  const handleAccountItemPress = (item: string) => {
    // Handle account menu item press
    console.log(`${item} pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>
        
        {/* Expected Budget Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#2C2C2C', '#2C2C2C', '#2C2C2C', '#2C2C2C']}
            style={styles.budgetCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PJ2k0Bereii-KD2nwFArtDxPmzMqM1qrM1iIb7tmym7JnLvDpny5-no5jdaZKv0cxF_4WdyEVclq7tZr3gxSWE-cJyUZNqdaMksR-brLh5jgsECE4Ea138XE0j2_N8xMkn_ahKZOPemFmxYznR66H1--HtZ_1WNDDuiARlQFg8JAOdmMjIu-0o4hz86hprPysQl2Sx4nvKToQN0Aq4KPEXH96f5rMaMj8ZR63GeWKuPC5ZDMF9r8Awq1H0VvslKLCL28nkSFKhTl' }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <View style={styles.budgetInfo}>
                <ThemedText style={styles.cardTitle}>Expected Budget</ThemedText>
                <ThemedText style={styles.cardDescription}>Set your monthly electricity spending goal</ThemedText>
              </View>
              <View style={styles.budgetActionContainer}>
                {/* <View style={styles.currentBudgetContainer}>
                  <ThemedText style={styles.currentBudgetLabel}>Current</ThemedText>
                  <ThemedText style={styles.currentBudgetAmount}>₹{billingInfo.expectedBill.toFixed(2)}</ThemedText>
                </View> */}
                <TouchableOpacity style={styles.cardButton} onPress={handleSetBudget}>
                  <ThemedText style={styles.cardButtonText}>Set Budget</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Account Section */}
        <ThemedText type="subtitle" style={styles.sectionSubTitle}>Account</ThemedText>
        
        <View style={styles.accountMenu}>
          {['Profile', 'Notifications', 'Privacy', 'Help & Support'].map((item, index) => (
            <TouchableOpacity
              key={item}
              style={styles.accountMenuItem}
              onPress={() => handleAccountItemPress(item)}
            >
              <ThemedText style={styles.accountMenuText}>{item}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={Colors.light.icon} />
            </TouchableOpacity>
          ))}
          
          {/* Device Info as Account Menu Item */}
          <TouchableOpacity
            style={styles.accountMenuItem}
            onPress={handleConfigureDevice}
          >
            <ThemedText style={styles.accountMenuText}>Device Info</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={Colors.light.icon} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Creative Budget Setting Modal */}
      <Modal
        visible={isBudgetModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsBudgetModalVisible(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnimation,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Set Your Budget</ThemedText>
              <TouchableOpacity
                onPress={() => setIsBudgetModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Smart Suggestion */}
            <View style={styles.smartSuggestionContainer}>
              <View style={styles.suggestionIcon}>
                <IconSymbol name="lightbulb" size={20} color="#FFD700" />
              </View>
              <ThemedText style={styles.suggestionText}>{smartSuggestion.message}</ThemedText>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => handleInputChange(smartSuggestion.amount.toString())}
              >
                <ThemedText style={styles.suggestionButtonText}>Use Suggestion</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <ThemedText style={styles.budgetLabel}>Enter Amount</ThemedText>
                <View style={styles.inputWrapper}>
                  <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                  <TextInput
                    style={styles.budgetInput}
                    value={budgetAmount}
                    onChangeText={handleInputChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                </View>
            </View>

            {inputMethod === 'presets' && (
              <View style={styles.presetsContainer}>
                <ThemedText style={styles.budgetLabel}>Choose a Plan</ThemedText>
                <View style={styles.presetsGrid}>
                  {budgetPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      style={[
                        styles.presetCard,
                        selectedPreset === preset.label && styles.presetCardSelected,
                        { borderColor: preset.color }
                      ]}
                      onPress={() => handlePresetSelect(preset)}
                    >
                      <View style={[styles.presetIcon, { backgroundColor: preset.color }]}>
                        <IconSymbol name={preset.icon as any} size={24} color="white" />
                      </View>
                      <ThemedText style={styles.presetLabel}>{preset.label}</ThemedText>
                      <ThemedText style={styles.presetAmount}>₹{preset.amount}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsBudgetModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#1E824C' }]}
                onPress={handleBudgetConfirm}
              >
                <ThemedText style={styles.confirmButtonText}>Set Budget</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Impulse Configuration Modal */}
      <Modal
        visible={isImpulseModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsImpulseModalVisible(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: impulseFadeAnimation,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: impulseSlideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Device Settings</ThemedText>
              <TouchableOpacity
                onPress={() => setIsImpulseModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.budgetLabel}>
              Impulses per kWh
              </ThemedText>
            <View style={styles.chipsContainer}>
              <View style={styles.chipsWrapper}>
                {impulsePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.chip,
                      selectedImpulsePreset === preset.label && styles.chipSelected,
                      { borderColor: preset.color }
                    ]}
                    onPress={() => handleImpulsePresetSelect(preset)}
                  >
                    <ThemedText style={[
                      styles.chipText,
                      selectedImpulsePreset === preset.label && styles.chipTextSelected
                    ]}>
                      {preset.impulsesPerKwh}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Input Container */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.currencySymbol}>
                  {impulseConfig.inputMethod === 'impulses_per_kwh' ? 'Imp' : 'kWh'}
                </ThemedText>
                <TextInput
                  style={styles.budgetInput}
                  value={impulseInputValue}
                  onChangeText={handleImpulseInputChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Conversion Display */}
              <View style={styles.conversionDisplay}>
                <ThemedText style={styles.conversionText}>
                  {`1 kWh = ${impulseConfig.impulsesPerKwh} impulses` }
                </ThemedText>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsImpulseModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#1E824C' }]}
                onPress={handleImpulseConfirm}
              >
                <ThemedText style={styles.confirmButtonText}>Save Configuration</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#11181C',
  },
  sectionSubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#11181C',
  },
  cardContainer: {
    marginBottom: 16,
  },
  budgetCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
    borderRadius: 16,
  },
  deviceCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 30
  },
  budgetInfo: {
    marginBottom: 8,
  },
  budgetActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  currentBudgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    flex: 1,
  },
  currentBudgetLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginRight: 8,
  },
  currentBudgetAmount: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  cardIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  houseIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  dollarSign: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  coinsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  coin: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
  },
  smartMeterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  smartMeter: {
    width: 100,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  meterDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: '#1E824C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  accountMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  accountMenuText: {
    fontSize: 16,
    color: '#11181C',
  },
  deviceInfoContainer: {
    flex: 1,
  },
  deviceInfoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181C',
  },
  closeButton: {
    padding: 8,
  },
  // Smart Suggestion Styles
  smartSuggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
  },
  suggestionButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionButtonText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  // Input Method Tabs
  inputMethodTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  inputMethodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  inputMethodTabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputMethodTabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  inputMethodTabTextActive: {
    color: '#1E824C',
    fontWeight: '600',
  },
  // Slider Styles
  sliderContainer: {
    marginBottom: 24,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  sliderWrapper: {
    marginBottom: 16,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  sliderProgress: {
    height: 8,
    backgroundColor: '#1E824C',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    backgroundColor: '#1E824C',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  budgetAmountDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  budgetAmountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E824C',
  },
  quickAdjustButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  quickAdjustButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E824C',
  },
  quickAdjustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E824C',
  },
  // Input Styles
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E824C',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
    paddingVertical: 12,
  },
  // Presets Styles
  presetsContainer: {
    marginBottom: 24,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetCardSelected: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  presetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E824C',
  },
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    width: '50%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    width: '50%',
    marginLeft: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E824C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Add new styles for impulse modal
  conversionDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E824C',
  },
  conversionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E824C',
    marginBottom: 4,
  },
  conversionSubText: {
    fontSize: 14,
    color: '#666',
  },
  // Chip Styles
  chipsContainer: {
    marginBottom: 24,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#F8F9FA',
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  chipTextSelected: {
    color: '#1E824C',
    fontWeight: '600',
  },
});

export default Settings;
