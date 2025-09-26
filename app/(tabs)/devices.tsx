import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DeviceData {
  id: string;
  name: string;
  brand: string;
  model: string;
  consumption: {
    '1D': number;
    '1W': number;
    '1M': number;
  };
  cost: {
    '1D': number;
    '1W': number;
    '1M': number;
  };
  icon: string;
  color: string;
}

const deviceData: DeviceData[] = [
  {
    id: 'ac',
    name: 'AC',
    brand: 'LG',
    model: 'LS-Q18HNZA',
    consumption: { '1D': 8.5, '1W': 55, '1M': 220 },
    cost: { '1D': 28.00, '1W': 33.00, '1M': 330.00 },
    icon: 'air.conditioner.horizontal.fill',
    color: '#2196F3' // Blue for AC/cooling
  },
  {
    id: 'motor',
    name: 'Motor',
    brand: 'Kirloskar',
    model: 'KOT-154S',
    consumption: { '1D': 4.2, '1W': 28, '1M': 115 },
    cost: { '1D': 14.00, '1W': 16.80, '1M': 172.50 },
    icon: 'fan.fill',
    color: '#FF9800' // Orange for motor/movement
  },
  {
    id: 'fridge',
    name: 'Fridge',
    brand: 'Haier',
    model: 'HRB-3654PSG',
    consumption: { '1D': 6.0, '1W': 42, '1M': 180 },
    cost: { '1D': 20.00, '1W': 25.20, '1M': 270.00 },
    icon: 'refrigerator.fill',
    color: '#9C27B0' // Purple for fridge/refrigeration
  },
  {
    id: 'others',
    name: 'Other',
    brand: '',
    model: '',
    consumption: { '1D': 2.5, '1W': 18, '1M': 75 },
    cost: { '1D': 8.00, '1W': 10.80, '1M': 112.50 },
    icon: 'ellipsis.circle.fill',
    color: '#757575' // Gray for other/miscellaneous
  }
];

export default function DevicesScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1D' | '1W' | '1M'>('1D');
  
  const totalConsumption = deviceData.reduce((sum, device) => sum + device.consumption[selectedTimeRange], 0);
  const totalCost = deviceData.reduce((sum, device) => sum + device.cost[selectedTimeRange], 0);
  
  const getTotalDisplayValue = () => {
    switch (selectedTimeRange) {
      case '1D': return `${totalConsumption.toFixed(1)} kWh`;
      case '1W': return `${totalConsumption.toFixed(0)} kWh`;
      case '1M': return `${totalConsumption.toFixed(0)} kWh`;
    }
  };
  
  const getComparisonText = () => {
    switch (selectedTimeRange) {
      case '1D': return 'vs Yesterday';
      case '1W': return 'vs Last Week';
      case '1M': return 'vs Last Month';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={styles.sectionTitle}>Device Breakdown</Text>

        {/* Chart Card */}
        <View style={styles.combinedCard}>
          {/* Time Range Buttons */}
          <View style={styles.timeRangeHeader}>
            <View style={styles.timeRangeButtons}>
              {(['1D', '1W', '1M'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeRange(range)}
                >
                  <Text
                    style={[
                      styles.timeRangeButtonText,
                      selectedTimeRange === range && styles.timeRangeButtonTextActive,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.barChart}>
              {deviceData.map((device, index) => (
                <View key={device.id} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: (device.consumption[selectedTimeRange] / Math.max(...deviceData.map(d => d.consumption[selectedTimeRange]))) * 100,
                        backgroundColor: '#c8e6d2' 
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{device.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Device List */}
        <View style={styles.deviceList}>
          {deviceData.map((device, index) => (
            <View 
              key={device.id} 
              style={[
                styles.deviceItem,
                index === deviceData.length - 1 && styles.deviceItemLast
              ]}
            >
              <View style={styles.deviceLeft}>
                <View style={[styles.deviceIcon, { backgroundColor: '#e7f3ee' }]}>
                  <IconSymbol size={24} name={device.icon} color="#43a57a" />
                </View>
                <View style={styles.deviceInfo}>
                  <View style={styles.deviceNameContainer}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={styles.deviceBrandModelContainer}>
                      {device.brand && <Text style={styles.deviceBrand}>{device.brand}</Text>}
                      {device.model && <Text style={styles.deviceModel}>{device.model}</Text>}
                    </View>
                  </View>
                  <Text style={styles.deviceConsumption}>{device.consumption[selectedTimeRange]} kWh</Text>
                </View>
              </View>
              <Text style={styles.deviceCost}>₹{device.cost[selectedTimeRange].toFixed(2)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
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
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  combinedCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timeRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  timeRangeButtonActive: {
    backgroundColor: '#1E824C',
  },
  timeRangeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: 'white',
  },
  totalSection: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartSection: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E824C',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 48,
    marginBottom: 8,
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  deviceList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  deviceItemLast: {
    borderBottomWidth: 0,
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceNameContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 2,
  },
  deviceBrandModelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  deviceBrand: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    color: '#1E824C',
  },
  deviceModel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
    color: '#1E824C',
    opacity: 0.8,
  },
  deviceConsumption: {
    fontSize: 14,
    color: '#666',
  },
  deviceCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
