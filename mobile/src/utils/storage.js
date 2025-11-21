import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_ROLE: 'userRole',
  SCAN_HISTORY: 'scanHistory',
  SETTINGS: 'settings',
};

/**
 * Get scan history
 */
export const getScanHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
    if (!history) return [];
    
    const parsed = JSON.parse(history);
    // Filter by today's date
    const today = new Date().toDateString();
    return parsed.filter(item => {
      const itemDate = new Date(item.timestamp).toDateString();
      return itemDate === today;
    });
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
};

/**
 * Save scan history
 */
export const saveScanHistory = async (scanData) => {
  try {
    const history = await getScanHistory();
    const newHistory = [scanData, ...history].slice(0, 100); // Max 100 items
    await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving scan history:', error);
  }
};

/**
 * Update scan history item
 */
export const updateScanHistory = async (barcode, updates) => {
  try {
    const history = await getScanHistory();
    const updatedHistory = history.map(item => {
      if (item.barcode === barcode) {
        return { ...item, ...updates };
      }
      return item;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error updating scan history:', error);
  }
};

/**
 * Clear scan history
 */
export const clearScanHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
  } catch (error) {
    console.error('Error clearing scan history:', error);
  }
};

/**
 * Save settings
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

/**
 * Get settings
 */
export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};

/**
 * Save printer settings
 */
export const savePrinterSettings = async (printerIp, printerPort, paperSize = '58') => {
  try {
    const settings = {
      printer_ip: printerIp,
      printer_port: printerPort,
      paper_size: paperSize, // '58' or '80' (mm)
    };
    await AsyncStorage.setItem('printer_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving printer settings:', error);
  }
};

/**
 * Get printer settings
 */
export const getPrinterSettings = async () => {
  try {
    const data = await AsyncStorage.getItem('printer_settings');
    if (data) {
      return JSON.parse(data);
    }
    // Return default if not set
    return {
      printer_ip: '192.168.110.10',
      printer_port: 9100,
      paper_size: '58', // Default 58mm
    };
  } catch (error) {
    console.error('Error getting printer settings:', error);
    return {
      printer_ip: '192.168.110.10',
      printer_port: 9100,
      paper_size: '80',
    };
  }
};

