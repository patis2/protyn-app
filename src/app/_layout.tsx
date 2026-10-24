import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../data/store';
import { Button, Loading, Note, Screen, Txt } from '../ui/components';
import { Logo } from '../ui/icons';
import { ToastProvider, useColors } from '../ui/theme';

function Gate({ children }: { children: React.ReactNode }) {
  const { status, error, retry, resetDamaged } = useStore();
  if (status === 'loading') return <Loading label="Opening Protyn" />;
  if (status === 'error')
    return (
      <Screen>
        <Logo size={56} />
        <Txt variant="screen">We couldn’t open your data</Txt>
        <Note tone="error">{error}</Note>
        <Txt variant="muted">Try again first. If it keeps happening, you can start fresh on this device. Starting fresh deletes the data saved here.</Txt>
        <Button label="Try again" onPress={retry} block />
        <Button label="Start fresh on this device" kind="ghost" onPress={resetDamaged} block />
      </Screen>
    );
  return <>{children}</>;
}

function Nav() {
  const c = useColors();
  const modal = { presentation: 'modal' as const, contentStyle: { backgroundColor: c.bg } };
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe" options={modal} />
      <Stack.Screen name="swap" options={modal} />
      <Stack.Screen name="plate" options={modal} />
      <Stack.Screen name="shopping" options={modal} />
      <Stack.Screen name="workout" options={{ presentation: 'fullScreenModal', contentStyle: { backgroundColor: c.bg } }} />
      <Stack.Screen name="edit-habits" options={modal} />
      <Stack.Screen name="measure" options={modal} />
      <Stack.Screen name="export" options={modal} />
      <Stack.Screen name="delete" options={modal} />
      <Stack.Screen name="reward" options={modal} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const [loaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        {!loaded && !fontError ? (
          <Loading label="Opening Protyn" />
        ) : (
          <StoreProvider>
            <ToastProvider>
              <Gate>
                <Nav />
              </Gate>
            </ToastProvider>
          </StoreProvider>
        )}
      </View>
    </SafeAreaProvider>
  );
}
