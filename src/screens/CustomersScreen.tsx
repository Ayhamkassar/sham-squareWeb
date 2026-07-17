import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, SearchBar, Button, EmptyState, Input, Modal, Avatar } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'info'> = { Active: 'success', Inactive: 'neutral', Loyal: 'info' };

interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
  city: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMPTY_FORM: CustomerFormState = { name: '', phone: '', email: '', city: '', password: '', confirmPassword: '' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomersScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCustomer } = useStore();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const customers = state.customers.filter((c) => c.name.includes(query) || c.phone.includes(query));

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = t('اسم العميل مطلوب');
    if (!form.phone.trim()) newErrors.phone = t('رقم الهاتف مطلوب');
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) newErrors.email = t('البريد الإلكتروني غير صالح');
    if (!form.password) newErrors.password = t('كلمة المرور مطلوبة');
    else if (form.password.length < 8) newErrors.password = t('يجب أن تكون 8 محارف على الأقل');
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = t('كلمتا المرور غير متطابقتين');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function openAddModal() {
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  }

  async function handleAdd() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        password: form.password,
        status: 'Active',
        totalOrders: 0,
        lifetimeValue: 0,
        memberSince: new Date().toISOString().slice(0, 10),
      });
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } catch {
      // error toast shown by context
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setModalVisible(false);
    setErrors({});
    setForm(EMPTY_FORM);
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('بحث في النظام...')} />
        <Button label={t('إضافة')} onPress={openAddModal} icon="add" iconPosition="right" />
      </View>

      {customers.length === 0 ? (
        <EmptyState icon="people-outline" title={t('لا توجد نتائج')} subtitle={t('ابحث عن عميل أو أضف واحداً جديداً')} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {customers.map((customer) => (
            <Pressable key={customer.id} onPress={() => navigation.navigate('CustomerDetails', { customer })}>
              <Card style={styles.row}>
                <Avatar uri={customer.avatar} name={customer.name} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{customer.name}</Text>
                  <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{customer.city} • {customer.totalOrders} {t('طلبات')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Badge label={customer.status} tone={STATUS_TONE[customer.status] ?? 'neutral'} size="sm" />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{formatCurrency(customer.lifetimeValue)}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} title={t('إضافة عميل جديد')} onClose={handleClose}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: Platform.OS === 'web' ? 500 : undefined }}>
          <Input
            label={t('الاسم')}
            value={form.name}
            onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); if (v.trim()) setErrors((e) => ({ ...e, name: undefined })); }}
            placeholder={t('أدخل اسم العميل')}
            error={errors.name}
            icon="person-outline"
          />
          <Input
            label={t('رقم الهاتف')}
            value={form.phone}
            onChangeText={(v) => { setForm((f) => ({ ...f, phone: v })); if (v.trim()) setErrors((e) => ({ ...e, phone: undefined })); }}
            placeholder="+966 5X XXX XXXX"
            keyboardType="phone-pad"
            error={errors.phone}
            icon="call-outline"
          />
          <Input
            label={t('البريد الإلكتروني')}
            value={form.email}
            onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); if (!v || EMAIL_REGEX.test(v)) setErrors((e) => ({ ...e, email: undefined })); }}
            placeholder="email@example.com"
            keyboardType="email-address"
            error={errors.email}
            icon="mail-outline"
          />
          <Input
            label={t('المدينة')}
            value={form.city}
            onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
            placeholder={t('المدينة (اختياري)')}
            icon="location-outline"
          />
          <Input
            label={t('كلمة المرور')}
            value={form.password}
            onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setErrors((e) => ({ ...e, password: undefined, confirmPassword: undefined })); }}
            placeholder={t('8 محارف على الأقل')}
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
          />
          <Input
            label={t('تأكيد كلمة المرور')}
            value={form.confirmPassword}
            onChangeText={(v) => { setForm((f) => ({ ...f, confirmPassword: v })); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
            placeholder={t('أعد إدخال كلمة المرور')}
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock-closed-outline"
          />

          <View style={styles.modalButtons}>
            <Button label={t('إلغاء')} onPress={handleClose} variant="outline" style={{ flex: 1 }} />
            <Button label={t('إضافة العميل')} onPress={handleAdd} disabled={saving} loading={saving} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
});