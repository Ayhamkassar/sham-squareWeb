import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { verifyResetCode, resetPassword } = useAuth();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  const identifier = route.params?.identifier || '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) { setError(t('يرجى إدخال رمز التحقق')); return; }
    setError('');
    setLoading(true);
    try {
      const token = await verifyResetCode(identifier, code.trim());
      if (token) {
        setResetToken(token);
        setStep('password');
      } else {
        setError(t('رمز التحقق غير صالح'));
      }
    } catch (err: any) {
      setError(err?.message || t('فشل التحقق من الرمز'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) { setError(t('يرجى إدخال كلمة المرور الجديدة')); return; }
    if (newPassword.length < 8) { setError(t('يجب أن تكون كلمة المرور من 8 محارف على الأقل')); return; }
    if (newPassword !== confirmPassword) { setError(t('كلمتا المرور غير متطابقتين')); return; }
    if (!resetToken) { setError(t('رمز التحقق غير صالح')); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess(t('تم تغيير كلمة المرور بنجاح'));
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err: any) {
      setError(err?.message || t('فشل تغيير كلمة المرور'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.center, isCompact && { padding: 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.logoSection}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
              <Ionicons name={step === 'code' ? 'key-outline' : 'lock-open-outline'} size={28} color={theme.colors.accent} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {step === 'code' ? t('إدخال رمز التحقق') : t('تعيين كلمة مرور جديدة')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {step === 'code'
                ? t('أدخل رمز التحقق المرسل إلى بريدك الإلكتروني أو هاتفك')
                : t('أدخل كلمة المرور الجديدة')
              }
            </Text>
          </View>

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

          {step === 'code' ? (
            <>
              <Input
                label={t('رمز التحقق')}
                value={code}
                onChangeText={(v) => { setCode(v); setError(''); }}
                keyboardType="numeric"
                icon="key-outline"
              />
              <Button
                label={loading ? t('جاري التحقق...') : t('التحقق من الرمز')}
                onPress={handleVerifyCode}
                fullWidth
                size="lg"
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Input
                label={t('كلمة المرور الجديدة')}
                value={newPassword}
                onChangeText={(v) => { setNewPassword(v); setError(''); }}
                secureTextEntry
                icon="lock-closed-outline"
              />
              <Input
                label={t('تأكيد كلمة المرور')}
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setError(''); }}
                secureTextEntry
                icon="lock-closed-outline"
              />
              <Button
                label={loading ? t('جاري الحفظ...') : t('حفظ كلمة المرور الجديدة')}
                onPress={handleResetPassword}
                fullWidth
                size="lg"
                disabled={loading}
              />
            </>
          )}

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
  card: { borderRadius: 24, padding: 32, gap: 20, maxWidth: 420, width: '100%', alignSelf: 'center' },
  logoSection: { alignItems: 'center', gap: 12, marginBottom: 4 },
  iconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  messageBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12 },
  backRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
