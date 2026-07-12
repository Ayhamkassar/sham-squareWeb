import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/layout';
import { Card, Button, Input, Avatar, Modal, ImageUpload } from '../components/ui';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale, locale } = useLocale();
  const { state, saveSettings } = useStore();
  const { adminUser, logout } = useAuth();
  const safeUser = adminUser ?? { name: '', role: '', email: '', phone: '', avatar: '' } as any;
  const { width } = useWindowDimensions();
  const isCompact = width < 600;

  const [form, setForm] = useState(state.storeSettings);
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  function handleSave() {
    saveSettings(form);
    Alert.alert(t('تم'), t('تم حفظ الإعدادات'));
  }

  function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) { Alert.alert(t('خطأ'), 'كلمة المرور الجديدة غير متطابقة'); return; }
    if (newPw.length < 8) { Alert.alert(t('خطأ'), t('يجب أن تكون كلمة المرور من 8 محارف على الأقل')); return; }
    Alert.alert(t('تم'), t('تم تغيير كلمة المرور'));
    setPasswordModal(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  function handleLogout() {
    Alert.alert(t('تأكيد تسجيل الخروج'), t('هل أنت متأكد من تسجيل الخروج؟'), [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('تأكيد'), onPress: () => logout(), style: 'destructive' },
    ]);
  }

  return (
    <ScreenContainer>
      {/* Admin Profile */}
      <Card style={styles.profileCard}>
        <View style={[styles.profileWrap, isCompact && { flexDirection: 'column', alignItems: 'center' }]}>
          <Avatar uri={safeUser.avatar} name={safeUser.name} size={72} />
          <View style={{ flex: 1, alignItems: isCompact ? 'center' : 'flex-start' }}>
            <Text style={[styles.adminName, { color: theme.colors.textPrimary }]}>{safeUser.name}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{safeUser.role}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>{safeUser.email} • {safeUser.phone}</Text>
          </View>
        </View>
      </Card>

      {/* General Settings */}
      <Card>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
            <Ionicons name="settings-outline" size={18} color={theme.colors.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('الإعدادات العامة')}</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>{t('بيانات المتجر الأساسية')}</Text>
        <ImageUpload label={t('شعار المتجر')} value={form.logoUrl} onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))} folder="users" />
        <Input label={t('اسم المتجر')} value={form.storeName} onChangeText={(v) => setForm((f) => ({ ...f, storeName: v }))} />
        <Input label={t('وصف ونبذة المتجر')} value={form.storeDesc} onChangeText={(v) => setForm((f) => ({ ...f, storeDesc: v }))} multiline />
        <Input label={t('رقم هاتف الدعم والاتصال')} value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <Input label={t('المدينة')} value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
        <Input label={t('العنوان بالتفصيل')} value={form.address} onChangeText={(v) => setForm((f) => ({ ...f, address: v }))} />
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('وضع الصيانة')}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('عند تفعيله، سيظهر للزوار صفحة صيانة مؤقتة للتحسينات.')}</Text>
          </View>
          <Switch value={form.maintenanceMode} onValueChange={(v) => setForm((f) => ({ ...f, maintenanceMode: v }))} />
        </View>
        <Button label={t('حفظ الإعدادات العامة')} onPress={handleSave} fullWidth />
      </Card>

      {/* Appearance */}
      <Card>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.infoLight || theme.colors.accentLight }]}>
            <Ionicons name="color-palette-outline" size={18} color={theme.colors.info || theme.colors.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('المظهر')}</Text>
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('الوضع المظلم')}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('تبديل مظهر التطبيق')}</Text>
          </View>
          <Switch value={theme.mode === 'dark'} onValueChange={toggleTheme} />
        </View>
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 4 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('اللغة الإنجليزية')}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('تبديل لغة الواجهة')}</Text>
          </View>
          <Switch value={locale === 'en'} onValueChange={toggleLocale} />
        </View>
      </Card>

      {/* Store Settings */}
      <Card>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.successLight || theme.colors.accentLight }]}>
            <Ionicons name="storefront-outline" size={18} color={theme.colors.success || theme.colors.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('معلومات المتجر')}</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>{t('العملة الافتراضية')}</Text>
        <View style={styles.currencyRow}>
          {['ريال سعودي (SAR)', 'دولار أمريكي (USD)', 'يورو (EUR)'].map((cur) => (
            <Pressable
              key={cur}
              style={[styles.currencyOption, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>{t(cur)}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Security */}
      <Card>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.dangerLight || theme.colors.accentLight }]}>
            <Ionicons name="shield-outline" size={18} color={theme.colors.danger || theme.colors.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('الأمان')}</Text>
        </View>
        <View style={styles.securityRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('تغيير كلمة المرور')}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('إدارة الجلسات')}</Text>
          </View>
          <Button variant="outline" label={t('تغيير كلمة المرور')} onPress={() => setPasswordModal(true)} size="sm" />
        </View>
        <View style={[styles.securityRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 4 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('تسجيل الخروج')}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{safeUser.name}</Text>
          </View>
          <Button variant="danger" label={t('تسجيل الخروج')} onPress={handleLogout} size="sm" />
        </View>
      </Card>

      {/* Password Change Modal */}
      <Modal visible={passwordModal} title={t('تغيير كلمة المرور')} onClose={() => setPasswordModal(false)}>
        <Input label={t('كلمة المرور الحالية')} value={currentPw} onChangeText={setCurrentPw} secureTextEntry />
        <Input label={t('كلمة المرور الجديدة')} value={newPw} onChangeText={setNewPw} secureTextEntry />
        <Input label={t('تأكيد كلمة المرور الجديدة')} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry />
        <Button label={t('حفظ')} onPress={handleChangePassword} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {},
  profileWrap: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  adminName: { fontSize: 17, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionDesc: { fontSize: 11, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  currencyOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  securityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
});
