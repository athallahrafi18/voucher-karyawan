import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROLES } from '../config/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffName, setStaffName] = useState(null); // Store staff name for kitchen role

  // Check stored role on mount
  useEffect(() => {
    checkStoredRole();
  }, []);

  const checkStoredRole = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedStaffName = await AsyncStorage.getItem('staffName');
      if (storedRole && Object.values(ROLES).includes(storedRole)) {
        setUserRole(storedRole);
        setIsAuthenticated(true);
        if (storedStaffName) {
          setStaffName(storedStaffName);
        }
      }
    } catch (error) {
      console.error('Error checking stored role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (role, staffName = null) => {
    try {
      if (!Object.values(ROLES).includes(role)) {
        throw new Error('Invalid role');
      }
      setUserRole(role);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('userRole', role);
      
      // Store staff name if provided (for kitchen role)
      if (staffName) {
        setStaffName(staffName);
        await AsyncStorage.setItem('staffName', staffName);
      } else {
        setStaffName(null);
        await AsyncStorage.removeItem('staffName');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUserRole(null);
      setIsAuthenticated(false);
      setStaffName(null);
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('staffName');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        isAuthenticated,
        isLoading,
        staffName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Export ROLES for convenience
export { ROLES } from '../config/roles';

