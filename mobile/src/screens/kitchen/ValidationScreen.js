import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { voucherAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { isTablet, getFontSize } from '../../utils/device';
import { updateScanHistory } from '../../utils/storage';
import StatusBadge from '../../components/StatusBadge';

const TENANTS = ['Martabak Rakan', 'Mie Aceh Rakan'];

export default function ValidationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [voucher, setVoucher] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(TENANTS[0]);

  useEffect(() => {
    if (barcode) {
      checkVoucher();
    }
  }, [barcode]);

  const checkVoucher = async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.check(barcode);
      setVoucher(response);
      
      // Update history status
      if (response.success && response.data?.can_redeem) {
        await updateScanHistory(barcode, { status: 'valid' });
      } else {
        await updateScanHistory(barcode, { status: 'invalid' });
      }
    } catch (error) {
      console.error('Error checking voucher:', error);
      Alert.alert('Error', 'Gagal memvalidasi voucher');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!staffName.trim()) {
      Alert.alert('Error', 'Nama staff harus diisi');
      return;
    }

    try {
      setRedeeming(true);
      const response = await voucherAPI.redeem(barcode, staffName.trim(), selectedTenant);
      
      if (response.success) {
        // Update scan history
        await updateScanHistory(barcode, {
          status: 'valid',
          staffName: staffName.trim(),
          tenant: selectedTenant,
          redeemedAt: new Date().toISOString(),
        });

        Alert.alert(
          'Berhasil!',
          'Voucher berhasil digunakan',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      Alert.alert('Error', error.response?.data?.message || 'Gagal menggunakan voucher');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { fontSize: getFontSize(16) }]}>
          Memvalidasi voucher...
        </Text>
      </View>
    );
  }

  if (!voucher) {
    return (
      <View style={styles.container}>
        <Text>No voucher data</Text>
      </View>
    );
  }

  const isValid = voucher.success && voucher.data?.can_redeem;
  const isRedeemed = voucher.data?.status === 'redeemed';
  const isExpired = voucher.data?.status === 'expired';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons
            name={isValid ? 'check-circle' : 'close-circle'}
            size={isTablet() ? 120 : 100}
            color={isValid ? theme.colors.success : theme.colors.error}
          />
          <StatusBadge
            status={voucher.data?.status}
            style={styles.statusBadge}
          />
        </View>

        {/* Voucher Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, { fontSize: getFontSize(18) }]}>
              Informasi Voucher
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Nomor Voucher:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(16) }]}>
                {voucher.data?.voucher_number || '-'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Barcode:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                {barcode}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Nominal:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(18), color: theme.colors.success }]}>
                {formatCurrency(voucher.data?.nominal || 10000)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Perusahaan:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                {voucher.data?.company_name || 'Rakan Kuphi'}
              </Text>
            </View>

            {voucher.data?.issue_date && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                  Tanggal Berlaku:
                </Text>
                <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                  {formatDate(voucher.data.issue_date)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Redeemed Info (if already used) */}
        {isRedeemed && voucher.data && (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <Text style={[styles.errorTitle, { fontSize: getFontSize(16) }]}>
                Voucher Sudah Digunakan
              </Text>
              {voucher.data.redeemed_at && (
                <Text style={[styles.errorText, { fontSize: getFontSize(14) }]}>
                  Digunakan: {formatDateTime(voucher.data.redeemed_at)}
                </Text>
              )}
              {voucher.data.redeemed_by && (
                <Text style={[styles.errorText, { fontSize: getFontSize(14) }]}>
                  Oleh: {voucher.data.redeemed_by}
                </Text>
              )}
              {voucher.data.tenant_used && (
                <Text style={[styles.errorText, { fontSize: getFontSize(14) }]}>
                  Di: {voucher.data.tenant_used}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Redeem Form (if valid) */}
        {isValid && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.cardTitle, { fontSize: getFontSize(18) }]}>
                Gunakan Voucher
              </Text>

              <Text style={[styles.formLabel, { fontSize: getFontSize(14) }]}>
                Nama Staff
              </Text>
              <TextInput
                style={[styles.input, { height: isTablet() ? 56 : 48, fontSize: getFontSize(16) }]}
                value={staffName}
                onChangeText={setStaffName}
                placeholder="Masukkan nama staff"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={[styles.formLabel, { fontSize: getFontSize(14), marginTop: theme.spacing.md }]}>
                Tenant
              </Text>
              <View style={[styles.pickerContainer, { height: isTablet() ? 56 : 48 }]}>
                <Picker
                  selectedValue={selectedTenant}
                  onValueChange={setSelectedTenant}
                  style={styles.picker}
                >
                  {TENANTS.map((tenant) => (
                    <Picker.Item key={tenant} label={tenant} value={tenant} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  { minHeight: isTablet() ? 64 : 56 },
                  redeeming && styles.buttonDisabled,
                ]}
                onPress={handleRedeem}
                disabled={redeeming}
                activeOpacity={0.8}
              >
                {redeeming ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={isTablet() ? 28 : 24} color="#fff" />
                    <Text style={[styles.redeemButtonText, { fontSize: getFontSize(18) }]}>
                      GUNAKAN VOUCHER
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Scan Again Button (if not valid) */}
        {!isValid && (
          <TouchableOpacity
            style={[styles.scanAgainButton, { minHeight: isTablet() ? 56 : 48 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={isTablet() ? 24 : 20} color="#fff" />
            <Text style={[styles.scanAgainButtonText, { fontSize: getFontSize(16) }]}>
              SCAN LAGI
            </Text>
          </TouchableOpacity>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  statusBadge: {
    marginTop: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
    elevation: 2,
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  errorTitle: {
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  formLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
    color: theme.colors.text,
  },
  pickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.text,
  },
  redeemButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scanAgainButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

