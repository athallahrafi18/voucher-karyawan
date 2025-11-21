import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { employeeAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { isTablet, getFontSize } from '../../utils/device';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const handleLogin = async (role) => {
    if (role === ROLES.KITCHEN) {
      // For kitchen, show staff selection modal
      await loadEmployees();
      setShowStaffModal(true);
    } else {
      // For admin, login directly
      login(role);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.data.filter(emp => emp.is_active));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'Gagal memuat daftar staff');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSelectStaff = (employee) => {
    setShowStaffModal(false);
    login(ROLES.KITCHEN, employee.name);
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#7C3AED']}
      style={styles.container}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="ticket-percent"
          size={isTablet() ? 120 : 80}
          color="#fff"
          style={styles.icon}
        />
        <Text style={[styles.title, { fontSize: getFontSize(32) }]}>
          Voucher Rakan Kuphi
        </Text>
        <Text style={[styles.subtitle, { fontSize: getFontSize(18) }]}>
          Pilih Role Anda
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => handleLogin(ROLES.ADMIN)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account-tie"
              size={isTablet() ? 48 : 40}
              color="#fff"
            />
            <Text style={[styles.buttonText, { fontSize: getFontSize(24) }]}>
              ADMIN
            </Text>
            <Text style={[styles.buttonSubtext, { fontSize: getFontSize(14) }]}>
              Generate & Print Voucher
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.kitchenButton]}
            onPress={() => handleLogin(ROLES.KITCHEN)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="chef-hat"
              size={isTablet() ? 48 : 40}
              color="#fff"
            />
            <Text style={[styles.buttonText, { fontSize: getFontSize(24) }]}>
              KITCHEN
            </Text>
            <Text style={[styles.buttonSubtext, { fontSize: getFontSize(14) }]}>
              Scan & Redeem Voucher
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Staff Selection Modal for Kitchen */}
      <Modal
        visible={showStaffModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontSize: getFontSize(20) }]}>
                  Pilih Staff
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStaffModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={isTablet() ? 28 : 24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {loadingEmployees ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { fontSize: getFontSize(14) }]}>
                    Memuat daftar staff...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={employees}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.staffItem}
                      onPress={() => handleSelectStaff(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={isTablet() ? 24 : 20}
                        color={theme.colors.primary}
                      />
                      <View style={styles.staffInfo}>
                        <Text style={[styles.staffName, { fontSize: getFontSize(16) }]}>
                          {item.name}
                        </Text>
                        {item.employee_code && (
                          <Text style={[styles.staffCode, { fontSize: getFontSize(12) }]}>
                            {item.employee_code}
                          </Text>
                        )}
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={isTablet() ? 24 : 20}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <MaterialCommunityIcons
                        name="account-off"
                        size={isTablet() ? 48 : 40}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={[styles.emptyText, { fontSize: getFontSize(14) }]}>
                        Belum ada staff terdaftar
                      </Text>
                    </View>
                  }
                />
              )}
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  icon: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing.xl * 2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    gap: theme.spacing.lg,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minHeight: isTablet() ? 160 : 140,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  adminButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
  },
  kitchenButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  buttonSubtext: {
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.textSecondary + '20',
  },
  staffInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  staffName: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  staffCode: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

