/**
 * LifeCall - Rehber Ayarları Ekranı
 *
 * - Görüntülenecek hesaplar (Google, Samsung, Telefon, vb.)
 * - Varsayılan hesap seçimi
 * - Kişi sıralama tercihi
 * - Kişi görüntüleme formatı
 * - Kişi grupları
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  RadioButton,
  Divider,
  Chip,
  Portal,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';
import { getDeviceAccounts } from '../../services/contactsService';
import { DeviceAccount } from '../../types';

// Ayar anahtarları
const STORAGE_KEYS = {
  VISIBLE_ACCOUNTS: '@lifecall_visible_accounts',
  DEFAULT_ACCOUNT: '@lifecall_default_account',
  SORT_ORDER: '@lifecall_contact_sort_order',
  DISPLAY_FORMAT: '@lifecall_contact_display_format',
  SHOW_PHONE_CONTACTS: '@lifecall_show_phone_contacts',
  SHOW_SIM_CONTACTS: '@lifecall_show_sim_contacts',
  SHOW_CONTACTS_WITH_PHONE: '@lifecall_show_with_phone_only',
};

// Sıralama seçenekleri
type SortOrder = 'firstName' | 'lastName';

// Görüntüleme formatı
type DisplayFormat = 'firstLast' | 'lastFirst';

// Hesap ikonu
const getAccountIcon = (type: string): string => {
  const icons: Record<string, string> = {
    google: 'google',
    samsung: 'cellphone',
    phone: 'sim',
    sim: 'sim',
    icloud: 'apple-icloud',
    outlook: 'microsoft-outlook',
    exchange: 'microsoft-exchange',
    other: 'account-circle',
  };
  return icons[type.toLowerCase()] || 'account-circle';
};

// Hesap rengi
const getAccountColor = (type: string): string => {
  const colors: Record<string, string> = {
    google: '#4285F4',
    samsung: '#1428A0',
    phone: '#4CAF50',
    sim: '#FF9800',
    icloud: '#007AFF',
    outlook: '#0078D4',
    exchange: '#0078D4',
    other: '#9E9E9E',
  };
  return colors[type.toLowerCase()] || '#9E9E9E';
};

const SettingsContactsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<DeviceAccount[]>([]);
  const [visibleAccounts, setVisibleAccounts] = useState<string[]>([]);
  const [defaultAccount, setDefaultAccount] = useState<string>('phone');
  const [sortOrder, setSortOrder] = useState<SortOrder>('firstName');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('firstLast');
  const [showPhoneContacts, setShowPhoneContacts] = useState(true);
  const [showSimContacts, setShowSimContacts] = useState(true);
  const [showWithPhoneOnly, setShowWithPhoneOnly] = useState(false);

  // Modallar
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showDefaultAccountModal, setShowDefaultAccountModal] = useState(false);

  // Ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Hesapları al
      const deviceAccounts = await getDeviceAccounts();
      setAccounts(deviceAccounts);

      // Kayıtlı ayarları al
      const [
        savedVisibleAccounts,
        savedDefaultAccount,
        savedSortOrder,
        savedDisplayFormat,
        savedShowPhone,
        savedShowSim,
        savedShowWithPhone,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VISIBLE_ACCOUNTS),
        AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_ACCOUNT),
        AsyncStorage.getItem(STORAGE_KEYS.SORT_ORDER),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_FORMAT),
        AsyncStorage.getItem(STORAGE_KEYS.SHOW_PHONE_CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.SHOW_SIM_CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.SHOW_CONTACTS_WITH_PHONE),
      ]);

      if (savedVisibleAccounts) {
        setVisibleAccounts(JSON.parse(savedVisibleAccounts));
      } else {
        // Varsayılan: tüm hesaplar görünür
        setVisibleAccounts(deviceAccounts.map((a) => a.id));
      }

      if (savedDefaultAccount) setDefaultAccount(savedDefaultAccount);
      if (savedSortOrder) setSortOrder(savedSortOrder as SortOrder);
      if (savedDisplayFormat) setDisplayFormat(savedDisplayFormat as DisplayFormat);
      if (savedShowPhone !== null) setShowPhoneContacts(savedShowPhone === 'true');
      if (savedShowSim !== null) setShowSimContacts(savedShowSim === 'true');
      if (savedShowWithPhone !== null) setShowWithPhoneOnly(savedShowWithPhone === 'true');
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hesap görünürlüğünü değiştir
  const toggleAccountVisibility = useCallback(
    async (accountId: string) => {
      const newVisibleAccounts = visibleAccounts.includes(accountId)
        ? visibleAccounts.filter((id) => id !== accountId)
        : [...visibleAccounts, accountId];

      setVisibleAccounts(newVisibleAccounts);
      await AsyncStorage.setItem(
        STORAGE_KEYS.VISIBLE_ACCOUNTS,
        JSON.stringify(newVisibleAccounts)
      );
    },
    [visibleAccounts]
  );

  // Varsayılan hesabı değiştir
  const changeDefaultAccount = useCallback(async (accountId: string) => {
    setDefaultAccount(accountId);
    await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_ACCOUNT, accountId);
    setShowDefaultAccountModal(false);
  }, []);

  // Sıralama tercihini değiştir
  const changeSortOrder = useCallback(async (order: SortOrder) => {
    setSortOrder(order);
    await AsyncStorage.setItem(STORAGE_KEYS.SORT_ORDER, order);
    setShowSortModal(false);
  }, []);

  // Görüntüleme formatını değiştir
  const changeDisplayFormat = useCallback(async (format: DisplayFormat) => {
    setDisplayFormat(format);
    await AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_FORMAT, format);
    setShowDisplayModal(false);
  }, []);

  // Toggle ayarlar
  const toggleShowPhoneContacts = useCallback(async (value: boolean) => {
    setShowPhoneContacts(value);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_PHONE_CONTACTS, String(value));
  }, []);

  const toggleShowSimContacts = useCallback(async (value: boolean) => {
    setShowSimContacts(value);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_SIM_CONTACTS, String(value));
  }, []);

  const toggleShowWithPhoneOnly = useCallback(async (value: boolean) => {
    setShowWithPhoneOnly(value);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_CONTACTS_WITH_PHONE, String(value));
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Görüntülenecek Hesaplar */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('settings.contacts.accounts') || 'Görüntülenecek Hesaplar'}
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
        {t('settings.contacts.accountsDescription') || 'Rehberde gösterilecek hesapları seçin'}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {accounts.map((account, index) => (
          <React.Fragment key={account.id}>
            <TouchableOpacity
              style={styles.accountItem}
              onPress={() => toggleAccountVisibility(account.id)}
            >
              <View style={styles.accountInfo}>
                <View
                  style={[
                    styles.accountIconContainer,
                    { backgroundColor: getAccountColor(account.type) + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getAccountIcon(account.type)}
                    size={24}
                    color={getAccountColor(account.type)}
                  />
                </View>
                <View style={styles.accountText}>
                  <Text style={[styles.accountName, { color: theme.colors.onSurface }]}>
                    {account.displayName}
                  </Text>
                  {account.name !== account.displayName && (
                    <Text style={[styles.accountEmail, { color: theme.colors.onSurfaceVariant }]}>
                      {account.name}
                    </Text>
                  )}
                </View>
                {account.contactCount > 0 && (
                  <Chip compact style={styles.countChip}>
                    {account.contactCount}
                  </Chip>
                )}
              </View>
              <Switch
                value={visibleAccounts.includes(account.id)}
                onValueChange={() => toggleAccountVisibility(account.id)}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            {index < accounts.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>

      {/* Varsayılan Hesap */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('settings.contacts.defaultAccount') || 'Varsayılan Hesap'}
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
        {t('settings.contacts.defaultAccountDescription') || 'Yeni kişiler bu hesaba kaydedilir'}
      </Text>

      <TouchableOpacity
        style={[styles.card, styles.settingItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => setShowDefaultAccountModal(true)}
      >
        <View style={styles.settingInfo}>
          <MaterialCommunityIcons
            name="account-plus"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
            {accounts.find((a) => a.id === defaultAccount)?.displayName || 'Telefon'}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* Sıralama ve Görüntüleme */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('settings.contacts.displayOptions') || 'Görüntüleme Seçenekleri'}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Sıralama */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowSortModal(true)}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="sort-alphabetical-ascending" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                {t('settings.contacts.sortBy') || 'Sıralama'}
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>
                {sortOrder === 'firstName'
                  ? t('settings.contacts.sortFirstName') || 'Ada göre'
                  : t('settings.contacts.sortLastName') || 'Soyadına göre'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Divider />

        {/* Görüntüleme Formatı */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowDisplayModal(true)}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="format-text" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                {t('settings.contacts.displayFormat') || 'İsim Formatı'}
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>
                {displayFormat === 'firstLast'
                  ? t('settings.contacts.firstLast') || 'Ad Soyad'
                  : t('settings.contacts.lastFirst') || 'Soyad, Ad'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Filtreler */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('settings.contacts.filters') || 'Filtreler'}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {Platform.OS === 'android' && (
          <>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="cellphone" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                  {t('settings.contacts.showPhoneContacts') || 'Telefon Kişileri'}
                </Text>
              </View>
              <Switch
                value={showPhoneContacts}
                onValueChange={toggleShowPhoneContacts}
                color={theme.colors.primary}
              />
            </View>
            <Divider />
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="sim" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                  {t('settings.contacts.showSimContacts') || 'SIM Kişileri'}
                </Text>
              </View>
              <Switch
                value={showSimContacts}
                onValueChange={toggleShowSimContacts}
                color={theme.colors.primary}
              />
            </View>
            <Divider />
          </>
        )}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="phone-check" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                {t('settings.contacts.showWithPhoneOnly') || 'Sadece Telefonlu Kişiler'}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                {t('settings.contacts.showWithPhoneOnlyDesc') || 'Telefon numarası olmayan kişileri gizle'}
              </Text>
            </View>
          </View>
          <Switch
            value={showWithPhoneOnly}
            onValueChange={toggleShowWithPhoneOnly}
            color={theme.colors.primary}
          />
        </View>
      </View>

      {/* Sıralama Modal */}
      <Portal>
        <Modal
          visible={showSortModal}
          onDismiss={() => setShowSortModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {t('settings.contacts.sortBy') || 'Sıralama'}
          </Text>
          <RadioButton.Group onValueChange={(v) => changeSortOrder(v as SortOrder)} value={sortOrder}>
            <RadioButton.Item
              label={t('settings.contacts.sortFirstName') || 'Ada göre'}
              value="firstName"
              labelStyle={{ color: theme.colors.onSurface }}
            />
            <RadioButton.Item
              label={t('settings.contacts.sortLastName') || 'Soyadına göre'}
              value="lastName"
              labelStyle={{ color: theme.colors.onSurface }}
            />
          </RadioButton.Group>
        </Modal>
      </Portal>

      {/* Görüntüleme Format Modal */}
      <Portal>
        <Modal
          visible={showDisplayModal}
          onDismiss={() => setShowDisplayModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {t('settings.contacts.displayFormat') || 'İsim Formatı'}
          </Text>
          <RadioButton.Group onValueChange={(v) => changeDisplayFormat(v as DisplayFormat)} value={displayFormat}>
            <RadioButton.Item
              label={t('settings.contacts.firstLast') || 'Ad Soyad (Ahmet Yılmaz)'}
              value="firstLast"
              labelStyle={{ color: theme.colors.onSurface }}
            />
            <RadioButton.Item
              label={t('settings.contacts.lastFirst') || 'Soyad, Ad (Yılmaz, Ahmet)'}
              value="lastFirst"
              labelStyle={{ color: theme.colors.onSurface }}
            />
          </RadioButton.Group>
        </Modal>
      </Portal>

      {/* Varsayılan Hesap Modal */}
      <Portal>
        <Modal
          visible={showDefaultAccountModal}
          onDismiss={() => setShowDefaultAccountModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {t('settings.contacts.defaultAccount') || 'Varsayılan Hesap'}
          </Text>
          <RadioButton.Group onValueChange={changeDefaultAccount} value={defaultAccount}>
            {accounts.map((account) => (
              <RadioButton.Item
                key={account.id}
                label={account.displayName}
                value={account.id}
                labelStyle={{ color: theme.colors.onSurface }}
              />
            ))}
          </RadioButton.Group>
        </Modal>
      </Portal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 4,
    fontWeight: '600',
  },
  sectionDescription: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 13,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountText: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '500',
  },
  accountEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  countChip: {
    marginRight: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: '90%',
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
});

export default SettingsContactsScreen;
