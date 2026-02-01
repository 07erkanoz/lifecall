/**
 * LifeCall - Gizlilik Ayarları Ekranı
 *
 * Uygulama kilidi, veri gizliliği, izinler ve güvenlik ayarları
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { List, Text, Divider, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';

// AsyncStorage keys
const PRIVACY_SETTINGS_KEY = '@lifecall_privacy_settings';

// Varsayılan ayarlar
const DEFAULT_PRIVACY_SETTINGS = {
  // Uygulama kilidi
  appLockEnabled: false,
  appLockType: 'none' as 'none' | 'pin' | 'biometric' | 'pattern',
  lockOnExit: false,
  lockAfterTimeout: 0, // dakika, 0 = hemen

  // Veri gizliliği
  hideCallContent: false,
  hideContactPhotos: false,
  hideNotificationContent: false,
  incognitoKeyboard: false,

  // Arama gizliliği
  hideCallHistory: false,
  hideFromRecents: false,
  privateCallsEnabled: false,

  // Veri paylaşımı
  analyticsEnabled: true,
  crashReportsEnabled: true,
  usageStatsEnabled: false,

  // Güvenlik
  screenshotProtection: false,
  secureBackup: true,
  autoDeleteOldData: false,
  autoDeletePeriod: 30, // gün
};

type PrivacySettings = typeof DEFAULT_PRIVACY_SETTINGS;

interface SettingsItemProps {
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const SettingsToggleItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  value,
  onToggle,
  disabled,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.settingsItem,
        { backgroundColor: theme.colors.surface },
        disabled && styles.disabledItem,
      ]}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || theme.colors.primary) + '20' }]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={iconColor || theme.colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.itemTitle,
              { color: disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        color={theme.colors.primary}
        disabled={disabled}
      />
    </View>
  );
};

interface SettingsActionItemProps {
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  rightText?: string;
  destructive?: boolean;
}

const SettingsActionItem: React.FC<SettingsActionItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  rightText,
  destructive,
}) => {
  const { theme } = useAppTheme();
  const textColor = destructive ? '#F44336' : theme.colors.onSurface;

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || (destructive ? '#F44336' : theme.colors.primary)) + '20' }]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={iconColor || (destructive ? '#F44336' : theme.colors.primary)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, { color: textColor }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightText ? (
        <Text style={[styles.rightText, { color: theme.colors.onSurfaceVariant }]}>
          {rightText}
        </Text>
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </TouchableOpacity>
  );
};

const SettingsPrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Gizlilik ayarları yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Gizlilik ayarları kaydedilemedi:', error);
    }
  };

  const updateSetting = useCallback(<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleAppLockSetup = () => {
    if (settings.appLockEnabled) {
      // Kilidi kapat
      Alert.alert(
        'Uygulama Kilidi',
        'Uygulama kilidini kapatmak istediğinize emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Kapat',
            onPress: () => updateSetting('appLockEnabled', false),
          },
        ]
      );
    } else {
      // Kilidi aç - ayar sayfasına yönlendir
      Alert.alert(
        'Uygulama Kilidi',
        'Uygulama kilidini etkinleştirmek için bir PIN veya biyometrik doğrulama ayarlayın.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ayarla',
            onPress: () => {
              // TODO: Kilit ayarlama ekranına yönlendir
              updateSetting('appLockEnabled', true);
            },
          },
        ]
      );
    }
  };

  const handleOpenAppSettings = () => {
    Linking.openSettings();
  };

  const handleClearPrivateData = () => {
    Alert.alert(
      'Gizli Verileri Temizle',
      'Arama geçmişi, gizli kişiler ve önbellek temizlenecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            // TODO: Verileri temizle
            Alert.alert('Başarılı', 'Gizli veriler temizlendi.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Verileri Dışa Aktar',
      'Kişileriniz ve ayarlarınız dışa aktarılacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Dışa Aktar',
          onPress: () => {
            // TODO: Verileri dışa aktar
            Alert.alert('Başarılı', 'Verileriniz dışa aktarıldı.');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Uygulama Kilidi Bölümü */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Uygulama Kilidi
      </Text>

      <SettingsActionItem
        title="Uygulama Kilidi"
        description={settings.appLockEnabled ? 'Etkin' : 'Devre dışı'}
        icon="lock-outline"
        iconColor="#4CAF50"
        onPress={handleAppLockSetup}
        rightText={settings.appLockEnabled ? 'Açık' : 'Kapalı'}
      />

      <SettingsToggleItem
        title="Çıkışta Kilitle"
        description="Uygulama arka plana geçince kilitle"
        icon="exit-to-app"
        value={settings.lockOnExit}
        onToggle={(v) => updateSetting('lockOnExit', v)}
        disabled={!settings.appLockEnabled}
      />

      <Divider style={styles.divider} />

      {/* Veri Gizliliği */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Veri Gizliliği
      </Text>

      <SettingsToggleItem
        title="Arama İçeriğini Gizle"
        description="Kilitli ekranda arama bilgilerini gizle"
        icon="phone-lock"
        iconColor="#FF9800"
        value={settings.hideCallContent}
        onToggle={(v) => updateSetting('hideCallContent', v)}
      />

      <SettingsToggleItem
        title="Bildirim İçeriğini Gizle"
        description="Kilitli ekranda bildirim detaylarını gizle"
        icon="bell-off-outline"
        iconColor="#9C27B0"
        value={settings.hideNotificationContent}
        onToggle={(v) => updateSetting('hideNotificationContent', v)}
      />

      <SettingsToggleItem
        title="Kişi Fotoğraflarını Gizle"
        description="Rehberde kişi fotoğraflarını gösterme"
        icon="account-off-outline"
        value={settings.hideContactPhotos}
        onToggle={(v) => updateSetting('hideContactPhotos', v)}
      />

      <SettingsToggleItem
        title="Gizli Klavye"
        description="Klavye girişlerini önbelleğe alma"
        icon="keyboard-off-outline"
        value={settings.incognitoKeyboard}
        onToggle={(v) => updateSetting('incognitoKeyboard', v)}
      />

      <Divider style={styles.divider} />

      {/* Arama Gizliliği */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Arama Gizliliği
      </Text>

      <SettingsToggleItem
        title="Arama Geçmişini Gizle"
        description="Son aramalar listesini gösterme"
        icon="history"
        value={settings.hideCallHistory}
        onToggle={(v) => updateSetting('hideCallHistory', v)}
      />

      <SettingsToggleItem
        title="Son Kullanılanlardan Gizle"
        description="Sistem son kullanılanlarında gösterme"
        icon="view-list-outline"
        value={settings.hideFromRecents}
        onToggle={(v) => updateSetting('hideFromRecents', v)}
      />

      <SettingsToggleItem
        title="Gizli Aramalar"
        description="Gizli arama modu etkinleştir"
        icon="incognito"
        iconColor="#607D8B"
        value={settings.privateCallsEnabled}
        onToggle={(v) => updateSetting('privateCallsEnabled', v)}
      />

      <Divider style={styles.divider} />

      {/* Güvenlik */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Güvenlik
      </Text>

      <SettingsToggleItem
        title="Ekran Görüntüsü Koruması"
        description="Uygulama içinde ekran görüntüsü almayı engelle"
        icon="cellphone-screenshot"
        iconColor="#E91E63"
        value={settings.screenshotProtection}
        onToggle={(v) => updateSetting('screenshotProtection', v)}
      />

      <SettingsToggleItem
        title="Güvenli Yedekleme"
        description="Yedeklemeleri şifrele"
        icon="shield-lock-outline"
        iconColor="#4CAF50"
        value={settings.secureBackup}
        onToggle={(v) => updateSetting('secureBackup', v)}
      />

      <SettingsToggleItem
        title="Eski Verileri Otomatik Sil"
        description="Belirli süreden eski verileri sil"
        icon="delete-clock-outline"
        value={settings.autoDeleteOldData}
        onToggle={(v) => updateSetting('autoDeleteOldData', v)}
      />

      <Divider style={styles.divider} />

      {/* Veri Paylaşımı */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Veri Paylaşımı
      </Text>

      <SettingsToggleItem
        title="Analitik Verileri"
        description="Uygulama geliştirmek için anonim veri paylaş"
        icon="chart-line"
        value={settings.analyticsEnabled}
        onToggle={(v) => updateSetting('analyticsEnabled', v)}
      />

      <SettingsToggleItem
        title="Çökme Raporları"
        description="Hata raporlarını otomatik gönder"
        icon="bug-outline"
        value={settings.crashReportsEnabled}
        onToggle={(v) => updateSetting('crashReportsEnabled', v)}
      />

      <SettingsToggleItem
        title="Kullanım İstatistikleri"
        description="Detaylı kullanım verilerini paylaş"
        icon="chart-bar"
        value={settings.usageStatsEnabled}
        onToggle={(v) => updateSetting('usageStatsEnabled', v)}
      />

      <Divider style={styles.divider} />

      {/* İzinler ve Eylemler */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        İzinler ve Veri
      </Text>

      <SettingsActionItem
        title="Uygulama İzinleri"
        description="Kamera, mikrofon, konum izinlerini yönet"
        icon="shield-account-outline"
        onPress={handleOpenAppSettings}
      />

      <SettingsActionItem
        title="Verileri Dışa Aktar"
        description="Tüm verilerinizi indirin"
        icon="download-outline"
        iconColor="#2196F3"
        onPress={handleExportData}
      />

      <SettingsActionItem
        title="Gizli Verileri Temizle"
        description="Geçmiş ve önbelleği temizle"
        icon="delete-outline"
        destructive
        onPress={handleClearPrivateData}
      />

      <View style={styles.bottomSpacer} />
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
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  rightText: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default SettingsPrivacyScreen;
