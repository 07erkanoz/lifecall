package com.lifecall;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;

/**
 * LifeCall - Navigation Bar Module
 *
 * Android navigation bar rengini React Native'den kontrol eder.
 * - Tema değişikliklerinde navigation bar rengini günceller
 * - Light/Dark mode desteği
 */
public class NavigationBarModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public NavigationBarModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "NavigationBarModule";
    }

    /**
     * Navigation bar rengini ayarla
     * @param colorHex Renk hex kodu (örn: "#FFFFFF")
     * @param isLight Light mode mu? (true ise ikonlar koyu)
     */
    @ReactMethod
    public void setNavigationBarColor(final String colorHex, final boolean isLight) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Activity activity = getCurrentActivity();
                if (activity == null) return;

                Window window = activity.getWindow();
                if (window == null) return;

                try {
                    int color = Color.parseColor(colorHex);
                    window.setNavigationBarColor(color);

                    // Android O+ için navigation bar ikon rengini ayarla
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        View decorView = window.getDecorView();
                        int flags = decorView.getSystemUiVisibility();

                        if (isLight) {
                            // Light background - dark icons
                            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        } else {
                            // Dark background - light icons
                            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        }

                        decorView.setSystemUiVisibility(flags);
                    }
                } catch (IllegalArgumentException e) {
                    // Geçersiz renk kodu
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     * Status bar ve navigation bar'ı tamamen şeffaf yap
     * Tam ekran deneyimi için (gelen arama ekranı vb.)
     */
    @ReactMethod
    public void setFullscreenMode(final boolean enable) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Activity activity = getCurrentActivity();
                if (activity == null) return;

                Window window = activity.getWindow();
                if (window == null) return;

                if (enable) {
                    // Tam ekran modu
                    window.setFlags(
                            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                    );
                } else {
                    // Normal mod
                    window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
                }
            }
        });
    }

    /**
     * Status bar rengini ayarla
     * @param colorHex Renk hex kodu
     * @param isLight Light mode mu?
     */
    @ReactMethod
    public void setStatusBarColor(final String colorHex, final boolean isLight) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Activity activity = getCurrentActivity();
                if (activity == null) return;

                Window window = activity.getWindow();
                if (window == null) return;

                try {
                    int color = Color.parseColor(colorHex);
                    window.setStatusBarColor(color);

                    // Android M+ için status bar ikon rengini ayarla
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        View decorView = window.getDecorView();
                        int flags = decorView.getSystemUiVisibility();

                        if (isLight) {
                            // Light background - dark icons
                            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        } else {
                            // Dark background - light icons
                            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        }

                        decorView.setSystemUiVisibility(flags);
                    }
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     * Hem status bar hem navigation bar rengini tek seferde ayarla
     * @param colorHex Renk hex kodu
     * @param isLight Light mode mu?
     */
    @ReactMethod
    public void setSystemBarsColor(final String colorHex, final boolean isLight) {
        setStatusBarColor(colorHex, isLight);
        setNavigationBarColor(colorHex, isLight);
    }
}
