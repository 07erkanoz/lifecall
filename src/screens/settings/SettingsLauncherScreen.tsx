/**
 * LifeCall - Launcher Ayarları Ekranı
 *
 * Ek launcher ikonları yönetimi:
 * - Rehber ikonu
 * - Takvim ikonu
 * - Notlar ikonu
 *
 * Bu ikonlar etkinleştirildiğinde uygulama çekmecesinde ayrı ikonlar olarak görünür
 * ve doğrudan ilgili sekmeyi açar.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Switch, Card, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../theme';
import LauncherIconModule, {
  LauncherIconType,
  getAllIconStatuses,
  setIconEnabled,
  enableAllIcons,
  disableAllIcons,
  getIconLabel,
  getIconColor,
  getIconName,
} from '../../native/LauncherIconModule';

interface IconSetting {
  type: LauncherIconType;
  enabled: boolean;
}

const SettingsLauncherScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [icons, setIcons] = useState<IconSetting[]>([
    { type: 'contacts', enabled: false },
    { type: 'calendar', enabled: false },
    { type: 'notes', enabled: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // İkon durumlarını yükle
  useEffect(() => {
    loadIconStatuses();
  }, []);

  const loadIconStatuses = async () => {
    if (Platform.OS !== 'android') {
      setIsLoading(false);
      return;
    }

    try {
      const statuses = await getAllIconStatuses();
      if (statuses) {
        setIcons([
          { type: 'contacts', enabled: statuses.contacts },
          { type: 'calendar', enabled: statuses.calendar },
          { type: 'notes', enabled: statuses.notes },
        ]);
      }
    } catch (error) {
      console.error('İkon durumları yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIcon = useCallback(async (iconType: LauncherIconType, enabled: boolean) => {
    try {
      const result = await setIconEnabled(iconType, enabled);
      if (result?.success) {
        setIcons(prev => prev.map(icon =>
          icon.type === iconType ? { ...icon, enabled } : icon
        ));

        // Kullanıcıyı bilgilendir
        const label = getIconLabel(iconType);
        Alert.alert(
          enabled ? 'İkon Eklendi' : 'İkon Kaldırıldı',
          enabled
            ? `${label} ikonu uygulama çekmecesine eklendi. Değişikliğin görünmesi birkaç saniye sürebilir.`
            : `${label} ikonu uygulama çekmecesinden kaldırıldı.`,
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('İkon durumu değiştirilemedi:', error);
      Alert.alert('Hata', 'İkon durumu değiştirilemedi.');
    }
  }, []);

  const handleEnableAll = useCallback(async () => {
    try {
      const result = await enableAllIcons();
      if (result) {
        setIcons(prev => prev.map(icon => ({ ...icon, enabled: true })));
        Alert.alert(
          'Tüm İkonlar Eklendi',
          'Rehber, Takvim ve Notlar ikonları uygulama çekmecesine eklendi.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('İkonlar etkinleştirilemedi:', error);
    }
  }, []);

  const handleDisableAll = useCallback(async () => {
    try {
      const result = await disableAllIcons();
      if (result) {
        setIcons(prev => prev.map(icon => ({ ...icon, enabled: false })));
        Alert.alert(
          'Tüm İkonlar Kaldırıldı',
          'Ek ikonlar uygulama çekmecesinden kaldırıldı.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('İkonlar devre dışı bırakılamadı:', error);
    }
  }, []);

  // Android dışı platformlar için
  if (Platform.OS !== 'android') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notAvailable}>
          <MaterialCommunityIcons
            name="android"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.notAvailableText, { color: theme.colors.onSurfaceVariant }]}>
            Bu özellik sadece Android'de kullanılabilir.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Yükleniyor...</Text>
      </View>
    );
  }

  const enabledCount = icons.filter(i => i.enabled).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Açıklama */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={theme.colors.onPrimaryContainer}
            />
            <Text style={[styles.infoText, { color: theme.colors.onPrimaryContainer }]}>
              Ek ikonları etkinleştirdiğinizde, uygulama çekmecesinde ayrı ikonlar olarak görünür.
              Her ikon doğrudan ilgili bölümü açar.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* İkon Listesi */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Launcher İkonları
      </Text>

      {icons.map((icon) => (
        <View
          key={icon.type}
          style={[styles.iconItem, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.iconItemLeft}>
            <View style={[styles.iconCircle, { backgroundColor: getIconColor(icon.type) + '20' }]}>
              <MaterialCommunityIcons
                name={getIconName(icon.type)}
                size={28}
                color={getIconColor(icon.type)}
              />
            </View>
            <View style={styles.iconTextContainer}>
              <Text style={[styles.iconTitle, { color: theme.colors.onSurface }]}>
                {getIconLabel(icon.type)}
              </Text>
              <Text style={[styles.iconDescription, { color: theme.colors.onSurfaceVariant }]}>
                {icon.type === 'contacts' && 'Doğrudan rehberi açar'}
                {icon.type === 'calendar' && 'Doğrudan takvimi açar'}
                {icon.type === 'notes' && 'Doğrudan notları açar'}
              </Text>
            </View>
          </View>
          <Switch
            value={icon.enabled}
            onValueChange={(value) => handleToggleIcon(icon.type, value)}
            color={getIconColor(icon.type)}
          />
        </View>
      ))}

      {/* Toplu İşlemler */}
      <View style={styles.bulkActions}>
        <Button
          mode="outlined"
          onPress={handleEnableAll}
          disabled={enabledCount === 3}
          style={styles.bulkButton}
          icon="plus-circle"
        >
          Tümünü Ekle
        </Button>
        <Button
          mode="outlined"
          onPress={handleDisableAll}
          disabled={enabledCount === 0}
          style={styles.bulkButton}
          icon="minus-circle"
        >
          Tümünü Kaldır
        </Button>
      </View>

      {/* Durum Bilgisi */}
      <View style={[styles.statusCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons
          name="apps"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
          {enabledCount === 0
            ? 'Hiçbir ek ikon etkin değil'
            : `${enabledCount} ek ikon etkin`}
        </Text>
      </View>

      {/* Uyarı */}
      <View style={[styles.warningCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={20}
          color={theme.colors.onTertiaryContainer}
        />
        <Text style={[styles.warningText, { color: theme.colors.onTertiaryContainer }]}>
          İkon değişiklikleri bazı launcher'larda birkaç saniye sonra veya launcher yeniden
          başlatıldığında görünebilir.
        </Text>
      </View>

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
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: '600',
  },
  iconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  iconItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconTextContainer: {
    flex: 1,
  },
  iconTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  iconDescription: {
    fontSize: 13,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  bulkButton: {
    flex: 1,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  notAvailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  notAvailableText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default SettingsLauncherScreen;
