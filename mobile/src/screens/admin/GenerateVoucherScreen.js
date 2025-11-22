import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, ActivityIndicator, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { voucherAPI, employeeAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatCurrency, formatDate, getTodayDate } from '../../utils/formatters';
import { getPrinterSettings } from '../../utils/storage';
import { isTablet, getFontSize, getPadding, getSpacing } from '../../utils/device';
import logger from '../../utils/logger';

export default function GenerateVoucherScreen() {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [issueDate, setIssueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [printerIp, setPrinterIp] = useState('192.168.110.10');
  const [printerPort, setPrinterPort] = useState(9100);

  useEffect(() => {
    loadEmployees();
    loadPrinterSettings();
  }, [issueDate]);

  const loadPrinterSettings = async () => {
    const settings = await getPrinterSettings();
    setPrinterIp(settings.printer_ip);
    setPrinterPort(settings.printer_port);
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const date = formatDateForAPI(issueDate);
      const response = await employeeAPI.getAll(date);
      if (response.success) {
        setEmployees(response.data);
        // Auto-select employees without voucher today
        const withoutVoucher = response.data
          .filter(emp => !emp.has_voucher_today)
          .map(emp => emp.id);
        setSelectedEmployeeIds(withoutVoucher);
      }
    } catch (error) {
      logger.error('Error loading employees:', error);
      Alert.alert('Error', 'Gagal memuat data karyawan');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIssueDate(selectedDate);
    }
  };

  const toggleEmployee = (employeeId) => {
    if (selectedEmployeeIds.includes(employeeId)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employeeId));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, employeeId]);
    }
  };

  const toggleSelectAll = () => {
    const withoutVoucher = employees
      .filter(emp => !emp.has_voucher_today && emp.is_active)
      .map(emp => emp.id);
    
    if (selectedEmployeeIds.length === withoutVoucher.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(withoutVoucher);
    }
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGenerate = async () => {
    if (selectedEmployeeIds.length === 0) {
      Alert.alert('Error', 'Pilih minimal 1 karyawan');
      return;
    }

    if (selectedEmployeeIds.length > 100) {
      Alert.alert('Error', 'Maksimal 100 karyawan per batch');
      return;
    }

    try {
      setLoading(true);
      
      // Generate vouchers
      const generateResponse = await voucherAPI.generate(selectedEmployeeIds, formatDateForAPI(issueDate));
      
      if (!generateResponse.success) {
        throw new Error(generateResponse.message || 'Gagal generate voucher');
      }

      const vouchers = generateResponse.data.vouchers;
      const count = vouchers.length;
      const skipped = generateResponse.data.skipped || 0;

      if (count === 0) {
        Alert.alert(
          'Info',
          'Semua karyawan yang dipilih sudah memiliki voucher hari ini',
          [{ text: 'OK' }]
        );
        setLoading(false);
        loadEmployees(); // Refresh list
        return;
      }

      // Print vouchers directly from mobile app (LAN printer - must use direct print)
      // Backend print API won't work because printer is on local LAN, not accessible from cloud
      setPrinting(true);
      try {
        const { printVouchers } = require('../../utils/printer');
        const printResult = await printVouchers(vouchers, printerIp, printerPort);
        const printedCount = printResult.printedCount;
        const printErrors = printResult.errors || [];
        
        if (printedCount === 0 && printErrors.length > 0) {
          // All prints failed - show detailed error
          const firstError = printErrors[0];
          let errorMessage = `Gagal mencetak semua voucher (0/${count}).\n\n`;
          
          // Check if thermal printer library not available
          if (firstError.error && (firstError.error.includes('Thermal Printer') || firstError.error.includes('tidak tersedia') || firstError.error.includes('Expo Go'))) {
            errorMessage += `⚠️ Thermal Printer library tidak tersedia.\n\n` +
                           `Pastikan:\n` +
                           `- Menggunakan APK build (bukan Expo Go)\n` +
                           `- APK sudah di-build dengan EAS Build\n` +
                           `- Native module react-native-thermal-receipt-printer terinstall\n\n`;
          } else {
            // Show detailed error from first failed print
            errorMessage += `Error: ${firstError.error}\n\n`;
            
            // Add troubleshooting tips based on error
            if (firstError.errorCode === 'ECONNREFUSED') {
              errorMessage += `Kemungkinan penyebab:\n` +
                             `- IP printer salah: ${printerIp}\n` +
                             `- Port salah: ${printerPort}\n` +
                             `- Printer tidak ON atau tidak siap\n\n`;
            } else if (firstError.errorCode === 'ETIMEDOUT' || firstError.errorCode === 'ENETUNREACH') {
              errorMessage += `Kemungkinan penyebab:\n` +
                             `- Printer dan tablet tidak di WiFi yang sama\n` +
                             `- IP printer tidak bisa dijangkau: ${printerIp}\n` +
                             `- Firewall memblokir koneksi\n\n`;
            } else {
              errorMessage += `Pastikan:\n` +
                             `- Printer terhubung ke jaringan yang sama dengan tablet\n` +
                             `- IP printer benar: ${printerIp}:${printerPort}\n` +
                             `- Printer dalam kondisi siap (on dan idle)\n` +
                             `- Tidak ada firewall yang memblokir koneksi\n\n`;
            }
          }
          
          errorMessage += `Voucher sudah tersimpan di database (${count} voucher).\n` +
                         `Anda bisa coba print lagi nanti.`;
          
          Alert.alert(
            'Gagal Print',
            errorMessage,
            [{ text: 'OK' }]
          );
        } else if (printedCount < count) {
          // Some prints failed
          let message = `${printedCount}/${count} voucher berhasil dicetak.`;
          if (printErrors.length > 0) {
            message += `\n\n${printErrors.length} voucher gagal dicetak.`;
            if (printErrors[0].error) {
              message += `\nError: ${printErrors[0].error}`;
            }
          }
          if (skipped > 0) {
            message += `\n(${skipped} karyawan sudah punya voucher hari ini)`;
          }
          
          Alert.alert(
            'Print Sebagian Berhasil',
            message,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.goBack();
                  navigation.getParent()?.navigate('Home');
                },
              },
            ]
          );
        } else {
          // All prints successful
          let message = `${printedCount} voucher berhasil dicetak!`;
          if (skipped > 0) {
            message += `\n(${skipped} karyawan sudah punya voucher hari ini)`;
          }
          
          Alert.alert(
            'Berhasil!',
            message,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.goBack();
                  navigation.getParent()?.navigate('Home');
                },
              },
            ]
          );
        }
      } catch (printError) {
        logger.error('Print error:', printError);
        let message = `${count} voucher berhasil dibuat di database`;
        if (skipped > 0) {
          message += `\n(${skipped} karyawan sudah punya voucher hari ini)`;
        }
        
        // Check if error is about TCP socket not available
        if (printError.message && (printError.message.includes('TCP Socket') || printError.message.includes('Expo Go'))) {
          message += `\n\n⚠️ TCP Socket library tidak tersedia.\n\n` +
                     `Untuk print langsung ke printer, Anda perlu:\n` +
                     `1. Build aplikasi dengan EAS Build\n` +
                     `2. Install APK yang sudah di-build\n\n` +
                     `Voucher sudah tersimpan di database dan bisa di-print nanti setelah build.`;
        } else {
          message += `\n\n⚠️ Gagal mencetak ke printer.\n\n` +
                     `Error: ${printError.message}\n\n` +
                     `Pastikan:\n` +
                     `- Printer terhubung ke jaringan yang sama\n` +
                     `- IP printer benar (${printerIp}:${printerPort})\n` +
                     `- Printer dalam kondisi siap\n\n` +
                     `Voucher sudah tersimpan di database.`;
        }
        
        Alert.alert(
          'Voucher Generated',
          message,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setPrinting(false);
        loadEmployees(); // Refresh list
      }
    } catch (error) {
      logger.error('Generate error:', error);
      Alert.alert('Error', error.message || 'Gagal generate voucher');
    } finally {
      setLoading(false);
    }
  };

  const count = selectedEmployeeIds.length;
  const totalNominal = count * 10000;
  const employeesWithoutVoucher = employees.filter(emp => !emp.has_voucher_today && emp.is_active);
  const allSelected = employeesWithoutVoucher.length > 0 && 
    selectedEmployeeIds.length === employeesWithoutVoucher.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Employee Selection Section */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerRow}>
                <Text style={[styles.label, { fontSize: getFontSize(16) }]}>
                  Pilih Karyawan
                </Text>
                {employeesWithoutVoucher.length > 0 && (
                  <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={toggleSelectAll}
                  >
                    <Text style={[styles.selectAllText, { fontSize: getFontSize(14) }]}>
                      {allSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingEmployees ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { fontSize: getFontSize(14) }]}>
                    Memuat data karyawan...
                  </Text>
                </View>
              ) : employees.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="account-off"
                    size={isTablet() ? 48 : 40}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.emptyText, { fontSize: getFontSize(14) }]}>
                    Belum ada data karyawan
                  </Text>
                  <TouchableOpacity
                    style={styles.addEmployeeButton}
                    onPress={() => navigation.navigate('Employee')}
                  >
                    <Text style={[styles.addEmployeeText, { fontSize: getFontSize(14) }]}>
                      Tambah Karyawan
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  style={styles.employeeList}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {employees.map((employee) => {
                    const isSelected = selectedEmployeeIds.includes(employee.id);
                    const hasVoucher = employee.has_voucher_today;
                    const isDisabled = hasVoucher || !employee.is_active;

                    return (
                      <TouchableOpacity
                        key={employee.id}
                        style={[
                          styles.employeeItem,
                          isSelected && styles.employeeItemSelected,
                          isDisabled && styles.employeeItemDisabled,
                        ]}
                        onPress={() => !isDisabled && toggleEmployee(employee.id)}
                        disabled={isDisabled}
                      >
                        <Checkbox
                          status={isSelected ? 'checked' : 'unchecked'}
                          onPress={() => !isDisabled && toggleEmployee(employee.id)}
                          disabled={isDisabled}
                          color={theme.colors.primary}
                        />
                        <View style={styles.employeeItemInfo}>
                          <Text style={[styles.employeeItemName, { fontSize: getFontSize(15) }]}>
                            {employee.name}
                          </Text>
                          {hasVoucher && (
                            <View style={styles.voucherBadge}>
                              <MaterialCommunityIcons name="ticket" size={12} color={theme.colors.success} />
                              <Text style={[styles.voucherBadgeText, { fontSize: getFontSize(11) }]}>
                                Sudah punya voucher hari ini
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={[styles.label, { fontSize: getFontSize(16), marginTop: theme.spacing.md }]}>
                Tanggal Voucher
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { height: isTablet() ? 56 : 48 }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, { fontSize: getFontSize(18) }]}>
                  {formatDate(formatDateForAPI(issueDate))}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={isTablet() ? 24 : 20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={issueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  maximumDate={new Date()}
                />
              )}
            </Card.Content>
          </Card>

          {/* Preview Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.previewTitle, { fontSize: getFontSize(18) }]}>
                Preview
              </Text>
              
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { fontSize: getFontSize(14) }]}>
                  Total Karyawan:
                </Text>
                <Text style={[styles.previewValue, { fontSize: getFontSize(16) }]}>
                  {count} karyawan
                </Text>
              </View>

              {count > 0 && (
                <View style={styles.selectedList}>
                  <Text style={[styles.previewLabel, { fontSize: getFontSize(14), marginBottom: theme.spacing.xs }]}>
                    Karyawan Terpilih:
                  </Text>
                  {selectedEmployeeIds.slice(0, 5).map((id) => {
                    const employee = employees.find(emp => emp.id === id);
                    return employee ? (
                      <Text key={id} style={[styles.selectedName, { fontSize: getFontSize(13) }]}>
                        • {employee.name}
                      </Text>
                    ) : null;
                  })}
                  {count > 5 && (
                    <Text style={[styles.selectedName, { fontSize: getFontSize(13), fontStyle: 'italic' }]}>
                      ... dan {count - 5} karyawan lainnya
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { fontSize: getFontSize(14) }]}>
                  Nominal per Voucher:
                </Text>
                <Text style={[styles.previewValue, { fontSize: getFontSize(16) }]}>
                  {formatCurrency(10000)}
                </Text>
              </View>

              <View style={[styles.previewRow, styles.totalRow]}>
                <Text style={[styles.previewLabel, { fontSize: getFontSize(16) }]}>
                  Total Nominal:
                </Text>
                <Text style={[styles.totalValue, { fontSize: getFontSize(20) }]}>
                  {formatCurrency(totalNominal)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              { minHeight: isTablet() ? 64 : 56 },
              (loading || printing) && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={loading || printing}
            activeOpacity={0.8}
          >
            {loading || printing ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.generateButtonText, { fontSize: getFontSize(18) }]}>
                  {printing ? 'Mencetak voucher...' : 'Generating...'}
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="printer" size={isTablet() ? 28 : 24} color="#fff" />
                <Text style={[styles.generateButtonText, { fontSize: getFontSize(18) }]}>
                  Generate & Print
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: getPadding(theme.spacing.md),
    paddingBottom: getPadding(theme.spacing.xl),
  },
  card: {
    marginBottom: getSpacing(theme.spacing.md),
    elevation: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    borderRadius: theme.borderRadius.md,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  selectAllButton: {
    padding: theme.spacing.xs,
  },
  selectAllText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  addEmployeeButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  addEmployeeText: {
    color: '#fff',
    fontWeight: '600',
  },
  employeeList: {
    maxHeight: isTablet() ? 400 : 250,
    marginTop: theme.spacing.sm,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  employeeItemSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  employeeItemDisabled: {
    opacity: 0.5,
  },
  employeeItemInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  employeeItemName: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  voucherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  voucherBadgeText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  selectedList: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    maxHeight: 200,
  },
  selectedName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  dateText: {
    color: theme.colors.text,
    flex: 1,
  },
  previewTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  previewLabel: {
    color: theme.colors.textSecondary,
  },
  previewValue: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  totalValue: {
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: getPadding(theme.spacing.md),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getSpacing(theme.spacing.sm),
    elevation: 3,
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

