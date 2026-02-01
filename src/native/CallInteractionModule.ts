/**
 * LifeCall - Call Interaction Module
 *
 * Arama etkileşim yöntemlerini yönetir:
 * - Ses düğmeleri ile cevaplama/reddetme
 * - Telefonu çevirerek reddetme (accelerometer)
 * - Yakınlık sensörü ile cevaplama
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface InteractionSettings {
  answerWithButton: boolean;
  answerWithProximity: boolean;
  rejectWithButton: boolean;
  rejectWithFlip: boolean;
}

interface CallInteractionModuleType {
  startListeningForIncomingCall: () => Promise<boolean>;
  stopListening: () => Promise<boolean>;
  answerWithVolumeButton: () => Promise<boolean>;
  rejectWithPowerButton: () => Promise<boolean>;
  getInteractionSettings: () => Promise<InteractionSettings>;
}

const { CallInteractionModule } = NativeModules;

// Event emitter
const eventEmitter = Platform.OS === 'android' && CallInteractionModule
  ? new NativeEventEmitter(CallInteractionModule)
  : null;

// Event types
export type CallInteractionEvent =
  | 'onVolumeButtonPressed'
  | 'onPhoneFlipped'
  | 'onProximityAnswer';

/**
 * Gelen arama için etkileşim dinlemeyi başlat
 */
export const startListeningForIncomingCall = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !CallInteractionModule) {
    return false;
  }

  try {
    return await (CallInteractionModule as CallInteractionModuleType).startListeningForIncomingCall();
  } catch (error) {
    console.warn('CallInteractionModule.startListeningForIncomingCall error:', error);
    return false;
  }
};

/**
 * Dinlemeyi durdur
 */
export const stopListening = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !CallInteractionModule) {
    return false;
  }

  try {
    return await (CallInteractionModule as CallInteractionModuleType).stopListening();
  } catch (error) {
    console.warn('CallInteractionModule.stopListening error:', error);
    return false;
  }
};

/**
 * Ses düğmesi ile aramayı cevapla
 */
export const answerWithVolumeButton = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !CallInteractionModule) {
    return false;
  }

  try {
    return await (CallInteractionModule as CallInteractionModuleType).answerWithVolumeButton();
  } catch (error) {
    console.warn('CallInteractionModule.answerWithVolumeButton error:', error);
    return false;
  }
};

/**
 * Güç düğmesi ile aramayı reddet
 */
export const rejectWithPowerButton = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !CallInteractionModule) {
    return false;
  }

  try {
    return await (CallInteractionModule as CallInteractionModuleType).rejectWithPowerButton();
  } catch (error) {
    console.warn('CallInteractionModule.rejectWithPowerButton error:', error);
    return false;
  }
};

/**
 * Etkileşim ayarlarını al
 */
export const getInteractionSettings = async (): Promise<InteractionSettings | null> => {
  if (Platform.OS !== 'android' || !CallInteractionModule) {
    return null;
  }

  try {
    return await (CallInteractionModule as CallInteractionModuleType).getInteractionSettings();
  } catch (error) {
    console.warn('CallInteractionModule.getInteractionSettings error:', error);
    return null;
  }
};

/**
 * Event listener ekle
 */
export const addCallInteractionListener = (
  eventType: CallInteractionEvent,
  callback: (event: any) => void
): (() => void) => {
  if (!eventEmitter) {
    return () => {};
  }

  const subscription = eventEmitter.addListener(eventType, callback);
  return () => subscription.remove();
};

/**
 * Tüm listener'ları kaldır
 */
export const removeAllListeners = (eventType: CallInteractionEvent): void => {
  if (eventEmitter) {
    eventEmitter.removeAllListeners(eventType);
  }
};

export default {
  startListeningForIncomingCall,
  stopListening,
  answerWithVolumeButton,
  rejectWithPowerButton,
  getInteractionSettings,
  addCallInteractionListener,
  removeAllListeners,
};
