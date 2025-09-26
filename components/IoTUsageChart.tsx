import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ENERGY_DATA from '@/data/energyUsageData.json';
import { Circle, LinearGradient, Paint, vec } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, SharedValue, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { Area, CartesianChart, Line, useChartPressState } from 'victory-native';

const screenWidth = Dimensions.get('window').width;

interface IoTUsageChartProps {
  title?: string;
  subtitle?: string;
  showArea?: boolean;
  showLine?: boolean;
  color?: string;
}

export function IoTUsageChart({ 
  title = "Energy Usage Chart", 
  subtitle = "kWH consumption over time",
  showArea = true,
  showLine = true,
  color = "#1E824C"
}: IoTUsageChartProps) {
  // Chart press state for interactions
  const { state, isActive } = useChartPressState({ x: '', y: { y: 0 } });

  // React state for label to avoid reading SharedValue during render
  const [activeLabel, setActiveLabel] = useState('0.00 kWh');

  // Update label when shared value changes without reading during render
  useAnimatedReaction(
    () => state.y.y.value?.value ?? 0,
    (val) => {
      if (typeof val === 'number') {
        runOnJS(setActiveLabel)(`${val.toFixed(2)} kWh`);
      }
    }
  );

  return (
    <ThemedView style={styles.graphContainer}>
      <ThemedText style={styles.graphTitle}>{title}</ThemedText>
      <View style={styles.chartContainer}>
        <CartesianChart 
          data={ENERGY_DATA} 
          xKey="x" 
          yKeys={["y"]}
          domain={{ y: [0, 3] }}
          chartPressState={state}
          padding={{ top: 24, bottom: 12, left: 0, right: 0 }}
        >
          {({ points, chartBounds }) => (
            <>
              {showArea && (
                <Area
                  curveType="linear"
                  points={points.y}
                  connectMissingData
                  y0={chartBounds.bottom}
                >
                  <LinearGradient
                    start={vec(0, chartBounds.top)}
                    end={vec(0, chartBounds.bottom)}
                    colors={["rgba(30, 130, 76, 0.55)", "rgba(30, 130, 76, 0.18)", "rgba(30, 130, 76, 0.02)"]}
                  />
                </Area>
              )}
              {/* Removed glow line to avoid halo/bulge */}
              {showLine && (
                <Line
                  points={points.y}
                  curveType="linear"
                  strokeWidth={1}
                  connectMissingData
                  animate={{ type: "timing", duration: 500 }}
                >
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(chartBounds.right, 0)}
                    colors={[color, color]}
                  />
                </Line>
              )}
              {/* No static line points */}
              {isActive ? (
                <ToolTip x={state.x.position} y={state.y.y.position} />
              ) : null}
            </>
          )}
        </CartesianChart>
        <FloatingTooltip 
          isActive={isActive}
          x={state.x.position}
          y={state.y.y.position}
          label={activeLabel}
        />
      </View>
      <ThemedText style={styles.graphSubtitle}>{subtitle}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    height: 220,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
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
      <ThemedText style={{ color: '#fff', fontSize: 12 }}>{label}</ThemedText>
    </Animated.View>
  );
}
