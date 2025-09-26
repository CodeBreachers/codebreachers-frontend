import { db } from '@/config/firebase';
import { AppDispatch } from '@/store';
import { setDocumentCount, setError, setLoading, setReadingData } from '@/store/nodeMCUSlice';
import { collection, onSnapshot, query } from 'firebase/firestore';

export class ReduxNodeMCUService {
  private unsubscribe: (() => void) | null = null;

  startListening(dispatch: AppDispatch) {
    try {
      dispatch(setLoading(true));
      console.log('🔄 Starting Redux Firebase subscription...');
      
      // Remove limit to get all documents
      const q = query(collection(db, 'nodemcu'));
      
      console.log('🔍 Query created for collection: nodemcu (no limit)');
      
      this.unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(`📊 Redux update: Found ${querySnapshot.docs.length} documents`);
        
        // Process all documents and extract individual reading timestamps
        const readingData = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            name: docData.name,
            timestamp: docData.timestamp?.toDate() || new Date(),
            reading: docData.reading || {}
          };
        });
        
        // Extract individual reading timestamps from all documents
        const allReadingTimestamps: { timestamp: string; value: number; documentId: string }[] = [];
        let totalReadings = 0;
        
        readingData.forEach((doc, index) => {
          if (doc.reading) {
            console.log(`🔍 Processing document ${doc.id} readings:`, doc.reading);
            Object.entries(doc.reading).forEach(([key, readingData]: [string, any]) => {
              console.log(`📖 Reading ${key}:`, readingData);
              
              // Extract timestamp from each reading and convert to string for serialization
              const readingTimestamp = readingData.timestamp?.toDate() || doc.timestamp;
              const readingValue = readingData.value || 1; // Use actual value if available, default to 1
              
              console.log(`⏰ Reading timestamp:`, readingTimestamp, `Value:`, readingValue);
              
              allReadingTimestamps.push({
                timestamp: readingTimestamp.toISOString(), // Convert to string for Redux serialization
                value: readingValue,
                documentId: doc.id
              });
              totalReadings++;
            });
          }
          
          console.log(`📄 Document ${index + 1}: ${doc.id} - ${doc.reading ? Object.keys(doc.reading).length : 0} readings`);
        });
        
        // Sort all readings by timestamp (newest first)
        allReadingTimestamps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Sort documents by timestamp (newest first)
        readingData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Store both document data and individual reading timestamps (all serializable)
        const processedData = {
          documents: readingData.map(doc => ({
            id: doc.id,
            name: doc.name,
            timestamp: doc.timestamp.toISOString(), // Convert to string for serialization
            readingCount: doc.reading ? Object.keys(doc.reading).length : 0 // Store count instead of raw reading object
          })),
          individualReadings: allReadingTimestamps
        };
        
        dispatch(setReadingData(processedData));
        dispatch(setDocumentCount(totalReadings));
        
        console.log('✅ Redux total readings count updated:', totalReadings);
        console.log('📊 Redux reading data updated:', readingData.length, 'documents');
      }, (error) => {
        console.error('❌ Redux subscription error:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        dispatch(setError(`Firebase error: ${error.message}`));
      });
      
    } catch (error) {
      console.error('❌ Error starting Redux subscription:', error);
      dispatch(setError(`Setup error: ${error}`));
    }
  }

  stopListening() {
    if (this.unsubscribe) {
      console.log('🧹 Stopping Redux Firebase subscription');
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export const reduxNodeMCUService = new ReduxNodeMCUService();
