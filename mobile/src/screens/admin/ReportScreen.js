import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { voucherAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatDate, formatDateTime, getTodayDate } from '../../utils/formatters';
import { isTablet, getFontSize } from '../../utils/device';
import VoucherCard from '../../components/VoucherCard';
import Navbar from '../../components/Navbar';

export default function ReportScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchReport();
  }, []);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const date = formatDateForAPI(selectedDate);
      
      const [reportResponse, detailsResponse] = await Promise.all([
        voucherAPI.getDailyReport(date),
        voucherAPI.getVoucherDetails(date),
      ]);

      if (reportResponse.success) {
        setReport(reportResponse.data);
      }

      if (detailsResponse.success) {
        setVouchers(detailsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      // Error handling sudah di interceptor, tidak perlu Alert di sini
      // User akan melihat loading state yang hilang jika error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReport();
    setRefreshing(false);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      // Fetch new data when date changes
      setTimeout(() => {
        fetchReport();
      }, 100);
    }
  };

  const renderVoucherItem = ({ item }) => (
    <VoucherCard voucher={item} />
  );

  return (
    <View style={styles.container}>
      <Navbar
        title="Laporan"
        subtitle="Data Voucher Harian"
        icon="chart-bar"
        backgroundColor={theme.colors.primary}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Picker */}
        <Card style={styles.dateCard}>
          <Card.Content>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={isTablet() ? 24 : 20}
                color={theme.colors.primary}
              />
              <Text style={[styles.dateText, { fontSize: getFontSize(18) }]}>
                {formatDate(formatDateForAPI(selectedDate))}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Summary Cards */}
        {loading && !report ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : report ? (
          <>
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={[styles.summaryLabel, { fontSize: getFontSize(14) }]}>
                    Total Generated
                  </Text>
                  <Text style={[styles.summaryValue, { fontSize: getFontSize(32) }]}>
                    {report.total_generated}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={[styles.summaryLabel, { fontSize: getFontSize(14) }]}>
                    Total Redeemed
                  </Text>
                  <Text style={[styles.summaryValue, { fontSize: getFontSize(32), color: theme.colors.success }]}>
                    {report.total_redeemed}
                  </Text>
                  <Text style={[styles.summaryPercentage, { fontSize: getFontSize(12) }]}>
                    {report.redemption_rate}
                  </Text>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={[styles.summaryLabel, { fontSize: getFontSize(14) }]}>
                    Total Unused
                  </Text>
                  <Text style={[styles.summaryValue, { fontSize: getFontSize(32), color: theme.colors.warning }]}>
                    {report.total_unused}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={[styles.summaryLabel, { fontSize: getFontSize(14) }]}>
                    Total Expired
                  </Text>
                  <Text style={[styles.summaryValue, { fontSize: getFontSize(32), color: theme.colors.error }]}>
                    {report.total_expired}
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Redemption Rate Progress */}
            <Card style={styles.progressCard}>
              <Card.Content>
                <Text style={[styles.progressLabel, { fontSize: getFontSize(16) }]}>
                  Redemption Rate
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${parseFloat(report.redemption_rate)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressValue, { fontSize: getFontSize(24) }]}>
                  {report.redemption_rate}
                </Text>
              </Card.Content>
            </Card>

            {/* By Tenant */}
            <Card style={styles.tenantCard}>
              <Card.Content>
                <Text style={[styles.tenantTitle, { fontSize: getFontSize(18) }]}>
                  Penggunaan per Tenant
                </Text>
                <View style={styles.tenantRow}>
                  <Text style={[styles.tenantLabel, { fontSize: getFontSize(16) }]}>
                    Martabak Rakan:
                  </Text>
                  <Text style={[styles.tenantValue, { fontSize: getFontSize(16) }]}>
                    {report.by_tenant['Martabak Rakan'] || 0}
                  </Text>
                </View>
                <View style={styles.tenantRow}>
                  <Text style={[styles.tenantLabel, { fontSize: getFontSize(16) }]}>
                    Mie Aceh Rakan:
                  </Text>
                  <Text style={[styles.tenantValue, { fontSize: getFontSize(16) }]}>
                    {report.by_tenant['Mie Aceh Rakan'] || 0}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Voucher Details List */}
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { fontSize: getFontSize(20) }]}>
                Detail Voucher
              </Text>
            </View>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>
                Belum ada data untuk tanggal ini
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Voucher List */}
      {vouchers.length > 0 && (
        <FlatList
          data={vouchers}
          renderItem={renderVoucherItem}
          keyExtractor={(item) => item.barcode}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>
                  Belum ada voucher
                </Text>
              </Card.Content>
            </Card>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  dateCard: {
    margin: theme.spacing.md,
    elevation: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dateText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  loader: {
    marginVertical: theme.spacing.xl,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    elevation: 2,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  summaryPercentage: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  progressCard: {
    margin: theme.spacing.md,
    elevation: 2,
  },
  progressLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.success,
  },
  progressValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  tenantCard: {
    margin: theme.spacing.md,
    elevation: 2,
  },
  tenantTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tenantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  tenantLabel: {
    color: theme.colors.textSecondary,
  },
  tenantValue: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  listTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  emptyCard: {
    margin: theme.spacing.md,
    elevation: 1,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

