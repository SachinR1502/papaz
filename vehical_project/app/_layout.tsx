import '@/utils/node-polyfill';
import { NotoSans_400Regular, NotoSans_700Bold, NotoSans_900Black, useFonts } from '@expo-google-fonts/noto-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CallOverlay from '@/components/screens/CallOverlay';
import { AdminProvider } from '@/context/AdminContext';
import { AuthProvider } from '@/context/AuthContext';
import { CallProvider } from '@/context/CallContext';
import { ChatProvider } from '@/context/ChatContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LogBox } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(['Expo AV has been deprecated']);

export const unstable_settings = {
  anchor: '(auth)',
};

import { ProviderComposer } from '@/components/ProviderComposer';
import { NetworkStatusBar } from '@/components/ui/NetworkStatusBar';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'NotoSans-Regular': NotoSans_400Regular,
    'NotoSans-Bold': NotoSans_700Bold,
    'NotoSans-Black': NotoSans_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const providers = [
    AuthProvider,
    AdminProvider,
    CallProvider,
    ChatProvider,
    LanguageProvider,
    NotificationProvider,
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProviderComposer providers={providers}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <NetworkStatusBar />
            <Slot />
            <CallOverlay />
            <StatusBar style="auto" />
          </ThemeProvider>
        </ProviderComposer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
