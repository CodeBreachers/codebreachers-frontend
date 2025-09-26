import { db } from '@/config/firebase';
import { setHourlyData } from '@/store/energySlice';
import { useAppDispatch } from '@/store/hooks';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface HourlyDataPoint {
  x: string; // Hour label (e.g., "00", "01", "02", etc.)
  y: number; // kWh value
  ts?: string; // ISO timestamp for this hour (optional)
  tms?: number; // epoch milliseconds for this hour (optional)
}

export function useHourlyUsage() {
  const [hourlyUsage, setHourlyUsage] = useState<HourlyDataPoint[] | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Generate document ID using device ID + current date
    const deviceId = 'fUHcfEQMJsd7Vdvt5A1a';
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const documentId = `${deviceId}_${dateString}`;
    const docRef = doc(db, 'hourlyAggregates', documentId);
    
    console.log(`📄 Setting up hourly usage subscription: ${documentId}`);
    
    const buildZeroHourly = (): HourlyDataPoint[] => {
      const zeros: HourlyDataPoint[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const localDate = new Date(year, currentDate.getMonth(), currentDate.getDate(), hour, 0, 0, 0);
        zeros.push({
          x: String(hour).padStart(2, '0'),
          y: 0,
          ts: localDate.toISOString(),
          tms: localDate.getTime(),
        });
      }
      return zeros;
    };
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data: any = docSnapshot.data();
        
        // Convert hourly data to x,y format for graphing
        const hourlyDataPoints: HourlyDataPoint[] = [];
        
        // Loop through all 24 hours (H00 to H23)
        for (let hour = 0; hour < 24; hour++) {
          const hourKey = `H${String(hour).padStart(2, '0')}`; // H00, H01, H02, etc.
          
          const nested = data?.hours?.[hourKey]?.kwh;
          const flat = data[`hours.${hourKey}.kwh`];
          const kwhValue = (nested ?? flat ?? 0);
          
          const localDate = new Date(year, currentDate.getMonth(), currentDate.getDate(), hour, 0, 0, 0);
          const ts = localDate.toISOString();
          const tms = localDate.getTime();
          
          hourlyDataPoints.push({
            x: String(hour).padStart(2, '0'), // "00", "01", "02", etc.
            y: Number(Number(kwhValue).toFixed(6)), // Round to 6 decimal places
            ts,
            tms,
          });
        }
        
        // Update Redux store with hourly data
        dispatch(setHourlyData(hourlyDataPoints));
        setHourlyUsage(hourlyDataPoints);
      } else {
        console.log(`❌ Hourly usage document not found: ${documentId}`);
        const zeros = buildZeroHourly();
        dispatch(setHourlyData(zeros));
        setHourlyUsage(zeros);
      }
    }, (error) => {
      console.error('🔥 Hourly usage subscription error:', error);
      const zeros = buildZeroHourly();
      dispatch(setHourlyData(zeros));
      setHourlyUsage(zeros);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return hourlyUsage;
}
