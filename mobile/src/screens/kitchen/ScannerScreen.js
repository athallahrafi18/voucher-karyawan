import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveScanHistory } from '../../utils/storage';
import { getScanHistory } from '../../utils/storage';
import { theme } from '../../config/theme';
import { isTablet, getFontSize } from '../../utils/device';

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    loadScanCount();
  }, []);

  const loadScanCount = async () => {
    const history = await getScanHistory();
    setScanCount(history.length);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save to history
    await saveScanHistory({
      barcode: data,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    // Navigate to validation screen
    navigation.navigate('Validation', { barcode: data });

    // Reset scanned after 2 seconds
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="camera-off"
          size={isTablet() ? 80 : 64}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { fontSize: getFontSize(18) }]}>
          Camera permission denied
        </Text>
        <Text style={[styles.errorSubtext, { fontSize: getFontSize(14) }]}>
          Please enable camera permission in settings
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'codabar', 'upc_a', 'upc_e'],
        }}
        enableTorch={flashlight}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.scanCountBadge}>
            <MaterialCommunityIcons name="qrcode-scan" size={isTablet() ? 20 : 16} color="#fff" />
            <Text style={[styles.scanCountText, { fontSize: getFontSize(14) }]}>
              {scanCount} scan hari ini
            </Text>
          </View>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashlight(!flashlight)}
          >
            <MaterialCommunityIcons
              name={flashlight ? 'flashlight' : 'flashlight-off'}
              size={isTablet() ? 28 : 24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame - Rectangle for barcode (not square for QR) */}
        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            {/* Corner indicators for barcode scanning */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={[styles.instructionText, { fontSize: getFontSize(16) }]}>
            Arahkan kamera ke barcode
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.md,
  },
  scanCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  scanCountText: {
    color: '#fff',
    fontWeight: '600',
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: isTablet() ? 56 : 48,
    height: isTablet() ? 56 : 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    // Rectangle frame for barcode (CODE128/CODE39), not square for QR
    width: isTablet() ? 500 : 350,
    height: isTablet() ? 200 : 140,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: theme.borderRadius.md,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: theme.borderRadius.md,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  instructionText: {
    color: '#fff',
    marginTop: theme.spacing.xl,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  errorSubtext: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

