import { useAppSelector } from '@/store/hooks';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TodayUsageCard() {
  const energyState = useAppSelector((state) => state.energy);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    
    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity 
      onPress={handleFlip}
      activeOpacity={0.8}
    >
      <View style={[styles.summaryCard, styles.cardContainer]}>
        {/* Front side - Cost */}
        <Animated.View style={[styles.card, styles.cardSide, styles.flipFacePadding, frontAnimatedStyle]}>
          <Text style={styles.summaryCardTitle}>Today's Usage</Text>
          <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>₹ {energyState.billingInfo.todayCost.toFixed(2)}</Text>
          <Text style={styles.summaryCardHint}>Tap to view in kWh</Text>
        </Animated.View>

        {/* Back side - kWh */}
        <Animated.View style={[styles.card, styles.cardSide, styles.cardBack, styles.flipFacePadding, backAnimatedStyle]}>
          <Text style={styles.summaryCardTitle}>Today's Usage</Text>
          <Text style={styles.summaryCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{energyState.billingInfo.todayUsage.toFixed(2)} kWh</Text>
          <Text style={styles.summaryCardHint}>Tap to view in ₹</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  summaryCard: {
    flex: 0.45,
  },
  cardContainer: {
    height: 100,
    position: 'relative',
  },
  cardSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  flipFacePadding: {
    padding: 20,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryCardHint: {
    fontSize: 12,
    color: '#999',
  },
});
