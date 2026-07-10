import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { RootStackParamList } from '../navigation/types';


export default function RegisterScreen() {
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale, locale } = useLocale();
  const { registerWithCredentials, authLoading } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!firstName.trim()) { setError(t('يرجى إدخال الاسم الأول')); return; }
    if (!lastName.trim()) { setError(t('يرجى إدخال اسم العائلة')); return; }
    if (!phone.trim()) { setError(t('يرجى إدخال رقم الهاتف')); return; }
    if (!email.trim()) { setError(t('يرجى إدخال البريد الإلكتروني')); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError(t('صيغة البريد الإلكتروني غير صحيحة')); return; }
    if (!password.trim()) { setError(t('يرجى إدخال كلمة المرور')); return; }
    if (password.length < 8) { setError(t('يجب أن تكون كلمة المرور من 8 محارف على الأقل')); return; }
    if (password !== confirmPassword) { setError(t('كلمتا المرور غير متطابقتين')); return; }

    setError('');
    try {
      await registerWithCredentials({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      // بعد نجاح التسجيل، الـ AuthContext المفروض يسجل دخول تلقائي
      // أو ينقل المستخدم لصفحة تسجيل الدخول - عدّل حسب منطق تطبيقك
    } catch (err: any) {
      setError(err?.message || t('حدث خطأ أثناء إنشاء الحساب'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={16} color={theme.colors.textSecondary} />
        </Pressable>
        <Pressable onPress={toggleLocale} style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 11 }}>
            {locale === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </Pressable>
      </View>

      {/* Register form */}
      <View style={[styles.center, isCompact && { padding: 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoWrap, { backgroundColor: theme.colors.accentLight }]}>
              <Ionicons name="person-add" size={28} color={theme.colors.accent} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sham Presto</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('إنشاء حساب جديد')}</Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '500', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <Input label={t('الاسم الأول')} value={firstName} onChangeText={(v) => { setFirstName(v); setError(''); }} icon="person-outline" />
          <Input label={t('اسم العائلة')} value={lastName} onChangeText={(v) => { setLastName(v); setError(''); }} icon="person-outline" />
          <Input label={t('البريد الإلكتروني')} value={email} onChangeText={(v) => { setEmail(v); setError(''); }} keyboardType="email-address" icon="mail-outline" />
          <Input label={t('رقم الهاتف')} value={phone} onChangeText={(v) => { setPhone(v); setError(''); }} keyboardType="phone-pad" icon="call-outline" />
          <Input label={t('كلمة المرور')} value={password} onChangeText={(v) => { setPassword(v); setError(''); }} secureTextEntry icon="lock-closed-outline" />
          <Input label={t('تأكيد كلمة المرور')} value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); setError(''); }} secureTextEntry icon="lock-closed-outline" />

          <Button
            label={authLoading ? t('جاري إنشاء الحساب...') : t('إنشاء الحساب')}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            disabled={authLoading}
          />

          {/* رابط الرجوع لتسجيل الدخول */}
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.switchAuthRow}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {t('لديك حساب بالفعل؟')}{' '}
            </Text>
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '700' }}>
              {t('سجّل الدخول')}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: 'absolute', top: 56, left: 20, flexDirection: 'row', gap: 8, zIndex: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  card: { borderRadius: 24, padding: 32, gap: 20, maxWidth: 420, width: '100%', alignSelf: 'center' },
  logoSection: { alignItems: 'center', gap: 12, marginBottom: 4 },
  logoWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12 },
  switchAuthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
});