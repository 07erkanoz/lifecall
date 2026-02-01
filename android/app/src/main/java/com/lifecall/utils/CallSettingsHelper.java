package com.lifecall.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.util.Log;

import org.json.JSONObject;

/**
 * LifeCall - Call Settings Helper
 *
 * React Native AsyncStorage'dan arama ayarlarını okur ve
 * native tarafta kullanılabilir hale getirir.
 */
public class CallSettingsHelper {

    private static final String TAG = "CallSettingsHelper";
    private static final String PREFS_NAME = "com.lifecall.asyncstorage";
    private static final String SETTINGS_KEY = "@lifecall_call_settings";

    private final Context context;

    // Ayarlar
    private boolean blockUnknownCallers = false;
    private boolean blockPrivateNumbers = false;
    private boolean spamProtection = true;
    private boolean answerWithButton = true;
    private boolean answerWithProximity = false;
    private boolean rejectWithButton = true;
    private boolean rejectWithFlip = false;

    public CallSettingsHelper(Context context) {
        this.context = context;
        loadSettings();
    }

    /**
     * AsyncStorage'dan ayarları yükle
     */
    public void loadSettings() {
        try {
            // React Native AsyncStorage SQLite veritabanından oku
            android.database.sqlite.SQLiteDatabase db = context.openOrCreateDatabase(
                "RKStorage", Context.MODE_PRIVATE, null);

            Cursor cursor = db.rawQuery(
                "SELECT value FROM catalystLocalStorage WHERE key = ?",
                new String[]{SETTINGS_KEY}
            );

            if (cursor != null && cursor.moveToFirst()) {
                String jsonStr = cursor.getString(0);
                parseSettings(jsonStr);
                cursor.close();
            }

            db.close();
        } catch (Exception e) {
            Log.e(TAG, "Failed to load settings from AsyncStorage", e);
            // Varsayılan değerleri kullan
        }
    }

    /**
     * JSON string'den ayarları parse et
     */
    private void parseSettings(String jsonStr) {
        try {
            JSONObject json = new JSONObject(jsonStr);

            blockUnknownCallers = json.optBoolean("blockUnknownCallers", false);
            blockPrivateNumbers = json.optBoolean("blockPrivateNumbers", false);
            spamProtection = json.optBoolean("spamProtection", true);
            answerWithButton = json.optBoolean("answerWithButton", true);
            answerWithProximity = json.optBoolean("answerWithProximity", false);
            rejectWithButton = json.optBoolean("rejectWithButton", true);
            rejectWithFlip = json.optBoolean("rejectWithFlip", false);

            Log.d(TAG, "Settings loaded: blockUnknown=" + blockUnknownCallers +
                    ", blockPrivate=" + blockPrivateNumbers);

        } catch (Exception e) {
            Log.e(TAG, "Failed to parse settings JSON", e);
        }
    }

    /**
     * Numara rehberde var mı kontrol et
     */
    public boolean isNumberInContacts(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }

        try {
            // Numarayı temizle
            String cleanNumber = phoneNumber.replaceAll("[^0-9+]", "");

            Uri uri = Uri.withAppendedPath(
                ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                Uri.encode(cleanNumber)
            );

            Cursor cursor = context.getContentResolver().query(
                uri,
                new String[]{ContactsContract.PhoneLookup._ID},
                null,
                null,
                null
            );

            if (cursor != null) {
                boolean found = cursor.getCount() > 0;
                cursor.close();
                return found;
            }

        } catch (Exception e) {
            Log.e(TAG, "Error checking contacts for: " + phoneNumber, e);
        }

        return false;
    }

    /**
     * Numara gizli/özel mi kontrol et
     */
    public boolean isPrivateNumber(String phoneNumber) {
        if (phoneNumber == null) {
            return true;
        }

        String cleaned = phoneNumber.trim();

        // Boş numara
        if (cleaned.isEmpty()) {
            return true;
        }

        // "Özel", "Gizli", "Unknown", "Restricted" vb.
        String lower = cleaned.toLowerCase();
        if (lower.equals("private") ||
            lower.equals("unknown") ||
            lower.equals("restricted") ||
            lower.equals("anonymous") ||
            lower.equals("blocked") ||
            lower.equals("özel") ||
            lower.equals("gizli") ||
            lower.equals("bilinmeyen")) {
            return true;
        }

        // Sadece rakam kontrolü - geçerli numara değilse
        String digits = cleaned.replaceAll("[^0-9]", "");
        if (digits.length() < 3) {
            return true;
        }

        return false;
    }

    /**
     * Bu aramayı engellemeli miyiz?
     */
    public boolean shouldBlockCall(String phoneNumber) {
        // Gizli numara kontrolü
        if (blockPrivateNumbers && isPrivateNumber(phoneNumber)) {
            Log.d(TAG, "Blocking private number");
            return true;
        }

        // Bilinmeyen arayan kontrolü
        if (blockUnknownCallers && !isPrivateNumber(phoneNumber)) {
            if (!isNumberInContacts(phoneNumber)) {
                Log.d(TAG, "Blocking unknown caller: " + phoneNumber);
                return true;
            }
        }

        return false;
    }

    // Getters
    public boolean isBlockUnknownCallersEnabled() {
        return blockUnknownCallers;
    }

    public boolean isBlockPrivateNumbersEnabled() {
        return blockPrivateNumbers;
    }

    public boolean isSpamProtectionEnabled() {
        return spamProtection;
    }

    public boolean isAnswerWithButtonEnabled() {
        return answerWithButton;
    }

    public boolean isAnswerWithProximityEnabled() {
        return answerWithProximity;
    }

    public boolean isRejectWithButtonEnabled() {
        return rejectWithButton;
    }

    public boolean isRejectWithFlipEnabled() {
        return rejectWithFlip;
    }
}
