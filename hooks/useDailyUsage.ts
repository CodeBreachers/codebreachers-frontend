import { db } from '@/config/firebase';
import { setBillingInfo } from '@/store/energySlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';


//TODO-consider whole month unit expense to understand slab later
export function useDailyUsage() {
  const [dailyUsage, setDailyUsage] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const monthlyInfo = useAppSelector((state) => state.energy.monthlyInfo);

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
    // Generate document ID using device ID + current date
    const deviceId = 'fUHcfEQMJsd7Vdvt5A1a';
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const documentId = `${deviceId}_${dateString}`;
    const docRef = doc(db, 'hourlyAggregates', documentId);
    
    console.log(`📄 Setting up daily usage subscription: ${documentId}`);
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const totalKwh = data.totalKwh;
        const billAmount = calculateKSEBBill(totalKwh);
        
        // Keep kWh as is for frontend display
        const unitsConsumed = totalKwh;
        
        // Use monthly expected bill if available, otherwise fallback to default
        const expectedBill = monthlyInfo.expectedBill > 0 ? monthlyInfo.expectedBill : 750.00;
        
        // Calculate weekly total including today's usage
        // Weekly should be approximately 1/4 of monthly (7 days out of ~30 days)
        // Use a base of 70 kWh for the week (roughly 1/4 of 286 monthly)
        const baseWeeklyTotal = 70; // Previous 6 days total
        const weeklyTotalWithToday = baseWeeklyTotal + unitsConsumed;
        
        // Update Redux store with today's usage data
        dispatch(setBillingInfo({
          expectedBill: expectedBill, // Use monthly expected bill
          todayUsage: unitsConsumed, // Send units instead of kWh
          todayCost: billAmount,
          weeklyTotal: weeklyTotalWithToday, // Include today's usage
          weeklyCost: 1750, // Keep existing weekly cost
          percentageChange: -15, // Keep existing percentage change
        }));
        
        setDailyUsage(totalKwh);
        console.log(`⚡ Today's Usage: ${totalKwh} kWh | Bill: ₹${billAmount.toFixed(2)}`);
      } else {
        console.log('❌ Today\'s usage document not found');
        setDailyUsage(null);
      }
    }, (error) => {
      console.error('🔥 Daily usage subscription error:', error);
      setDailyUsage(null);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [dispatch, monthlyInfo.expectedBill]);

  return dailyUsage;
}
