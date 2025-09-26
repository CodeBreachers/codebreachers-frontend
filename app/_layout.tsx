import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, Text as RNText, TextInput as RNTextInput } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Apply a consistent global font family across all Text and TextInput components
const defaultFontFamily = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

if ((RNText as any).defaultProps == null) (RNText as any).defaultProps = {};
(RNText as any).defaultProps.style = [
  (RNText as any).defaultProps.style,
  { fontFamily: defaultFontFamily },
];

if ((RNTextInput as any).defaultProps == null) (RNTextInput as any).defaultProps = {};
(RNTextInput as any).defaultProps.style = [
  (RNTextInput as any).defaultProps.style,
  { fontFamily: defaultFontFamily },
];

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications not granted');
      }
    }
    requestPermissions();

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
