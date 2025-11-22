import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { isTablet, getFontSize, getPadding } from '../utils/device';

export default function StatsCard({ title, value, icon, color, style }) {
  const tablet = isTablet();
  
  return (
    <Card style={[styles.card, style]}>
      <Card.Content style={[styles.content, tablet ? styles.contentHorizontal : styles.contentVertical]}>
        <View style={[styles.iconContainer, { 
          backgroundColor: color + '20',
          borderColor: color + '50',
        }]}>
          <MaterialCommunityIcons name={icon} size={tablet ? 32 : 24} color={color} />
        </View>
        <View style={styles.textContainer}>
          {Array.isArray(title) ? (
            <View>
              {title.map((line, index) => (
                <Text 
                  key={index}
                  style={[
                    styles.title, 
                    { fontSize: tablet ? getFontSize(12) : 10 },
                    index > 0 && styles.titleSecondLine
                  ]}
                  numberOfLines={1}
                >
                  {line}
                </Text>
              ))}
            </View>
          ) : (
            <Text 
              style={[styles.title, { fontSize: tablet ? getFontSize(12) : 10 }]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {title}
            </Text>
          )}
          <Text style={[styles.value, { fontSize: tablet ? getFontSize(22) : 16 }]}>{value}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: theme.spacing.xs,
    elevation: 6,
    minWidth: isTablet() ? '31%' : '30%',
    maxWidth: isTablet() ? '32%' : '31%',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary + '60',
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    padding: getPadding(isTablet() ? theme.spacing.md : theme.spacing.xs),
    minHeight: isTablet() ? 80 : 90,
  },
  contentHorizontal: {
    flexDirection: 'row',
  },
  contentVertical: {
    flexDirection: 'column',
  },
  iconContainer: {
    width: isTablet() ? 56 : 36,
    height: isTablet() ? 56 : 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet() ? theme.spacing.md : 0,
    marginBottom: isTablet() ? 0 : theme.spacing.xs,
    borderWidth: 1.5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: isTablet() ? 'flex-start' : 'center',
    width: isTablet() ? 'auto' : '100%',
  },
  title: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontSize: isTablet() ? getFontSize(12) : 9,
    fontWeight: '500',
    textAlign: isTablet() ? 'left' : 'center',
  },
  titleSecondLine: {
    marginTop: -4,
    marginBottom: 0,
  },
  value: {
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: isTablet() ? getFontSize(22) : 18,
    textAlign: isTablet() ? 'left' : 'center',
  },
});

