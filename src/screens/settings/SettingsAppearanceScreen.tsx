/**
 * LifeCall - Görünüm Ayarları Ekranı
 * Modern tema seçici ile 10 farklı tema desteği
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { List, Text, Divider, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme, ThemeMode, THEME_LIST, ThemeId } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Tema kartı için gradient renkleri
const THEME_GRADIENTS: Record<string, string[]> = {
  'light': ['#FAFAFA', '#E0E0E0'],
  'dark': ['#1E1E1E', '#121212'],
  'ocean-blue': ['#162A46', '#0A1628'],
  'midnight-purple': ['#2D1B4E', '#0D0118'],
  'emerald': ['#143D2D', '#041F14'],
  'rose-pink': ['#461E34', '#1A0A14'],
  'sunset-orange': ['#462818', '#1A0F08'],
  'arctic-blue': ['#B3E5FC', '#E3F2FD'],
  'crimson': ['#461C1C', '#1A0808'],
  'forest': ['#1E3C1E', '#0A140A'],
};

// Tema ikonu
const THEME_ICONS: Record<string, string> = {
  'light': 'white-balance-sunny',
  'dark': 'moon-waning-crescent',
  'ocean-blue': 'waves',
  'midnight-purple': 'star-four-points',
  'emerald': 'leaf',
  'rose-pink': 'flower-tulip',
  'sunset-orange': 'weather-sunset',
  'arctic-blue': 'snowflake',
  'crimson': 'fire',
  'forest': 'pine-tree',
};

// Tema accent rengi
const THEME_ACCENTS: Record<string, string> = {
  'light': '#2196F3',
  'dark': '#BB86FC',
  'ocean-blue': '#00D9FF',
  'midnight-purple': '#BB86FC',
  'emerald': '#00E676',
  'rose-pink': '#FF4081',
  'sunset-orange': '#FF7043',
  'arctic-blue': '#0288D1',
  'crimson': '#FF1744',
  'forest': '#8BC34A',
};

interface ThemeCardProps {
  theme: typeof THEME_LIST[0];
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
  const { theme: currentTheme } = useAppTheme();
  const gradientColors = THEME_GRADIENTS[theme.id] || ['#333', '#111'];
  const accentColor = THEME_ACCENTS[theme.id] || '#00D9FF';
  const iconName = THEME_ICONS[theme.id] || 'palette';

  return (
    <TouchableOpacity
      style={[
        styles.themeCard,
        isSelected && { borderColor: accentColor, borderWidth: 2 },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.themeCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Seçili işareti */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: accentColor }]}>
            <MaterialCommunityIcons name="check" size={14} color="#FFF" />
          </View>
        )}

        {/* Tema ikonu */}
        <View style={[styles.themeIconContainer, { backgroundColor: accentColor + '30' }]}>
          <MaterialCommunityIcons name={iconName} size={28} color={accentColor} />
        </View>

        {/* Tema adı */}
        <Text
          style={[
            styles.themeName,
            { color: theme.isDark ? '#FFF' : '#1A1A1A' },
          ]}
        >
          {theme.name}
        </Text>

        {/* Dark/Light badge */}
        <View
          style={[
            styles.modeBadge,
            { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
          ]}
        >
          <MaterialCommunityIcons
            name={theme.isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
            size={12}
            color={theme.isDark ? '#FFF' : '#333'}
          />
          <Text
            style={[
              styles.modeBadgeText,
              { color: theme.isDark ? '#FFF' : '#333' },
            ]}
          >
            {theme.isDark ? 'Dark' : 'Light'}
          </Text>
        </View>

        {/* Preview kartları */}
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
            ]}
          />
          <View
            style={[
              styles.previewCard,
              styles.previewCardSmall,
              { backgroundColor: accentColor + '40' },
            ]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SettingsAppearanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, themeMode, themeId, setThemeMode, setThemeId, availableThemes } = useAppTheme();
  const navigation = useNavigation();

  const handleThemeSelect = async (id: ThemeId) => {
    await setThemeId(id);
  };

  const handleSystemThemeToggle = async (enabled: boolean) => {
    if (enabled) {
      await setThemeMode('system');
    } else {
      // Sistem temasını kapattığında mevcut temayı koru
      await setThemeMode(theme.colors.background === '#FAFAFA' ? 'light' : 'dark');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Sistem Teması Toggle */}
      <View style={[styles.systemToggleContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.systemToggleContent}>
          <MaterialCommunityIcons
            name="cellphone"
            size={24}
            color={theme.colors.primary}
            style={styles.systemIcon}
          />
          <View style={styles.systemToggleText}>
            <Text style={[styles.systemToggleTitle, { color: theme.colors.onSurface }]}>
              {t('settings.appearance.themeSystem') || 'Sistem Teması'}
            </Text>
            <Text style={[styles.systemToggleSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.appearance.systemDescription') || 'Cihaz ayarlarını takip et'}
            </Text>
          </View>
        </View>
        <Switch
          value={themeMode === 'system'}
          onValueChange={handleSystemThemeToggle}
          color={theme.colors.primary}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Tema Başlığı */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('settings.appearance.selectTheme') || 'Tema Seç'}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {t('settings.appearance.themeDescription') || '10 farklı tema arasından seçim yapın'}
      </Text>

      {/* Tema Grid */}
      <View style={styles.themeGrid}>
        {availableThemes.map((themeItem) => (
          <ThemeCard
            key={themeItem.id}
            theme={themeItem}
            isSelected={themeId === themeItem.id}
            onSelect={() => handleThemeSelect(themeItem.id as ThemeId)}
          />
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Dil Ayarı */}
      <List.Item
        title={t('settings.appearance.language') || 'Dil'}
        description={t('settings.appearance.languageDescription') || 'Uygulama dilini değiştir'}
        left={() => (
          <MaterialCommunityIcons
            name="translate"
            size={24}
            color={theme.colors.onSurfaceVariant}
            style={styles.icon}
          />
        )}
        right={() => (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        )}
        onPress={() => navigation.navigate('SettingsLanguage' as never)}
        style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
        titleStyle={{ color: theme.colors.onSurface }}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  systemToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  systemToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemIcon: {
    marginRight: 12,
  },
  systemToggleText: {
    flex: 1,
  },
  systemToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  systemToggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    fontWeight: '600',
  },
  sectionSubtitle: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 13,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  themeCard: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeCardGradient: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  previewContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  previewCard: {
    width: 24,
    height: 32,
    borderRadius: 4,
  },
  previewCardSmall: {
    width: 20,
    height: 28,
  },
  listItem: {
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  icon: {
    marginLeft: 16,
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
});

export default SettingsAppearanceScreen;
