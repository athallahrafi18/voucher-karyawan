import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { theme } from '../config/theme';
import { formatCurrency, formatDate } from '../utils/formatters';
import { isTablet, getFontSize, getSpacing } from '../utils/device';

export default function VoucherCard({ voucher, style }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'redeemed':
        return theme.colors.primary; // Gold
      case 'expired':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'redeemed':
        return 'Digunakan';
      case 'expired':
        return 'Kadaluarsa';
      default:
        return status;
    }
  };

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.voucherNumber, { fontSize: getFontSize(20) }]}>
            Voucher #{voucher.voucher_number}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(voucher.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(voucher.status)}
            </Text>
          </View>
        </View>

        <Text style={[styles.barcode, { fontSize: getFontSize(16) }]}>
          {voucher.barcode}
        </Text>

        <View style={styles.details}>
          <Text style={[styles.nominal, { fontSize: getFontSize(18) }]}>
            {formatCurrency(voucher.nominal || 10000)}
          </Text>
          <Text style={[styles.date, { fontSize: getFontSize(14) }]}>
            {formatDate(voucher.issue_date)}
          </Text>
        </View>

        {voucher.redeemed_by && (
          <View style={styles.redeemInfo}>
            <Text style={[styles.redeemText, { fontSize: getFontSize(12) }]}>
              Digunakan oleh: {voucher.redeemed_by}
            </Text>
            {voucher.tenant_used && (
              <Text style={[styles.redeemText, { fontSize: getFontSize(12) }]}>
                Di: {voucher.tenant_used}
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: getSpacing(theme.spacing.sm),
    elevation: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  voucherNumber: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  barcode: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: 'monospace',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  nominal: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  date: {
    color: theme.colors.textSecondary,
  },
  redeemInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  redeemText: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

