import { useAppSelector } from '@/store/hooks';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Interface definitions for weekly usage data

interface WeeklyUsageData {
  day: string;
  usage: number;
  morning: number;
  evening: number;
  night: number;
}

interface WeeklyUsageCardProps {
  onTimeRangePress?: () => void;
}

// Function to calculate cost based on electricity tariff slabs
const calculateCostFromUnits = (units: number): number => {
  let totalCost = 0;
  let remainingUnits = units;

  // Using switch case for different tariff slabs
  switch (true) {
    case units <= 300:
      totalCost = units * 6.40;
      break;
    
    case units <= 350:
      totalCost = (300 * 6.40) + ((units - 300) * 7.25);
      break;
    
    case units <= 400:
      totalCost = (300 * 6.40) + (50 * 7.25) + ((units - 350) * 7.60);
      break;
    
    case units <= 500:
      totalCost = (300 * 6.40) + (50 * 7.25) + (50 * 7.60) + ((units - 400) * 7.90);
      break;
    
    default: // Above 500 units
      totalCost = (300 * 6.40) + (50 * 7.25) + (50 * 7.60) + (100 * 7.90) + ((units - 500) * 8.80);
      break;
  }

  return totalCost;
};

// Function to process real daily data into time segments
const processRealWeeklyData = (dailyAggregatesData: {x: string, y: number}[], hourlyData: {x: string, y: number}[]) => {
  if (!dailyAggregatesData || dailyAggregatesData.length === 0) {
    console.log('📊 No daily aggregates data available for weekly chart');
    return null;
  }

  console.log('📊 Processing weekly data:', { 
    dailyDataLength: dailyAggregatesData.length, 
    hourlyDataLength: hourlyData?.length || 0 
  });

  // Get current date for labeling
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Process daily data into weekly format
  const dailyBreakdown = dailyAggregatesData.map((dayData, index) => {
    const dayNumber = parseInt(dayData.x);
    const currentDay = new Date();
    currentDay.setDate(dayNumber);
    const dayOfWeek = currentDay.getDay();
    const dayName = dayNames[dayOfWeek];
    
    // For time segments, we'll use proportional distribution since we don't have hourly breakdown for each day
    // This is a simplified approach - in a real app, you'd fetch hourly data for each day
    const totalKwh = dayData.y;
    
    // Typical distribution percentages based on usage patterns
    const morningPercent = 0.25; // 25% morning (0-11 AM)
    const eveningPercent = 0.50; // 50% evening (11 AM-8 PM) 
    const nightPercent = 0.25;   // 25% night (8 PM-12 AM)
    
    // For today, use actual hourly data if available
    let morning = totalKwh * morningPercent;
    let evening = totalKwh * eveningPercent;
    let night = totalKwh * nightPercent;
    
    if (dayNumber === today.getDate() && hourlyData && hourlyData.length > 0) {
      // Calculate actual segments for today using hourly data
      morning = hourlyData
        .filter((hour, idx) => idx >= 0 && idx <= 10) // 0-11 AM (hours 0-10)
        .reduce((sum, hour) => sum + hour.y, 0);
      
      evening = hourlyData
        .filter((hour, idx) => idx >= 11 && idx <= 19) // 11 AM-8 PM (hours 11-19)
        .reduce((sum, hour) => sum + hour.y, 0);
      
      night = hourlyData
        .filter((hour, idx) => idx >= 20 && idx <= 23) // 8 PM-12 AM (hours 20-23)
        .reduce((sum, hour) => sum + hour.y, 0);
    }
    
    return {
      day: dayName,
      date: currentDay.toISOString().split('T')[0],
      totalUsage: totalKwh, // Convert to units for display
      cost: calculateCostFromUnits(totalKwh), // Estimate cost //todo:- take from slab
      timeSegments: {
        morning: morning , // Convert to units
        evening: evening ,
        night: night ,
      },
      peakHour: evening > morning && evening > night ? "2:00 PM" : morning > night ? "9:00 AM" : "10:00 PM",
      efficiency: totalKwh < 0.01 ? "Excellent" : totalKwh < 0.05 ? "Good" : "Fair"
    };
  });

  const totalUsage = dailyBreakdown.reduce((sum, day) => sum + day.totalUsage, 0);
  const peakDay = dailyBreakdown.reduce((max, day) => 
    day.totalUsage > max.totalUsage ? day : max, dailyBreakdown[0]
  ).day;

  return {
    period: `Last ${dailyAggregatesData.length} days`,
    totalUsage,
    averageDailyUsage: totalUsage / dailyAggregatesData.length,
    peakDay,
    lowestDay: dailyBreakdown.reduce((min, day) => 
      day.totalUsage < min.totalUsage ? day : min, dailyBreakdown[0]
    ).day,
    dailyBreakdown,
    insights: {
      highestUsageDay: peakDay,
      lowestUsageDay: dailyBreakdown.reduce((min, day) => 
        day.totalUsage < min.totalUsage ? day : min, dailyBreakdown[0]
      ).day,
      mostEfficientDay: dailyBreakdown.reduce((best, day) => 
        day.efficiency === "Excellent" ? day : best, dailyBreakdown[0]
      ).day,
      averageMorningUsage: dailyBreakdown.reduce((sum, day) => sum + day.timeSegments.morning, 0) / dailyBreakdown.length,
      averageEveningUsage: dailyBreakdown.reduce((sum, day) => sum + day.timeSegments.evening, 0) / dailyBreakdown.length,
      averageNightUsage: dailyBreakdown.reduce((sum, day) => sum + day.timeSegments.night, 0) / dailyBreakdown.length,
    }
  };
};


export default function WeeklyUsageCard({ 
  onTimeRangePress 
}: WeeklyUsageCardProps) {
  const energyState = useAppSelector((state) => state.energy);
  
  // Process real data from Redux
  const weeklyData = React.useMemo(() => {
    if (energyState.dailyAggregatesData && energyState.dailyAggregatesData.length > 0) {
      const realWeeklyData = processRealWeeklyData(
        energyState.dailyAggregatesData, 
        energyState.hourlyData
      );
      
      if (realWeeklyData) {
        console.log('📊 Using real weekly data:', realWeeklyData);
        return realWeeklyData;
      }
    }
    
    // Return empty data structure if no real data available
    return {
      period: "No data available",
      totalUsage: 0,
      averageDailyUsage: 0,
      peakDay: "N/A",
      lowestDay: "N/A",
      dailyBreakdown: [],
      insights: {
        highestUsageDay: "N/A",
        lowestUsageDay: "N/A",
        mostEfficientDay: "N/A",
        averageMorningUsage: 0,
        averageEveningUsage: 0,
        averageNightUsage: 0,
      }
    };
  }, [energyState.dailyAggregatesData, energyState.hourlyData]);
  
  // Calculate max daily usage for scaling
  const maxDailyUsage = React.useMemo(() => {
    if (weeklyData?.dailyBreakdown && weeklyData.dailyBreakdown.length > 0) {
      const maxUsage = Math.max(...weeklyData.dailyBreakdown.map(day => day.totalUsage));
      return Math.max(10, maxUsage * 1.2); // At least 10, or 120% of max usage for better scaling
    }
    return 10; // Minimum scale for empty data
  }, [weeklyData]);

  // Daily budget value (dummy for now - API will provide later)
  const dailyBudget = 40; // kWh per day

  return (
    <View style={styles.card}>
      <View style={styles.weeklyHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.weeklyTitle}>This Week&apos;s Usage</Text>
        </View>
        <TouchableOpacity style={styles.weeklyButton} onPress={onTimeRangePress}>
          <Text style={styles.weeklyButtonText}>Last 7 Days</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.totalUsageContainer}>
        <Text style={styles.totalUsageNumber}>{weeklyData.totalUsage.toFixed(1)}</Text>
        <Text style={styles.totalUsageUnit}>kWh</Text>
      </View>
      
      <View style={styles.chartContainer}>
        {weeklyData.dailyBreakdown.length > 0 ? (
          <View style={styles.weeklyChart}>
            {weeklyData.dailyBreakdown.map((day, index) => (
              <View key={index} style={styles.weeklyDay}>
                <Text style={[
                  styles.weeklyDayLabel,
                  day.day === weeklyData.peakDay && styles.weeklyDayLabelHighlighted
                ]}>
                  {day.day}
                </Text>
                <View style={styles.weeklyBarContainer}>
                  <View style={styles.segmentedBar}>
                    {/* Morning segment - only render if has usage */}
                    {day.timeSegments.morning > 0 && (
                      <View 
                        style={[
                          styles.segment,
                          styles.morningSegment,
                          { width: `${(day.timeSegments.morning / maxDailyUsage) * 100}%` }
                        ]} 
                      />
                    )}
                    {/* Evening segment - only render if has usage */}
                    {day.timeSegments.evening > 0 && (
                      <View 
                        style={[
                          styles.segment,
                          styles.eveningSegment,
                          { width: `${(day.timeSegments.evening / maxDailyUsage) * 100}%` }
                        ]} 
                      />
                    )}
                    {/* Night segment - only render if has usage */}
                    {day.timeSegments.night > 0 && (
                      <View 
                        style={[
                          styles.segment,
                          styles.nightSegment,
                          { width: `${(day.timeSegments.night / maxDailyUsage) * 100}%` }
                        ]} 
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
            
            {/* Daily Limit Indicator - Vertical Dotted Line */}
            <View style={styles.budgetIndicatorContainer}>
              <View style={[
                styles.budgetLineContainer,
                { left: `${(dailyBudget / 70) * 100}%` } // Use 70 as max scale value from x-axis
              ]}>
                {Array.from({ length: 60 }, (_, i) => (
                  <View key={i} style={[styles.budgetLineDot, { top: i * 4 }]} />
                ))}
              </View>
              <View style={[
                styles.budgetLabel,
                { left: `${(dailyBudget / 70) * 100}%` }
              ]}>
                <Text style={styles.budgetLabelText}>Daily Limit: {dailyBudget} kWh</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>📊 Loading weekly usage data...</Text>
            <Text style={styles.noDataSubtext}>Data will appear once aggregation is complete</Text>
          </View>
        )}
        
        {/* X-axis scale */}
        <View style={styles.xAxis}>
          {[0, 17.5, 35, 52.5, 70].map((value) => (
            <Text key={value} style={styles.xAxisLabel}>{value}</Text>
          ))}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.morningSegment]} />
          <Text style={styles.legendText}>Morning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.eveningSegment]} />
          <Text style={styles.legendText}>Evening</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.nightSegment]} />
          <Text style={styles.legendText}>Night</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF3B30',
  },
  weeklyButton: {
    backgroundColor: '#1E824C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weeklyButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  totalUsageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  totalUsageNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  totalUsageUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  chartContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  weeklyChart: {
    gap: 12,
    marginBottom: 12,
    position: 'relative',
  },
  weeklyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyDayLabel: {
    fontSize: 12,
    color: '#666',
    width: 30,
    fontWeight: '500',
  },
  weeklyDayLabelHighlighted: {
    color: '#1E824C',
    fontWeight: '600',
  },
  weeklyBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    overflow: 'hidden',
  },
  segmentedBar: {
    flexDirection: 'row',
    height: '100%',
  },
  segment: {
    height: '100%',
  },
  morningSegment: {
    backgroundColor: '#90EE90', // Light green
  },
  eveningSegment: {
    backgroundColor: '#87CEEB', // Light blue
  },
  nightSegment: {
    backgroundColor: '#D3D3D3', // Light gray
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 42, // Align with chart bars
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#999',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 70,
    justifyContent: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  budgetIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 42, // Align with chart bars
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000, // Maximum z-index to appear above all chart bars
  },
  budgetLineContainer: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 2,
  },
  budgetLineDot: {
    position: 'absolute',
    width: 2,
    height: 3,
    backgroundColor: '#FF3B30',
    borderRadius: 1,
    zIndex: 1001, // Maximum z-index for dots
  },
  budgetLabel: {
    position: 'absolute',
    top: -25,
    transform: [{ translateX: -30 }], // Center the label on the line
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1002, // Maximum z-index for label
  },
  budgetLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
