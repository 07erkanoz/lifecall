/**
 * LifeCall - Proximity Sensor Service
 *
 * Devam eden aramalar sırasında ekran kontrolü için proximity sensor yönetimi.
 * - Telefon kulağa yaklaştığında ekran kapanır (yanlışlıkla dokunma önlenir)
 * - Telefon uzaklaştığında ekran açılır
 * - react-native-incall-manager kullanır
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const PROXIMITY_SETTING_KEY = '@lifecall_proximity_enabled';

// Event listener type
type ProximityListener = (isNear: boolean) => void;

class ProximityService {
  private static instance: ProximityService;
  private isStarted: boolean = false;
  private isEnabled: boolean = true;
  private listeners: Set<ProximityListener> = new Set();
  private currentProximityState: boolean = false;

  private constructor() {
    // Ayarları yükle
    this.loadSettings();
  }

  static getInstance(): ProximityService {
    if (!ProximityService.instance) {
      ProximityService.instance = new ProximityService();
    }
    return ProximityService.instance;
  }

  /**
   * Ayarları yükle
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedValue = await AsyncStorage.getItem(PROXIMITY_SETTING_KEY);
      if (savedValue !== null) {
        this.isEnabled = savedValue === 'true';
      }
    } catch (error) {
      console.warn('Proximity ayarı yüklenemedi:', error);
    }
  }

  /**
   * Proximity sensor etkin mi?
   */
  isProximityEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Proximity sensor'ü etkinleştir/devre dışı bırak
   */
  async setProximityEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    try {
      await AsyncStorage.setItem(PROXIMITY_SETTING_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.warn('Proximity ayarı kaydedilemedi:', error);
    }

    // Eğer arama devam ediyorsa ve devre dışı bırakıldıysa, sensörü kapat
    if (this.isStarted && !enabled) {
      this.stopProximitySensor();
    }
  }

  /**
   * Arama başladığında proximity sensor'ü başlat
   * InCallManager otomatik olarak proximity sensor'ü yönetir
   */
  startCallMode(): void {
    if (!this.isEnabled) {
      console.log('Proximity sensor devre dışı');
      return;
    }

    if (this.isStarted) {
      console.log('Proximity sensor zaten başlatılmış');
      return;
    }

    try {
      // InCallManager'ı başlat - arama moduna geç
      InCallManager.start({ media: 'audio', auto: true, ringback: '' });

      // Proximity sensor'ü etkinleştir
      InCallManager.setProximitySensorEnabled(true);

      this.isStarted = true;
      console.log('Proximity sensor başlatıldı');
    } catch (error) {
      console.error('Proximity sensor başlatılamadı:', error);
    }
  }

  /**
   * Arama bittiğinde proximity sensor'ü durdur
   */
  stopCallMode(): void {
    if (!this.isStarted) {
      return;
    }

    try {
      // Proximity sensor'ü devre dışı bırak
      InCallManager.setProximitySensorEnabled(false);

      // InCallManager'ı durdur
      InCallManager.stop();

      this.isStarted = false;
      this.currentProximityState = false;
      console.log('Proximity sensor durduruldu');
    } catch (error) {
      console.error('Proximity sensor durdurulamadı:', error);
    }
  }

  /**
   * Sadece proximity sensor'ü kapat (arama modunu koruyarak)
   */
  private stopProximitySensor(): void {
    try {
      InCallManager.setProximitySensorEnabled(false);
      console.log('Proximity sensor devre dışı bırakıldı');
    } catch (error) {
      console.error('Proximity sensor devre dışı bırakılamadı:', error);
    }
  }

  /**
   * Hoparlör modunu ayarla
   * Hoparlör açıkken proximity sensor devre dışı olmalı
   */
  setSpeakerphoneOn(enabled: boolean): void {
    try {
      InCallManager.setSpeakerphoneOn(enabled);

      // Hoparlör açıkken proximity sensor'ü kapat
      if (enabled && this.isStarted) {
        InCallManager.setProximitySensorEnabled(false);
      } else if (!enabled && this.isStarted && this.isEnabled) {
        // Hoparlör kapatıldığında ve proximity etkinse, sensörü tekrar aç
        InCallManager.setProximitySensorEnabled(true);
      }
    } catch (error) {
      console.error('Hoparlör ayarlanamadı:', error);
    }
  }

  /**
   * Mikrofonu sessize al
   */
  setMicrophoneMute(muted: boolean): void {
    try {
      InCallManager.setMicrophoneMute(muted);
    } catch (error) {
      console.error('Mikrofon ayarlanamadı:', error);
    }
  }

  /**
   * Ses yönlendirmesini ayarla
   */
  setForceSpeakerphoneOn(flag: boolean): void {
    try {
      InCallManager.setForceSpeakerphoneOn(flag);
    } catch (error) {
      console.error('Zorla hoparlör ayarlanamadı:', error);
    }
  }

  /**
   * Zil sesi çal (gelen arama için)
   */
  startRingtone(ringtone?: string): void {
    try {
      InCallManager.startRingtone(ringtone || '_DEFAULT_', true);
    } catch (error) {
      console.error('Zil sesi başlatılamadı:', error);
    }
  }

  /**
   * Zil sesini durdur
   */
  stopRingtone(): void {
    try {
      InCallManager.stopRingtone();
    } catch (error) {
      console.error('Zil sesi durdurulamadı:', error);
    }
  }

  /**
   * Geri çağırma tonu çal (giden arama için)
   */
  startRingback(): void {
    try {
      InCallManager.startRingback('_DEFAULT_');
    } catch (error) {
      console.error('Geri çağırma tonu başlatılamadı:', error);
    }
  }

  /**
   * Geri çağırma tonunu durdur
   */
  stopRingback(): void {
    try {
      InCallManager.stopRingback();
    } catch (error) {
      console.error('Geri çağırma tonu durdurulamadı:', error);
    }
  }

  /**
   * Titreşim kalıbı
   */
  vibrate(pattern?: number[]): void {
    // InCallManager titreşim kontrolü sunmaz, Vibration API kullanılmalı
    // Bu metod uyumluluk için bırakıldı
  }

  /**
   * Arama durumunu kontrol et
   */
  isInCallMode(): boolean {
    return this.isStarted;
  }
}

// Singleton export
export const proximityService = ProximityService.getInstance();
export default proximityService;
