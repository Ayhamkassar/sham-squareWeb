import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { LocaleProvider, useLocale } from './src/i18n/LocaleContext';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';

import LoginScreen from './src/screens/LoginScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { ToastBanner } from './src/components/common';
import AuthNavigator from '@/navigation/AuthNavigation';

/** Applies `dir` attribute to the document root on web for full RTL support. */
function RtlBridge() {
  const { locale } = useLocale();
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}

/** Decides between the Login gate and the authenticated app shell. */
function Gate() {
  const { isLoggedIn, authLoading } = useAuth();
  const { theme } = useTheme();

  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
  <>
    <RtlBridge />
    <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />

    <NavigationContainer>
{isLoggedIn ? (
  <RootNavigator />
) : (
  <AuthNavigator />
)}
    </NavigationContainer>

    <ToastBanner />
  </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

/**
 * Provider order matters: Theme/Locale are pure UI concerns and sit outermost;
 * Toast must wrap Store because Store dispatches call showToast(); Auth is
 * independent of both and can sit anywhere above Gate.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <AuthProvider>
              <StoreProvider>
                <Gate />
              </StoreProvider>
            </AuthProvider>
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
