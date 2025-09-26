import EcoWarriorChallengeCard from '@/components/EcoWarriorChallengeCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import WeeklyUsageCard from '@/components/WeeklyUsageCard';
import { useDailyAggregates } from '@/hooks/useDailyAggregates';
import { useHourlyUsage } from '@/hooks/useHourlyUsage';
import { useMonthlyUsage } from '@/hooks/useMonthlyUsage';
import { dismissAnomalyAlert, restoreAnomalyAlert, setSelectedTimeRange } from '@/store/energySlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Circle, LinearGradient, Paint, vec } from '@shopify/react-native-skia';
import React, { useMemo, useRef, useState } from 'react';
import { RefreshControl, Animated as RNAnimated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, SharedValue, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Area, CartesianChart, Line, useChartPressState } from 'victory-native';

// const screenWidth = Dimensions.get('window').width;

export default function EnergyDashboard() {
  const dispatch = useAppDispatch();
  const energyState = useAppSelector((state) => state.energy);
  const [ecoWarriorVisible, setEcoWarriorVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Refresh function to restore dismissed cards
  const handleRefresh = () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    setEcoWarriorVisible(true);
    dispatch(restoreAnomalyAlert());
    
    // Simulate refresh delay for better UX
    setTimeout(() => {
      setRefreshing(false);
      console.log('✅ Refresh completed');
    }, 1000);
  };
  
  // Subscribe to monthly usage using custom hook - this updates Redux automatically
  useMonthlyUsage();
  
  // Subscribe to hourly usage using custom hook - this updates Redux automatically
  useHourlyUsage();
  
  // Subscribe to daily aggregates using custom hook - this updates Redux automatically
  useDailyAggregates();
  
  // Build realistic usage data for 1D / 1W / 1M with evening peaks (6pm–12am)
  const buildRangeData = (range: '1D' | '1W' | '1M') => {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    // Baseline hourly shape with strong evening peak
    const hourBase = (hour: number) => {
      if (hour >= 18 && hour <= 21) {
        // Peak hours
        return 2.0 + Math.random() * 0.6; // 2.0 – 2.6
      }
      if (hour === 22 || hour === 23) {
        return 1.2 + Math.random() * 0.6; // 1.2 – 1.8
      }
      if (hour === 17) {
        return 1.1 + Math.random() * 0.5; // 1.1 – 1.6
      }
      if (hour >= 10 && hour <= 16) {
        return 0.6 + Math.random() * 0.5; // 0.6 – 1.1
      }
      if (hour >= 6 && hour <= 9) {
        // Morning ramp up
        const ramp = (hour - 6) / 3; // 0..1
        return 0.35 + ramp * 0.35 + Math.random() * 0.1; // ~0.35 – 0.8
      }
      // Late night/early morning
      return 0.2 + Math.random() * 0.15; // 0.2 – 0.35
    };

    // Generate one day (24 points)
    const generateDay = (dayIndex: number) => {
      // Increase day-to-day variability
      const dayScale = 0.85 + Math.random() * 0.4; // 0.85 – 1.25
      const smallNoise = () => (Math.random() - 0.5) * 0.08; // ±0.04 kWh
      const dayOfWeek = dayIndex % 7; // 0=Mon ... 6=Sun

      // Pronounced weekday multipliers
      const dayMultipliers = [
        0.9,  // Mon - lower
        1.0,  // Tue - baseline
        1.15, // Wed - office/AC midday
        0.95, // Thu - slightly lower
        1.25, // Fri - higher
        1.35, // Sat - highest
        1.2   // Sun - high
      ];

      return Array.from({ length: 24 }, (_, hour) => {
        // Weekend slightly higher evenings
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        const weekendBoost = isWeekend && hour >= 18 && hour <= 22 ? 1.12 : 1.0;

        // Hour-specific events to make some days stand out
        let hourOffset = 0;
        // Wednesday midday bump (laundry/AC)
        if (dayOfWeek === 2 && hour >= 12 && hour <= 15) hourOffset += 0.18;
        // Friday party prep & cooking
        if (dayOfWeek === 4 && hour >= 20 && hour <= 22) hourOffset += 0.2;
        // Saturday long evening
        if (dayOfWeek === 5 && hour >= 19 && hour <= 22) hourOffset += 0.25;
        // Sunday brunch / midday cooking
        if (dayOfWeek === 6 && hour >= 11 && hour <= 13) hourOffset += 0.15;
        // Monday calmer mornings
        if (dayOfWeek === 0 && hour >= 6 && hour <= 8) hourOffset -= 0.1;

        const base = hourBase(hour) * dayScale * dayMultipliers[dayOfWeek] * weekendBoost + hourOffset + smallNoise();
        const value = clamp(Number(base.toFixed(2)), 0.2, 3.0);
        return value;
      });
    };

    // Assemble series depending on range
    const series: number[] =
      range === '1D'
        ? generateDay(0)
        : range === '1W'
        ? Array.from({ length: 7 })
            .flatMap((_, d) => generateDay(d))
        : Array.from({ length: 30 })
            .flatMap((_, d) => {
              // Monthly trend: slight mid-month rise plus week-to-week oscillation
              const dayProfile = generateDay(d);
              const t = d / 29;
              const monthWave = 0.95 + 0.1 * Math.sin((t - 0.2) * Math.PI * 2); // ±5%
              const weekWave = 0.95 + 0.08 * Math.sin((d / 6.5) * Math.PI * 0.8);
              // Bill cycle peak approx on days 18–23
              const billingPeak = d >= 18 && d <= 23 ? 1.08 : 1.0;
              const trend = monthWave * weekWave * billingPeak;
              return dayProfile.map((v) => clamp(Number((v * trend).toFixed(2)), 0.2, 3.0));
            });

    return series.map((value, i) => ({
      timestamp: String(i),
      value: Number(value.toFixed(2)),
      cost: Number((value * 5).toFixed(2)),
    }));
  };

  // Create chart data with upper, middle, and lower bounds for area range
  const createChartData = (source: { timestamp: string; value: number }[] | { x: string; y: number }[]) => {
    return source.map((data) => {
      // Handle both synthetic data format and real data format
      const baseValue = 'value' in data ? data.value : data.y;
      const xValue = 'timestamp' in data ? data.timestamp : data.x;
      // Use smaller variance for real data since values are much smaller
      const variance = 'value' in data ? 0.25 : baseValue * 0.1; // 10% variance for real data
      const upper = Math.min(3, baseValue + variance);
      const lower = Math.max(0, baseValue - variance);
      return {
        x: xValue,
        upper,
        middle: baseValue,
        lower,
      };
    });
  };

  const sourceData = useMemo(() => {
    // Use real data for all views
    if (energyState.selectedTimeRange === '1D') {
      return energyState.hourlyData.length > 0 ? energyState.hourlyData : Array.from({ length: 24 }, (_, hour) => ({ x: String(hour).padStart(2, '0'), y: 0 }));
    }
    if (energyState.selectedTimeRange === '1W') {
      return energyState.dailyAggregatesData.length > 0 ? energyState.dailyAggregatesData : buildRangeData('1W');
    }
    if (energyState.selectedTimeRange === '1M') {
      return energyState.monthlyAggregatesData.length > 0 ? energyState.monthlyAggregatesData : buildRangeData('1M');
    }
    return buildRangeData(energyState.selectedTimeRange);
  }, [energyState.selectedTimeRange, energyState.hourlyData, energyState.dailyAggregatesData, energyState.monthlyAggregatesData]);
  
  const chartData = useMemo(() => createChartData(sourceData), [sourceData]);
  
  // Chart press state for interactions
  const { state, isActive } = useChartPressState({ x: '', y: { middle: 0, lower: 0, upper: 0 } });

  // Build a map from x -> ts (ISO) when available in real data
  const xToTsMap = useMemo(() => {
    const map = new Map<string, number>();
    // sourceData can be {x,y} or {timestamp,value}
    (sourceData as any[]).forEach((d) => {
      if (d && typeof d === 'object') {
        const xKey = 'x' in d ? d.x : ('timestamp' in d ? d.timestamp : undefined);
        const tms = 'tms' in d ? d.tms : undefined;
        if (xKey && typeof tms === 'number') {
          map.set(String(xKey), tms);
        }
      }
    });
    return map;
  }, [sourceData]);

  // React state for tooltip label to avoid reading SharedValue during render
  const [activeLabel, setActiveLabel] = useState('0.00 kWh');
  
  // Format tooltip label based on selected range and x value
  const formatTooltipTime = (xStr: string, range: '1D' | '1W' | '1M', tms?: number) => {
    if (typeof tms === 'number') {
      const d = new Date(tms);
      if (!isNaN(d.getTime())) {
        if (range === '1D') {
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        }
        const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleDateString(undefined, { month: 'short' });
        return `${weekday} ${day} ${month}`;
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth(); // 0-based

    // 1D -> x is hour label "00".."23"
    if (range === '1D') {
      const n = Number(xStr);
      if (!isNaN(n)) {
        const hh = String(Math.max(0, Math.min(23, Math.round(n)))).padStart(2, '0');
        return `${hh}:00`;
      }
      return String(xStr);
    }

    // 1W / 1M -> x is day-of-month string for current month
    const dayNum = Number(xStr);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
      const d = new Date(year, monthIndex, dayNum);
      const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleDateString(undefined, { month: 'short' });
      return `${weekday} ${day} ${month}`;
    }

    const n = Number(xStr);
    if (!isNaN(n)) {
      if (range === '1W' || range === '1M') {
        return `Day ${Math.max(1, Math.round(n + 1))}`;
      }
    }
    return String(xStr);
  };

  const updateTooltipLabel = (xStr: string, yVal: number) => {
    const tms = xToTsMap.get(xStr);
    const timeOrDay = formatTooltipTime(xStr, energyState.selectedTimeRange, tms);
    setActiveLabel(`${timeOrDay} • ${yVal.toFixed(2)} kWh`);
  };

  useAnimatedReaction(
    () => ({
      y: state.y.middle.value?.value ?? 0,
      x: state.x.value?.value ?? ''
    }),
    (vals) => {
      const yVal = typeof vals.y === 'number' ? vals.y : 0;
      const xStr = typeof vals.x === 'string' ? vals.x : String(vals.x ?? '');
      runOnJS(updateTooltipLabel)(xStr, yVal);
    }
  );
  
  // console.log('Chart data:', chartData);

  const handleTimeRangeChange = (range: '1D' | '1W' | '1M') => {
    dispatch(setSelectedTimeRange(range));
  };

  const handleDismissAlert = () => {
    dispatch(dismissAnomalyAlert());
  };

  // Expected Bill flip card
  const [isExpectedFlipped, setIsExpectedFlipped] = useState(false);
  const expectedFlip = useRef(new RNAnimated.Value(0)).current;
  const frontRotate = expectedFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = expectedFlip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontStyle = { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] };
  const backStyle = { transform: [{ perspective: 1000 }, { rotateY: backRotate }] };

  const [isExpectedFlipped1, setIsExpectedFlipped1] = useState(false);
  const expectedFlip1 = useRef(new RNAnimated.Value(0)).current;
  const frontRotate1 = expectedFlip1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate1 = expectedFlip1.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontStyle1 = { transform: [{ perspective: 1000 }, { rotateY: frontRotate1 }] };
  const backStyle1 = { transform: [{ perspective: 1000 }, { rotateY: backRotate1 }] };

  const toggleExpected = () => {
    RNAnimated.timing(expectedFlip, { toValue: isExpectedFlipped ? 0 : 1, duration: 600, useNativeDriver: true }).start();
    setIsExpectedFlipped(!isExpectedFlipped);
  };

  const toggleExpected1 = () => {
    RNAnimated.timing(expectedFlip1, { toValue: isExpectedFlipped1 ? 0 : 1, duration: 600, useNativeDriver: true }).start();
    setIsExpectedFlipped1(!isExpectedFlipped1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#43a57a"
          />
        }
      >
        {/* Anomaly Alert Card */}
        {energyState.anomalyAlert.detected && (
          <TouchableOpacity style={[styles.card, styles.alertCard]} onPress={handleDismissAlert} activeOpacity={0.9}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissAlert} activeOpacity={0.8}>
              <View style={styles.closeButtonBackground}>
                <IconSymbol size={12} name="xmark" color="#666" />
              </View>
            </TouchableOpacity>

            <View style={styles.alertContent}>
              <View style={styles.alertIcon}>
                <IconSymbol size={20} name="exclamationmark.circle.fill" color="#FF3B30" />
              </View>
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>High Usage Alert</Text>
                <Text style={styles.alertMessage}>{energyState.anomalyAlert.message}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <TouchableOpacity activeOpacity={0.8} onPress={toggleExpected} style={styles.flipCardContainer}>
            <View style={[styles.flipCard]}>
              {/* Front: Rupees */}
               <RNAnimated.View style={[styles.flipCardFace, styles.flipSide, frontStyle]}>
                 <Text style={styles.summaryCardTitle}>Estimated Bill</Text>
                 <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>₹ {energyState.billingInfo.expectedBill.toFixed(2)}</Text>
                 <View style={styles.summaryCardIndicator}>
                   <IconSymbol size={16} name="arrow.up" color="#FF3B30" />
                   <Text style={[styles.summaryCardChange, { color: '#FF3B30' }]}>15% higher</Text>
                 </View>
                 <Text style={styles.summaryCardHint}>Tap to view in kWh</Text>
               </RNAnimated.View>
              {/* Back: kWh estimate */}
              <RNAnimated.View style={[styles.flipCardFace, styles.flipSide, styles.flipBack, backStyle]}>
                <Text style={styles.summaryCardTitleSmall}>This Month&apos;s Usage</Text>
                <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{(energyState.billingInfo.expectedBill / 5).toFixed(2)} kWh</Text>
                <View style={styles.summaryCardIndicator}>
                  <IconSymbol size={16} name="arrow.up" color="#FF3B30" />
                  <Text style={[styles.summaryCardChange, { color: '#FF3B30' }]}>15% higher</Text>
                </View>
              </RNAnimated.View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={toggleExpected1} style={styles.flipCardContainer}>
            <View style={[styles.flipCard]}>
              {/* Front: Rupees */}
               <RNAnimated.View style={[styles.flipCardFace, styles.flipSide, frontStyle1]}>
                 <Text style={styles.summaryCardTitle}>Today</Text>
                 <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>₹ {energyState.billingInfo.todayCost.toFixed(2)}</Text>
                 <View style={styles.summaryCardIndicator}>
                   <IconSymbol size={16} name="arrow.down" color="#1E824C" />
                   <Text style={styles.summaryCardChange}>8% lower</Text>
                 </View>
                 <Text style={styles.summaryCardHint}>Tap to view in kWh</Text>
               </RNAnimated.View>
              {/* Back: Units consumed */}
              <RNAnimated.View style={[styles.flipCardFace, styles.flipSide, styles.flipBack, backStyle1]}>
                <Text style={styles.summaryCardTitle}>Today</Text>
                <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{energyState.billingInfo.todayUsage.toFixed(1)} kWh</Text>
                <View style={styles.summaryCardIndicator}>
                  <IconSymbol size={16} name="arrow.down" color="#1E824C" />
                  <Text style={styles.summaryCardChange}>8% lower</Text>
                </View>
              </RNAnimated.View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Eco Warrior Challenge Card */}
        <View style={styles.ecoWarriorContainer}>
          <EcoWarriorChallengeCard 
            onPress={() => console.log('Eco Warrior Challenge pressed')} 
            isVisible={ecoWarriorVisible}
            onDismiss={() => setEcoWarriorVisible(false)}
          />
        </View>

        {/* Usage Chart Card */}
        <View style={styles.card}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Power Consumption</Text>
              <View style={styles.timeRangeButtons}>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  energyState.selectedTimeRange === '1D' && styles.timeRangeButtonActive
                ]}
                onPress={() => handleTimeRangeChange('1D')}
              >
                <Text style={[
                  styles.timeRangeButtonText,
                  energyState.selectedTimeRange === '1D' && styles.timeRangeButtonTextActive
                ]}>1D</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  energyState.selectedTimeRange === '1W' && styles.timeRangeButtonActive
                ]}
                onPress={() => handleTimeRangeChange('1W')}
              >
                <Text style={[
                  styles.timeRangeButtonText,
                  energyState.selectedTimeRange === '1W' && styles.timeRangeButtonTextActive
                ]}>1W</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  energyState.selectedTimeRange === '1M' && styles.timeRangeButtonActive
                ]}
                onPress={() => handleTimeRangeChange('1M')}
              >
                <Text style={[
                  styles.timeRangeButtonText,
                  energyState.selectedTimeRange === '1M' && styles.timeRangeButtonTextActive
                  ]}>1M</Text>
                </TouchableOpacity>
              </View>
            </View>
          
          <View style={styles.currentUsageSimple}>
            <IconSymbol size={16} name="bolt.fill" color="#1E824C" />
            {energyState.selectedTimeRange === '1D' && (
              <Text style={styles.currentUsageValue}>{energyState.billingInfo.todayUsage.toFixed(2)} kWh</Text>
            )}
            {energyState.selectedTimeRange === '1W' && (
              <Text style={styles.currentUsageValue}>{energyState.billingInfo.weeklyTotal.toFixed(2)} kWh</Text>
            )}
            {energyState.selectedTimeRange === '1M' && (
              <Text style={styles.currentUsageValue}>{energyState.monthlyInfo.monthlyTotalKwh.toFixed(2)} kWh</Text>
            )}
          </View>
          
          {/* Energy Usage Chart with Gradient */}
          <View style={styles.chartWrapper}>
            <CartesianChart
              xKey="x"
              yKeys={["middle", "lower", "upper"]}
              domain={{ 
                y: (() => {
                  if (energyState.selectedTimeRange === '1D' && energyState.hourlyData.length > 0) {
                    return [0, Math.max(0.05, Math.max(...energyState.hourlyData.map(d => d.y)) * 1.2)];
                  }
                  if (energyState.selectedTimeRange === '1W' && energyState.dailyAggregatesData.length > 0) {
                    return [0, Math.max(0.05, Math.max(...energyState.dailyAggregatesData.map(d => d.y)) * 1.2)];
                  }
                  if (energyState.selectedTimeRange === '1M' && energyState.monthlyAggregatesData.length > 0) {
                    return [0, Math.max(0.05, Math.max(...energyState.monthlyAggregatesData.map(d => d.y)) * 1.2)];
                  }
                  return [0, 3];
                })()
              }}
              data={chartData}
              chartPressState={state}
              padding={{ top: 24, bottom: 12, left: 0, right: 0 }}
            >
              {({ points, chartBounds }) => (
                <>
                  {/* Fill from the line down to the bottom */}
                  <Area
                    points={points.middle}
                    y0={chartBounds.bottom}
                    curveType="linear"
                    animate={{ type: "timing", duration: 300 }}
                  >
                    <LinearGradient
                      start={vec(0, chartBounds.top)}
                      end={vec(0, chartBounds.bottom)}
                      colors={["rgba(30, 130, 76, 0.55)", "rgba(30, 130, 76, 0.18)", "rgba(30, 130, 76, 0.02)"]}
                    />
                  </Area>
                  {/* Removed glow line to avoid halo/bulge */}
                  <Line
                    points={points.middle}
                    curveType="linear"
                    strokeWidth={1}
                    connectMissingData
                    animate={{ type: "timing", duration: 500 }}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(chartBounds.right, 0)}
                      colors={["#1E824C", "#1E824C"]}
                    />
                  </Line>
                  {/* No static line points */}
                  {isActive ? (
                    <ToolTip x={state.x.position} y={state.y.middle.position} />
                  ) : null}
                </>
              )}
            </CartesianChart>
            <FloatingTooltip 
              isActive={isActive}
              x={state.x.position}
              y={state.y.middle.position}
              label={activeLabel}
            />
          </View>
        </View>

        {/* Weekly Usage Card */}
        <WeeklyUsageCard />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCard: {
    position: 'relative',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  closeButtonBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4, // Reduced from 6 to 4
    marginBottom: 12,
  },
  ecoWarriorContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 0.45,
  },
  flipCardContainer: {
    flex: 0.48, // Increased from 0.47 to 0.48
  },
  flipCard: {
    height: 140,
    position: 'relative',
  },
  flipSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipBack: {
    transform: [{ rotateY: '180deg' }],
  },
  flipCardFace: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flipFacePadding: {
    padding: 20,
  },
  summaryCardTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryCardTitleSmall: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryCardHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
  summaryCardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  summaryCardChange: {
    fontSize: 11,
    color: '#1E824C',
    marginLeft: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
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
  currentUsageSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  currentUsageValue: {
    fontSize: 15,
    color: '#1E824C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartWrapper: {
    height: 200,
    width: '100%',
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
});

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return (
    <Circle cx={x} cy={y} r={8} color="#1E824C">
      <Paint color="#FFF" style="stroke" strokeWidth={4} />
    </Circle>
  );
}

function FloatingTooltip({ isActive, x, y, label }: { isActive: boolean; x: SharedValue<number>; y: SharedValue<number>; label: string; }) {
  const tooltipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (x?.value || 0) - 28 },
      { translateY: (y?.value || 0) - 40 },
    ],
    opacity: isActive ? 1 : 0,
  }));
  return (
    <Animated.View style={[{
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.75)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    }, tooltipStyle]}>
      <Text style={{ color: '#fff', fontSize: 12 }}>{label}</Text>
    </Animated.View>
  );
}
