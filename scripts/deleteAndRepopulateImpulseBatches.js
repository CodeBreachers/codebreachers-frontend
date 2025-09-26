const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdOMVBQawGW6Hp7SgZk_EgjmAiBTFDCjc",
  authDomain: "codebreachers-beta.firebaseapp.com",
  projectId: "codebreachers-beta",
  storageBucket: "codebreachers-beta.firebasestorage.app",
  messagingSenderId: "949400379468",
  appId: "1:949400379468:ios:d06f925f8194353dac54e9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function deleteAndRepopulateImpulseBatches() {
  try {
    console.log('🗑️  Deleting existing impulseBatches documents...');
    
    // First, delete all existing documents in impulseBatches collection
    const collectionRef = collection(db, 'impulseBatches');
    const querySnapshot = await getDocs(collectionRef);
    
    console.log(`📊 Found ${querySnapshot.size} documents to delete`);
    
    const deletePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(docSnapshot.ref));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All existing documents deleted');
    
    console.log('🚀 Starting to populate impulseBatches collection for last 1 month...');
    
    const deviceId = "fUHcfEQMJsd7Vdvt5A1a";
    const today = new Date();
    
    // Set to start of today (00:00)
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Populating data for last 30 days ending today: ${today.toDateString()}`);
    console.log(`📱 Device ID: ${deviceId}`);
    
    let totalDocuments = 0;
    let totalImpulses = 0;
    
    // Helper function to apply ±15% variation to base values
    const applyVariation = (baseValue) => {
      const variation = 0.15; // ±15%
      const randomMultiplier = 1 + (Math.random() - 0.5) * 2 * variation; // Range: 0.85 to 1.15
      return Math.max(1, Math.round(baseValue * randomMultiplier));
    };
    
    // Base impulse patterns for different hour ranges
    const getBaseImpulseCount = (hour, isWeekend = false) => {
      // Weekend multiplier
      const weekendFactor = isWeekend ? 1.2 : 1.0;
      
      if (hour >= 6 && hour <= 8) return Math.round(17 * weekendFactor); // Morning peak: ~17
      if (hour >= 18 && hour <= 22) return Math.round(23 * weekendFactor); // Evening peak: ~23
      if (hour >= 12 && hour <= 17) return Math.round(9 * weekendFactor); // Afternoon: ~9
      if (hour >= 9 && hour <= 11) return Math.round(6 * weekendFactor); // Late morning: ~6
      return Math.round(4 * weekendFactor); // Night/early morning: ~4
    };
    
    // Generate data for last 30 days (including today)
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - dayOffset);
      
      const dayOfWeek = currentDay.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      let dayLabel;
      if (dayOffset === 0) {
        dayLabel = "Today";
      } else if (dayOffset === 1) {
        dayLabel = "Yesterday";
      } else {
        dayLabel = `${dayOffset} days ago`;
      }
      
      console.log(`\n📅 Processing ${dayLabel} - ${dayName} ${isWeekend ? '(Weekend)' : '(Weekday)'}`);
      
      // Create 24 documents (one for each hour of the day)
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(currentDay);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Get base impulse count and apply ±15% variation
        const baseCount = getBaseImpulseCount(hour, isWeekend);
        const impulseCount = applyVariation(baseCount);
        
        const impulseData = {
          deviceId: deviceId,
          impulseCount: impulseCount,
          timestamp: Timestamp.fromDate(timestamp)
        };
        
        // Add document to impulseBatches collection
        const docRef = await addDoc(collection(db, 'impulseBatches'), impulseData);
        
        // Only log key hours to avoid spam
        if (hour % 6 === 0 || hour === 7 || hour === 19) {
          console.log(`✅ ${dayLabel} - Hour ${hour.toString().padStart(2, '0')}:00 - ${impulseCount} impulses (base: ${baseCount}) - Doc ID: ${docRef.id}`);
        }
        
        totalDocuments++;
        totalImpulses += impulseCount;
      }
      
      // Log daily summary
      const dailyTotal = Array.from({length: 24}, (_, hour) => {
        const baseCount = getBaseImpulseCount(hour, isWeekend);
        return applyVariation(baseCount);
      }).reduce((sum, count) => sum + count, 0);
      
      console.log(`📊 ${dayLabel} total: ~${Math.round(dailyTotal * 0.9)} - ${Math.round(dailyTotal * 1.1)} impulses`);
    }
    
    console.log('\n🎉 Successfully populated impulseBatches collection for 1 month!');
    console.log(`📊 Total documents created: ${totalDocuments}`);
    console.log(`⚡ Total impulses: ${totalImpulses}`);
    console.log('📋 Structure: 30 days × 24 hours with ±15% daily variation');
    console.log('🔥 Pattern: Morning peaks (6-8 AM), Evening peaks (6-10 PM)');
    console.log('📅 Weekend boost: 20% higher usage on weekends');
    console.log('🎲 Variation: Each hour has ±15% random variation from base pattern');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
deleteAndRepopulateImpulseBatches()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
