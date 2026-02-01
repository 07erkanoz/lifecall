/**
 * LifeCall - Auth Prompt Bileşeni
 *
 * Auth gerektiren özellikler için kullanıcıya giriş yapma teklifi sunar.
 * Kullanıcı isterse atlayabilir veya giriş yapabilir.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';
import type { AuthFeature } from '../contexts/AuthContext';

// Özellik bilgileri
const FEATURE_INFO: Record<AuthFeature, {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  iconColor: string;
}> = {
  spam_report: {
    icon: 'shield-alert',
    titleKey: 'auth.features.spamReport.title',
    descriptionKey: 'auth.features.spamReport.description',
    iconColor: '#F44336',
  },
  cloud_backup: {
    icon: 'cloud-upload',
    titleKey: 'auth.features.cloudBackup.title',
    descriptionKey: 'auth.features.cloudBackup.description',
    iconColor: '#2196F3',
  },
  cross_device_sync: {
    icon: 'sync',
    titleKey: 'auth.features.crossDeviceSync.title',
    descriptionKey: 'auth.features.crossDeviceSync.description',
    iconColor: '#4CAF50',
  },
  premium_features: {
    icon: 'star',
    titleKey: 'auth.features.premium.title',
    descriptionKey: 'auth.features.premium.description',
    iconColor: '#FF9800',
  },
};

// Varsayılan Türkçe metinler (i18n yoksa)
const DEFAULT_TEXTS: Record<string, string> = {
  'auth.features.spamReport.title': 'Spam Bildirmek İçin Giriş Yapın',
  'auth.features.spamReport.description': 'Spam numaralarını topluluk veritabanına bildirerek diğer kullanıcılara yardımcı olun.',
  'auth.features.cloudBackup.title': 'Bulut Yedekleme',
  'auth.features.cloudBackup.description': 'Verilerinizi güvenle buluta yedekleyin ve dilediğiniz zaman geri yükleyin.',
  'auth.features.crossDeviceSync.title': 'Cihazlar Arası Senkronizasyon',
  'auth.features.crossDeviceSync.description': 'Verilerinizi tüm cihazlarınızda senkronize edin.',
  'auth.features.premium.title': 'Premium Özellikler',
  'auth.features.premium.description': 'Premium özelliklere erişmek için giriş yapın.',
  'auth.signIn': 'Giriş Yap',
  'auth.signUp': 'Kayıt Ol',
  'auth.skip': 'Şimdilik Atla',
  'auth.email': 'E-posta',
  'auth.password': 'Şifre',
  'auth.confirmPassword': 'Şifre Tekrar',
  'auth.continueWithGoogle': 'Google ile Devam Et',
  'auth.or': 'veya',
  'auth.alreadyHaveAccount': 'Zaten hesabınız var mı?',
  'auth.dontHaveAccount': 'Hesabınız yok mu?',
  'auth.passwordMismatch': 'Şifreler eşleşmiyor',
  'auth.invalidEmail': 'Geçerli bir e-posta girin',
  'auth.passwordTooShort': 'Şifre en az 6 karakter olmalı',
};

interface AuthPromptProps {
  visible: boolean;
  feature: AuthFeature;
  onClose: () => void;
  onSuccess: () => void;
  onSkip?: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle?: () => Promise<{ success: boolean; error?: string }>;
  skip?: () => Promise<void>;
  allowSkip?: boolean;
}

type AuthMode = 'login' | 'register';

const AuthPrompt: React.FC<AuthPromptProps> = ({
  visible,
  feature,
  onClose,
  onSuccess,
  onSkip,
  signIn,
  signUp,
  signInWithGoogle,
  skip,
  allowSkip = true,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureInfo = FEATURE_INFO[feature];

  // Çeviri al (varsa i18n, yoksa varsayılan)
  const getText = (key: string): string => {
    const translated = t(key);
    return translated !== key ? translated : (DEFAULT_TEXTS[key] || key);
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    setError(null);

    if (!email || !email.includes('@')) {
      setError(getText('auth.invalidEmail'));
      return false;
    }

    if (password.length < 6) {
      setError(getText('auth.passwordTooShort'));
      return false;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError(getText('auth.passwordMismatch'));
      return false;
    }

    return true;
  };

  // Giriş/Kayıt işlemi
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.success) {
        onSuccess();
        resetForm();
      } else {
        setError(result.error || 'Bir hata oluştu');
      }
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Google ile giriş
  const handleGoogleSignIn = async () => {
    if (!signInWithGoogle) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess();
        resetForm();
      } else {
        setError(result.error || 'Google girişi başarısız');
      }
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Atla
  const handleSkip = async () => {
    if (skip) {
      await skip();
    }
    onSkip?.();
    onClose();
    resetForm();
  };

  // Formu sıfırla
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setMode('login');
  };

  // Kapat
  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.surface,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {/* Başlık çubuğu */}
            <View style={styles.header}>
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                iconColor={theme.colors.onSurfaceVariant}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Özellik ikonu ve açıklaması */}
              <View style={styles.featureSection}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: featureInfo.iconColor + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={featureInfo.icon}
                    size={48}
                    color={featureInfo.iconColor}
                  />
                </View>
                <Text
                  variant="headlineSmall"
                  style={[styles.featureTitle, { color: theme.colors.onSurface }]}
                >
                  {getText(featureInfo.titleKey)}
                </Text>
                <Text
                  style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}
                >
                  {getText(featureInfo.descriptionKey)}
                </Text>
              </View>

              {/* Google ile giriş */}
              {signInWithGoogle && (
                <>
                  <TouchableOpacity
                    style={[styles.googleButton, { borderColor: theme.colors.outline }]}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
                    <Text style={[styles.googleButtonText, { color: theme.colors.onSurface }]}>
                      {getText('auth.continueWithGoogle')}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                      {getText('auth.or')}
                    </Text>
                    <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                  </View>
                </>
              )}

              {/* Hata mesajı */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <TextInput
                  label={getText('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  mode="outlined"
                  style={styles.input}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  disabled={isLoading}
                />

                <TextInput
                  label={getText('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  disabled={isLoading}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                {mode === 'register' && (
                  <TextInput
                    label={getText('auth.confirmPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={isLoading}
                  />
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                >
                  {mode === 'login' ? getText('auth.signIn') : getText('auth.signUp')}
                </Button>

                {/* Mod değiştir */}
                <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                  disabled={isLoading}
                >
                  <Text style={[styles.switchModeText, { color: theme.colors.onSurfaceVariant }]}>
                    {mode === 'login'
                      ? getText('auth.dontHaveAccount')
                      : getText('auth.alreadyHaveAccount')}{' '}
                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                      {mode === 'login' ? getText('auth.signUp') : getText('auth.signIn')}
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Atla butonu */}
                {allowSkip && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    disabled={isLoading}
                  >
                    <Text style={[styles.skipText, { color: theme.colors.onSurfaceVariant }]}>
                      {getText('auth.skip')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  featureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#F44336',
    fontSize: 14,
  },
  form: {
    gap: 4,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchModeText: {
    fontSize: 14,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
  },
});

export default AuthPrompt;
