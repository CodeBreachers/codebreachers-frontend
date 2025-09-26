import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsageData {
  timestamp: string;
  value: number; // kWh
  cost: number; // in rupees
}

interface WeeklyUsage {
  day: string;
  usage: number; // kWh
  cost: number; // in rupees
  morning: number; // kWh
  evening: number; // kWh
  night: number; // kWh
}

interface BillingInfo {
  expectedBill: number;
  todayUsage: number;
  todayCost: number;
  weeklyTotal: number;
  weeklyCost: number;
  percentageChange: number; // percentage lower/higher than expected
}

interface MonthlyInfo {
  monthlyTotalKwh: number;
  monthlyTotalUnits: number;
  expectedBill: number;
  year: number;
  month: string;
}

interface HourlyDataPoint {
  x: string; // Hour label (e.g., "00", "01", "02", etc.)
  y: number; // kWh value
  ts?: string; // ISO timestamp for this hour (optional)
  tms?: number; // epoch milliseconds for this hour (optional)
}

interface DailyDataPoint {
  x: string; // Day label (e.g., "15", "16", "17", etc.)
  y: number; // kWh value
  ts?: string; // ISO date for this day (optional)
  tms?: number; // epoch milliseconds for this day (optional)
}

interface AnomalyAlert {
  detected: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface EnergyState {
  currentUsage: number; // current kWh
  usageData: UsageData[];
  weeklyUsage: WeeklyUsage[];
  billingInfo: BillingInfo;
  monthlyInfo: MonthlyInfo;
  monthlyBudget: number;
  hourlyData: HourlyDataPoint[];
  dailyAggregatesData: DailyDataPoint[];
  monthlyAggregatesData: DailyDataPoint[];
  anomalyAlert: AnomalyAlert;
  selectedTimeRange: '1D' | '1W' | '1M';
  loading: boolean;
  error: string | null;
}

const initialState: EnergyState = {
  currentUsage: 12.5,
  usageData: [
    { timestamp: '12a', value: 0.8, cost: 4.0 },
    { timestamp: '3a', value: 0.6, cost: 3.0 },
    { timestamp: '6a', value: 1.2, cost: 6.0 },
    { timestamp: '9a', value: 1.8, cost: 9.0 },
    { timestamp: '12p', value: 1.5, cost: 7.5 },
    { timestamp: '3p', value: 1.3, cost: 6.5 },
    { timestamp: '6p', value: 1.7, cost: 8.5 },
    { timestamp: '9p', value: 1.1, cost: 5.5 },
  ],
  weeklyUsage: [
    { day: 'Mon', usage: 45, cost: 225, morning: 15, evening: 20, night: 10 },
    { day: 'Tue', usage: 52, cost: 260, morning: 18, evening: 22, night: 12 },
    { day: 'Wed', usage: 48, cost: 240, morning: 16, evening: 20, night: 12 },
    { day: 'Thu', usage: 55, cost: 275, morning: 20, evening: 25, night: 10 },
    { day: 'Fri', usage: 50, cost: 250, morning: 18, evening: 22, night: 10 },
    { day: 'Sat', usage: 60, cost: 300, morning: 25, evening: 25, night: 10 },
    { day: 'Sun', usage: 65, cost: 325, morning: 30, evening: 25, night: 10 },
  ],
  billingInfo: {
    expectedBill: 750.00,
    todayUsage: 12.5,
    todayCost: 12.50,
    weeklyTotal: 375,
    weeklyCost: 1875,
    percentageChange: -15, // 15% lower
  },
  monthlyInfo: {
    monthlyTotalKwh: 1560,
    monthlyTotalUnits: 1560,
    expectedBill: 750.00,
    year: new Date().getFullYear(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
  },
  monthlyBudget: 0,
  hourlyData: [],
  dailyAggregatesData: [],
  monthlyAggregatesData: [],
  anomalyAlert: {
    detected: true,
    message: 'Today\'s usage has gone over your budget.',
    severity: 'medium',
  },
  selectedTimeRange: '1D',
  loading: false,
  error: null,
};

const energySlice = createSlice({
  name: 'energy',
  initialState,
  reducers: {
    setCurrentUsage: (state, action: PayloadAction<number>) => {
      state.currentUsage = action.payload;
    },
    setUsageData: (state, action: PayloadAction<UsageData[]>) => {
      state.usageData = action.payload;
    },
    setWeeklyUsage: (state, action: PayloadAction<WeeklyUsage[]>) => {
      state.weeklyUsage = action.payload;
    },
    setBillingInfo: (state, action: PayloadAction<BillingInfo>) => {
      state.billingInfo = action.payload;
    },
    setMonthlyInfo: (state, action: PayloadAction<MonthlyInfo>) => {
      state.monthlyInfo = action.payload;
    },
    setMonthlyBudget: (state, action: PayloadAction<number>) => {
      state.monthlyBudget = action.payload;
    },
    setHourlyData: (state, action: PayloadAction<HourlyDataPoint[]>) => {
      state.hourlyData = action.payload;
    },
    setDailyAggregatesData: (state, action: PayloadAction<DailyDataPoint[]>) => {
      state.dailyAggregatesData = action.payload;
    },
    setMonthlyAggregatesData: (state, action: PayloadAction<DailyDataPoint[]>) => {
      state.monthlyAggregatesData = action.payload;
    },
    setAnomalyAlert: (state, action: PayloadAction<AnomalyAlert>) => {
      state.anomalyAlert = action.payload;
    },
    setSelectedTimeRange: (state, action: PayloadAction<'1D' | '1W' | '1M'>) => {
      state.selectedTimeRange = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    dismissAnomalyAlert: (state) => {
      state.anomalyAlert.detected = false;
    },
    restoreAnomalyAlert: (state) => {
      state.anomalyAlert.detected = true;
    },
  },
});

export const {
  setCurrentUsage,
  setUsageData,
  setWeeklyUsage,
  setBillingInfo,
  setMonthlyInfo,
  setMonthlyBudget,
  setHourlyData,
  setDailyAggregatesData,
  setMonthlyAggregatesData,
  setAnomalyAlert,
  setSelectedTimeRange,
  setLoading,
  setError,
  clearError,
  dismissAnomalyAlert,
  restoreAnomalyAlert,
} = energySlice.actions;

export default energySlice.reducer;
