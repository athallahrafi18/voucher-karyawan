import { Dimensions } from 'react-native';

/**
 * Check if device is tablet
 */
export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio < 1.6 && Math.min(width, height) >= 600;
};

/**
 * Get device type
 */
export const getDeviceType = () => {
  return isTablet() ? 'tablet' : 'phone';
};

/**
 * Get responsive font size
 */
export const getFontSize = (baseSize) => {
  return isTablet() ? baseSize * 1.2 : baseSize;
};

/**
 * Get responsive spacing
 */
export const getSpacing = (baseSpacing) => {
  return isTablet() ? baseSpacing * 1.5 : baseSpacing;
};

/**
 * Get responsive padding for mobile (reduced for phones)
 */
export const getPadding = (basePadding) => {
  const { width } = Dimensions.get('window');
  if (width < 400) {
    // Small phones - reduce padding
    return Math.max(basePadding * 0.75, 8);
  }
  return isTablet() ? basePadding * 1.5 : basePadding;
};

