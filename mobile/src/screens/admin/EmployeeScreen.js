import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Card, ActivityIndicator, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { employeeAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { isTablet, getFontSize } from '../../utils/device';

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const handleAdd = () => {
    Alert.prompt(
      'Tambah Karyawan',
      'Masukkan nama karyawan',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Simpan',
          onPress: async (name) => {
            if (!name || !name.trim()) {
              Alert.alert('Error', 'Nama karyawan harus diisi');
              return;
            }
            try {
              const response = await employeeAPI.create(name.trim());
              if (response.success) {
                Alert.alert('Berhasil', 'Karyawan berhasil ditambahkan');
                loadEmployees();
              }
            } catch (error) {
              console.error('Error adding employee:', error);
              Alert.alert('Error', error.response?.data?.message || 'Gagal menambahkan karyawan');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDelete = (employee) => {
    Alert.alert(
      'Hapus Karyawan',
      `Apakah Anda yakin ingin menghapus ${employee.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await employeeAPI.delete(employee.id);
              if (response.success) {
                Alert.alert('Berhasil', 'Karyawan berhasil dihapus');
                loadEmployees();
              }
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Error', 'Gagal menghapus karyawan');
            }
          },
        },
      ]
    );
  };

  const renderEmployee = ({ item }) => (
    <Card style={styles.employeeCard}>
      <Card.Content>
        <View style={styles.employeeRow}>
          <View style={styles.employeeInfo}>
            <Text style={[styles.employeeName, { fontSize: getFontSize(16) }]}>
              {item.name}
            </Text>
            {item.employee_code && (
              <Text style={[styles.employeeCode, { fontSize: getFontSize(12) }]}>
                Code: {item.employee_code}
              </Text>
            )}
            {item.has_voucher_today && (
              <View style={styles.voucherBadge}>
                <MaterialCommunityIcons name="ticket" size={14} color={theme.colors.success} />
                <Text style={[styles.voucherText, { fontSize: getFontSize(11) }]}>
                  Sudah punya voucher hari ini
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="delete" size={isTablet() ? 24 : 20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && employees.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-off"
              size={isTablet() ? 80 : 64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>
              Belum ada data karyawan
            </Text>
            <Text style={[styles.emptySubtext, { fontSize: getFontSize(14) }]}>
              Tekan tombol + untuk menambahkan
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAdd}
        label={isTablet() ? 'Tambah' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  employeeCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  employeeCode: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  voucherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  voucherText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

