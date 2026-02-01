/**
 * LifeCall - Ayarlar Ekranı
 *
 * Kapsamlı telefon ve rehber uygulaması ayarları
 * - Görünüm (Tema, Dil)
 * - Kişiler (Hesap seçimi, sıralama, görünüm)
 * - Aramalar (Geçmiş, spam koruması, cevaplama)
 * - Bildirimler (Arama, kişi, rahatsız etme)
 * - Gizlilik (Kilit, veri gizliliği, güvenlik)
 * - Yedekleme
 * - Hakkında
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';
import { RootStackScreenProps } from '../navigation/types';

interface SettingsItemProps {
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  onPress: () => void;
  badge?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  iconBgColor,
  onPress,
  badge,
}) => {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor || (iconColor || theme.colors.primary) + '20' }]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={iconColor || theme.colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {children}
      </View>
    </View>
  );
};

const SettingsDivider: React.FC = () => {
  const { theme } = useAppTheme();
  return <View style={[styles.itemDivider, { backgroundColor: theme.colors.outline + '30' }]} />;
};

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, themeId } = useAppTheme();
  const navigation = useNavigation<RootStackScreenProps<'Main'>['navigation']>();
  const insets = useSafeAreaInsets();

  // Tema adını al
  const getThemeName = () => {
    const themeNames: Record<string, string> = {
      'light': 'Açık',
      'dark': 'Koyu',
      'ocean-blue': 'Okyanus Mavisi',
      'midnight-purple': 'Gece Moru',
      'emerald': 'Zümrüt',
      'rose-pink': 'Gül Pembesi',
      'sunset-orange': 'Gün Batımı',
      'arctic-blue': 'Kutup Mavisi',
      'crimson': 'Kırmızı',
      'forest': 'Orman',
    };
    return themeNames[themeId] || 'Koyu';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
    >
      {/* Başlık */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          {t('settings.title') || 'Ayarlar'}
        </Text>
      </View>

      {/* Görünüm Bölümü */}
      <SettingsSection title="Görünüm">
        <SettingsItem
          title={t('settings.appearance.title') || 'Görünüm'}
          description={getThemeName()}
          icon="palette-outline"
          iconColor="#2196F3"
          onPress={() => navigation.navigate('SettingsAppearance')}
        />
        <SettingsDivider />
        <SettingsItem
          title={t('settings.appearance.language') || 'Dil'}
          description="Türkçe"
          icon="translate"
          iconColor="#9C27B0"
          onPress={() => navigation.navigate('SettingsLanguage')}
        />
      </SettingsSection>

      {/* Kişiler Bölümü */}
      <SettingsSection title="Kişiler">
        <SettingsItem
          title={t('settings.contacts.title') || 'Rehber Ayarları'}
          description="Hesaplar, sıralama, görüntüleme"
          icon="account-group-outline"
          iconColor="#4CAF50"
          onPress={() => navigation.navigate('SettingsContacts' as never)}
        />
      </SettingsSection>

      {/* Aramalar Bölümü */}
      <SettingsSection title="Aramalar">
        <SettingsItem
          title={t('settings.calls.title') || 'Arama Ayarları'}
          description="Geçmiş, spam koruması, cevaplama"
          icon="phone-outline"
          iconColor="#00BCD4"
          onPress={() => navigation.navigate('SettingsCalls' as never)}
        />
        <SettingsDivider />
        <SettingsItem
          title={t('callThemes.title') || 'Arama Teması'}
          description="Gelen arama ekranını özelleştir"
          icon="palette-swatch-variant"
          iconColor="#E91E63"
          onPress={() => navigation.navigate('SettingsCallTheme')}
        />
        <SettingsDivider />
        <SettingsItem
          title={t('settings.ringtone') || 'Zil Sesi'}
          description="Varsayılan zil sesini seç"
          icon="music-note"
          iconColor="#FF5722"
          onPress={() => navigation.navigate('SettingsRingtone')}
        />
      </SettingsSection>

      {/* Bildirimler Bölümü */}
      <SettingsSection title="Bildirimler">
        <SettingsItem
          title="Bildirim Ayarları"
          description="Arama, kişi bildirimleri, sesler"
          icon="bell-outline"
          iconColor="#FF9800"
          onPress={() => navigation.navigate('SettingsNotifications' as never)}
        />
      </SettingsSection>

      {/* Gizlilik ve Güvenlik */}
      <SettingsSection title="Gizlilik ve Güvenlik">
        <SettingsItem
          title="Gizlilik"
          description="Uygulama kilidi, veri gizliliği"
          icon="shield-lock-outline"
          iconColor="#607D8B"
          onPress={() => navigation.navigate('SettingsPrivacy' as never)}
        />
      </SettingsSection>

      {/* Mağaza */}
      <SettingsSection title="Mağaza">
        <SettingsItem
          title={t('store.themes') || 'Tema Mağazası'}
          description="Yeni temalar keşfet"
          icon="shopping-outline"
          iconColor="#673AB7"
          onPress={() => navigation.navigate('ThemeStore')}
          badge="Yeni"
        />
      </SettingsSection>

      {/* Veri ve Depolama */}
      <SettingsSection title="Veri ve Depolama">
        <SettingsItem
          title={t('settings.backup.title') || 'Yedekleme'}
          description="Verilerinizi yedekleyin ve geri yükleyin"
          icon="cloud-upload-outline"
          iconColor="#03A9F4"
          onPress={() => navigation.navigate('SettingsBackup' as never)}
        />
      </SettingsSection>

      {/* Hakkında */}
      <SettingsSection title="Hakkında">
        <SettingsItem
          title={t('settings.about.title') || 'Uygulama Hakkında'}
          description="Sürüm, lisans, geliştirici"
          icon="information-outline"
          iconColor="#795548"
          onPress={() => navigation.navigate('SettingsAbout')}
        />
      </SettingsSection>

      {/* Alt bilgi */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          LifeCall v1.0.0
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Made with ❤️ by Lifeos
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  itemDivider: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});

export default SettingsScreen;
