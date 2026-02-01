/**
 * LifeCall - Arama Geçmişi Repository
 *
 * Arama geçmişi verilerini yönetir
 */

import {
  executeQuery,
  executeCommand,
  getOne,
  getCount,
  insert,
  remove,
  generateId,
} from '../DatabaseService';

// Arama tipi
export type CallType = 'incoming' | 'outgoing' | 'missed' | 'rejected' | 'blocked';

// Arama kaydı
export interface CallLogEntry {
  id: string;
  phoneNumber: string;
  formattedNumber?: string;
  contactId?: string;
  contactName?: string;
  photoUri?: string;
  callType: CallType;
  duration: number; // saniye
  timestamp: Date;
  isRead: boolean;
  isSpam?: boolean;
  spamScore?: number;
}

// Veritabanı kayıt tipi
interface CallLogRow {
  id: string;
  phone_number: string;
  formatted_number: string | null;
  contact_id: string | null;
  contact_name: string | null;
  photo_uri: string | null;
  call_type: string;
  duration: number;
  timestamp: string;
  is_read: number;
  is_spam: number;
  spam_score: number | null;
}

// Row'dan CallLogEntry'e dönüşüm
const mapRowToEntry = (row: CallLogRow): CallLogEntry => ({
  id: row.id,
  phoneNumber: row.phone_number,
  formattedNumber: row.formatted_number || undefined,
  contactId: row.contact_id || undefined,
  contactName: row.contact_name || undefined,
  photoUri: row.photo_uri || undefined,
  callType: row.call_type as CallType,
  duration: row.duration,
  timestamp: new Date(row.timestamp),
  isRead: row.is_read === 1,
  isSpam: row.is_spam === 1,
  spamScore: row.spam_score || undefined,
});

class CallLogRepository {
  /**
   * Arama kaydı ekle
   */
  static async addEntry(entry: Omit<CallLogEntry, 'id'>): Promise<string> {
    const id = generateId();

    await insert('call_logs', {
      id,
      phone_number: entry.phoneNumber,
      formatted_number: entry.formattedNumber || null,
      contact_id: entry.contactId || null,
      contact_name: entry.contactName || null,
      photo_uri: entry.photoUri || null,
      call_type: entry.callType,
      duration: entry.duration,
      timestamp: entry.timestamp.toISOString(),
      is_read: entry.isRead ? 1 : 0,
      is_spam: entry.isSpam ? 1 : 0,
      spam_score: entry.spamScore || null,
    });

    return id;
  }

  /**
   * Tüm arama geçmişini al
   */
  static async getAll(limit: number = 100, offset: number = 0): Promise<CallLogEntry[]> {
    const rows = await executeQuery<CallLogRow>(
      `SELECT * FROM call_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map(mapRowToEntry);
  }

  /**
   * Belirli bir numaranın arama geçmişini al
   */
  static async getByPhoneNumber(phoneNumber: string): Promise<CallLogEntry[]> {
    const normalized = phoneNumber.replace(/[^0-9+]/g, '');
    const rows = await executeQuery<CallLogRow>(
      `SELECT * FROM call_logs WHERE REPLACE(REPLACE(phone_number, ' ', ''), '-', '') LIKE ? ORDER BY timestamp DESC`,
      [`%${normalized}%`]
    );

    return rows.map(mapRowToEntry);
  }

  /**
   * Cevapsız aramaları al
   */
  static async getMissedCalls(): Promise<CallLogEntry[]> {
    const rows = await executeQuery<CallLogRow>(
      `SELECT * FROM call_logs WHERE call_type = 'missed' AND is_read = 0 ORDER BY timestamp DESC`
    );

    return rows.map(mapRowToEntry);
  }

  /**
   * Cevapsız arama sayısını al
   */
  static async getMissedCallCount(): Promise<number> {
    return getCount('call_logs', `call_type = 'missed' AND is_read = 0`);
  }

  /**
   * Aramayı okundu olarak işaretle
   */
  static async markAsRead(id: string): Promise<void> {
    await executeCommand(
      `UPDATE call_logs SET is_read = 1 WHERE id = ?`,
      [id]
    );
  }

  /**
   * Tüm cevapsız aramaları okundu olarak işaretle
   */
  static async markAllMissedAsRead(): Promise<void> {
    await executeCommand(
      `UPDATE call_logs SET is_read = 1 WHERE call_type = 'missed' AND is_read = 0`
    );
  }

  /**
   * Tek bir arama kaydını sil
   */
  static async deleteEntry(id: string): Promise<void> {
    await remove('call_logs', 'id = ?', [id]);
  }

  /**
   * Belirli bir numaranın tüm aramalarını sil
   */
  static async deleteByPhoneNumber(phoneNumber: string): Promise<void> {
    const normalized = phoneNumber.replace(/[^0-9+]/g, '');
    await executeCommand(
      `DELETE FROM call_logs WHERE REPLACE(REPLACE(phone_number, ' ', ''), '-', '') LIKE ?`,
      [`%${normalized}%`]
    );
  }

  /**
   * Belirli bir tarihten eski aramaları sil
   */
  static async deleteOlderThan(date: Date): Promise<number> {
    const result = await executeCommand(
      `DELETE FROM call_logs WHERE timestamp < ?`,
      [date.toISOString()]
    );
    return result.rowsAffected || 0;
  }

  /**
   * Tüm arama geçmişini temizle
   */
  static async clearAll(): Promise<void> {
    await executeCommand(`DELETE FROM call_logs`);
  }

  /**
   * Arama geçmişini saklama süresine göre temizle
   */
  static async cleanupByRetention(retentionDays: number): Promise<number> {
    if (retentionDays < 0) {
      // -1 = süresiz, temizleme yapma
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    return this.deleteOlderThan(cutoffDate);
  }

  /**
   * Spam aramalarını al
   */
  static async getSpamCalls(): Promise<CallLogEntry[]> {
    const rows = await executeQuery<CallLogRow>(
      `SELECT * FROM call_logs WHERE is_spam = 1 ORDER BY timestamp DESC`
    );

    return rows.map(mapRowToEntry);
  }

  /**
   * Arama kaydını spam olarak işaretle
   */
  static async markAsSpam(id: string, spamScore: number = 100): Promise<void> {
    await executeCommand(
      `UPDATE call_logs SET is_spam = 1, spam_score = ? WHERE id = ?`,
      [spamScore, id]
    );
  }

  /**
   * Toplam arama sayısını al
   */
  static async getTotalCount(): Promise<number> {
    return getCount('call_logs');
  }

  /**
   * İstatistikler
   */
  static async getStats(): Promise<{
    total: number;
    incoming: number;
    outgoing: number;
    missed: number;
    spam: number;
    totalDuration: number;
  }> {
    const total = await getCount('call_logs');
    const incoming = await getCount('call_logs', `call_type = 'incoming'`);
    const outgoing = await getCount('call_logs', `call_type = 'outgoing'`);
    const missed = await getCount('call_logs', `call_type = 'missed'`);
    const spam = await getCount('call_logs', `is_spam = 1`);

    const durationResult = await executeQuery<{ total_duration: number }>(
      `SELECT COALESCE(SUM(duration), 0) as total_duration FROM call_logs`
    );

    return {
      total,
      incoming,
      outgoing,
      missed,
      spam,
      totalDuration: durationResult[0]?.total_duration || 0,
    };
  }
}

export default CallLogRepository;
