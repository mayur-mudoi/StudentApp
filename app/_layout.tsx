import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  console.log('Font loaded:', loaded, 'Auth loading:', authLoading, 'User:', user);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Wait until auth state is initialized and fonts are loaded
    if (!authLoading || !loaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (user) {
      // If user is authenticated, redirect to the main app (tabs)
      // if they are not already there.
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    } else if (segments[0] !== 'login') {
      // If user is not authenticated, redirect to the login screen
      // if they are not already there.
      router.replace('/login');
    }
  }, [authLoading, user, loaded, segments]);

  // Show a loading indicator while waiting for auth and fonts
  if (!loaded || !authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'black'} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* These are the main routes of the app */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <DataProvider>
      <AuthProvider>
          <RootLayoutNav />
      </AuthProvider>
    </DataProvider>
  );
}