import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { theme } from '../../config/theme';
import { isTablet, getFontSize } from '../../utils/device';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();

  const handleLogin = (role) => {
    login(role);
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
});

