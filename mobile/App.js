import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { VoucherProvider } from './src/contexts/VoucherContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <VoucherProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </VoucherProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

