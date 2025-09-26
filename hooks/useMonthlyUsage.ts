import { db } from '@/config/firebase';
import { setMonthlyInfo } from '@/store/energySlice';
import { useAppDispatch } from '@/store/hooks';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useMonthlyUsage() {
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null);
  const dispatch = useAppDispatch();

  // KSEB Bill Calculation Function
  const calculateKSEBBill = (kwhUnits: number): number => {
    // Use kWh directly as units (no multiplication)
    const units = kwhUnits;
    
    let totalAmount = 0;
    
    if (units <= 300) {
      // 0-300 units: ₹6.40 per unit
      totalAmount = units * 6.40;
    } else if (units <= 350) {
      // First 300 units at ₹6.40, remaining at ₹7.25
      totalAmount = (300 * 6.40) + ((units - 300) * 7.25);
    } else if (units <= 400) {
      // First 300 at ₹6.40, next 50 at ₹7.25, remaining at ₹7.60
      totalAmount = (300 * 6.40) + (50 * 7.25) + ((units - 350) * 7.60);
    } else if (units <= 500) {
      // First 300 at ₹6.40, next 50 at ₹7.25, next 50 at ₹7.60, remaining at ₹7.90
      totalAmount = (300 * 6.40) + (50 * 7.25) + (50 * 7.60) + ((units - 400) * 7.90);
    } else {
      // First 300 at ₹6.40, next 50 at ₹7.25, next 50 at ₹7.60, next 100 at ₹7.90, remaining at ₹8.80
      totalAmount = (300 * 6.40) + (50 * 7.25) + (50 * 7.60) + (100 * 7.90) + ((units - 500) * 8.80);
    }
    
    return totalAmount;
  };

  useEffect(() => {
    // Generate document ID using device ID + current year
    const deviceId = 'fUHcfEQMJsd7Vdvt5A1a';
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12
    const monthKey = `M${String(month).padStart(2, '0')}`; // M01, M02, ..., M09, M10, M11, M12
    
    const documentId = `${deviceId}_${year}`;
    const docRef = doc(db, 'monthlyAggregates', documentId);
    
    console.log(`📄 Setting up monthly usage subscription: ${documentId}, month: ${monthKey}`);
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Read from flattened structure: "months.M09.kwh"
        const monthKwhKey = `months.${monthKey}.kwh`;
        const monthImpulsesKey = `months.${monthKey}.impulses`;
        
        console.log(`🔍 Looking for key: ${monthKwhKey}`);
        
        if (data[monthKwhKey] !== undefined) {
          const currentMonthKwh = data[monthKwhKey];
          
          // Calculate expected bill based on daily average projected to full month
          const currentDate = new Date();
          const currentDayOfMonth = currentDate.getDate(); // 1-31
          
          // Calculate units per day from current monthly total
          const unitsPerDay = currentMonthKwh / currentDayOfMonth;
          
          // Project for full month (30 days)
          const projectedMonthlyUnits = unitsPerDay * 30;
          
          // Calculate expected bill from projected monthly usage
          const expectedBill = calculateKSEBBill(projectedMonthlyUnits);
          
          // Keep current month kWh as is for display
          const unitsConsumed = currentMonthKwh;
          
          // Update Redux store with monthly usage data
          dispatch(setMonthlyInfo({
            monthlyTotalKwh: currentMonthKwh,
            monthlyTotalUnits: unitsConsumed,
            expectedBill: expectedBill,
            year: year,
            month: String(month).padStart(2, '0'),
          }));
          
          setMonthlyUsage(currentMonthKwh);
          console.log(`📊 Monthly Usage (${monthKey}): ${currentMonthKwh} kWh | Day ${currentDayOfMonth} | Units/Day: ${unitsPerDay.toFixed(4)} | Projected Month: ${projectedMonthlyUnits.toFixed(2)} kWh | Expected Bill: ₹${expectedBill.toFixed(2)}`);
        } else {
          console.log(`❌ Monthly data not found for key: ${monthKwhKey} in document: ${documentId}`);
          setMonthlyUsage(null);
        }
      } else {
        console.log(`❌ Monthly usage document not found: ${documentId}`);
        setMonthlyUsage(null);
      }
    }, (error) => {
      console.error('🔥 Monthly usage subscription error:', error);
      setMonthlyUsage(null);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  return monthlyUsage;
}
