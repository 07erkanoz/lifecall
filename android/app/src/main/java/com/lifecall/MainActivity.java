package com.lifecall;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * LifeCall - Ana Activity
 *
 * React Native uygulamasının ana aktivitesi.
 * - Gelen arama intent'lerini yakalar
 * - Dial intent'lerini işler
 * - Launcher ikon kısayollarını yönetir
 */
public class MainActivity extends ReactActivity {

    private static final String TAG = "MainActivity";
    private String pendingTargetTab = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Launcher alias'tan başlatıldıysa hedef sekmeyi kontrol et
        checkLauncherAlias();

        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    /**
     * Launcher alias'tan başlatıldıysa hedef sekmeyi kontrol et
     */
    private void checkLauncherAlias() {
        try {
            Intent launchIntent = getIntent();
            if (launchIntent == null) return;

            ComponentName componentName = launchIntent.getComponent();
            if (componentName == null) return;

            String className = componentName.getClassName();
            Log.d(TAG, "Launched from component: " + className);

            // Activity-alias'lardan başlatılmışsa hedef sekmeyi belirle
            if (className.endsWith(".ContactsAlias")) {
                pendingTargetTab = "contacts";
            } else if (className.endsWith(".CalendarAlias")) {
                pendingTargetTab = "calendar";
            } else if (className.endsWith(".NotesAlias")) {
                pendingTargetTab = "notes";
            }

            if (pendingTargetTab != null) {
                Log.d(TAG, "Pending target tab: " + pendingTargetTab);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking launcher alias", e);
        }
    }

    /**
     * React uygulaması hazır olduğunda bekleyen sekme varsa bildir
     */
    public void notifyPendingTargetTab() {
        if (pendingTargetTab != null) {
            try {
                if (getReactInstanceManager() != null &&
                    getReactInstanceManager().getCurrentReactContext() != null) {

                    WritableMap params = Arguments.createMap();
                    params.putString("tab", pendingTargetTab);

                    getReactInstanceManager().getCurrentReactContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onLauncherTabRequested", params);

                    Log.d(TAG, "Sent target tab event: " + pendingTargetTab);
                    pendingTargetTab = null; // Sadece bir kez gönder
                }
            } catch (Exception e) {
                Log.e(TAG, "Error sending target tab event", e);
            }
        }
    }

    /**
     * Gelen intent'leri işle
     */
    private void handleIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Uri data = intent.getData();

        if (action == null) return;

        switch (action) {
            case Intent.ACTION_DIAL:
            case Intent.ACTION_VIEW:
                // Arama ekranını aç
                if (data != null && "tel".equals(data.getScheme())) {
                    String phoneNumber = data.getSchemeSpecificPart();
                    // React Native'e gönder
                    sendDialIntent(phoneNumber);
                }
                break;

            case Intent.ACTION_CALL:
                // Doğrudan arama yap (izin gerektirir)
                if (data != null && "tel".equals(data.getScheme())) {
                    String phoneNumber = data.getSchemeSpecificPart();
                    sendCallIntent(phoneNumber);
                }
                break;
        }
    }

    /**
     * Dial intent'ini React Native'e gönder
     */
    private void sendDialIntent(String phoneNumber) {
        // Bu metod DeviceEventEmitter üzerinden React Native'e event gönderir
        // Native modül tarafından dinlenir
    }

    /**
     * Call intent'ini React Native'e gönder
     */
    private void sendCallIntent(String phoneNumber) {
        // Doğrudan arama başlat
    }

    /**
     * React Native modül adını döndür
     */
    @Override
    protected String getMainComponentName() {
        return "CallHub";
    }

    /**
     * React Activity Delegate
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                DefaultNewArchitectureEntryPoint.getFabricEnabled()
        );
    }
}
