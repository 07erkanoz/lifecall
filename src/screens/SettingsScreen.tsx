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

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';
import { useAuth } from '../contexts';
import { AuthPrompt } from '../components';
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

// Hesap Bölümü Bileşeni
const AccountSection: React.FC<{
  onSignInPress: () => void;
}> = ({ onSignInPress }) => {
  const { theme } = useAppTheme();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          HESAP
        </Text>
        <View style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          HESAP
        </Text>
        <View style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.accountInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="account" size={28} color="#FFF" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={[styles.accountEmail, { color: theme.colors.onSurface }]}>
                {user.email}
              </Text>
              <Text style={[styles.accountStatus, { color: theme.colors.primary }]}>
                ✓ Giriş yapıldı
              </Text>
            </View>
          </View>
          <View style={styles.accountActions}>
            <TouchableOpacity
              style={[styles.accountButton, { borderColor: theme.colors.outline }]}
              onPress={handleSignOut}
            >
              <MaterialCommunityIcons name="logout" size={18} color={theme.colors.error || '#F44336'} />
              <Text style={[styles.accountButtonText, { color: theme.colors.error || '#F44336' }]}>
                Çıkış Yap
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.accountBenefits}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
                Spam bildirme aktif
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
                Bulut yedekleme aktif
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Giriş yapılmamış
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        HESAP
      </Text>
      <TouchableOpacity
        style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}
        onPress={onSignInPress}
        activeOpacity={0.7}
      >
        <View style={styles.accountInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="account-outline" size={28} color={theme.colors.onSurfaceVariant} />
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.accountTitle, { color: theme.colors.onSurface }]}>
              Giriş Yap
            </Text>
            <Text style={[styles.accountSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Spam bildirme ve bulut yedekleme için
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
        <View style={styles.accountBenefits}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="shield-alert-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
              Spam numaralarını toplulukla paylaş
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
              Verilerini güvenle yedekle
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="sync-circle" size={16} color={theme.colors.primary} />
            <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
              Cihazlar arası senkronizasyon
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, themeId } = useAppTheme();
  const navigation = useNavigation<RootStackScreenProps<'Main'>['navigation']>();
  const insets = useSafeAreaInsets();
  const auth = useAuth();

  // Auth prompt state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

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

      {/* Hesap Bölümü - En üstte */}
      <AccountSection onSignInPress={() => setShowAuthPrompt(true)} />

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

      {/* Auth Prompt Modal */}
      <AuthPrompt
        visible={showAuthPrompt}
        feature="cloud_backup"
        onClose={() => setShowAuthPrompt(false)}
        onSuccess={() => setShowAuthPrompt(false)}
        onSkip={() => setShowAuthPrompt(false)}
        signIn={auth.signInWithEmail}
        signUp={auth.signUpWithEmail}
        signInWithGoogle={auth.signInWithGoogle}
        skip={auth.skipAuth}
        allowSkip={true}
      />
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
  // Account section styles
  accountCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accountDetails: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  accountTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  accountSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  accountActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  accountButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountBenefits: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
  },
});

export default SettingsScreen;
