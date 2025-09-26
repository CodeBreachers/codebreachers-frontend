import Slider from '@react-native-community/slider'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { IconSymbol } from '../ui/icon-symbol'

interface IndividualUsageProps {
  applianceName: string
  index: number
  hours: number
  setHours: (hours: number) => void
}

const IndividualUsage = ({ applianceName, index, hours, setHours }: IndividualUsageProps) => {
  return (
    <View
      style={[styles.individualUsageCard]}
    >
      <View style={styles.individualUsageHeader}>
        <View style={styles.individualUsageLabelContainer}>
          <Text style={styles.individualUsageLabel}>{applianceName} #{index + 1}</Text>
          <Text style={styles.individualUsageSubtitle}>Daily Usage</Text>
        </View>
        <View style={styles.individualHoursContainer}>
          <Text style={styles.individualHoursText}>{Math.round(hours)} <Text style={styles.individualHoursUnit}>hrs</Text></Text>
        </View>
      </View>
      <View style={styles.individualUsageContent}>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.individualSlider}
            minimumValue={0}
            maximumValue={24}
            value={hours}
            step={1}
            onValueChange={setHours}
            minimumTrackTintColor="#1E824C"
            maximumTrackTintColor="#1E824C"
            thumbTintColor="#1E824C"
          />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0h</Text>
          <Text style={styles.sliderLabel}>24h</Text>
        </View>
      </View>
    </View>
  )
}

const UsageItem = ({hours, setHours, applianceName, applianceIcon, brand}: {hours: number, setHours: (hours: number) => void, applianceName: string, applianceIcon: string, brand?: string}) => {
  const [count, setCount] = useState(1)
  const [individualHours, setIndividualHours] = useState([8]) // Default hours for each instance
  // const [isExpanded, setIsExpanded] = useState(true)

  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, count + delta)
    setCount(newCount)
    
    // Adjust individual hours array when count changes
    if (newCount > count) {
      // Adding more instances
      setIndividualHours([...individualHours, 0]) // Default new instance to 4 hours
    } else if (newCount < count) {
      // Removing instances
      const removedHours = individualHours[newCount] // Get hours of the instance being removed
      setIndividualHours(individualHours.slice(0, newCount))
      setHours(hours - removedHours)
    }
  }

  const handleIndividualHoursChange = (index: number, newHours: number) => {
    const updatedHours = [...individualHours]
    updatedHours[index] = newHours
    setIndividualHours(updatedHours)
    
    // Update the main hours to be the average
    const averageHours = updatedHours.reduce((sum, h) => sum + h, 0)
    setHours(averageHours)
  }

  const totalHours = individualHours.reduce((sum, h) => sum + h, 0)

  return (
    <View style={styles.container}>
      {/* Main Appliance Card */}
      <View
        style={styles.mainCard}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol size={24} name={applianceIcon as any} color="#1E824C" />
          </View>
          <View style={styles.applianceInfo}>
            <View style={styles.applianceNameContainer}>
            <Text style={styles.applianceName}>{applianceName}</Text>
            {brand && <Text style={styles.applianceBrand}>{brand}</Text>}
            </View>
            <Text style={styles.applianceSubtitle}>
              {totalHours}h total
            </Text>
          </View>
          <View style={styles.countStepper}>
            <Pressable
              style={[styles.countButton, count === 1 && styles.countButtonDisabled]}
              onPress={() => handleCountChange(-1)}
              disabled={count === 1}
            >
              <IconSymbol 
                name="minus" 
                size={16} 
                color={count === 1 ? "#9CA3AF" : "#1E824C"} 
              />
            </Pressable>
            <View style={styles.countValueContainer}>
              <Text style={styles.countValue}>{count}</Text>
            </View>
            <Pressable 
              style={styles.countButton}
              onPress={() => handleCountChange(1)}
            >
              <IconSymbol name="plus" size={16} color="#1E824C" />
            </Pressable>
          </View>
        </View>
      </View>
      {true && (
        <View style={styles.individualUsageContainer}>
          {individualHours.map((individualHours, index) => (
            <IndividualUsage
              key={index}
              applianceName={applianceName}
              index={index}
              hours={individualHours}
              setHours={(hours) => handleIndividualHoursChange(index, hours)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

export default UsageItem;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  mainCard: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#F0F8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#1E824C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applianceInfo: {
    flex: 1,
    marginRight: 12,
  },
  applianceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  applianceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  applianceBrand: {
    fontSize: 12,
    color: '#8b8b8b',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applianceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  countStepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countButton: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  countButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  countButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  countButtonTextPlus: {
    color: '#FFFFFF',
  },
  countButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  countValueContainer: {
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  countValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  expandIndicator: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
  },
  individualUsageContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  individualUsageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  individualUsageCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },
  individualUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  individualUsageLabelContainer: {
    flex: 1,
  },
  individualUsageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  individualUsageSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  individualHoursContainer: {
    alignItems: 'flex-end',
  },
  individualHoursText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E824C',
  },
  individualHoursUnit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: -2,
  },
  individualUsageContent: {
    flexDirection: 'column',
    width: '100%',
  },
  sliderContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    width: '100%',
  },
  sliderProgress: {
    height: 6,
    backgroundColor: '#1E824C',
    borderRadius: 3,
  },
  individualSlider: {
    width: '100%',
    height: 20,
    marginHorizontal: 0,
    transform: [{ scaleX: 1.05 }], // This scales the width by 5% (approximately 10px)
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  sliderTrackStyle: {
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E824C',
    shadowColor: '#1E824C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});