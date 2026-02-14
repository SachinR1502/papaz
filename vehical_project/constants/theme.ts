/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF', // Pure white for cleaner look
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    primary: '#FF6B00', // Vibrant Orange (Hero)
    secondary: '#2E2E2E', // Dark Grey for contrast
    card: '#F7F9FC', // Very subtle blue-ish grey for cards
    border: '#ECDED5', // Warm light grey
    notification: '#FF3B30',
    sales: '#34C759',
    revenue: '#AF52DE',
    customers: '#007AFF',
    warning: '#FF9500',
    requestsBadge: '#FF3B30',
    shadow: '#171717',
    inputBg: '#F2F2F7',
    placeHolder: '#A1A1A6',
    success: '#34C759',
    error: '#FF3B30',
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000', // True black for OLED
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF9F0A', // Lighter Orange for dark mode visibility
    secondary: '#E5E5EA', // Light Grey for contrast
    card: '#1C1C1E', // System Dark Grey
    border: '#2C2C2E',
    notification: '#FF453A',
    sales: '#32D74B',
    revenue: '#BF5AF2',
    customers: '#0A84FF',
    warning: '#FF9F0A',
    requestsBadge: '#FF453A',
    shadow: '#000000',
    inputBg: '#2C2C2E',
    placeHolder: '#58585E',
    success: '#30D158',
    error: '#FF453A',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
