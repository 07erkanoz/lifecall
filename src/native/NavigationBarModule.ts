/**
 * LifeCall - Navigation Bar Module
 *
 * Android navigation bar ve status bar rengini kontrol eder.
 * Tema değişikliklerinde otomatik güncelleme sağlar.
 */

import { NativeModules, Platform } from 'react-native';

interface NavigationBarModuleType {
  setNavigationBarColor: (colorHex: string, isLight: boolean) => void;
  setStatusBarColor: (colorHex: string, isLight: boolean) => void;
  setSystemBarsColor: (colorHex: string, isLight: boolean) => void;
  setFullscreenMode: (enable: boolean) => void;
}

const { NavigationBarModule } = NativeModules;

/**
 * Navigation bar rengini ayarla
 * @param colorHex Renk hex kodu (örn: "#FFFFFF")
 * @param isLight Light mode mu? (true ise ikonlar koyu)
 */
export const setNavigationBarColor = (colorHex: string, isLight: boolean): void => {
  if (Platform.OS !== 'android') return;

  try {
    (NavigationBarModule as NavigationBarModuleType)?.setNavigationBarColor(colorHex, isLight);
  } catch (error) {
    console.warn('Navigation bar color değiştirilemedi:', error);
  }
};

/**
 * Status bar rengini ayarla
 * @param colorHex Renk hex kodu
 * @param isLight Light mode mu?
 */
export const setStatusBarColor = (colorHex: string, isLight: boolean): void => {
  if (Platform.OS !== 'android') return;

  try {
    (NavigationBarModule as NavigationBarModuleType)?.setStatusBarColor(colorHex, isLight);
  } catch (error) {
    console.warn('Status bar color değiştirilemedi:', error);
  }
};

/**
 * Hem status bar hem navigation bar rengini tek seferde ayarla
 * @param colorHex Renk hex kodu
 * @param isLight Light mode mu?
 */
export const setSystemBarsColor = (colorHex: string, isLight: boolean): void => {
  if (Platform.OS !== 'android') return;

  try {
    (NavigationBarModule as NavigationBarModuleType)?.setSystemBarsColor(colorHex, isLight);
  } catch (error) {
    console.warn('System bars color değiştirilemedi:', error);
  }
};

/**
 * Tam ekran modunu etkinleştir/devre dışı bırak
 * @param enable true ise tam ekran
 */
export const setFullscreenMode = (enable: boolean): void => {
  if (Platform.OS !== 'android') return;

  try {
    (NavigationBarModule as NavigationBarModuleType)?.setFullscreenMode(enable);
  } catch (error) {
    console.warn('Fullscreen mode değiştirilemedi:', error);
  }
};

export default {
  setNavigationBarColor,
  setStatusBarColor,
  setSystemBarsColor,
  setFullscreenMode,
};
