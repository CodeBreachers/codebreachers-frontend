import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { reduxNodeMCUService } from '@/services/ReduxNodeMCUService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const screenWidth = Dimensions.get('window').width;

export default function TabTwoScreen() {
  const dispatch = useAppDispatch();
  const documentCount = useAppSelector((state: any) => state.nodeMCU.documentCount);
  const readingData = useAppSelector((state: any) => state.nodeMCU.readingData);

  useEffect(() => {
    console.log('🚀 Explore page mounted - starting Redux Firebase subscription');
    reduxNodeMCUService.startListening(dispatch);

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up Redux Firebase subscription');
      reduxNodeMCUService.stopListening();
    };
  }, [dispatch]);

  // Create chart data from Redux individual readings
  const createChartData = () => {
    // console.log('📊 Creating chart data from Redux:', readingData);
    
    if (!readingData?.individualReadings || readingData.individualReadings.length === 0) {
      console.log('❌ No individual readings data available');
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
          strokeWidth: 3
        }]
      };
    }
    
    console.log('✅ Found', readingData.individualReadings.length, 'individual readings');
    
    // Get the last 10 individual readings for the chart
    const recentReadings = readingData.individualReadings.slice(0, 10);
    
    // Group readings by hour for better visualization
    const hourlyData: { [key: string]: number[] } = {};
    
    recentReadings.forEach((reading: any) => {
      const timestamp = new Date(reading.timestamp);
      const hour = timestamp.getHours();
      const hourKey = `${hour}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = [];
      }
      hourlyData[hourKey].push(reading.value);
    });
    
    // Create chart data points
    const chartLabels = Object.keys(hourlyData).sort();
    const chartValues = chartLabels.map(hour => {
      const values = hourlyData[hour];
      return values.reduce((sum, val) => sum + val, 0) / values.length; // Average value
    });
    
    return {
      labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
      datasets: [{
        data: chartValues.length > 0 ? chartValues : [0],
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const chartData = createChartData();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.countNumber}>
        {documentCount || 0}
      </ThemedText>
      
      {/* Professional Line Chart */}
      <ThemedView style={styles.graphContainer}>
        <ThemedText style={styles.graphTitle}>Reading Value Analysis</ThemedText>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#FFD700"
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#333333",
                strokeWidth: 1
              }
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withScrollableDot={false}
          />
        </View>
        <ThemedText style={styles.graphSubtitle}>Hourly Reading Values Over Time</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  countNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 140,
    marginBottom: 20,
  },
  graphContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: screenWidth - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
