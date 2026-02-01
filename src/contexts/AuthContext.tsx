/**
 * LifeCall - Auth Context (Lazy Authentication)
 *
 * Telefon/rehber uygulaması için optimize edilmiş auth sistemi:
 * - Uygulama başlangıcında auth kontrolü YOK (sıfır gecikme)
 * - Auth sadece gerektiğinde istenir (spam bildirme, yedekleme, sync)
 * - Offline-first yaklaşım
 * - Opsiyonel hesap - kullanıcı istemezse olmadan devam eder
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Google Sign-In yapılandırması
const configureGoogleSignIn = () => {
  const webClientId = Config.GOOGLE_WEB_CLIENT_ID;
  if (webClientId) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
    return true;
  }
  console.warn('Google Web Client ID yapılandırılmamış. .env dosyasını kontrol edin.');
  return false;
};

// Uygulama başladığında Google Sign-In yapılandır
let isGoogleConfigured = false;
try {
  isGoogleConfigured = configureGoogleSignIn();
} catch (error) {
  console.warn('Google Sign-In yapılandırma hatası:', error);
}

// Storage keys
const AUTH_USER_KEY = '@lifecall_auth_user';
const AUTH_SKIPPED_KEY = '@lifecall_auth_skipped';

// Auth durumu
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'skipped';

// Context tipi
interface AuthContextType {
  // Durum
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSkipped: boolean;

  // Auth gerektiren özellik kontrolü
  requiresAuth: (feature: AuthFeature) => boolean;

  // İşlemler
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  skipAuth: () => Promise<void>;
  resetSkip: () => Promise<void>;

  // Lazy auth - sadece gerektiğinde çağrılır
  checkAuthStatus: () => Promise<void>;
}

// Auth gerektiren özellikler
export type AuthFeature =
  | 'spam_report'      // Spam numarası bildirme
  | 'cloud_backup'     // Bulut yedekleme
  | 'cross_device_sync' // Cihazlar arası senkronizasyon
  | 'premium_features'; // Premium özellikler

// Auth sonuç tipi
interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider - Lazy Authentication
 *
 * ÖNEMLİ: Bu provider başlangıçta auth kontrolü YAPMAZ.
 * Auth durumu sadece kullanıcı auth gerektiren bir özelliğe
 * erişmek istediğinde kontrol edilir.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [hasSkipped, setHasSkipped] = useState(false);

  // Supabase client
  const supabase = getSupabaseClient();

  // Skip durumunu yükle (sadece bir kez, başlangıçta)
  useEffect(() => {
    const loadSkipStatus = async () => {
      try {
        const skipped = await AsyncStorage.getItem(AUTH_SKIPPED_KEY);
        if (skipped === 'true') {
          setHasSkipped(true);
          setStatus('skipped');
        }
      } catch (error) {
        console.warn('Skip durumu yüklenemedi:', error);
      }
    };
    loadSkipStatus();
  }, []);

  // Auth durumunu kontrol et (LAZY - sadece çağrıldığında)
  const checkAuthStatus = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setStatus('unauthenticated');
      return;
    }

    if (status === 'loading') return;

    setStatus('loading');

    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('Session kontrolü hatası:', error);
        setStatus('unauthenticated');
        return;
      }

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setStatus('authenticated');
        setHasSkipped(false);
        await AsyncStorage.removeItem(AUTH_SKIPPED_KEY);
      } else {
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Auth kontrolü hatası:', error);
      setStatus('unauthenticated');
    }
  }, [supabase, status]);

  // Email ile giriş
  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return { success: false, error: 'Supabase yapılandırılmamış' };
    }

    setStatus('loading');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus('unauthenticated');
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setStatus('authenticated');
        setHasSkipped(false);
        await AsyncStorage.removeItem(AUTH_SKIPPED_KEY);
        return { success: true, user: data.user };
      }

      setStatus('unauthenticated');
      return { success: false, error: 'Giriş başarısız' };
    } catch (error: any) {
      setStatus('unauthenticated');
      return { success: false, error: error.message || 'Bir hata oluştu' };
    }
  }, [supabase]);

  // Email ile kayıt
  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return { success: false, error: 'Supabase yapılandırılmamış' };
    }

    setStatus('loading');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setStatus('unauthenticated');
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Email doğrulama gerekebilir
        if (data.session) {
          setUser(data.user);
          setSession(data.session);
          setStatus('authenticated');
          setHasSkipped(false);
          await AsyncStorage.removeItem(AUTH_SKIPPED_KEY);
        } else {
          setStatus('unauthenticated');
        }
        return { success: true, user: data.user };
      }

      setStatus('unauthenticated');
      return { success: false, error: 'Kayıt başarısız' };
    } catch (error: any) {
      setStatus('unauthenticated');
      return { success: false, error: error.message || 'Bir hata oluştu' };
    }
  }, [supabase]);

  // Google ile giriş
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) {
      return { success: false, error: 'Supabase yapılandırılmamış' };
    }

    if (!isGoogleConfigured) {
      return { success: false, error: 'Google Sign-In yapılandırılmamış' };
    }

    setStatus('loading');

    try {
      // Google Play Services kontrolü
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Google ile giriş yap
      const signInResult = await GoogleSignin.signIn();

      if (!signInResult.data?.idToken) {
        setStatus('unauthenticated');
        return { success: false, error: 'Google ID token alınamadı' };
      }

      // Supabase'e Google token ile giriş yap
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: signInResult.data.idToken,
      });

      if (error) {
        setStatus('unauthenticated');
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setStatus('authenticated');
        setHasSkipped(false);
        await AsyncStorage.removeItem(AUTH_SKIPPED_KEY);
        return { success: true, user: data.user };
      }

      setStatus('unauthenticated');
      return { success: false, error: 'Google girişi başarısız' };
    } catch (error: any) {
      setStatus('unauthenticated');

      // Google Sign-In hata kodları
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'Giriş iptal edildi' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Giriş işlemi devam ediyor' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Google Play Services mevcut değil' };
      }

      return { success: false, error: error.message || 'Google girişi başarısız' };
    }
  }, [supabase]);

  // Çıkış yap
  const signOut = useCallback(async () => {
    // Supabase'den çıkış yap
    if (supabase) {
      await supabase.auth.signOut();
    }

    // Google'dan da çıkış yap (eğer Google ile giriş yapılmışsa)
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.warn('Google Sign-Out hatası:', error);
    }

    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  }, [supabase]);

  // Auth'u atla
  const skipAuth = useCallback(async () => {
    setHasSkipped(true);
    setStatus('skipped');
    await AsyncStorage.setItem(AUTH_SKIPPED_KEY, 'true');
  }, []);

  // Skip'i sıfırla
  const resetSkip = useCallback(async () => {
    setHasSkipped(false);
    setStatus('idle');
    await AsyncStorage.removeItem(AUTH_SKIPPED_KEY);
  }, []);

  // Özellik için auth gerekli mi?
  const requiresAuth = useCallback((feature: AuthFeature): boolean => {
    // Bu özellikler için auth gerekli
    const authRequiredFeatures: AuthFeature[] = [
      'spam_report',
      'cloud_backup',
      'cross_device_sync',
      'premium_features',
    ];
    return authRequiredFeatures.includes(feature);
  }, []);

  // Computed values
  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const isLoading = useMemo(() => status === 'loading', [status]);

  // Context value
  const value = useMemo(
    () => ({
      user,
      session,
      status,
      isAuthenticated,
      isLoading,
      hasSkipped,
      requiresAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      skipAuth,
      resetSkip,
      checkAuthStatus,
    }),
    [
      user,
      session,
      status,
      isAuthenticated,
      isLoading,
      hasSkipped,
      requiresAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      skipAuth,
      resetSkip,
      checkAuthStatus,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 * Auth context'e erişim sağlar
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * useOptionalAuth hook
 * Lazy authentication için kullanılır.
 * Auth gerektiren bir özellik için kullanıcıya prompt gösterilmesi gerekip gerekmediğini belirler.
 *
 * @param feature - Auth gerektiren özellik
 * @returns { needsAuth, showPrompt, user, checkAndProceed }
 */
export const useOptionalAuth = (feature: AuthFeature) => {
  const auth = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  // Auth gerekli mi ve kullanıcı giriş yapmamış mı?
  const needsAuth = auth.requiresAuth(feature) && !auth.isAuthenticated;

  // Özelliğe erişmeye çalış
  const checkAndProceed = useCallback(async (): Promise<boolean> => {
    // Auth gerekmiyorsa veya zaten giriş yapılmışsa devam et
    if (!auth.requiresAuth(feature)) {
      return true;
    }

    // Henüz kontrol edilmemişse kontrol et
    if (auth.status === 'idle') {
      await auth.checkAuthStatus();
    }

    // Giriş yapılmışsa devam et
    if (auth.isAuthenticated) {
      return true;
    }

    // Daha önce atlanmışsa tekrar sorma, direkt devam et (bazı özellikler için)
    // Ama spam bildirme ve backup gibi kritik özellikler için her zaman sor
    if (auth.hasSkipped && feature !== 'spam_report' && feature !== 'cloud_backup') {
      return false;
    }

    // Prompt göster
    setShowPrompt(true);
    return false;
  }, [auth, feature]);

  // Prompt'u kapat
  const hidePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  // Auth başarılı olduğunda
  const onAuthSuccess = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    needsAuth,
    showPrompt,
    hidePrompt,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    checkAndProceed,
    onAuthSuccess,
    signIn: auth.signInWithEmail,
    signUp: auth.signUpWithEmail,
    signInWithGoogle: auth.signInWithGoogle,
    skip: auth.skipAuth,
  };
};

export default AuthProvider;
