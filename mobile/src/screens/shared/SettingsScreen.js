import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../config/theme';
import { ROLES, ROLE_LABELS } from '../../config/roles';
import { isTablet, getFontSize, getPadding, getSpacing } from '../../utils/device';
import { savePrinterSettings, getPrinterSettings } from '../../utils/storage';
import Navbar from '../../components/Navbar';
import logger from '../../utils/logger';

export default function SettingsScreen() {
  const { userRole, logout } = useAuth();
  const [printerIp, setPrinterIp] = useState('192.168.110.10');
  const [printerPort, setPrinterPort] = useState('9100');
  const [paperSize, setPaperSize] = useState('58'); // '58' or '80'
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrinterSettings();
  }, []);

  const loadPrinterSettings = async () => {
    const settings = await getPrinterSettings();
    setPrinterIp(settings.printer_ip);
    setPrinterPort(String(settings.printer_port));
    setPaperSize(settings.paper_size || '58');
  };

  const handleSavePrinter = async () => {
    // Validate IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(printerIp)) {
      Alert.alert('Error', 'Format IP tidak valid');
      return;
    }

    // Validate port
    const port = parseInt(printerPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      Alert.alert('Error', 'Port harus antara 1-65535');
      return;
    }

    try {
      setSaving(true);
      await savePrinterSettings(printerIp, port, paperSize);
      Alert.alert('Berhasil', 'Setting printer berhasil disimpan');
      setShowPrinterModal(false);
    } catch (error) {
      logger.error('Error saving printer settings:', error);
      Alert.alert('Error', 'Gagal menyimpan setting printer');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin logout?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="Settings"
        subtitle={ROLE_LABELS[userRole] || userRole}
        icon="cog"
        backgroundColor={userRole === ROLES.ADMIN ? theme.colors.primary : theme.colors.secondary}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        {/* User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.userInfo}>
              <MaterialCommunityIcons
                name={userRole === ROLES.ADMIN ? 'account-tie' : 'chef-hat'}
                size={isTablet() ? 48 : 40}
                color={theme.colors.primary}
              />
              <View style={styles.userDetails}>
                <Text style={[styles.userLabel, { fontSize: getFontSize(14) }]}>
                  Role
                </Text>
                <Text style={[styles.userValue, { fontSize: getFontSize(20) }]}>
                  {ROLE_LABELS[userRole] || userRole}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Printer Settings - Only for Admin */}
        {userRole === ROLES.ADMIN && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>
                Setting Printer
              </Text>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                    IP Printer:
                  </Text>
                  <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                    {printerIp}
                  </Text>
                </View>
                <View style={styles.infoLeft}>
                  <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                    Port:
                  </Text>
                  <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                    {printerPort}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                    Paper Size:
                  </Text>
                  <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                    {paperSize}mm
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { minHeight: isTablet() ? 48 : 44 }]}
                onPress={() => setShowPrinterModal(true)}
              >
                <MaterialCommunityIcons
                  name="printer-settings"
                  size={isTablet() ? 20 : 18}
                  color={theme.colors.primary}
                />
                <Text style={[styles.editButtonText, { fontSize: getFontSize(14) }]}>
                  Edit Setting Printer
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>
              Tentang Aplikasi
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Nama:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                Voucher Rakan Kuphi
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: getFontSize(14) }]}>
                Version:
              </Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(14) }]}>
                1.0.0
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { minHeight: isTablet() ? 56 : 48 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="logout"
            size={isTablet() ? 24 : 20}
            color={theme.colors.error}
          />
          <Text style={[styles.logoutButtonText, { fontSize: getFontSize(16) }]}>
            Logout
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Printer Settings Modal */}
      <Modal
        visible={showPrinterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrinterModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: getFontSize(20) }]}>
                Setting Printer
              </Text>
              <TouchableOpacity
                onPress={() => setShowPrinterModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { fontSize: getFontSize(16) }]}>
                IP Printer *
              </Text>
              <TextInput
                mode="outlined"
                value={printerIp}
                onChangeText={setPrinterIp}
                placeholder="192.168.1.100"
                keyboardType="numeric"
                style={[styles.input, { height: isTablet() ? 56 : 48 }]}
                contentStyle={{ fontSize: getFontSize(16) }}
                autoFocus
              />

              <Text style={[styles.inputLabel, { fontSize: getFontSize(16), marginTop: theme.spacing.md }]}>
                Port *
              </Text>
              <TextInput
                mode="outlined"
                value={printerPort}
                onChangeText={setPrinterPort}
                placeholder="9100"
                keyboardType="numeric"
                style={[styles.input, { height: isTablet() ? 56 : 48 }]}
                contentStyle={{ fontSize: getFontSize(16) }}
              />

              <Text style={[styles.inputLabel, { fontSize: getFontSize(16), marginTop: theme.spacing.md }]}>
                Paper Size *
              </Text>
              <View style={styles.paperSizeContainer}>
                <TouchableOpacity
                  style={[
                    styles.paperSizeButton,
                    paperSize === '58' && styles.paperSizeButtonActive,
                  ]}
                  onPress={() => setPaperSize('58')}
                >
                  <Text
                    style={[
                      styles.paperSizeText,
                      paperSize === '58' && styles.paperSizeTextActive,
                    ]}
                  >
                    58mm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paperSizeButton,
                    paperSize === '80' && styles.paperSizeButtonActive,
                  ]}
                  onPress={() => setPaperSize('80')}
                >
                  <Text
                    style={[
                      styles.paperSizeText,
                      paperSize === '80' && styles.paperSizeTextActive,
                    ]}
                  >
                    80mm
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowPrinterModal(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                  labelStyle={{ fontSize: getFontSize(16) }}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSavePrinter}
                  loading={saving}
                  disabled={saving}
                  style={[styles.modalButton, styles.saveButton]}
                  labelStyle={{ fontSize: getFontSize(16) }}
                >
                  Simpan
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  content: {
    padding: getPadding(theme.spacing.md),
  },
  card: {
    marginBottom: getSpacing(theme.spacing.md),
    elevation: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    borderRadius: theme.borderRadius.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: theme.spacing.md,
  },
  userLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  userValue: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  inputLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
  },
  cancelButton: {
    borderColor: theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  paperSizeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  paperSizeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + '50',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  paperSizeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  paperSizeText: {
    fontSize: getFontSize(16),
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  paperSizeTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.error,
    gap: theme.spacing.sm,
  },
  logoutButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});

