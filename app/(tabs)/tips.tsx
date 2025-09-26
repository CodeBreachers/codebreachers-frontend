import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TipsScreen() {
  const tips = [
    {
      id: 1,
      title: "Use appliances in off-peak hours",
      icon: "clock.fill",
      savings: "12%",
      color: "#1E824C",
      actionLink: "Learn more in our blog post →"
    },
   
    {
      id: 2,
      title: "Consider setting your AC timer to turn off after 3 hours at night",
      icon: "thermometer",
      savings: "20%",
      color: "#1E824C"
    },
    {
      id: 3,
      title: "Unplug chargers when not in use",
      icon: "powerplug.fill",
      savings: "2%",
      color: "#1E824C"
    },
    
    {
      id: 4,
      title: "Run dishwashers and washing machines only with full loads",
      icon: "washer.fill",
      savings: "14%",
      color: "#1E824C"
    },
    {
      id: 5,
      title: "Use smart power strips to eliminate phantom loads",
      icon: "bolt.fill",
      savings: "10%",
      color: "#1E824C",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header removed */}
        
        {/* Main Title */}
        <Text style={styles.mainTitle}>Energy-Saving Tips</Text>

        {/* Tips List */}
        {tips.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <IconSymbol size={24} name={tip.icon} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipSavings}>Save {tip.savings} monthly</Text>
              {tip.actionLink && (
                <TouchableOpacity onPress={() => Linking.openURL('https://example.com')} style={styles.actionLinkContainer}>
                  <Text style={styles.actionLink}>{tip.actionLink}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  tipSavings: {
    fontSize: 14,
    color: '#1E824C',
    fontWeight: '500',
    marginBottom: 8,
  },
  actionLinkContainer: {
    marginLeft: -56, // Align with icon start (40px icon + 16px margin)
  },
  actionLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
