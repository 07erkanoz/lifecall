/**
 * LifeCall - Bildirim Ayarları Ekranı
 *
 * Arama, mesaj ve uygulama bildirimleri için detaylı ayarlar
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { List, Text, Divider, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';

// AsyncStorage keys
const NOTIFICATION_SETTINGS_KEY = '@lifecall_notification_settings';

// Varsayılan ayarlar
const DEFAULT_NOTIFICATION_SETTINGS = {
  // Genel bildirimler
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  ledEnabled: true,

  // Arama bildirimleri
  incomingCallNotification: true,
  missedCallNotification: true,
  callReminderEnabled: false,
  callReminderInterval: 5, // dakika

  // Kişi bildirimleri
  birthdayReminders: true,
  birthdayReminderDays: 1, // kaç gün önce
  anniversaryReminders: false,

  // Rahatsız etme modu
  doNotDisturbEnabled: false,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '07:00',
  allowFavoritesDuringDnd: true,
  allowRepeatCallsDuringDnd: true,

  // Görüntüleme
  showPreview: true,
  showCallerPhoto: true,
  fullScreenNotification: true,
  headsUpNotification: true,

  // Sesler
  callRingtone: 'default',
  notificationSound: 'default',

  // Grup bildirimleri
  groupNotifications: true,
  silentGroupNotifications: false,
};

type NotificationSettings = typeof DEFAULT_NOTIFICATION_SETTINGS;

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
}

const SettingsActionItem: React.FC<SettingsActionItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  rightText,
}) => {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
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
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
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

const SettingsNotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Bildirim ayarları yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Bildirim ayarları kaydedilemedi:', error);
    }
  };

  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleOpenSystemSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  };

  const handleSelectRingtone = () => {
    // TODO: Zil sesi seçici aç
  };

  const handleSelectNotificationSound = () => {
    // TODO: Bildirim sesi seçici aç
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
      {/* Genel Bildirim Ayarları */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Genel
      </Text>

      <SettingsToggleItem
        title="Bildirimler"
        description="Tüm bildirimleri aç/kapat"
        icon="bell-outline"
        value={settings.notificationsEnabled}
        onToggle={(v) => updateSetting('notificationsEnabled', v)}
      />

      <SettingsToggleItem
        title="Ses"
        description="Bildirim sesi"
        icon="volume-high"
        value={settings.soundEnabled}
        onToggle={(v) => updateSetting('soundEnabled', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Titreşim"
        description="Bildirim titreşimi"
        icon="vibrate"
        value={settings.vibrationEnabled}
        onToggle={(v) => updateSetting('vibrationEnabled', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="LED Işığı"
        description="Bildirim LED göstergesi"
        icon="led-on"
        iconColor="#4CAF50"
        value={settings.ledEnabled}
        onToggle={(v) => updateSetting('ledEnabled', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsActionItem
        title="Sistem Bildirim Ayarları"
        description="Android bildirim kanallarını yönet"
        icon="cog-outline"
        onPress={handleOpenSystemSettings}
      />

      <Divider style={styles.divider} />

      {/* Arama Bildirimleri */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Arama Bildirimleri
      </Text>

      <SettingsToggleItem
        title="Gelen Arama"
        description="Gelen aramalar için bildirim göster"
        icon="phone-incoming"
        iconColor="#4CAF50"
        value={settings.incomingCallNotification}
        onToggle={(v) => updateSetting('incomingCallNotification', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Cevapsız Arama"
        description="Cevapsız aramalar için bildirim göster"
        icon="phone-missed"
        iconColor="#F44336"
        value={settings.missedCallNotification}
        onToggle={(v) => updateSetting('missedCallNotification', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Arama Hatırlatıcı"
        description="Cevapsız arama hatırlatıcısı"
        icon="bell-ring-outline"
        iconColor="#FF9800"
        value={settings.callReminderEnabled}
        onToggle={(v) => updateSetting('callReminderEnabled', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Tam Ekran Bildirim"
        description="Gelen aramayı tam ekranda göster"
        icon="fullscreen"
        value={settings.fullScreenNotification}
        onToggle={(v) => updateSetting('fullScreenNotification', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Açılır Bildirim"
        description="Bildirimi ekranın üstünde göster"
        icon="message-alert-outline"
        value={settings.headsUpNotification}
        onToggle={(v) => updateSetting('headsUpNotification', v)}
        disabled={!settings.notificationsEnabled}
      />

      <Divider style={styles.divider} />

      {/* Kişi Bildirimleri */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Kişi Bildirimleri
      </Text>

      <SettingsToggleItem
        title="Doğum Günü Hatırlatıcı"
        description="Kişilerin doğum günlerini hatırlat"
        icon="cake-variant"
        iconColor="#E91E63"
        value={settings.birthdayReminders}
        onToggle={(v) => updateSetting('birthdayReminders', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Özel Gün Hatırlatıcı"
        description="Yıldönümü ve özel günleri hatırlat"
        icon="calendar-heart"
        iconColor="#9C27B0"
        value={settings.anniversaryReminders}
        onToggle={(v) => updateSetting('anniversaryReminders', v)}
        disabled={!settings.notificationsEnabled}
      />

      <Divider style={styles.divider} />

      {/* Rahatsız Etme Modu */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Rahatsız Etme Modu
      </Text>

      <SettingsToggleItem
        title="Rahatsız Etme"
        description="Belirli saatlerde bildirimleri sessize al"
        icon="minus-circle-outline"
        iconColor="#607D8B"
        value={settings.doNotDisturbEnabled}
        onToggle={(v) => updateSetting('doNotDisturbEnabled', v)}
      />

      <SettingsActionItem
        title="Sessiz Saatler"
        description="Rahatsız etme zamanlarını ayarla"
        icon="clock-outline"
        rightText={`${settings.doNotDisturbStart} - ${settings.doNotDisturbEnd}`}
        onPress={() => {/* TODO: Saat seçici aç */}}
      />

      <SettingsToggleItem
        title="Favorilere İzin Ver"
        description="Favori kişilerden gelen aramalara izin ver"
        icon="star-outline"
        iconColor="#FFC107"
        value={settings.allowFavoritesDuringDnd}
        onToggle={(v) => updateSetting('allowFavoritesDuringDnd', v)}
        disabled={!settings.doNotDisturbEnabled}
      />

      <SettingsToggleItem
        title="Tekrarlayan Aramalara İzin Ver"
        description="3 dakika içinde 2. kez arayan kişilere izin ver"
        icon="phone-refresh-outline"
        value={settings.allowRepeatCallsDuringDnd}
        onToggle={(v) => updateSetting('allowRepeatCallsDuringDnd', v)}
        disabled={!settings.doNotDisturbEnabled}
      />

      <Divider style={styles.divider} />

      {/* Görüntüleme */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Görüntüleme
      </Text>

      <SettingsToggleItem
        title="Önizleme Göster"
        description="Bildirimde arayan bilgilerini göster"
        icon="eye-outline"
        value={settings.showPreview}
        onToggle={(v) => updateSetting('showPreview', v)}
        disabled={!settings.notificationsEnabled}
      />

      <SettingsToggleItem
        title="Arayan Fotoğrafı"
        description="Bildirimde arayan fotoğrafını göster"
        icon="account-circle-outline"
        value={settings.showCallerPhoto}
        onToggle={(v) => updateSetting('showCallerPhoto', v)}
        disabled={!settings.notificationsEnabled || !settings.showPreview}
      />

      <Divider style={styles.divider} />

      {/* Sesler */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Sesler
      </Text>

      <SettingsActionItem
        title="Zil Sesi"
        description="Gelen arama zil sesini seç"
        icon="music-note"
        iconColor="#2196F3"
        rightText={settings.callRingtone === 'default' ? 'Varsayılan' : settings.callRingtone}
        onPress={handleSelectRingtone}
      />

      <SettingsActionItem
        title="Bildirim Sesi"
        description="Bildirim sesini seç"
        icon="bell-ring-outline"
        iconColor="#9C27B0"
        rightText={settings.notificationSound === 'default' ? 'Varsayılan' : settings.notificationSound}
        onPress={handleSelectNotificationSound}
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

export default SettingsNotificationsScreen;
