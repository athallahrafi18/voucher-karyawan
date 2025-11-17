import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../config/theme';
import { ROLES, ROLE_LABELS } from '../../config/roles';
import { isTablet, getFontSize } from '../../utils/device';

export default function SettingsScreen() {
  const { userRole, logout } = useAuth();

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
    <ScrollView style={styles.container}>
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
  card: {
    marginBottom: theme.spacing.lg,
    elevation: 2,
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
  infoLabel: {
    color: theme.colors.textSecondary,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: '600',
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

