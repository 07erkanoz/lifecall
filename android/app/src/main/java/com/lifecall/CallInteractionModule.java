package com.lifecall;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;
import android.view.KeyEvent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.lifecall.services.LifeCallInCallService;
import com.lifecall.utils.CallSettingsHelper;

/**
 * LifeCall - Call Interaction Module
 *
 * Arama etkileşim yöntemlerini yönetir:
 * - Ses düğmeleri ile cevaplama/reddetme
 * - Telefonu çevirerek reddetme (accelerometer)
 * - Yakınlık sensörü ile cevaplama
 */
public class CallInteractionModule extends ReactContextBaseJavaModule implements SensorEventListener {

    private static final String TAG = "CallInteractionModule";
    private static final String MODULE_NAME = "CallInteractionModule";

    private final ReactApplicationContext reactContext;
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private Sensor proximitySensor;
    private CallSettingsHelper settingsHelper;

    // Etkileşim durumları
    private boolean isListening = false;
    private boolean isRinging = false;

    // Flip detection
    private static final float FLIP_THRESHOLD = 9.0f; // m/s² - yüzü aşağı algılama eşiği
    private long lastFlipTime = 0;
    private static final long FLIP_DEBOUNCE = 1000; // 1 saniye

    // Proximity detection
    private boolean wasNear = false;
    private long proximityChangeTime = 0;
    private static final long PROXIMITY_ANSWER_DELAY = 500; // 0.5 saniye

    // Event isimleri
    public static final String EVENT_VOLUME_BUTTON_PRESSED = "onVolumeButtonPressed";
    public static final String EVENT_PHONE_FLIPPED = "onPhoneFlipped";
    public static final String EVENT_PROXIMITY_ANSWER = "onProximityAnswer";

    public CallInteractionModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.settingsHelper = new CallSettingsHelper(context);

        // Sensor manager
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Gelen arama için etkileşim dinlemeyi başlat
     */
    @ReactMethod
    public void startListeningForIncomingCall(Promise promise) {
        try {
            if (isListening) {
                promise.resolve(true);
                return;
            }

            // Ayarları yeniden yükle
            settingsHelper.loadSettings();

            isRinging = true;
            isListening = true;

            // Sensörleri etkinleştir
            if (sensorManager != null) {
                // Accelerometer - çevirerek reddetme için
                if (settingsHelper.isRejectWithFlipEnabled() && accelerometer != null) {
                    sensorManager.registerListener(this, accelerometer,
                            SensorManager.SENSOR_DELAY_NORMAL);
                    Log.d(TAG, "Accelerometer listening started");
                }

                // Proximity - yakınlık ile cevaplama için
                if (settingsHelper.isAnswerWithProximityEnabled() && proximitySensor != null) {
                    sensorManager.registerListener(this, proximitySensor,
                            SensorManager.SENSOR_DELAY_NORMAL);
                    Log.d(TAG, "Proximity listening started");
                }
            }

            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting listening", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Dinlemeyi durdur
     */
    @ReactMethod
    public void stopListening(Promise promise) {
        try {
            isListening = false;
            isRinging = false;

            // Sensörleri kapat
            if (sensorManager != null) {
                sensorManager.unregisterListener(this);
            }

            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping listening", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Ses düğmesi ile aramayı cevapla
     */
    @ReactMethod
    public void answerWithVolumeButton(Promise promise) {
        try {
            if (settingsHelper.isAnswerWithButtonEnabled()) {
                boolean answered = LifeCallInCallService.answerActiveCall();
                promise.resolve(answered);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Güç düğmesi ile aramayı reddet
     */
    @ReactMethod
    public void rejectWithPowerButton(Promise promise) {
        try {
            if (settingsHelper.isRejectWithButtonEnabled()) {
                boolean rejected = LifeCallInCallService.disconnectActiveCall();
                promise.resolve(rejected);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Mevcut etkileşim ayarlarını al
     */
    @ReactMethod
    public void getInteractionSettings(Promise promise) {
        try {
            settingsHelper.loadSettings();

            WritableMap settings = Arguments.createMap();
            settings.putBoolean("answerWithButton", settingsHelper.isAnswerWithButtonEnabled());
            settings.putBoolean("answerWithProximity", settingsHelper.isAnswerWithProximityEnabled());
            settings.putBoolean("rejectWithButton", settingsHelper.isRejectWithButtonEnabled());
            settings.putBoolean("rejectWithFlip", settingsHelper.isRejectWithFlipEnabled());

            promise.resolve(settings);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ==================== Sensor Event Listener ====================

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (!isListening || !isRinging) return;

        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            handleAccelerometer(event);
        } else if (event.sensor.getType() == Sensor.TYPE_PROXIMITY) {
            handleProximity(event);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Gerekli değil
    }

    /**
     * Accelerometer - Telefonu çevirerek reddetme
     */
    private void handleAccelerometer(SensorEvent event) {
        if (!settingsHelper.isRejectWithFlipEnabled()) return;

        float z = event.values[2];

        // Telefon yüzü aşağı bakıyor mu? (z negatif ve büyük)
        boolean isFaceDown = z < -FLIP_THRESHOLD;

        if (isFaceDown) {
            long now = System.currentTimeMillis();

            // Debounce kontrolü
            if (now - lastFlipTime > FLIP_DEBOUNCE) {
                lastFlipTime = now;

                Log.d(TAG, "Phone flipped face down, rejecting call");

                // Aramayı reddet
                boolean rejected = LifeCallInCallService.disconnectActiveCall();

                if (rejected) {
                    // React Native'e bildir
                    sendEvent(EVENT_PHONE_FLIPPED, null);
                }
            }
        }
    }

    /**
     * Proximity - Yakınlık sensörü ile cevaplama
     */
    private void handleProximity(SensorEvent event) {
        if (!settingsHelper.isAnswerWithProximityEnabled()) return;

        float distance = event.values[0];
        boolean isNear = distance < proximitySensor.getMaximumRange();

        long now = System.currentTimeMillis();

        // Uzaktan yakına geçiş
        if (isNear && !wasNear) {
            proximityChangeTime = now;
        }
        // Yakından uzağa geçiş - kulağa götürüp indirdi
        else if (!isNear && wasNear) {
            // Yeterince uzun süre yakın kaldı mı?
            if (now - proximityChangeTime > PROXIMITY_ANSWER_DELAY) {
                Log.d(TAG, "Proximity answer triggered");

                // Aramayı cevapla
                boolean answered = LifeCallInCallService.answerActiveCall();

                if (answered) {
                    // React Native'e bildir
                    sendEvent(EVENT_PROXIMITY_ANSWER, null);
                    isRinging = false; // Artık çalmıyor
                }
            }
        }

        wasNear = isNear;
    }

    /**
     * React Native'e event gönder
     */
    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    /**
     * Cleanup
     */
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        isListening = false;
    }
}
