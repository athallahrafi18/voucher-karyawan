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

const STATUS_FILTERS = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Redeemed', value: 'redeemed' },
  { label: 'Expired', value: 'expired' },
];

export default function ReportScreen() {
  const [useDateRange, setUseDateRange] = useState(false); // Default: single date (hari ini)
  const [startDate, setStartDate] = useState(new Date()); // Default: hari ini
  const [endDate, setEndDate] = useState(new Date()); // Default: hari ini
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all'); // Default: Semua Status
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, selectedStatus, useDateRange]);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = useDateRange ? formatDateForAPI(endDate) : null;
      
      const [reportResponse, detailsResponse] = await Promise.all([
        voucherAPI.getDailyReport(startDateStr, endDateStr, selectedStatus),
        voucherAPI.getVoucherDetails(startDateStr, endDateStr, selectedStatus),
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

  const handleStartDateChange = (event, date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
      // If using single date mode, also update endDate
      if (!useDateRange) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateChange = (event, date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
      // Ensure endDate is not before startDate
      if (date < startDate) {
        setStartDate(date);
      }
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
        {/* Filter Section */}
        <Card style={styles.filterCard}>
          <Card.Content>
            {/* Date Range Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={[styles.filterLabel, { fontSize: getFontSize(14) }]}>
                Mode Filter:
              </Text>
              <View style={styles.toggleButtons}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !useDateRange && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setUseDateRange(false);
                    setEndDate(startDate); // Reset endDate to startDate
                  }}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { fontSize: getFontSize(14) },
                      !useDateRange && styles.toggleButtonTextActive,
                    ]}
                  >
                    Tanggal Tunggal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    useDateRange && styles.toggleButtonActive,
                  ]}
                  onPress={() => setUseDateRange(true)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { fontSize: getFontSize(14) },
                      useDateRange && styles.toggleButtonTextActive,
                    ]}
                  >
                    Range Tanggal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker(s) */}
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={isTablet() ? 24 : 20}
                  color={theme.colors.primary}
                />
                <View style={styles.dateInfo}>
                  <Text style={[styles.dateLabel, { fontSize: getFontSize(12) }]}>
                    {useDateRange ? 'Dari Tanggal' : 'Tanggal'}
                  </Text>
                  <Text style={[styles.dateText, { fontSize: getFontSize(16) }]}>
                    {formatDate(startDate)}
                  </Text>
                </View>
              </TouchableOpacity>

              {useDateRange && (
                <>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={isTablet() ? 24 : 20}
                    color={theme.colors.textSecondary}
                  />
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={isTablet() ? 24 : 20}
                      color={theme.colors.primary}
                    />
                    <View style={styles.dateInfo}>
                      <Text style={[styles.dateLabel, { fontSize: getFontSize(12) }]}>
                        Sampai Tanggal
                      </Text>
                      <Text style={[styles.dateText, { fontSize: getFontSize(16) }]}>
                        {formatDate(endDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Status Filter */}
            <View style={styles.statusContainer}>
              <Text style={[styles.filterLabel, { fontSize: getFontSize(14) }]}>
                Status:
              </Text>
              <View style={styles.statusButtons}>
                {STATUS_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    style={[
                      styles.statusButton,
                      selectedStatus === filter.value && styles.statusButtonActive,
                    ]}
                    onPress={() => setSelectedStatus(filter.value)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { fontSize: getFontSize(14) },
                        selectedStatus === filter.value && styles.statusButtonTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate}
          />
        )}

        {/* Period Info */}
        {report && (
          <Card style={styles.periodCard}>
            <Card.Content>
              <Text style={[styles.periodText, { fontSize: getFontSize(14) }]}>
                {useDateRange 
                  ? `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`
                  : `Tanggal: ${formatDate(startDate)}`}
                {selectedStatus !== 'all' && ` | Status: ${STATUS_FILTERS.find(f => f.value === selectedStatus)?.label || selectedStatus}`}
              </Text>
            </Card.Content>
          </Card>
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
                {useDateRange 
                  ? `Belum ada data untuk periode ${formatDate(startDate)} - ${formatDate(endDate)}`
                  : `Belum ada data untuk tanggal ${formatDate(startDate)}`}
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
  filterCard: {
    margin: theme.spacing.md,
    elevation: 2,
  },
  toggleContainer: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: theme.spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
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
  periodCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    elevation: 1,
    backgroundColor: theme.colors.primary + '10',
  },
  periodText: {
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

