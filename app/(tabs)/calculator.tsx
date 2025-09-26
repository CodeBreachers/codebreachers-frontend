import UsageItem from '@/components/estimator/UsageItem';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { calculateElectricityBill, nonTelescopicRates, telescopicRates } from '@/utils/calculator';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BreakdownItem {
  title: string;
  unitText: string;
  cost: number;
  type: 'energy' | 'fixed';
}

interface BillCalculation {
  breakdown: BreakdownItem[];
  totalCost: number;
}

export default function CalculatorScreen() {
  // Calculator states
  const [energyConsumption, setEnergyConsumption] = useState('');
  const [submittedConsumption, setSubmittedConsumption] = useState(0);
  const [calculatedBill, setCalculatedBill] = useState<BillCalculation>({ breakdown: [], totalCost: 0 });
  const [isCalculated, setIsCalculated] = useState(false);

  // Estimator states
  const [fanHours, setFanHours] = useState(4);
  const [fridgeHours, setFridgeHours] = useState(24);
  const [tvHours, setTvHours] = useState(3);
  const [airConditionerHours, setAirConditionerHours] = useState(3);
  const [washingMachineHours, setWashingMachineHours] = useState(3);
  const [ironHours, setIronHours] = useState(3);

  const calculateTelescopicBill = (units: number): BillCalculation => {
    let totalCost = 0;
    let breakdown: BreakdownItem[] = [];
    let remainingUnits = units;

    for (const slab of telescopicRates) {
      if (remainingUnits <= 0) break;
      
      const unitsInSlab = Math.min(remainingUnits, slab.max - slab.min + 1);
      const cost = unitsInSlab * slab.rate;
      
      if (unitsInSlab > 0) {
        breakdown.push({
          title: `${slab.min}-${Math.min(slab.max, slab.min + unitsInSlab)} Units`,
          unitText: `@ ₹${slab.rate}/unit`,
          cost: cost,
          type: 'energy'
        });
        totalCost += cost;
        remainingUnits -= unitsInSlab;
      }
    }

    // Add fixed charge for the highest applicable slab
    const applicableSlab = telescopicRates.find(slab => units >= slab.min && units <= slab.max);
    if (applicableSlab && applicableSlab.fixedCharge > 0) {
      breakdown.push({
        title: 'Fixed Charge',
        unitText: 'Monthly fixed charge',
        cost: applicableSlab.fixedCharge,
        type: 'fixed'
      });
      totalCost += applicableSlab.fixedCharge;
    }

    return { breakdown, totalCost };
  };

  const calculateNonTelescopicBill = (units: number): BillCalculation => {
    let breakdown: BreakdownItem[] = [];
    const applicableSlab = nonTelescopicRates.find(slab => units >= slab.min && units <= slab.max);
    
    if (applicableSlab) {
      const energyCost = units * applicableSlab.rate;
      breakdown.push({
        title: `${units} Units`,
        unitText: `@ ₹${applicableSlab.rate}/unit`,
        cost: energyCost,
        type: 'energy'
      });
      
      const totalCost = energyCost + applicableSlab.fixedCharge;
      return { breakdown, totalCost };
    }
    
    return { breakdown, totalCost: 0 };
  };


  const handleCalculate = () => {
    const units = parseInt(energyConsumption) || 0;
    
    if (units <= 0) {
      setCalculatedBill({ breakdown: [], totalCost: 0 });
      setIsCalculated(true);
      dismissKeyboard();
      return;
    }

    // Automatically determine billing method based on consumption
    // Telescopic billing for 0-250 units, Non-telescopic for >250 units
    const shouldUseTelescopic = units <= 250;
    
    let bill: BillCalculation;
    if (shouldUseTelescopic) {
      bill = calculateTelescopicBill(units);
    } else {
      bill = calculateNonTelescopicBill(units);
    }
    setSubmittedConsumption(units);
    setEnergyConsumption('');
    setCalculatedBill(bill);
    setIsCalculated(true);
    dismissKeyboard();
  };

  const handleInputChange = (text: string) => {
    setEnergyConsumption(text);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Estimator calculations
  const fanConsumption = fanHours * 0.075; // 75W fan
  const fridgeConsumption = fridgeHours * 0.15; // 150W fridge
  const tvConsumption = tvHours * 0.1; // 100W TV
  const airConditionerConsumption = airConditionerHours * 1.5; // 1500W AC
  const washingMachineConsumption = washingMachineHours * 0.5; // 500W washing machine
  const ironConsumption = ironHours * 1.0; // 1000W iron

  const totalConsumption = fanConsumption + fridgeConsumption + tvConsumption + 
                          airConditionerConsumption + washingMachineConsumption + 
                          ironConsumption;
  
  const monthlyConsumption = totalConsumption * 30; // Convert daily to monthly
  const estimatedCost = calculateElectricityBill(monthlyConsumption);

  const bill = isCalculated ? calculatedBill : { breakdown: [], totalCost: 0 };

  return (
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Energy Bill Calculator Section - Accordion */}
            <View style={styles.card}>
              <Collapsible title="Energy Bill Calculator" defaultOpen={true}>
                <View style={styles.calculatorContainer}>
                  <Text style={styles.sectionDescription}>
                    Calculate your electricity bill using telescopic or non-telescopic billing structure.
                  </Text>
                  
                  <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <IconSymbol size={20} name="bolt.fill" color="#43a57a" />
                    <Text style={styles.inputLabel}>Energy Consumption</Text>
                  </View>
                  <Text style={styles.inputSubtext}>Input units in kWh</Text>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={energyConsumption}
                      onChangeText={handleInputChange}
                      onBlur={dismissKeyboard}
                      keyboardType="numeric"
                      placeholder='Enter units'
                    />
                    <TouchableOpacity 
                      style={[
                        styles.calculateButton,
                        !energyConsumption && styles.calculateButtonDisabled
                      ]}
                      onPress={handleCalculate}
                      disabled={!energyConsumption}
                    >
                      <Text style={[
                        styles.calculateButtonText,
                        !energyConsumption && styles.calculateButtonTextDisabled
                      ]}>Calculate</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bill Breakdown within the same accordion section */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.subsectionTitle}>Bill Breakdown</Text>
                  <Text style={styles.breakdownSubtitle}>
                    {isCalculated ? (
                      <>
                        Based on <Text style={styles.boldText}>{submittedConsumption} units</Text> consumption using {submittedConsumption <= 250 ? 'Telescopic' : 'Non-Telescopic'} billing.
                      </>
                    ) : (
                      ''
                    )}
                  </Text>
                  
                  {bill.breakdown.length > 0 ? (
                    <>
                      {bill.breakdown.map((item, index) => (
                        <View
                          key={index}
                          style={[
                            styles.breakdownItem,
                            index === bill.breakdown.length - 1 && styles.breakdownItemLast,
                          ]}
                        >
                          <View style={styles.breakdownLeft}>
                            <Text style={styles.breakdownLabel}>{item.title}</Text>
                            {!!item.unitText && (
                              <Text style={styles.breakdownUnit}>{item.unitText}</Text>
                            )}
                          </View>
                          <Text style={[
                            styles.breakdownValue,
                            item.type === 'fixed' && styles.fixedChargeValue
                          ]}>
                            ₹{item.cost.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                      
                      <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Total Estimated Bill</Text>
                        <Text style={styles.totalValue}>₹{bill.totalCost.toFixed(2)}</Text>
                      </View>
                      
                      {/* Additional Information */}
                      <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                          <IconSymbol size={16} name="info.circle.fill" color="#43a57a" />
                          <Text style={styles.infoText}>
                            {parseInt(energyConsumption) <= 250 
                              ? 'Telescopic billing applies different rates for different consumption slabs (≤250 units)'
                              : 'Non-telescopic billing applies a uniform rate for all units consumed (>250 units)'
                            }
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <IconSymbol size={16} name="exclamationmark.triangle.fill" color="#43a57a" />
                          <Text style={styles.infoText}>
                            This is an estimate. Actual bill may vary based on taxes and other charges.
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <View style={styles.noDataContent}>
                        <IconSymbol size={64} name="bolt.slash.fill" color="#43a57a" />
                        <Text style={styles.noDataText}>Enter consumption units and click calculate to see bill breakdown</Text>
                      </View>
                    </View>
                  )}
                </View>
                </View>
              </Collapsible>
            </View>

            {/* Usage Estimator Section - Accordion */}
            <View style={styles.card}>
              <Collapsible title="Usage Estimator">
                <Text style={styles.sectionDescription}>
                  Estimate your energy consumption and cost based on appliance usage.
                </Text>
                
                {/* Beautiful Header with Gradient and Stats */}
                <View style={styles.estimatorContainer}>
                  <LinearGradient
                    colors={['#2ECC71', '#27AE60', '#1E824C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.estimatorHeader}
                  >
                  <View style={styles.headerContent}>
                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>{monthlyConsumption.toFixed(1)} kWh</Text>
                        <Text style={styles.statLabel}>kWh/month</Text>
                        <Text style={styles.statSubtext}>Total Consumption</Text>
                      </View>
                      
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>₹{estimatedCost.toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Estimated Cost</Text>
                        <Text style={styles.statSubtext}>Monthly Bill</Text>
                      </View>
                    </View>
                    
                    {/* Daily Average */}
                    <View style={styles.dailyAverageContainer}>
                      <Text style={styles.dailyAverageText}>
                        Daily Average: {totalConsumption.toFixed(2)} kWh
                      </Text>
                    </View>
                  </View>
                  </LinearGradient>

                  <Text style={styles.usageHeader}>Appliance Usage</Text>
                  <View style={styles.usageCard}>
                    <UsageItem hours={airConditionerHours} setHours={setAirConditionerHours} applianceName="AC" brand="LG" applianceIcon="wind" />
                    <UsageItem hours={fridgeHours} setHours={setFridgeHours} applianceName="Fridge" brand="Haier" applianceIcon="snow" />
                    <UsageItem hours={washingMachineHours} setHours={setWashingMachineHours} applianceName="Washing Machine" brand="Samsung" applianceIcon="washer" />
                    <UsageItem hours={tvHours} setHours={setTvHours} applianceName="TV" brand="LG" applianceIcon="tv" />
                    <UsageItem hours={fanHours} setHours={setFanHours} applianceName="Fan" brand="Havells" applianceIcon="fan" />
                    <UsageItem hours={ironHours} setHours={setIronHours} applianceName="Iron" applianceIcon="flame" />
                  </View>
                </View>
              </Collapsible>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: -40
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  breakdownSection: {
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputSection: {
    marginTop: 0,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputSubtext: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: '#f9f9f9',
  },
  calculateButton: {
    backgroundColor: '#1E824C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  calculateButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  calculateButtonTextDisabled: {
    color: '#9CA3AF',
  },
  breakdownSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownItemLast: {
    borderBottomWidth: 0,
  },
  breakdownLeft: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  breakdownUnit: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  breakdownValue: {
    fontSize: 16,
    color: '#1E824C',
    fontWeight: '500',
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E824C',
  },
  fixedChargeValue: {
    color: '#FF9500',
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  noDataContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    height: '100%',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  // Calculator specific styles
  calculatorContainer: {
    marginLeft: -24,
    marginRight: 0,
  },
  // Estimator specific styles
  estimatorContainer: {
    marginLeft: -24,
    marginRight: 0,
  },
  estimatorHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  dailyAverageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyAverageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  usageHeader: {
    paddingLeft: 0,
    paddingTop: 16,
    paddingBottom: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  usageCard: {
    marginHorizontal: 0,
    marginBottom: 8,
    borderRadius: 12,
  },
});
