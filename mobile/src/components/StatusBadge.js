import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import { isTablet, getFontSize } from '../utils/device';

export default function StatusBadge({ status, style }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'VALID',
          color: theme.colors.success,
          bgColor: theme.colors.success + '20',
        };
      case 'redeemed':
        return {
          label: 'SUDAH DIGUNAKAN',
          color: theme.colors.textSecondary,
          bgColor: theme.colors.textSecondary + '20',
        };
      case 'expired':
        return {
          label: 'KADALUARSA',
          color: theme.colors.warning,
          bgColor: theme.colors.warning + '20',
        };
      default:
        return {
          label: status?.toUpperCase() || 'UNKNOWN',
          color: theme.colors.error,
          bgColor: theme.colors.error + '20',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.color,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: config.color, fontSize: getFontSize(14) },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: 'bold',
  },
});

