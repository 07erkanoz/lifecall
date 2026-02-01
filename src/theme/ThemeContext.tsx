/**
 * LifeCall - Tema Context
 *
 * Tema yönetimi için React Context
 * - Çoklu tema desteği (10 tema)
 * - Light/Dark/System mod desteği
 * - AsyncStorage ile tema tercihi saklama
 * - Sistem teması değişikliklerini izleme
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  lightTheme,
  darkTheme,
  AppTheme,
  ThemeMode,
  ThemeId,
  APP_THEMES,
  THEME_LIST,
  getThemeById,
} from './themes';

// AsyncStorage keys
const THEME_MODE_KEY = '@lifecall_theme_mode';
const THEME_ID_KEY = '@lifecall_theme_id';

// Context tipi
interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  themeId: ThemeId;
  isDarkMode: boolean;
  availableThemes: typeof THEME_LIST;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setThemeId: (id: ThemeId) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// Context oluştur
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Tema Provider bileşeni
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [themeId, setThemeIdState] = useState<ThemeId>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Gerçek dark mode durumunu hesapla
  const isDarkMode = useMemo(() => {
    // Eğer belirli bir tema seçilmişse, o temanın dark mode durumunu kullan
    const selectedThemeInfo = THEME_LIST.find(t => t.id === themeId);
    if (selectedThemeInfo && themeId !== 'light' && themeId !== 'dark') {
      return selectedThemeInfo.isDark;
    }

    // Light/Dark tema için themeMode'u kullan
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, themeId, systemColorScheme]);

  // Aktif temayı seç
  const theme = useMemo(() => {
    // Eğer belirli bir tema seçilmişse onu kullan
    if (themeId !== 'light' && themeId !== 'dark') {
      return getThemeById(themeId);
    }

    // Light/Dark için themeMode'u kullan
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, themeId, systemColorScheme]);

  // Kaydedilmiş temayı yükle
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const [savedMode, savedId] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(THEME_ID_KEY),
        ]);

        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }

        if (savedId && Object.keys(APP_THEMES).includes(savedId)) {
          setThemeIdState(savedId as ThemeId);
        }
      } catch (error) {
        console.warn('Tema tercihi yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, []);

  // Sistem teması değişikliklerini izle
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Sadece sistem modundayken güncelle
      if (themeMode === 'system') {
        // State otomatik güncellenecek (useMemo bağımlılığı)
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  // Tema modunu değiştir ve kaydet
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    // Mode değiştiğinde, tema ID'sini de uygun şekilde güncelle
    if (mode === 'light') {
      setThemeIdState('light');
    } else if (mode === 'dark') {
      setThemeIdState('dark');
    }
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      if (mode === 'light' || mode === 'dark') {
        await AsyncStorage.setItem(THEME_ID_KEY, mode);
      }
    } catch (error) {
      console.error('Tema tercihi kaydedilemedi:', error);
    }
  }, []);

  // Tema ID'sini değiştir ve kaydet
  const setThemeId = useCallback(async (id: ThemeId) => {
    setThemeIdState(id);
    // Tema seçildiğinde mode'u da güncelle
    const themeInfo = THEME_LIST.find(t => t.id === id);
    if (id === 'light') {
      setThemeModeState('light');
    } else if (id === 'dark') {
      setThemeModeState('dark');
    } else if (themeInfo) {
      // Özel tema seçildi, mode'u temanın dark durumuna göre ayarla
      setThemeModeState(themeInfo.isDark ? 'dark' : 'light');
    }
    try {
      await AsyncStorage.setItem(THEME_ID_KEY, id);
      if (id === 'light' || id === 'dark') {
        await AsyncStorage.setItem(THEME_MODE_KEY, id);
      }
    } catch (error) {
      console.error('Tema ID kaydedilemedi:', error);
    }
  }, []);

  // Temayı toggle et (light <-> dark)
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isDarkMode, setThemeMode]);

  // Context değeri
  const value = useMemo(
    () => ({
      theme,
      themeMode,
      themeId,
      isDarkMode,
      availableThemes: THEME_LIST,
      setThemeMode,
      setThemeId,
      toggleTheme,
    }),
    [theme, themeMode, themeId, isDarkMode, setThemeMode, setThemeId, toggleTheme]
  );

  // Yüklenene kadar bekle
  if (isLoading) {
    return null; // veya bir loading indicator
  }

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Tema hook'u
 * @returns Tema context değerleri
 */
export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
