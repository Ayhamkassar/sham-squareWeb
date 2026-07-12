import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';


export default function LoginScreen() {

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale, locale } = useLocale();
  const { loginWithCredentials, authLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const navigation = useNavigation<NavigationProp>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!phone.trim()) { setError(t('يرجى إدخال رقم الهاتف')); return; }
    if (!password.trim()) { setError(t('يرجى إدخال كلمة المرور')); return; }
    if (password.length < 8) { setError(t('يجب أن تكون كلمة المرور من 8 محارف على الأقل')); return; }
    setError('');
    try {
      await loginWithCredentials(phone.trim(), password);
    } catch (err: any) {
      setError(err?.message || t('بيانات الدخول غير صحيحة'));
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

      {/* Login form */}
      <View style={[styles.center, isCompact && { padding: 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoWrap, { backgroundColor: theme.colors.accentLight }]}>
              <Ionicons name="shield-checkmark" size={28} color={theme.colors.accent} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sham Presto</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('بوابة إدارة شام بريستو')}</Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '500', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <Input label={t('البريد الإلكتروني أو رقم الهاتف')} value={phone} onChangeText={(v) => { setPhone(v); setError(''); }} keyboardType="email-address" icon="person-outline" />
          <Input label={t('كلمة المرور')} value={password} onChangeText={(v) => { setPassword(v); setError(''); }} secureTextEntry icon="lock-closed-outline" />

          <Button
            label={authLoading ? t('جاري تسجيل الدخول...') : t('الدخول للنظام')}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            disabled={authLoading}
          />

          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.switchAuthRow}>
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>
              {t('نسيت كلمة المرور؟')}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchAuthRow}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {t('ليس لديك حساب؟')}{' '}
            </Text>
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '700' }}>
              {t('أنشئ واحد')}
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
  roleRow: { flexDirection: 'row', gap: 8 },
  switchAuthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  roleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
});
