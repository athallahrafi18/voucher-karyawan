import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { voucherAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatDateTime, formatDate, formatDateForAPI } from '../../utils/formatters';
import { isTablet, getFontSize, getPadding, getSpacing } from '../../utils/device';
import StatusBadge from '../../components/StatusBadge';
import Navbar from '../../components/Navbar';
import logger from '../../utils/logger';

const FILTERS = ['All', 'Valid', 'Invalid'];

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [selectedDate, filter])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const dateStr = formatDateForAPI(selectedDate); // Use YYYY-MM-DD format for API
      // Backend only returns redeemed vouchers (valid scans)
      // Invalid scans are not tracked in database
      const response = await voucherAPI.getScanHistory(dateStr, 'all');
      
      if (response.success) {
        let historyData = response.data || [];
        
        // Filter by status on frontend (since backend only returns redeemed vouchers)
        if (filter === 'Valid') {
          historyData = historyData.filter(item => item.status === 'valid');
        } else if (filter === 'Invalid') {
          // Invalid scans are not stored in database, so this will be empty
          historyData = [];
        }
        // 'All' shows all redeemed vouchers
        
        setHistory(historyData);
      } else {
        setHistory([]);
      }
    } catch (error) {
      logger.error('Error loading scan history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  // History is already filtered by backend, no need to filter again
  const filteredHistory = history;

  const renderHistoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemLeft}>
            <MaterialCommunityIcons
              name="ticket-percent"
              size={isTablet() ? 24 : 20}
              color={theme.colors.primary}
            />
            <View style={styles.itemInfo}>
              <Text style={[styles.barcode, { fontSize: getFontSize(16) }]}>
                {item.barcode}
              </Text>
              <Text style={[styles.timestamp, { fontSize: getFontSize(12) }]}>
                {formatDateTime(item.timestamp)}
              </Text>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {item.tenant && (
          <View style={styles.itemDetail}>
            <Text style={[styles.detailText, { fontSize: getFontSize(14) }]}>
              Tenant: {item.tenant}
            </Text>
          </View>
        )}

        {item.staffName && (
          <View style={styles.itemDetail}>
            <Text style={[styles.detailText, { fontSize: getFontSize(14) }]}>
              Staff: {item.staffName}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Navbar
        title="Riwayat Scan"
        subtitle="History Voucher"
        icon="history"
        backgroundColor={theme.colors.secondary}
      />
      {/* Date Filter */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={isTablet() ? 24 : 20}
            color={theme.colors.primary}
          />
          <Text style={[styles.dateText, { fontSize: getFontSize(14) }]}>
            {formatDate(selectedDate)}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={isTablet() ? 20 : 16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterText,
                { fontSize: getFontSize(14) },
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {/* History List */}
      {loading && history.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { fontSize: getFontSize(14) }]}>
            Memuat riwayat scan...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.barcode}-${index}`}
          contentContainerStyle={
            filteredHistory.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="history"
                  size={isTablet() ? 64 : 48}
                  color={theme.colors.textSecondary}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>
                  Belum ada riwayat scan pada tanggal {formatDate(selectedDate)}
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
  dateFilterContainer: {
    padding: getPadding(theme.spacing.md),
    paddingBottom: theme.spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  dateText: {
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: getPadding(theme.spacing.md),
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: getPadding(theme.spacing.md),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    margin: theme.spacing.xl,
    elevation: 2,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: getSpacing(theme.spacing.sm),
    elevation: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  barcode: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  timestamp: {
    color: theme.colors.textSecondary,
  },
  itemDetail: {
    marginTop: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
  },
});

