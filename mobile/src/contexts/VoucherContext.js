import React, { createContext, useState, useContext } from 'react';
import { voucherAPI } from '../services/api';

const VoucherContext = createContext();

export const VoucherProvider = ({ children }) => {
  const [dailyReport, setDailyReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDailyReport = async (date) => {
    try {
      setIsLoading(true);
      const response = await voucherAPI.getDailyReport(date);
      if (response.success) {
        setDailyReport(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDailyReport = async (date) => {
    return fetchDailyReport(date);
  };

  return (
    <VoucherContext.Provider
      value={{
        dailyReport,
        isLoading,
        fetchDailyReport,
        refreshDailyReport,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export const useVoucher = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error('useVoucher must be used within VoucherProvider');
  }
  return context;
};

