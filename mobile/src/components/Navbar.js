import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { isTablet, getFontSize } from '../utils/device';

export default function Navbar({ title, subtitle, icon, backgroundColor, showBack = false, onBackPress }) {
  const insets = useSafeAreaInsets();
  const bgColor = backgroundColor || theme.colors.primary;

  return (
    <View style={[styles.navbar, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={styles.navbarContent}>
        {showBack && onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={isTablet() ? 28 : 24}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={isTablet() ? 32 : 28}
            color="#fff"
            style={styles.icon}
          />
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: getFontSize(isTablet() ? 24 : 20) }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { fontSize: getFontSize(12) }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: isTablet() ? 64 : 56,
  },
  backButton: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
});

