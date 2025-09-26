const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

async function populateImpulseBatches() {
  try {
    console.log('🚀 Starting to populate impulseBatches collection...');
    
    const deviceId = "fUHcfEQMJsd7Vdvt5A1a";
    const today = new Date();
    
    // Set to start of today (00:00)
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Populating data for today: ${today.toDateString()}`);
    console.log(`📱 Device ID: ${deviceId}`);
    
    // Create 24 documents (one for each hour of the day)
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(today);
      timestamp.setHours(hour, 0, 0, 0); // Set to the specific hour
      
      const impulseData = {
        deviceId: deviceId,
        impulseCount: 10, // 10 impulses per hour as requested
        timestamp: Timestamp.fromDate(timestamp),
        impulseBatches: [
          {
            batchId: `batch_${hour}_1`,
            impulses: 5,
            timestamp: Timestamp.fromDate(new Date(timestamp.getTime() + 30 * 60 * 1000)) // 30 minutes into the hour
          },
          {
            batchId: `batch_${hour}_2`,
            impulses: 5,
            timestamp: Timestamp.fromDate(new Date(timestamp.getTime() + 60 * 60 * 1000)) // End of hour
          }
        ]
      };
      
      // Add document to impulseBatches collection
      const docRef = await addDoc(collection(db, 'impulseBatches'), impulseData);
      
      console.log(`✅ Added hour ${hour.toString().padStart(2, '0')}:00 - Document ID: ${docRef.id}`);
    }
    
    console.log('🎉 Successfully populated impulseBatches collection with 24 documents!');
    console.log('📊 Total documents created: 24');
    console.log('⚡ Total impulses: 240 (10 per hour × 24 hours)');
    
  } catch (error) {
    console.error('❌ Error populating impulseBatches collection:', error);
  }
}

// Run the script
populateImpulseBatches()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
