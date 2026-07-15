/**
 * OTP Verification Screen
 * Allows users to verify their phone number using an OTP sent via SMS.
 * Features: loading states, validation errors, server errors, resend countdown timer,
 * cooldown enforcement, and button disable during cooldown.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { Button } from '../components/ui';
import { otpService } from '../services/otpService';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;
type Route = RouteProp<RootStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function OtpVerificationScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  const phone = route.params?.phone || '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown on mount
  useEffect(() => {
    startCooldown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    if (digit.length > 1) {
      // Handle paste — distribute digits across inputs
      const digits = digit.split('').slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      // Focus the last filled input or the next empty one
      const lastFilledIndex = digits.length - 1;
      const focusIndex = lastFilledIndex < OTP_LENGTH - 1 ? lastFilledIndex + 1 : lastFilledIndex;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setError(t('رقم الهاتف مطلوب'));
      return;
    }

    setError('');
    setSuccess('');
    setSending(true);

    try {
      const result = await otpService.sendOtp(phone);
      if (result.success) {
        setSuccess(t('تم إرسال رمز التحقق بنجاح'));
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        startCooldown();
      } else {
        setError(result.message || t('فشل إرسال رمز التحقق'));
      }
    } catch (err: any) {
      setError(err?.message || t('فشل إرسال رمز التحقق'));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(t('يرجى إدخال رمز التحقق كاملاً'));
      return;
    }

    if (!phone) {
      setError(t('رقم الهاتف مطلوب'));
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await otpService.verifyOtp(phone, code);
      if (result.success) {
        setSuccess(t('تم التحقق بنجاح'));
        // Navigate back or to the next screen after a brief delay
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        setError(result.message || t('رمز التحقق غير صحيح'));
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err?.message || t('فشل التحقق من الرمز'));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const getCooldownText = () => {
    if (cooldown === 0) return t('إعادة إرسال الرمز');
    const minutes = Math.floor(cooldown / 60);
    const seconds = cooldown % 60;
    if (minutes > 0) {
      return t(`إعادة الإرسال بعد ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    return t(`إعادة الإرسال بعد ${seconds} ثانية`);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.center, isCompact && { padding: 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.logoSection}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
              <Ionicons name="shield-checkmark-outline" size={28} color={theme.colors.accent} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('التحقق من رقم الهاتف')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {t('تم إرسال رمز التحقق إلى')}
            </Text>
            <Text style={[styles.phoneText, { color: theme.colors.textPrimary }]}>{phone}</Text>
          </View>

          {/* Error / Success messages */}
          {error ? (
            <View style={[styles.messageBox, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '500', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={[styles.messageBox, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
              <Text style={{ color: theme.colors.success, fontSize: 12, fontWeight: '500', flex: 1 }}>{success}</Text>
            </View>
          ) : null}

          {/* OTP Input */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    color: theme.colors.textPrimary,
                    borderColor: digit ? theme.colors.accent : theme.colors.border,
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {/* Verify Button */}
          <Button
            label={loading ? t('جاري التحقق...') : t('تحقق')}
            onPress={handleVerify}
            fullWidth
            size="lg"
            disabled={loading || otp.join('').length !== OTP_LENGTH}
          />

          {/* Resend */}
          <Pressable
            onPress={handleSendOtp}
            disabled={cooldown > 0 || sending}
            style={styles.resendRow}
          >
            {sending ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                {t('جاري الإرسال...')}
              </Text>
            ) : (
              <Text
                style={{
                  color: cooldown > 0 ? theme.colors.textMuted : theme.colors.accent,
                  fontSize: 13,
                  fontWeight: cooldown > 0 ? '400' : '600',
                }}
              >
                {getCooldownText()}
              </Text>
            )}
          </Pressable>

          {/* Back */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
            <Ionicons name="arrow-back" size={14} color={theme.colors.accent} />
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>
              {t('العودة')}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  card: {
    borderRadius: 24,
    padding: 32,
    gap: 20,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logoSection: { alignItems: 'center', gap: 8, marginBottom: 4 },
  iconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  phoneText: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: -4 },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    borderWidth: 2,
  },
  resendRow: { alignItems: 'center', paddingVertical: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
