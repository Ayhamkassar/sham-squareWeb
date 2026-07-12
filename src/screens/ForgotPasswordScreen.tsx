import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { forgotPassword } = useAuth();
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) { setError(t('يرجى إدخال البريد الإلكتروني أو رقم الهاتف')); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await forgotPassword(identifier.trim());
      setSuccess(t('تم إرسال رمز التحقق. يرجى التحقق من بريدك الإلكتروني أو هاتفك.'));
    } catch (err: any) {
      setError(err?.message || t('فشل إرسال رمز التحقق'));
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
              <Ionicons name="lock-open-outline" size={28} color={theme.colors.accent} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('استعادة كلمة المرور')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('أدخل بريدك الإلكتروني أو رقم هاتفك لإرسال رمز التحقق')}</Text>
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

          <Input
            label={t('البريد الإلكتروني أو رقم الهاتف')}
            value={identifier}
            onChangeText={(v) => { setIdentifier(v); setError(''); }}
            keyboardType="email-address"
            icon="person-outline"
          />

          <Button
            label={loading ? t('جاري الإرسال...') : t('إرسال رمز التحقق')}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            disabled={loading}
          />

          <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
            <Ionicons name="arrow-back" size={14} color={theme.colors.accent} />
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>
              {t('العودة لتسجيل الدخول')}
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
