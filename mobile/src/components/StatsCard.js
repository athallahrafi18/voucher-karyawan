import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { isTablet, getFontSize } from '../utils/device';

export default function StatsCard({ title, value, icon, color, style }) {
  return (
    <Card style={[styles.card, style]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={isTablet() ? 32 : 28} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: getFontSize(14) }]}>{title}</Text>
          <Text style={[styles.value, { fontSize: getFontSize(24) }]}>{value}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: theme.spacing.sm,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: isTablet() ? 56 : 48,
    height: isTablet() ? 56 : 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

