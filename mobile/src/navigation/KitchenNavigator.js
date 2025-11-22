import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { isTablet } from '../utils/device';

import ScannerScreen from '../screens/kitchen/ScannerScreen';
import ValidationScreen from '../screens/kitchen/ValidationScreen';
import HistoryScreen from '../screens/kitchen/HistoryScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function KitchenTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, isTablet() ? 12 : 8);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: (isTablet() ? 72 : 60) + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.primary + '40',
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: isTablet() ? 14 : 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function KitchenNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="KitchenTabs"
        component={KitchenTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Validation"
        component={ValidationScreen}
        options={{
          title: 'Validasi Voucher',
          headerStyle: { backgroundColor: theme.colors.secondary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: isTablet() ? 20 : 18 },
        }}
      />
    </Stack.Navigator>
  );
}

