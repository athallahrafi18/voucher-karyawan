import React, { useState } from 'react';
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
import { TextInput, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { voucherAPI, printAPI } from '../../services/api';
import { theme } from '../../config/theme';
import { formatCurrency, formatDate, getTodayDate } from '../../utils/formatters';
import { PRINTER_IP, PRINTER_PORT } from '../../config/api';
import { isTablet, getFontSize } from '../../utils/device';

export default function GenerateVoucherScreen() {
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState('45');
  const [issueDate, setIssueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIssueDate(selectedDate);
    }
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGenerate = async () => {
    const qty = parseInt(quantity);
    
    if (!qty || qty < 1 || qty > 100) {
      Alert.alert('Error', 'Jumlah voucher harus antara 1-100');
      return;
    }

    try {
      setLoading(true);
      
      // Generate vouchers
      const generateResponse = await voucherAPI.generate(qty, formatDateForAPI(issueDate));
      
      if (!generateResponse.success) {
        throw new Error(generateResponse.message || 'Gagal generate voucher');
      }

      const vouchers = generateResponse.data.vouchers;

      // Print vouchers
      setPrinting(true);
      try {
        await printAPI.thermal(vouchers, PRINTER_IP, PRINTER_PORT);
        
        Alert.alert(
          'Berhasil!',
          `${qty} voucher berhasil dicetak!`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
                // Trigger refresh in HomeScreen
                navigation.getParent()?.navigate('Home');
              },
            },
          ]
        );
      } catch (printError) {
        console.error('Print error:', printError);
        Alert.alert(
          'Voucher Generated',
          `${qty} voucher berhasil dibuat, tetapi gagal mencetak. Silakan coba print manual.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setPrinting(false);
      }
    } catch (error) {
      console.error('Generate error:', error);
      Alert.alert('Error', error.message || 'Gagal generate voucher');
    } finally {
      setLoading(false);
    }
  };

  const qty = parseInt(quantity) || 0;
  const totalNominal = qty * 10000;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Input Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.label, { fontSize: getFontSize(16) }]}>
                Jumlah Karyawan
              </Text>
              <TextInput
                mode="outlined"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={[styles.input, { height: isTablet() ? 56 : 48 }]}
                contentStyle={{ fontSize: getFontSize(18) }}
              />

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
                  Total Voucher:
                </Text>
                <Text style={[styles.previewValue, { fontSize: getFontSize(16) }]}>
                  {qty} voucher
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { fontSize: getFontSize(14) }]}>
                  Nomor Urut:
                </Text>
                <Text style={[styles.previewValue, { fontSize: getFontSize(16) }]}>
                  001 - {String(qty).padStart(3, '0')}
                </Text>
              </View>

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
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
    elevation: 2,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '30',
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
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    elevation: 3,
    gap: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

