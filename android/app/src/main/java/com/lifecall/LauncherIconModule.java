package com.lifecall;

import android.content.ComponentName;
import android.content.pm.PackageManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

/**
 * LifeCall - Launcher Icon Module
 *
 * Uygulama için ek launcher ikonları yönetimi:
 * - Rehber ikonu
 * - Takvim ikonu
 * - Notlar ikonu
 *
 * Kullanıcı isterse bu ikonları etkinleştirip uygulama çekmecesine ekleyebilir.
 * Her ikon doğrudan ilgili sekmeyi açar.
 */
public class LauncherIconModule extends ReactContextBaseJavaModule {

    private static final String TAG = "LauncherIconModule";
    private final ReactApplicationContext reactContext;

    // Activity alias isimleri (AndroidManifest.xml ile eşleşmeli)
    private static final String ALIAS_CONTACTS = "com.lifecall.ContactsAlias";
    private static final String ALIAS_CALENDAR = "com.lifecall.CalendarAlias";
    private static final String ALIAS_NOTES = "com.lifecall.NotesAlias";

    public LauncherIconModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "LauncherIconModule";
    }

    /**
     * Launcher ikonunun durumunu al
     * @param iconType "contacts", "calendar", "notes"
     */
    @ReactMethod
    public void getIconStatus(String iconType, Promise promise) {
        try {
            String aliasName = getAliasName(iconType);
            if (aliasName == null) {
                promise.reject("INVALID_TYPE", "Geçersiz ikon tipi: " + iconType);
                return;
            }

            PackageManager pm = reactContext.getPackageManager();
            ComponentName componentName = new ComponentName(reactContext, aliasName);
            int state = pm.getComponentEnabledSetting(componentName);

            boolean isEnabled = (state == PackageManager.COMPONENT_ENABLED_STATE_ENABLED);

            WritableMap result = Arguments.createMap();
            result.putString("iconType", iconType);
            result.putBoolean("enabled", isEnabled);
            promise.resolve(result);

        } catch (Exception e) {
            promise.reject("ERROR", "İkon durumu alınamadı: " + e.getMessage());
        }
    }

    /**
     * Tüm launcher ikonlarının durumunu al
     */
    @ReactMethod
    public void getAllIconStatuses(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();

            WritableMap result = Arguments.createMap();

            // Contacts
            ComponentName contactsComponent = new ComponentName(reactContext, ALIAS_CONTACTS);
            int contactsState = pm.getComponentEnabledSetting(contactsComponent);
            result.putBoolean("contacts", contactsState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED);

            // Calendar
            ComponentName calendarComponent = new ComponentName(reactContext, ALIAS_CALENDAR);
            int calendarState = pm.getComponentEnabledSetting(calendarComponent);
            result.putBoolean("calendar", calendarState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED);

            // Notes
            ComponentName notesComponent = new ComponentName(reactContext, ALIAS_NOTES);
            int notesState = pm.getComponentEnabledSetting(notesComponent);
            result.putBoolean("notes", notesState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED);

            promise.resolve(result);

        } catch (Exception e) {
            promise.reject("ERROR", "İkon durumları alınamadı: " + e.getMessage());
        }
    }

    /**
     * Launcher ikonunu etkinleştir/devre dışı bırak
     * @param iconType "contacts", "calendar", "notes"
     * @param enabled true: etkinleştir, false: devre dışı bırak
     */
    @ReactMethod
    public void setIconEnabled(String iconType, boolean enabled, Promise promise) {
        try {
            String aliasName = getAliasName(iconType);
            if (aliasName == null) {
                promise.reject("INVALID_TYPE", "Geçersiz ikon tipi: " + iconType);
                return;
            }

            PackageManager pm = reactContext.getPackageManager();
            ComponentName componentName = new ComponentName(reactContext, aliasName);

            int newState = enabled
                    ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                    : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;

            pm.setComponentEnabledSetting(
                    componentName,
                    newState,
                    PackageManager.DONT_KILL_APP
            );

            WritableMap result = Arguments.createMap();
            result.putString("iconType", iconType);
            result.putBoolean("enabled", enabled);
            result.putBoolean("success", true);
            promise.resolve(result);

        } catch (Exception e) {
            promise.reject("ERROR", "İkon durumu değiştirilemedi: " + e.getMessage());
        }
    }

    /**
     * Tüm ek launcher ikonlarını etkinleştir
     */
    @ReactMethod
    public void enableAllIcons(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();

            // Contacts
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_CONTACTS),
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
            );

            // Calendar
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_CALENDAR),
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
            );

            // Notes
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_NOTES),
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
            );

            promise.resolve(true);

        } catch (Exception e) {
            promise.reject("ERROR", "İkonlar etkinleştirilemedi: " + e.getMessage());
        }
    }

    /**
     * Tüm ek launcher ikonlarını devre dışı bırak
     */
    @ReactMethod
    public void disableAllIcons(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();

            // Contacts
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_CONTACTS),
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
            );

            // Calendar
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_CALENDAR),
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
            );

            // Notes
            pm.setComponentEnabledSetting(
                    new ComponentName(reactContext, ALIAS_NOTES),
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
            );

            promise.resolve(true);

        } catch (Exception e) {
            promise.reject("ERROR", "İkonlar devre dışı bırakılamadı: " + e.getMessage());
        }
    }

    /**
     * Bekleyen hedef sekmeyi al (launcher alias'tan başlatıldıysa)
     */
    @ReactMethod
    public void getPendingTargetTab(Promise promise) {
        try {
            android.app.Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.resolve(null);
                return;
            }

            android.content.Intent intent = activity.getIntent();
            if (intent == null) {
                promise.resolve(null);
                return;
            }

            android.content.ComponentName componentName = intent.getComponent();
            if (componentName == null) {
                promise.resolve(null);
                return;
            }

            String className = componentName.getClassName();
            String targetTab = null;

            if (className.endsWith(".ContactsAlias")) {
                targetTab = "contacts";
            } else if (className.endsWith(".CalendarAlias")) {
                targetTab = "calendar";
            } else if (className.endsWith(".NotesAlias")) {
                targetTab = "notes";
            }

            promise.resolve(targetTab);

        } catch (Exception e) {
            promise.resolve(null);
        }
    }

    /**
     * İkon tipinden alias adını al
     */
    private String getAliasName(String iconType) {
        switch (iconType.toLowerCase()) {
            case "contacts":
                return ALIAS_CONTACTS;
            case "calendar":
                return ALIAS_CALENDAR;
            case "notes":
                return ALIAS_NOTES;
            default:
                return null;
        }
    }
}
