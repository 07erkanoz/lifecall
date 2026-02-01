/**
 * LifeCall - Call Settings Service
 *
 * Arama ayarlarını yöneten servis
 * SettingsCallsScreen'deki ayarları diğer ekranlardan erişilebilir yapar
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

// Storage key
const CALL_SETTINGS_KEY = '@lifecall_call_settings';

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

  // Proximity Sensor
  proximityScreenOff: true,

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

export type CallSettings = typeof DEFAULT_CALL_SETTINGS;

class CallSettingsService {
  private static instance: CallSettingsService;
  private settings: CallSettings = DEFAULT_CALL_SETTINGS;
  private isLoaded: boolean = false;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): CallSettingsService {
    if (!CallSettingsService.instance) {
      CallSettingsService.instance = new CallSettingsService();
    }
    return CallSettingsService.instance;
  }

  /**
   * Ayarları yükle
   */
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(CALL_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_CALL_SETTINGS, ...JSON.parse(saved) };
      }
      this.isLoaded = true;
    } catch (error) {
      console.warn('Arama ayarları yüklenemedi:', error);
    }
  }

  /**
   * Ayarları yeniden yükle (ayarlar değiştiğinde çağrılmalı)
   */
  async reloadSettings(): Promise<void> {
    await this.loadSettings();
  }

  /**
   * Tüm ayarları al
   */
  getSettings(): CallSettings {
    return { ...this.settings };
  }

  /**
   * Tek bir ayarı al
   */
  getSetting<K extends keyof CallSettings>(key: K): CallSettings[K] {
    return this.settings[key];
  }

  /**
   * Titreşim etkin mi?
   */
  isVibrationEnabled(): boolean {
    return this.settings.vibrationEnabled;
  }

  /**
   * Cevaplanınca titret
   */
  shouldVibrateOnAnswer(): boolean {
    return this.settings.vibrationOnAnswer;
  }

  /**
   * Kapanınca titret
   */
  shouldVibrateOnHangup(): boolean {
    return this.settings.vibrationOnHangup;
  }

  /**
   * Varsayılan hoparlör modu
   */
  isSpeakerphoneDefault(): boolean {
    return this.settings.speakerphoneDefault;
  }

  /**
   * Tuş sesleri etkin mi?
   */
  isDialpadSoundsEnabled(): boolean {
    return this.settings.dialpadSounds;
  }

  /**
   * Tuş titreşimi etkin mi?
   */
  isDialpadHapticEnabled(): boolean {
    return this.settings.dialpadHaptic;
  }

  /**
   * Bilinmeyen arayanları engelle
   */
  shouldBlockUnknownCallers(): boolean {
    return this.settings.blockUnknownCallers;
  }

  /**
   * Gizli numaraları engelle
   */
  shouldBlockPrivateNumbers(): boolean {
    return this.settings.blockPrivateNumbers;
  }

  /**
   * Spam koruması etkin mi?
   */
  isSpamProtectionEnabled(): boolean {
    return this.settings.spamProtection;
  }

  /**
   * Aramadan önce onay iste
   */
  shouldConfirmBeforeCall(): boolean {
    return this.settings.confirmBeforeCall;
  }

  /**
   * Geçmiş saklama süresi (gün)
   */
  getHistoryRetentionDays(): number {
    const periods: Record<string, number> = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '180days': 180,
      '365days': 365,
      'forever': -1,
    };
    return periods[this.settings.historyRetentionPeriod] || 90;
  }

  // ============ Titreşim Yardımcı Metodları ============

  /**
   * Gelen arama titreşimi
   */
  vibrateForIncomingCall(): void {
    if (this.settings.vibrationEnabled) {
      // Sürekli titreşim pattern'i
      Vibration.vibrate([0, 500, 200, 500], true);
    }
  }

  /**
   * Titreşimi durdur
   */
  stopVibration(): void {
    Vibration.cancel();
  }

  /**
   * Arama cevaplanınca titret
   */
  vibrateOnAnswer(): void {
    if (this.settings.vibrationOnAnswer) {
      Vibration.vibrate(100);
    }
  }

  /**
   * Arama sonlanınca titret
   */
  vibrateOnHangup(): void {
    if (this.settings.vibrationOnHangup) {
      Vibration.vibrate([0, 50, 50, 50]);
    }
  }

  /**
   * Tuş titreşimi
   */
  vibrateOnDialpadPress(): void {
    if (this.settings.dialpadHaptic) {
      Vibration.vibrate(10);
    }
  }
}

// Singleton export
export const callSettingsService = CallSettingsService.getInstance();
export default callSettingsService;
