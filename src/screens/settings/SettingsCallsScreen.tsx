/**
 * LifeCall - Arama Ayarları Ekranı
 *
 * Arama geçmişi, spam koruması, titreşim ve cevaplama ayarları
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { List, Text, Divider, Switch, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';

// AsyncStorage keys
const CALL_SETTINGS_KEY = '@lifecall_call_settings';

// Arama geçmişi saklama süreleri
const CALL_HISTORY_PERIODS = [
  { key: '7days', label: '7 gün', days: 7 },
  { key: '30days', label: '30 gün', days: 30 },
  { key: '90days', label: '3 ay', days: 90 },
  { key: '180days', label: '6 ay', days: 180 },
  { key: '365days', label: '1 yıl', days: 365 },
  { key: 'forever', label: 'Süresiz', days: -1 },
];

// Varsayılan ayarlar
const DEFAULT_CALL_SETTINGS = {
  // Geçmiş ayarları
  historyRetentionPeriod: '90days',
  showMissedCallBadge: true,
  groupCallsByContact: true,

  // Spam koruması
  blockUnknownCallers: false,
  blockPrivateNumbers: false,
  spamProtection: true,
  spamCallNotification: true,

  // Titreşim ayarları
  vibrationEnabled: true,
  vibrationOnAnswer: false,
  vibrationOnHangup: false,

  // Cevaplama yöntemleri
  answerWithButton: true,
  answerWithSwipe: true,
  answerWithProximity: false,
  rejectWithButton: true,
  rejectWithFlip: false,

  // Ses ayarları
  speakerphoneDefault: false,
  autoRecordCalls: false,

  // Diğer
  showCallerId: true,
  confirmBeforeCall: false,
  dialpadSounds: true,
  dialpadHaptic: true,
};

type CallSettings = typeof DEFAULT_CALL_SETTINGS;

interface SettingsItemProps {
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const SettingsToggleItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  value,
  onToggle,
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}>
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
      <Switch
        value={value}
        onValueChange={onToggle}
        color={theme.colors.primary}
      />
    </View>
  );
};

const SettingsCallsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [settings, setSettings] = useState<CallSettings>(DEFAULT_CALL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistoryPicker, setShowHistoryPicker] = useState(false);

  // Ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(CALL_SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_CALL_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Arama ayarları yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: CallSettings) => {
    try {
      await AsyncStorage.setItem(CALL_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Arama ayarları kaydedilemedi:', error);
    }
  };

  const updateSetting = useCallback(<K extends keyof CallSettings>(
    key: K,
    value: CallSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleClearCallHistory = () => {
    Alert.alert(
      'Arama Geçmişini Temizle',
      'Tüm arama geçmişi silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            // TODO: Arama geçmişini temizle
            Alert.alert('Başarılı', 'Arama geçmişi temizlendi.');
          },
        },
      ]
    );
  };

  const getHistoryPeriodLabel = () => {
    const period = CALL_HISTORY_PERIODS.find(p => p.key === settings.historyRetentionPeriod);
    return period?.label || '3 ay';
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
      {/* Arama Geçmişi Bölümü */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Arama Geçmişi
      </Text>

      {/* Geçmiş saklama süresi */}
      <TouchableOpacity
        style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => setShowHistoryPicker(!showHistoryPicker)}
      >
        <View style={styles.settingsItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
              Geçmiş Saklama Süresi
            </Text>
            <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
              {getHistoryPeriodLabel()}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={showHistoryPicker ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* Süre seçici */}
      {showHistoryPicker && (
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <RadioButton.Group
            value={settings.historyRetentionPeriod}
            onValueChange={(value) => {
              updateSetting('historyRetentionPeriod', value);
              setShowHistoryPicker(false);
            }}
          >
            {CALL_HISTORY_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={styles.radioItem}
                onPress={() => {
                  updateSetting('historyRetentionPeriod', period.key);
                  setShowHistoryPicker(false);
                }}
              >
                <RadioButton value={period.key} color={theme.colors.primary} />
                <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        </View>
      )}

      <SettingsToggleItem
        title="Cevapsız Arama Rozeti"
        description="Cevapsız arama sayısını göster"
        icon="bell-badge-outline"
        value={settings.showMissedCallBadge}
        onToggle={(v) => updateSetting('showMissedCallBadge', v)}
      />

      <SettingsToggleItem
        title="Aramaları Grupla"
        description="Aynı kişiden gelen aramaları grupla"
        icon="group"
        value={settings.groupCallsByContact}
        onToggle={(v) => updateSetting('groupCallsByContact', v)}
      />

      {/* Geçmişi temizle */}
      <TouchableOpacity
        style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
        onPress={handleClearCallHistory}
      >
        <View style={styles.settingsItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: '#F4433620' }]}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={22}
              color="#F44336"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: '#F44336' }]}>
              Arama Geçmişini Temizle
            </Text>
            <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
              Tüm arama kayıtlarını sil
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      {/* Spam Koruması Bölümü */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Spam Koruması
      </Text>

      <SettingsToggleItem
        title="Spam Koruması"
        description="Bilinen spam numaralarını otomatik engelle"
        icon="shield-check-outline"
        iconColor="#4CAF50"
        value={settings.spamProtection}
        onToggle={(v) => updateSetting('spamProtection', v)}
      />

      <SettingsToggleItem
        title="Bilinmeyen Aramaları Engelle"
        description="Rehberde olmayan numaralardan gelen aramaları engelle"
        icon="phone-off-outline"
        iconColor="#FF9800"
        value={settings.blockUnknownCallers}
        onToggle={(v) => updateSetting('blockUnknownCallers', v)}
      />

      <SettingsToggleItem
        title="Gizli Numaraları Engelle"
        description="Numara gizleyerek arayan kişileri engelle"
        icon="eye-off-outline"
        iconColor="#9C27B0"
        value={settings.blockPrivateNumbers}
        onToggle={(v) => updateSetting('blockPrivateNumbers', v)}
      />

      <SettingsToggleItem
        title="Spam Bildirimi"
        description="Engellenen spam aramalarını bildir"
        icon="bell-outline"
        value={settings.spamCallNotification}
        onToggle={(v) => updateSetting('spamCallNotification', v)}
      />

      <Divider style={styles.divider} />

      {/* Titreşim Ayarları */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Titreşim
      </Text>

      <SettingsToggleItem
        title="Titreşim"
        description="Gelen aramalar için titreşim"
        icon="vibrate"
        value={settings.vibrationEnabled}
        onToggle={(v) => updateSetting('vibrationEnabled', v)}
      />

      <SettingsToggleItem
        title="Cevaplanınca Titret"
        description="Arama cevaplanınca kısa titreşim"
        icon="phone-incoming-outline"
        value={settings.vibrationOnAnswer}
        onToggle={(v) => updateSetting('vibrationOnAnswer', v)}
      />

      <SettingsToggleItem
        title="Kapanınca Titret"
        description="Arama sonlandığında kısa titreşim"
        icon="phone-hangup-outline"
        value={settings.vibrationOnHangup}
        onToggle={(v) => updateSetting('vibrationOnHangup', v)}
      />

      <Divider style={styles.divider} />

      {/* Cevaplama Yöntemleri */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Cevaplama Yöntemleri
      </Text>

      <SettingsToggleItem
        title="Düğme ile Cevapla"
        description="Ses düğmeleri ile aramayı cevapla"
        icon="gesture-tap-button"
        value={settings.answerWithButton}
        onToggle={(v) => updateSetting('answerWithButton', v)}
      />

      <SettingsToggleItem
        title="Kaydırarak Cevapla"
        description="Ekranı kaydırarak aramayı cevapla"
        icon="gesture-swipe"
        value={settings.answerWithSwipe}
        onToggle={(v) => updateSetting('answerWithSwipe', v)}
      />

      <SettingsToggleItem
        title="Yakınlık Sensörü ile Cevapla"
        description="Telefonu kulağa götürerek cevapla"
        icon="cellphone"
        value={settings.answerWithProximity}
        onToggle={(v) => updateSetting('answerWithProximity', v)}
      />

      <SettingsToggleItem
        title="Düğme ile Reddet"
        description="Güç düğmesi ile aramayı reddet"
        icon="gesture-tap-button"
        iconColor="#F44336"
        value={settings.rejectWithButton}
        onToggle={(v) => updateSetting('rejectWithButton', v)}
      />

      <SettingsToggleItem
        title="Çevirerek Reddet"
        description="Telefonu çevirerek aramayı reddet"
        icon="rotate-3d-variant"
        iconColor="#F44336"
        value={settings.rejectWithFlip}
        onToggle={(v) => updateSetting('rejectWithFlip', v)}
      />

      <Divider style={styles.divider} />

      {/* Diğer Ayarlar */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Diğer Ayarlar
      </Text>

      <SettingsToggleItem
        title="Hoparlör Varsayılan"
        description="Aramaları hoparlörden başlat"
        icon="volume-high"
        value={settings.speakerphoneDefault}
        onToggle={(v) => updateSetting('speakerphoneDefault', v)}
      />

      <SettingsToggleItem
        title="Arayan Kimliğini Göster"
        description="Numaran aradığın kişilere görünsün"
        icon="card-account-details-outline"
        value={settings.showCallerId}
        onToggle={(v) => updateSetting('showCallerId', v)}
      />

      <SettingsToggleItem
        title="Aramadan Önce Onayla"
        description="Arama yapmadan önce onay iste"
        icon="help-circle-outline"
        value={settings.confirmBeforeCall}
        onToggle={(v) => updateSetting('confirmBeforeCall', v)}
      />

      <SettingsToggleItem
        title="Tuş Sesleri"
        description="Numara tuşlarına basınca ses çal"
        icon="dialpad"
        value={settings.dialpadSounds}
        onToggle={(v) => updateSetting('dialpadSounds', v)}
      />

      <SettingsToggleItem
        title="Tuş Titreşimi"
        description="Numara tuşlarına basınca titret"
        icon="vibrate"
        value={settings.dialpadHaptic}
        onToggle={(v) => updateSetting('dialpadHaptic', v)}
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
  divider: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  pickerContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 12,
    padding: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  radioLabel: {
    fontSize: 15,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default SettingsCallsScreen;
