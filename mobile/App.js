import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { VoucherProvider } from './src/contexts/VoucherContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={{
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            surface: theme.colors.surface,
            text: theme.colors.text,
            onSurface: theme.colors.text,
            onBackground: theme.colors.text,
            placeholder: theme.colors.textSecondary,
            disabled: theme.colors.textSecondary + '60',
          },
          dark: true,
        }}>
          <AuthProvider>
            <VoucherProvider>
              <StatusBar style="light" translucent={false} />
              <AppNavigator />
            </VoucherProvider>
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

