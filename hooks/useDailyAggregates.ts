import { db } from '@/config/firebase';
import { setDailyAggregatesData, setMonthlyAggregatesData } from '@/store/energySlice';
import { useAppDispatch } from '@/store/hooks';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface DailyDataPoint {
  x: string; // Day label (e.g., "15", "16", "17", etc.)
  y: number; // kWh value
  ts?: string; // ISO date for this day (optional)
  tms?: number; // epoch milliseconds for this day (optional)
}

export function useDailyAggregates() {
  const [dailyAggregates, setDailyAggregates] = useState<DailyDataPoint[] | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Generate document ID using device ID + current year-month
    const deviceId = 'fUHcfEQMJsd7Vdvt5A1a';
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = currentDate.getDate();
    
    const documentId = `${deviceId}_${year}-${month}`;
    const docRef = doc(db, 'dailyAggregates', documentId);
    
    console.log(`📄 Setting up daily aggregates subscription: ${documentId}`);
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data: any = docSnapshot.data();
        
        // Get last 7 days data for 1W view
        const dailyDataPoints: DailyDataPoint[] = [];
        
        // Calculate the range of days to fetch (last 7 days including today)
        const startDay = Math.max(1, currentDay - 6); // Don't go below day 1
        const endDay = currentDay;
        
        for (let day = startDay; day <= endDay; day++) {
          const dayKey = `D${String(day).padStart(2, '0')}`; // D01, D02, D22, etc.
          const kwhValue = (data?.days?.[dayKey]?.kwh ?? data[`days.${dayKey}.kwh`] ?? 0);
          
          const localDate = new Date(year, currentDate.getMonth(), day, 0, 0, 0, 0);
          const ts = localDate.toISOString();
          const tms = localDate.getTime();
          
          dailyDataPoints.push({
            x: String(day), // "15", "16", "22", etc.
            y: Number(Number(kwhValue).toFixed(6)), // Round to 6 decimal places
            ts,
            tms,
          });
        }
        
        // Get all days data for 1M view
        const monthlyDataPoints: DailyDataPoint[] = [];
        
        // Get days in current month (1 to 30/31)
        const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = `D${String(day).padStart(2, '0')}`; // D01, D02, D22, etc.
          const kwhValue = (data?.days?.[dayKey]?.kwh ?? data[`days.${dayKey}.kwh`] ?? 0);
          
          const localDate = new Date(year, currentDate.getMonth(), day, 0, 0, 0, 0);
          const ts = localDate.toISOString();
          const tms = localDate.getTime();
          
          monthlyDataPoints.push({
            x: String(day), // "1", "2", "22", etc.
            y: Number(Number(kwhValue).toFixed(6)), // Round to 6 decimal places
            ts,
            tms,
          });
        }
        
        // Update Redux store with both weekly and monthly data
        dispatch(setDailyAggregatesData(dailyDataPoints));
        dispatch(setMonthlyAggregatesData(monthlyDataPoints));
        
        setDailyAggregates(dailyDataPoints);
      } else {
        console.log(`❌ Daily aggregates document not found: ${documentId}`);
        setDailyAggregates(null);
      }
    }, (error) => {
      console.error('🔥 Daily aggregates subscription error:', error);
      setDailyAggregates(null);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return dailyAggregates;
}
