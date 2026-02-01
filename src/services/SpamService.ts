/**
 * LifeCall - Spam Detection Service
 *
 * Spam numaralarını tespit ve yönetim servisi:
 * - Yerel veritabanından spam kontrolü
 * - Uzak API'den spam bilgisi çekme
 * - Kullanıcı spam bildirimleri
 * - Topluluk tabanlı spam puanlaması
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';

// Storage keys
const SPAM_CACHE_KEY = '@lifecall_spam_cache';
const SPAM_REPORTS_KEY = '@lifecall_spam_reports';
const SPAM_SETTINGS_KEY = '@lifecall_spam_settings';
const BLOCKED_NUMBERS_KEY = '@lifecall_blocked_numbers';

// Spam kategorileri
export type SpamCategory =
  | 'telemarketing'    // Telefonla pazarlama
  | 'scam'             // Dolandırıcılık
  | 'robocall'         // Otomatik arama
  | 'fraud'            // Sahtecilik
  | 'harassment'       // Taciz
  | 'political'        // Politik arama
  | 'survey'           // Anket
  | 'debt_collector'   // Borç tahsilatı
  | 'unknown';         // Bilinmeyen

// Spam bilgisi
export interface SpamInfo {
  phoneNumber: string;
  isSpam: boolean;
  spamScore: number;           // 0-100 arası spam puanı
  category: SpamCategory;
  reportCount: number;         // Toplam bildirim sayısı
  lastReportedAt?: string;     // Son bildirim tarihi
  description?: string;        // Açıklama
  companyName?: string;        // Şirket adı (biliniyorsa)
  source: 'api' | 'user' | 'community' | 'local';
  confidence: number;          // 0-100 güvenilirlik
}

// Kullanıcı spam bildirimi
export interface SpamReport {
  id: string;
  phoneNumber: string;
  category: SpamCategory;
  description?: string;
  reportedAt: string;
  userId?: string;
}

// Spam ayarları
interface SpamSettings {
  enabled: boolean;
  blockSpamCalls: boolean;
  showSpamWarning: boolean;
  spamThreshold: number;       // Bu puanın üstü spam kabul edilir (varsayılan 60)
  notifyOnSpam: boolean;
}

const DEFAULT_SPAM_SETTINGS: SpamSettings = {
  enabled: true,
  blockSpamCalls: false,
  showSpamWarning: true,
  spamThreshold: 60,
  notifyOnSpam: true,
};

// Spam kategorisi Türkçe açıklamaları
export const SPAM_CATEGORY_LABELS: Record<SpamCategory, string> = {
  telemarketing: 'Telefonla Pazarlama',
  scam: 'Dolandırıcılık',
  robocall: 'Otomatik Arama',
  fraud: 'Sahtecilik',
  harassment: 'Taciz',
  political: 'Politik Arama',
  survey: 'Anket',
  debt_collector: 'Borç Tahsilatı',
  unknown: 'Bilinmeyen Spam',
};

// Spam kategorisi ikonları
export const SPAM_CATEGORY_ICONS: Record<SpamCategory, string> = {
  telemarketing: 'phone-alert',
  scam: 'alert-octagon',
  robocall: 'robot',
  fraud: 'shield-alert',
  harassment: 'account-alert',
  political: 'vote',
  survey: 'clipboard-text',
  debt_collector: 'cash-remove',
  unknown: 'help-circle',
};

// Spam kategorisi renkleri
export const SPAM_CATEGORY_COLORS: Record<SpamCategory, string> = {
  telemarketing: '#FF9800',
  scam: '#F44336',
  robocall: '#9C27B0',
  fraud: '#D32F2F',
  harassment: '#E91E63',
  political: '#2196F3',
  survey: '#00BCD4',
  debt_collector: '#795548',
  unknown: '#607D8B',
};

class SpamService {
  private static instance: SpamService;
  private cache: Map<string, SpamInfo> = new Map();
  private settings: SpamSettings = DEFAULT_SPAM_SETTINGS;
  private blockedNumbers: Set<string> = new Set();
  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): SpamService {
    if (!SpamService.instance) {
      SpamService.instance = new SpamService();
    }
    return SpamService.instance;
  }

  /**
   * Servisi başlat
   */
  private async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadCache(),
        this.loadSettings(),
        this.loadBlockedNumbers(),
      ]);
      this.isInitialized = true;
    } catch (error) {
      console.error('SpamService başlatılamadı:', error);
    }
  }

  /**
   * Cache'i yükle
   */
  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(SPAM_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Spam cache yüklenemedi:', error);
    }
  }

  /**
   * Cache'i kaydet
   */
  private async saveCache(): Promise<void> {
    try {
      const data = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(SPAM_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Spam cache kaydedilemedi:', error);
    }
  }

  /**
   * Ayarları yükle
   */
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(SPAM_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SPAM_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Spam ayarları yüklenemedi:', error);
    }
  }

  /**
   * Ayarları kaydet
   */
  async saveSettings(settings: Partial<SpamSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    try {
      await AsyncStorage.setItem(SPAM_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Spam ayarları kaydedilemedi:', error);
    }
  }

  /**
   * Engelli numaraları yükle
   */
  private async loadBlockedNumbers(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(BLOCKED_NUMBERS_KEY);
      if (saved) {
        this.blockedNumbers = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Engelli numaralar yüklenemedi:', error);
    }
  }

  /**
   * Engelli numaraları kaydet
   */
  private async saveBlockedNumbers(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        BLOCKED_NUMBERS_KEY,
        JSON.stringify(Array.from(this.blockedNumbers))
      );
    } catch (error) {
      console.warn('Engelli numaralar kaydedilemedi:', error);
    }
  }

  /**
   * Numarayı normalize et
   */
  private normalizeNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^0-9+]/g, '');
  }

  /**
   * Numara için spam bilgisi al
   */
  async checkNumber(phoneNumber: string): Promise<SpamInfo | null> {
    if (!this.settings.enabled) {
      return null;
    }

    const normalized = this.normalizeNumber(phoneNumber);

    // 1. Önce cache'e bak
    const cached = this.cache.get(normalized);
    if (cached) {
      return cached;
    }

    // 2. Yerel bildirimlere bak
    const localInfo = await this.checkLocalReports(normalized);
    if (localInfo) {
      this.cache.set(normalized, localInfo);
      await this.saveCache();
      return localInfo;
    }

    // 3. Uzak API'ye sor (Supabase varsa)
    if (isSupabaseConfigured()) {
      const apiInfo = await this.checkRemoteAPI(normalized);
      if (apiInfo) {
        this.cache.set(normalized, apiInfo);
        await this.saveCache();
        return apiInfo;
      }
    }

    return null;
  }

  /**
   * Yerel bildirimleri kontrol et
   */
  private async checkLocalReports(phoneNumber: string): Promise<SpamInfo | null> {
    try {
      const saved = await AsyncStorage.getItem(SPAM_REPORTS_KEY);
      if (!saved) return null;

      const reports: SpamReport[] = JSON.parse(saved);
      const matchingReports = reports.filter(
        (r) => this.normalizeNumber(r.phoneNumber) === phoneNumber
      );

      if (matchingReports.length === 0) return null;

      // En çok bildirilen kategoriyi bul
      const categoryCount = matchingReports.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryCount).sort(
        ([, a], [, b]) => b - a
      )[0][0] as SpamCategory;

      // Spam puanı hesapla (bildirim sayısına göre)
      const spamScore = Math.min(100, matchingReports.length * 20);

      return {
        phoneNumber,
        isSpam: spamScore >= this.settings.spamThreshold,
        spamScore,
        category: topCategory,
        reportCount: matchingReports.length,
        lastReportedAt: matchingReports[matchingReports.length - 1].reportedAt,
        description: matchingReports[matchingReports.length - 1].description,
        source: 'user',
        confidence: Math.min(95, 50 + matchingReports.length * 10),
      };
    } catch (error) {
      console.warn('Yerel spam bildirimleri kontrol edilemedi:', error);
      return null;
    }
  }

  /**
   * Uzak API'den spam bilgisi al
   */
  private async checkRemoteAPI(phoneNumber: string): Promise<SpamInfo | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      // Supabase'den spam bilgisini çek
      const { data, error } = await supabase
        .from('spam_numbers')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error || !data) return null;

      return {
        phoneNumber: data.phone_number,
        isSpam: data.spam_score >= this.settings.spamThreshold,
        spamScore: data.spam_score,
        category: data.category || 'unknown',
        reportCount: data.report_count || 0,
        lastReportedAt: data.last_reported_at,
        description: data.description,
        companyName: data.company_name,
        source: 'api',
        confidence: data.confidence || 80,
      };
    } catch (error) {
      console.warn('Uzak spam API kontrol edilemedi:', error);
      return null;
    }
  }

  /**
   * Spam bildirimi yap
   */
  async reportSpam(
    phoneNumber: string,
    category: SpamCategory,
    description?: string
  ): Promise<boolean> {
    const normalized = this.normalizeNumber(phoneNumber);

    const report: SpamReport = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber: normalized,
      category,
      description,
      reportedAt: new Date().toISOString(),
    };

    try {
      // Yerel olarak kaydet
      const saved = await AsyncStorage.getItem(SPAM_REPORTS_KEY);
      const reports: SpamReport[] = saved ? JSON.parse(saved) : [];
      reports.push(report);
      await AsyncStorage.setItem(SPAM_REPORTS_KEY, JSON.stringify(reports));

      // Cache'i güncelle
      const existingInfo = this.cache.get(normalized);
      const newReportCount = (existingInfo?.reportCount || 0) + 1;
      const newSpamScore = Math.min(100, newReportCount * 20);

      const updatedInfo: SpamInfo = {
        phoneNumber: normalized,
        isSpam: newSpamScore >= this.settings.spamThreshold,
        spamScore: newSpamScore,
        category,
        reportCount: newReportCount,
        lastReportedAt: report.reportedAt,
        description,
        source: 'user',
        confidence: Math.min(95, 50 + newReportCount * 10),
      };

      this.cache.set(normalized, updatedInfo);
      await this.saveCache();

      // Supabase'e de gönder (arka planda)
      this.syncReportToServer(report);

      return true;
    } catch (error) {
      console.error('Spam bildirimi kaydedilemedi:', error);
      return false;
    }
  }

  /**
   * Bildirimi sunucuya senkronize et
   */
  private async syncReportToServer(report: SpamReport): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Spam bildirimi tablosuna ekle
      await supabase.from('spam_reports').insert({
        phone_number: report.phoneNumber,
        category: report.category,
        description: report.description,
        reported_at: report.reportedAt,
      });

      // Spam numaraları tablosunu güncelle
      const { data: existing } = await supabase
        .from('spam_numbers')
        .select('*')
        .eq('phone_number', report.phoneNumber)
        .single();

      if (existing) {
        // Mevcut kaydı güncelle
        await supabase
          .from('spam_numbers')
          .update({
            report_count: existing.report_count + 1,
            spam_score: Math.min(100, (existing.spam_score || 0) + 10),
            last_reported_at: report.reportedAt,
            category: report.category,
          })
          .eq('phone_number', report.phoneNumber);
      } else {
        // Yeni kayıt oluştur
        await supabase.from('spam_numbers').insert({
          phone_number: report.phoneNumber,
          category: report.category,
          description: report.description,
          report_count: 1,
          spam_score: 20,
          last_reported_at: report.reportedAt,
          confidence: 50,
        });
      }
    } catch (error) {
      console.warn('Spam bildirimi sunucuya gönderilemedi:', error);
    }
  }

  /**
   * Numarayı engelle
   */
  async blockNumber(phoneNumber: string): Promise<boolean> {
    const normalized = this.normalizeNumber(phoneNumber);
    this.blockedNumbers.add(normalized);
    await this.saveBlockedNumbers();
    return true;
  }

  /**
   * Numara engelini kaldır
   */
  async unblockNumber(phoneNumber: string): Promise<boolean> {
    const normalized = this.normalizeNumber(phoneNumber);
    this.blockedNumbers.delete(normalized);
    await this.saveBlockedNumbers();
    return true;
  }

  /**
   * Numara engelli mi?
   */
  isNumberBlocked(phoneNumber: string): boolean {
    const normalized = this.normalizeNumber(phoneNumber);
    return this.blockedNumbers.has(normalized);
  }

  /**
   * Tüm engelli numaraları al
   */
  getBlockedNumbers(): string[] {
    return Array.from(this.blockedNumbers);
  }

  /**
   * Numara spam olarak işaretlenmeli mi?
   */
  shouldBlockCall(phoneNumber: string): boolean {
    if (!this.settings.blockSpamCalls) return false;

    const normalized = this.normalizeNumber(phoneNumber);

    // Manuel engelli mi?
    if (this.blockedNumbers.has(normalized)) return true;

    // Spam cache'inde var mı?
    const cached = this.cache.get(normalized);
    if (cached && cached.isSpam) return true;

    return false;
  }

  /**
   * Spam uyarısı gösterilmeli mi?
   */
  shouldShowWarning(phoneNumber: string): boolean {
    if (!this.settings.showSpamWarning) return false;

    const normalized = this.normalizeNumber(phoneNumber);
    const cached = this.cache.get(normalized);

    return cached?.isSpam === true;
  }

  /**
   * Ayarları al
   */
  getSettings(): SpamSettings {
    return { ...this.settings };
  }

  /**
   * Spam koruması etkin mi?
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Spam korumasını aç/kapat
   */
  async setEnabled(enabled: boolean): Promise<void> {
    await this.saveSettings({ enabled });
  }

  /**
   * Cache'i temizle
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(SPAM_CACHE_KEY);
  }

  /**
   * Yerel bildirimleri temizle
   */
  async clearLocalReports(): Promise<void> {
    await AsyncStorage.removeItem(SPAM_REPORTS_KEY);
    this.cache.clear();
    await this.saveCache();
  }
}

// Singleton export
export const spamService = SpamService.getInstance();
export default spamService;
