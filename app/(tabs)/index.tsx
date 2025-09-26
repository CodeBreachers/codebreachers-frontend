import EnergyDashboard from '@/components/EnergyDashboard';
import { useDailyUsage } from '@/hooks/useDailyUsage';
import { LogBox } from "react-native";

// Ignore all log notifications

export default function HomeScreen() {
  // Subscribe to daily usage using custom hook - this updates Redux automatically
  useDailyUsage();

  LogBox.ignoreAllLogs(true);


  return (
    <EnergyDashboard />
  );
}
