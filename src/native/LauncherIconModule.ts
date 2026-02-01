/**
 * LifeCall - Launcher Icon Module
 *
 * Uygulama için ek launcher ikonları yönetimi:
 * - Rehber ikonu (doğrudan rehber sekmesini açar)
 * - Takvim ikonu (doğrudan takvim sekmesini açar)
 * - Notlar ikonu (doğrudan notlar sekmesini açar)
 *
 * Kullanıcı isterse bu ikonları etkinleştirip uygulama çekmecesine ekleyebilir.
 */

import { NativeModules, Platform } from 'react-native';

export type LauncherIconType = 'contacts' | 'calendar' | 'notes';

interface IconStatus {
  iconType: string;
  enabled: boolean;
}

interface AllIconStatuses {
  contacts: boolean;
  calendar: boolean;
  notes: boolean;
}

interface SetIconResult {
  iconType: string;
  enabled: boolean;
  success: boolean;
}

interface LauncherIconModuleType {
  getIconStatus: (iconType: string) => Promise<IconStatus>;
  getAllIconStatuses: () => Promise<AllIconStatuses>;
  setIconEnabled: (iconType: string, enabled: boolean) => Promise<SetIconResult>;
  enableAllIcons: () => Promise<boolean>;
  disableAllIcons: () => Promise<boolean>;
  getPendingTargetTab: () => Promise<string | null>;
}

const { LauncherIconModule } = NativeModules;

/**
 * Belirli bir launcher ikonunun durumunu al
 */
export const getIconStatus = async (iconType: LauncherIconType): Promise<IconStatus | null> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return null;
  }

  try {
    return await (LauncherIconModule as LauncherIconModuleType).getIconStatus(iconType);
  } catch (error) {
    console.warn('LauncherIconModule.getIconStatus error:', error);
    return null;
  }
};

/**
 * Tüm launcher ikonlarının durumunu al
 */
export const getAllIconStatuses = async (): Promise<AllIconStatuses | null> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return null;
  }

  try {
    return await (LauncherIconModule as LauncherIconModuleType).getAllIconStatuses();
  } catch (error) {
    console.warn('LauncherIconModule.getAllIconStatuses error:', error);
    return null;
  }
};

/**
 * Launcher ikonunu etkinleştir/devre dışı bırak
 */
export const setIconEnabled = async (
  iconType: LauncherIconType,
  enabled: boolean
): Promise<SetIconResult | null> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return null;
  }

  try {
    return await (LauncherIconModule as LauncherIconModuleType).setIconEnabled(iconType, enabled);
  } catch (error) {
    console.warn('LauncherIconModule.setIconEnabled error:', error);
    return null;
  }
};

/**
 * Tüm ek launcher ikonlarını etkinleştir
 */
export const enableAllIcons = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return false;
  }

  try {
    return await (LauncherIconModule as LauncherIconModuleType).enableAllIcons();
  } catch (error) {
    console.warn('LauncherIconModule.enableAllIcons error:', error);
    return false;
  }
};

/**
 * Tüm ek launcher ikonlarını devre dışı bırak
 */
export const disableAllIcons = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return false;
  }

  try {
    return await (LauncherIconModule as LauncherIconModuleType).disableAllIcons();
  } catch (error) {
    console.warn('LauncherIconModule.disableAllIcons error:', error);
    return false;
  }
};

/**
 * Bekleyen hedef sekmeyi al (launcher alias'tan başlatıldıysa)
 * Uygulama bir launcher kısayolundan başlatıldıysa ilgili sekme adını döndürür
 */
export const getPendingTargetTab = async (): Promise<LauncherIconType | null> => {
  if (Platform.OS !== 'android' || !LauncherIconModule) {
    return null;
  }

  try {
    const tab = await (LauncherIconModule as LauncherIconModuleType).getPendingTargetTab();
    return tab as LauncherIconType | null;
  } catch (error) {
    console.warn('LauncherIconModule.getPendingTargetTab error:', error);
    return null;
  }
};

/**
 * İkon tipi için gösterilecek etiket
 */
export const getIconLabel = (iconType: LauncherIconType): string => {
  switch (iconType) {
    case 'contacts':
      return 'Rehber';
    case 'calendar':
      return 'Takvim';
    case 'notes':
      return 'Notlar';
    default:
      return iconType;
  }
};

/**
 * İkon tipi için gösterilecek renk
 */
export const getIconColor = (iconType: LauncherIconType): string => {
  switch (iconType) {
    case 'contacts':
      return '#4CAF50'; // Yeşil
    case 'calendar':
      return '#2196F3'; // Mavi
    case 'notes':
      return '#FF9800'; // Turuncu
    default:
      return '#6750A4'; // Primary
  }
};

/**
 * İkon tipi için Material icon adı
 */
export const getIconName = (iconType: LauncherIconType): string => {
  switch (iconType) {
    case 'contacts':
      return 'account-group';
    case 'calendar':
      return 'calendar-month';
    case 'notes':
      return 'note-text';
    default:
      return 'application';
  }
};

export default {
  getIconStatus,
  getAllIconStatuses,
  setIconEnabled,
  enableAllIcons,
  disableAllIcons,
  getPendingTargetTab,
  getIconLabel,
  getIconColor,
  getIconName,
};
