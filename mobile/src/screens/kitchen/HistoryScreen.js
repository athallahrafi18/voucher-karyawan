import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getScanHistory } from '../../utils/storage';
import { theme } from '../../config/theme';
import { formatDateTime } from '../../utils/formatters';
import { isTablet, getFontSize } from '../../utils/device';
import StatusBadge from '../../components/StatusBadge';

const FILTERS = ['All', 'Valid', 'Invalid'];

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getScanHistory();
    setHistory(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Valid') return item.status === 'valid';
    if (filter === 'Invalid') return item.status !== 'valid';
    return true;
  });

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

      {/* History List */}
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
                Belum ada riwayat scan hari ini
              </Text>
            </Card.Content>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
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
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    margin: theme.spacing.xl,
    elevation: 1,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
    elevation: 2,
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

