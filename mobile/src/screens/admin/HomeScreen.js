import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { voucherAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatDate, getTodayDate } from '../../utils/formatters';
import { isTablet, getFontSize, getSpacing } from '../../utils/device';
import StatsCard from '../../components/StatsCard';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(null);
  const today = getTodayDate();

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getDailyReport(today);
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyReport();
    setRefreshing(false);
  };

  const handleGenerateVoucher = () => {
    navigation.navigate('GenerateVoucher');
  };

  const handleViewReport = () => {
    navigation.navigate('Report');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View>
              <Text style={[styles.dateLabel, { fontSize: getFontSize(14) }]}>
                Tanggal Hari Ini
              </Text>
              <Text style={[styles.dateValue, { fontSize: getFontSize(28) }]}>
                {formatDate(today)}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="calendar-today"
              size={isTablet() ? 48 : 40}
              color={theme.colors.primary}
            />
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, { minHeight: isTablet() ? 72 : 64 }]}
          onPress={handleGenerateVoucher}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="ticket-percent"
            size={isTablet() ? 32 : 28}
            color="#fff"
          />
          <Text style={[styles.generateButtonText, { fontSize: getFontSize(20) }]}>
            Generate Voucher Hari Ini
          </Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        {loading && !report ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <StatsCard
              title="Total Generated"
              value={report?.total_generated || 0}
              icon="ticket-outline"
              color={theme.colors.primary}
            />
            <StatsCard
              title="Total Redeemed"
              value={report?.total_redeemed || 0}
              icon="check-circle"
              color={theme.colors.success}
            />
            <StatsCard
              title="Total Unused"
              value={report?.total_unused || 0}
              icon="clock-outline"
              color={theme.colors.warning}
            />
            {report && (
              <View style={styles.rateContainer}>
                <Text style={[styles.rateLabel, { fontSize: getFontSize(16) }]}>
                  Redemption Rate
                </Text>
                <Text style={[styles.rateValue, { fontSize: getFontSize(32) }]}>
                  {report.redemption_rate}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* View Report Button */}
        <TouchableOpacity
          style={[styles.reportButton, { minHeight: isTablet() ? 56 : 48 }]}
          onPress={handleViewReport}
          activeOpacity={0.8}
        >
          <Text style={[styles.reportButtonText, { fontSize: getFontSize(16) }]}>
            Lihat Laporan Lengkap
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={isTablet() ? 24 : 20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  dateLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  generateButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    elevation: 3,
    gap: theme.spacing.md,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  loader: {
    marginVertical: theme.spacing.xl,
  },
  rateContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    elevation: 2,
  },
  rateLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  rateValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  reportButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  reportButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

