/**
 * LifeCall - Tema Tanımları
 *
 * Light ve Dark tema tanımları
 * React Native Paper ile uyumlu
 */

import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { PRIMARY, SECONDARY, SEMANTIC, NEUTRAL, SPECIAL, ACCENT } from './colors';

// Font yapılandırması
const fontConfig = {
  fontFamily: 'System',
};

// Light tema
export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),

  colors: {
    ...MD3LightTheme.colors,

    // Ana renkler
    primary: PRIMARY[500],
    primaryContainer: PRIMARY[100],
    onPrimary: NEUTRAL.white,
    onPrimaryContainer: PRIMARY[900],

    // İkincil renkler
    secondary: SECONDARY[500],
    secondaryContainer: SECONDARY[100],
    onSecondary: NEUTRAL.white,
    onSecondaryContainer: SECONDARY[900],

    // Accent
    tertiary: ACCENT[500],
    tertiaryContainer: ACCENT[100],
    onTertiary: NEUTRAL.white,
    onTertiaryContainer: ACCENT[900],

    // Arka planlar
    background: NEUTRAL.gray50,
    surface: NEUTRAL.white,
    surfaceVariant: NEUTRAL.gray100,
    onBackground: NEUTRAL.gray900,
    onSurface: NEUTRAL.gray900,
    onSurfaceVariant: NEUTRAL.gray700,

    // Hata
    error: SEMANTIC.error,
    errorContainer: '#FFCDD2',
    onError: NEUTRAL.white,
    onErrorContainer: SEMANTIC.errorDark,

    // Outline ve divider
    outline: NEUTRAL.gray400,
    outlineVariant: NEUTRAL.gray300,

    // Özel renkler
    shadow: SPECIAL.shadow,
    inverseSurface: NEUTRAL.gray800,
    inverseOnSurface: NEUTRAL.gray100,
    inversePrimary: PRIMARY[200],

    // Özel LifeCall renkleri
    success: SEMANTIC.success,
    warning: SEMANTIC.warning,
    info: SEMANTIC.info,

    // Kart ve liste
    card: NEUTRAL.white,
    cardBorder: NEUTRAL.gray200,

    // Tab bar
    tabBar: NEUTRAL.white,
    tabBarActive: PRIMARY[500],
    tabBarInactive: NEUTRAL.gray500,

    // Header
    header: PRIMARY[500],
    headerText: NEUTRAL.white,

    // Input
    inputBackground: NEUTRAL.gray100,
    inputBorder: NEUTRAL.gray300,
    inputText: NEUTRAL.gray900,
    inputPlaceholder: NEUTRAL.gray500,

    // Arama ekranı
    callBackground: NEUTRAL.gray900,
    callPrimary: SEMANTIC.success,
    callDanger: SEMANTIC.error,

    // Avatar
    avatarText: NEUTRAL.white,

    // Divider
    divider: SPECIAL.divider,

    // Overlay
    overlay: SPECIAL.overlay,

    // Ripple efekti
    ripple: SPECIAL.ripple,
  },

  // Gölge stilleri
  shadows: {
    small: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },

  // Border radius değerleri
  roundness: 12,

  // Spacing değerleri
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Animasyon süreleri
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// Dark tema
export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),

  colors: {
    ...MD3DarkTheme.colors,

    // Ana renkler
    primary: PRIMARY[300],
    primaryContainer: PRIMARY[800],
    onPrimary: PRIMARY[900],
    onPrimaryContainer: PRIMARY[100],

    // İkincil renkler
    secondary: SECONDARY[300],
    secondaryContainer: SECONDARY[800],
    onSecondary: SECONDARY[900],
    onSecondaryContainer: SECONDARY[100],

    // Accent
    tertiary: ACCENT[300],
    tertiaryContainer: ACCENT[800],
    onTertiary: ACCENT[900],
    onTertiaryContainer: ACCENT[100],

    // Arka planlar
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onBackground: NEUTRAL.gray100,
    onSurface: NEUTRAL.gray100,
    onSurfaceVariant: NEUTRAL.gray400,

    // Hata
    error: SEMANTIC.errorLight,
    errorContainer: '#5C1A1A',
    onError: SEMANTIC.errorDark,
    onErrorContainer: SEMANTIC.errorLight,

    // Outline ve divider
    outline: NEUTRAL.gray600,
    outlineVariant: NEUTRAL.gray700,

    // Özel renkler
    shadow: SPECIAL.shadow,
    inverseSurface: NEUTRAL.gray200,
    inverseOnSurface: NEUTRAL.gray800,
    inversePrimary: PRIMARY[700],

    // Özel LifeCall renkleri
    success: SEMANTIC.successLight,
    warning: SEMANTIC.warningLight,
    info: SEMANTIC.infoLight,

    // Kart ve liste
    card: '#1E1E1E',
    cardBorder: NEUTRAL.gray800,

    // Tab bar
    tabBar: '#1E1E1E',
    tabBarActive: PRIMARY[300],
    tabBarInactive: NEUTRAL.gray500,

    // Header
    header: '#1E1E1E',
    headerText: NEUTRAL.gray100,

    // Input
    inputBackground: '#2C2C2C',
    inputBorder: NEUTRAL.gray700,
    inputText: NEUTRAL.gray100,
    inputPlaceholder: NEUTRAL.gray500,

    // Arama ekranı
    callBackground: NEUTRAL.black,
    callPrimary: SEMANTIC.successLight,
    callDanger: SEMANTIC.errorLight,

    // Avatar
    avatarText: NEUTRAL.white,

    // Divider
    divider: SPECIAL.dividerDark,

    // Overlay
    overlay: SPECIAL.overlayDark,

    // Ripple efekti
    ripple: SPECIAL.rippleLight,
  },

  // Gölge stilleri (dark için daha az belirgin)
  shadows: {
    small: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: NEUTRAL.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },

  roundness: 12,

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// ============================================================================
// MODERN TEMALAR
// ============================================================================

// Ocean Blue Tema (Ekran görüntüsündeki tema)
export const oceanBlueTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'ocean-blue',
  name: 'Ocean Blue',
  nameKey: 'themes.oceanBlue',

  colors: {
    ...MD3DarkTheme.colors,

    // Ana renkler
    primary: '#00D9FF',
    primaryContainer: '#0A3D62',
    onPrimary: '#001F2A',
    onPrimaryContainer: '#B8EAFF',

    // İkincil renkler
    secondary: '#7C4DFF',
    secondaryContainer: '#3D2080',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#E8DDFF',

    // Accent
    tertiary: '#00E676',
    tertiaryContainer: '#005A2B',
    onTertiary: '#003919',
    onTertiaryContainer: '#6BFFB0',

    // Arka planlar - Koyu lacivert
    background: '#0A1628',
    surface: '#0F2137',
    surfaceVariant: '#162A46',
    onBackground: '#E1E6ED',
    onSurface: '#E1E6ED',
    onSurfaceVariant: '#A3B1C6',

    // Hata
    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    // Outline ve divider
    outline: '#3D5A80',
    outlineVariant: '#293D5A',

    // Özel renkler
    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#E1E6ED',
    inverseOnSurface: '#0A1628',
    inversePrimary: '#006B80',

    // Özel LifeCall renkleri
    success: '#00E676',
    warning: '#FFB74D',
    info: '#00D9FF',

    // Kart ve liste - Gradient efekti için
    card: '#0F2137',
    cardBorder: '#1E3A5F',

    // Tab bar
    tabBar: '#0A1628',
    tabBarActive: '#00D9FF',
    tabBarInactive: '#5A7A9A',

    // Header
    header: '#0A1628',
    headerText: '#E1E6ED',

    // Input
    inputBackground: '#162A46',
    inputBorder: '#3D5A80',
    inputText: '#E1E6ED',
    inputPlaceholder: '#5A7A9A',

    // Arama ekranı
    callBackground: '#050D18',
    callPrimary: '#00E676',
    callDanger: '#FF5252',

    // Avatar
    avatarText: '#FFFFFF',

    // Divider
    divider: 'rgba(61, 90, 128, 0.3)',

    // Overlay
    overlay: 'rgba(10, 22, 40, 0.8)',

    // Ripple efekti
    ripple: 'rgba(0, 217, 255, 0.15)',

    // Özel gradient renkleri
    gradientStart: '#7C4DFF',
    gradientEnd: '#00D9FF',
    accentBlue: '#2196F3',
    accentPurple: '#7C4DFF',
    accentGreen: '#00E676',
    accentOrange: '#FF9800',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Midnight Purple Tema
export const midnightPurpleTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'midnight-purple',
  name: 'Midnight Purple',
  nameKey: 'themes.midnightPurple',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#BB86FC',
    primaryContainer: '#4A148C',
    onPrimary: '#1A0033',
    onPrimaryContainer: '#F3E5F5',

    secondary: '#03DAC6',
    secondaryContainer: '#00574B',
    onSecondary: '#00201A',
    onSecondaryContainer: '#A7FFEB',

    tertiary: '#FF7597',
    tertiaryContainer: '#7B0028',
    onTertiary: '#400012',
    onTertiaryContainer: '#FFD9E2',

    background: '#0D0118',
    surface: '#1A0A2E',
    surfaceVariant: '#2D1B4E',
    onBackground: '#E8DEF8',
    onSurface: '#E8DEF8',
    onSurfaceVariant: '#CAC4D0',

    error: '#CF6679',
    errorContainer: '#4A0E1A',
    onError: '#1A0007',
    onErrorContainer: '#F9DEDC',

    outline: '#4A3D6A',
    outlineVariant: '#352A4D',

    shadow: 'rgba(0, 0, 0, 0.5)',
    inverseSurface: '#E8DEF8',
    inverseOnSurface: '#1A0A2E',
    inversePrimary: '#6200EE',

    success: '#03DAC6',
    warning: '#FFB74D',
    info: '#BB86FC',

    card: '#1A0A2E',
    cardBorder: '#3D2A5E',

    tabBar: '#0D0118',
    tabBarActive: '#BB86FC',
    tabBarInactive: '#7A6A9A',

    header: '#0D0118',
    headerText: '#E8DEF8',

    inputBackground: '#2D1B4E',
    inputBorder: '#4A3D6A',
    inputText: '#E8DEF8',
    inputPlaceholder: '#7A6A9A',

    callBackground: '#05000D',
    callPrimary: '#03DAC6',
    callDanger: '#CF6679',

    avatarText: '#FFFFFF',
    divider: 'rgba(74, 61, 106, 0.3)',
    overlay: 'rgba(13, 1, 24, 0.8)',
    ripple: 'rgba(187, 134, 252, 0.15)',

    gradientStart: '#BB86FC',
    gradientEnd: '#03DAC6',
    accentBlue: '#7C4DFF',
    accentPurple: '#BB86FC',
    accentGreen: '#03DAC6',
    accentOrange: '#FF7597',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Emerald Green Tema
export const emeraldTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'emerald',
  name: 'Emerald',
  nameKey: 'themes.emerald',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#00E676',
    primaryContainer: '#005A2B',
    onPrimary: '#00391A',
    onPrimaryContainer: '#6BFFB0',

    secondary: '#00BCD4',
    secondaryContainer: '#004D54',
    onSecondary: '#00232A',
    onSecondaryContainer: '#97F0FF',

    tertiary: '#FFD54F',
    tertiaryContainer: '#5C4300',
    onTertiary: '#3E2D00',
    onTertiaryContainer: '#FFECB3',

    background: '#041F14',
    surface: '#0A2E1E',
    surfaceVariant: '#143D2D',
    onBackground: '#D4F5E4',
    onSurface: '#D4F5E4',
    onSurfaceVariant: '#A3C9B7',

    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    outline: '#3D7A5A',
    outlineVariant: '#2A5A42',

    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#D4F5E4',
    inverseOnSurface: '#0A2E1E',
    inversePrimary: '#00894A',

    success: '#00E676',
    warning: '#FFD54F',
    info: '#00BCD4',

    card: '#0A2E1E',
    cardBorder: '#1E5038',

    tabBar: '#041F14',
    tabBarActive: '#00E676',
    tabBarInactive: '#5A9A7A',

    header: '#041F14',
    headerText: '#D4F5E4',

    inputBackground: '#143D2D',
    inputBorder: '#3D7A5A',
    inputText: '#D4F5E4',
    inputPlaceholder: '#5A9A7A',

    callBackground: '#021008',
    callPrimary: '#00E676',
    callDanger: '#FF5252',

    avatarText: '#FFFFFF',
    divider: 'rgba(61, 122, 90, 0.3)',
    overlay: 'rgba(4, 31, 20, 0.8)',
    ripple: 'rgba(0, 230, 118, 0.15)',

    gradientStart: '#00E676',
    gradientEnd: '#00BCD4',
    accentBlue: '#00BCD4',
    accentPurple: '#7C4DFF',
    accentGreen: '#00E676',
    accentOrange: '#FFD54F',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Rose Pink Tema
export const rosePinkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'rose-pink',
  name: 'Rose Pink',
  nameKey: 'themes.rosePink',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#FF4081',
    primaryContainer: '#7B0028',
    onPrimary: '#400012',
    onPrimaryContainer: '#FFD9E2',

    secondary: '#E040FB',
    secondaryContainer: '#5C007A',
    onSecondary: '#2D003F',
    onSecondaryContainer: '#F9D9FF',

    tertiary: '#FFD54F',
    tertiaryContainer: '#5C4300',
    onTertiary: '#3E2D00',
    onTertiaryContainer: '#FFECB3',

    background: '#1A0A14',
    surface: '#2E1422',
    surfaceVariant: '#461E34',
    onBackground: '#FFE4EC',
    onSurface: '#FFE4EC',
    onSurfaceVariant: '#D4A8BA',

    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    outline: '#8A4A6A',
    outlineVariant: '#5A3248',

    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#FFE4EC',
    inverseOnSurface: '#2E1422',
    inversePrimary: '#C2185B',

    success: '#00E676',
    warning: '#FFD54F',
    info: '#E040FB',

    card: '#2E1422',
    cardBorder: '#5A2A42',

    tabBar: '#1A0A14',
    tabBarActive: '#FF4081',
    tabBarInactive: '#A86A8A',

    header: '#1A0A14',
    headerText: '#FFE4EC',

    inputBackground: '#461E34',
    inputBorder: '#8A4A6A',
    inputText: '#FFE4EC',
    inputPlaceholder: '#A86A8A',

    callBackground: '#0D0508',
    callPrimary: '#00E676',
    callDanger: '#FF5252',

    avatarText: '#FFFFFF',
    divider: 'rgba(138, 74, 106, 0.3)',
    overlay: 'rgba(26, 10, 20, 0.8)',
    ripple: 'rgba(255, 64, 129, 0.15)',

    gradientStart: '#FF4081',
    gradientEnd: '#E040FB',
    accentBlue: '#7C4DFF',
    accentPurple: '#E040FB',
    accentGreen: '#00E676',
    accentOrange: '#FFD54F',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Sunset Orange Tema
export const sunsetOrangeTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'sunset-orange',
  name: 'Sunset Orange',
  nameKey: 'themes.sunsetOrange',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#FF7043',
    primaryContainer: '#7B2E00',
    onPrimary: '#3E1500',
    onPrimaryContainer: '#FFDBCF',

    secondary: '#FFD54F',
    secondaryContainer: '#5C4300',
    onSecondary: '#3E2D00',
    onSecondaryContainer: '#FFECB3',

    tertiary: '#FF4081',
    tertiaryContainer: '#7B0028',
    onTertiary: '#400012',
    onTertiaryContainer: '#FFD9E2',

    background: '#1A0F08',
    surface: '#2E1A10',
    surfaceVariant: '#462818',
    onBackground: '#FFE8DF',
    onSurface: '#FFE8DF',
    onSurfaceVariant: '#D4B8A8',

    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    outline: '#8A5A42',
    outlineVariant: '#5A3D2A',

    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#FFE8DF',
    inverseOnSurface: '#2E1A10',
    inversePrimary: '#C4511C',

    success: '#00E676',
    warning: '#FFD54F',
    info: '#29B6F6',

    card: '#2E1A10',
    cardBorder: '#5A3828',

    tabBar: '#1A0F08',
    tabBarActive: '#FF7043',
    tabBarInactive: '#A87A62',

    header: '#1A0F08',
    headerText: '#FFE8DF',

    inputBackground: '#462818',
    inputBorder: '#8A5A42',
    inputText: '#FFE8DF',
    inputPlaceholder: '#A87A62',

    callBackground: '#0D0804',
    callPrimary: '#00E676',
    callDanger: '#FF5252',

    avatarText: '#FFFFFF',
    divider: 'rgba(138, 90, 66, 0.3)',
    overlay: 'rgba(26, 15, 8, 0.8)',
    ripple: 'rgba(255, 112, 67, 0.15)',

    gradientStart: '#FF7043',
    gradientEnd: '#FFD54F',
    accentBlue: '#29B6F6',
    accentPurple: '#FF4081',
    accentGreen: '#00E676',
    accentOrange: '#FF7043',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Arctic Blue Tema (Açık tema)
export const arcticBlueTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'arctic-blue',
  name: 'Arctic Blue',
  nameKey: 'themes.arcticBlue',

  colors: {
    ...MD3LightTheme.colors,

    primary: '#0288D1',
    primaryContainer: '#B3E5FC',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#014A77',

    secondary: '#00ACC1',
    secondaryContainer: '#B2EBF2',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#00626E',

    tertiary: '#7C4DFF',
    tertiaryContainer: '#E8DDFF',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#4A00B0',

    background: '#E3F2FD',
    surface: '#FFFFFF',
    surfaceVariant: '#E1F5FE',
    onBackground: '#0D47A1',
    onSurface: '#1A237E',
    onSurfaceVariant: '#37474F',

    error: '#D32F2F',
    errorContainer: '#FFCDD2',
    onError: '#FFFFFF',
    onErrorContainer: '#7B1A1A',

    outline: '#90CAF9',
    outlineVariant: '#BBDEFB',

    shadow: 'rgba(0, 0, 0, 0.15)',
    inverseSurface: '#0D47A1',
    inverseOnSurface: '#E3F2FD',
    inversePrimary: '#81D4FA',

    success: '#00C853',
    warning: '#FF9800',
    info: '#0288D1',

    card: '#FFFFFF',
    cardBorder: '#B3E5FC',

    tabBar: '#FFFFFF',
    tabBarActive: '#0288D1',
    tabBarInactive: '#90A4AE',

    header: '#0288D1',
    headerText: '#FFFFFF',

    inputBackground: '#E1F5FE',
    inputBorder: '#90CAF9',
    inputText: '#1A237E',
    inputPlaceholder: '#78909C',

    callBackground: '#E3F2FD',
    callPrimary: '#00C853',
    callDanger: '#D32F2F',

    avatarText: '#FFFFFF',
    divider: 'rgba(2, 136, 209, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.3)',
    ripple: 'rgba(2, 136, 209, 0.15)',

    gradientStart: '#0288D1',
    gradientEnd: '#00ACC1',
    accentBlue: '#0288D1',
    accentPurple: '#7C4DFF',
    accentGreen: '#00C853',
    accentOrange: '#FF9800',
  },

  shadows: lightTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Crimson Red Tema
export const crimsonTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'crimson',
  name: 'Crimson',
  nameKey: 'themes.crimson',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#FF1744',
    primaryContainer: '#7B0A0A',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#FFD9D9',

    secondary: '#FF9100',
    secondaryContainer: '#5C3700',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#FFE0B2',

    tertiary: '#FFD600',
    tertiaryContainer: '#5C4D00',
    onTertiary: '#3E3300',
    onTertiaryContainer: '#FFF8E1',

    background: '#1A0808',
    surface: '#2E1212',
    surfaceVariant: '#461C1C',
    onBackground: '#FFE8E8',
    onSurface: '#FFE8E8',
    onSurfaceVariant: '#D4A8A8',

    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    outline: '#8A4A4A',
    outlineVariant: '#5A3232',

    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#FFE8E8',
    inverseOnSurface: '#2E1212',
    inversePrimary: '#C41000',

    success: '#00E676',
    warning: '#FF9100',
    info: '#29B6F6',

    card: '#2E1212',
    cardBorder: '#5A2828',

    tabBar: '#1A0808',
    tabBarActive: '#FF1744',
    tabBarInactive: '#A86A6A',

    header: '#1A0808',
    headerText: '#FFE8E8',

    inputBackground: '#461C1C',
    inputBorder: '#8A4A4A',
    inputText: '#FFE8E8',
    inputPlaceholder: '#A86A6A',

    callBackground: '#0D0404',
    callPrimary: '#00E676',
    callDanger: '#FF1744',

    avatarText: '#FFFFFF',
    divider: 'rgba(138, 74, 74, 0.3)',
    overlay: 'rgba(26, 8, 8, 0.8)',
    ripple: 'rgba(255, 23, 68, 0.15)',

    gradientStart: '#FF1744',
    gradientEnd: '#FF9100',
    accentBlue: '#29B6F6',
    accentPurple: '#E040FB',
    accentGreen: '#00E676',
    accentOrange: '#FF9100',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// Forest Tema
export const forestTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  id: 'forest',
  name: 'Forest',
  nameKey: 'themes.forest',

  colors: {
    ...MD3DarkTheme.colors,

    primary: '#8BC34A',
    primaryContainer: '#3D5A20',
    onPrimary: '#1A2E0A',
    onPrimaryContainer: '#DCEDC8',

    secondary: '#4CAF50',
    secondaryContainer: '#2E5A30',
    onSecondary: '#0A2E0C',
    onSecondaryContainer: '#C8E6C9',

    tertiary: '#CDDC39',
    tertiaryContainer: '#5A5C1A',
    onTertiary: '#3E3E0A',
    onTertiaryContainer: '#F0F4C3',

    background: '#0A140A',
    surface: '#142814',
    surfaceVariant: '#1E3C1E',
    onBackground: '#E4F1E4',
    onSurface: '#E4F1E4',
    onSurfaceVariant: '#A8C8A8',

    error: '#FF5252',
    errorContainer: '#5C1A1A',
    onError: '#FFFFFF',
    onErrorContainer: '#FFCDD2',

    outline: '#5A8A5A',
    outlineVariant: '#3D5A3D',

    shadow: 'rgba(0, 0, 0, 0.4)',
    inverseSurface: '#E4F1E4',
    inverseOnSurface: '#142814',
    inversePrimary: '#558B2F',

    success: '#8BC34A',
    warning: '#CDDC39',
    info: '#29B6F6',

    card: '#142814',
    cardBorder: '#2A4A2A',

    tabBar: '#0A140A',
    tabBarActive: '#8BC34A',
    tabBarInactive: '#6A9A6A',

    header: '#0A140A',
    headerText: '#E4F1E4',

    inputBackground: '#1E3C1E',
    inputBorder: '#5A8A5A',
    inputText: '#E4F1E4',
    inputPlaceholder: '#6A9A6A',

    callBackground: '#050A05',
    callPrimary: '#8BC34A',
    callDanger: '#FF5252',

    avatarText: '#FFFFFF',
    divider: 'rgba(90, 138, 90, 0.3)',
    overlay: 'rgba(10, 20, 10, 0.8)',
    ripple: 'rgba(139, 195, 74, 0.15)',

    gradientStart: '#8BC34A',
    gradientEnd: '#4CAF50',
    accentBlue: '#29B6F6',
    accentPurple: '#7C4DFF',
    accentGreen: '#8BC34A',
    accentOrange: '#CDDC39',
  },

  shadows: darkTheme.shadows,
  roundness: 16,
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
};

// ============================================================================
// TEMA LİSTESİ
// ============================================================================

// Tüm uygulama temaları
export const APP_THEMES = {
  light: lightTheme,
  dark: darkTheme,
  'ocean-blue': oceanBlueTheme,
  'midnight-purple': midnightPurpleTheme,
  'emerald': emeraldTheme,
  'rose-pink': rosePinkTheme,
  'sunset-orange': sunsetOrangeTheme,
  'arctic-blue': arcticBlueTheme,
  'crimson': crimsonTheme,
  'forest': forestTheme,
};

// Tema listesi (UI için)
export const THEME_LIST = [
  { id: 'light', name: 'Light', nameKey: 'themes.light', isDark: false, preview: '#FAFAFA' },
  { id: 'dark', name: 'Dark', nameKey: 'themes.dark', isDark: true, preview: '#121212' },
  { id: 'ocean-blue', name: 'Ocean Blue', nameKey: 'themes.oceanBlue', isDark: true, preview: '#0A1628' },
  { id: 'midnight-purple', name: 'Midnight Purple', nameKey: 'themes.midnightPurple', isDark: true, preview: '#0D0118' },
  { id: 'emerald', name: 'Emerald', nameKey: 'themes.emerald', isDark: true, preview: '#041F14' },
  { id: 'rose-pink', name: 'Rose Pink', nameKey: 'themes.rosePink', isDark: true, preview: '#1A0A14' },
  { id: 'sunset-orange', name: 'Sunset Orange', nameKey: 'themes.sunsetOrange', isDark: true, preview: '#1A0F08' },
  { id: 'arctic-blue', name: 'Arctic Blue', nameKey: 'themes.arcticBlue', isDark: false, preview: '#E3F2FD' },
  { id: 'crimson', name: 'Crimson', nameKey: 'themes.crimson', isDark: true, preview: '#1A0808' },
  { id: 'forest', name: 'Forest', nameKey: 'themes.forest', isDark: true, preview: '#0A140A' },
];

// Tema tipi
export type AppTheme = typeof lightTheme;

// Tema ID tipi
export type ThemeId = keyof typeof APP_THEMES;

// Tema modu (geriye uyumluluk için)
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Tema ID'sine göre tema al
 */
export const getThemeById = (id: ThemeId): AppTheme => {
  return APP_THEMES[id] || lightTheme;
};
