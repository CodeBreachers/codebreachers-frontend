import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface EcoWarriorChallengeCardProps {
  onPress?: () => void;
  isVisible?: boolean;
  onDismiss?: () => void;
}

export default function EcoWarriorChallengeCard({ onPress, isVisible = true, onDismiss }: EcoWarriorChallengeCardProps) {
  const [internalVisible, setInternalVisible] = useState(true);
  
  // Reset internal visibility when external visibility changes to true
  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
    }
  }, [isVisible]);
  
  // Use external visibility if provided, otherwise use internal state
  const shouldShow = isVisible && internalVisible;
  
  const handleDismiss = () => {
    setInternalVisible(false);
    onDismiss?.();
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.card}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
        <View style={styles.closeButtonBackground}>
          <IconSymbol size={12} name="xmark" color="#666" />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.title}>Eco Warrior Challenge</Text>
          <Text style={styles.description}>Beat your last bill by ₹100 to win a special prize.</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>View Details</Text>
          <IconSymbol size={16} name="arrow.right" color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Background leaf icon (SVG) */}
      <View style={styles.backgroundIcon}>
        <Svg viewBox="0 -960 960 960" style={styles.leafIcon}>
          <Path
            d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z"
            fill="#1E824C"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E8E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 100,
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
  content: {
    position: 'relative',
    zIndex: 2,
  },
  textContent: {
    marginBottom: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4D1B',
    marginBottom: 8,
    fontFamily: 'System',
  },
  description: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6B9B6B',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  backgroundIcon: {
    position: 'absolute',
    bottom: -12,
    right: 0,
    opacity: 0.4,
    zIndex: 1,
  },
  leafIcon: {
    width: 100,
    height: 100,
  },
});