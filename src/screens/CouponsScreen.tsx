import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Switch, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal, ProgressBar } from '../components/ui';
import { clamp } from '../utils/formatters';
import { BadgeTone } from '../components/ui/Badge';
import { Coupon } from '../types';

const STATUS_TONE: Record<Coupon['status'], BadgeTone> = { active: 'success', scheduled: 'info', expired: 'neutral' };
const STATUS_LABEL: Record<Coupon['status'], string> = { active: 'نشط', scheduled: 'مجدول', expired: 'منتهي' };

interface CouponFormState {
  code: string;
  discount: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  description: string;
  minOrder: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ValidationErrors {
  code?: string;
  discount?: string;
  endDate?: string;
}

const EMPTY_FORM: CouponFormState = {
  code: '',
  discount: '',
  discountType: 'PERCENTAGE',
  description: '',
  minOrder: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function CouponsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCoupon, deleteCoupon } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.code.trim()) newErrors.code = t('كود الكوبون مطلوب');
    if (!form.discount || isNaN(Number(form.discount)) || Number(form.discount) <= 0) {
      newErrors.discount = t('قيمة خصم صالحة مطلوبة');
    }
    if (form.discountType === 'PERCENTAGE' && (Number(form.discount) > 100)) {
      newErrors.discount = t('نسبة الخصم يجب أن تكون أقل من 100');
    }
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
      await addCoupon({
        code: form.code.trim().toUpperCase(),
        discount: form.discountType === 'PERCENTAGE' ? `${form.discount}%` : `${form.discount} ر.س`,
        description: form.description.trim(),
        usage: `0 / ${form.usageLimit || '∞'}`,
        usagePercentage: 0,
        expiry: form.endDate || t('بدون تاريخ انتهاء'),
        status: form.isActive ? 'active' : 'scheduled',
      });
      setModalVisible(false);
    } catch {
      // error toast shown by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(coupon: Coupon) {
    Alert.alert(t('إلغاء كوبون'), `${t('هل أنت متأكد من حذف')} "${coupon.code}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: async () => { try { await deleteCoupon(coupon.id); } catch { /* error toast shown by context */ } } },
    ]);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>{t('الكوبونات')}</Text>
        <Button label={t('إضافة كوبون')} onPress={openAddModal} icon="add" iconPosition="right" />
      </View>

      {state.coupons.length === 0 ? (
        <EmptyState icon="ticket-outline" title={t('لا توجد كوبونات')} subtitle={t('أضف كوبون خصم جديد للبدء')} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {state.coupons.map((coupon) => (
            <Card key={coupon.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.codeRow}>
                  <View style={[styles.codeBadge, { backgroundColor: theme.colors.accentLight }]}>
                    <Text style={[styles.codeText, { color: theme.colors.accent }]}>{coupon.code}</Text>
                  </View>
                  <Badge label={t(STATUS_LABEL[coupon.status])} tone={STATUS_TONE[coupon.status]} size="sm" />
                </View>
                <Pressable onPress={() => handleDelete(coupon)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                </Pressable>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{coupon.description}</Text>
              <View style={styles.usageRow}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{coupon.discount}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{coupon.usage}</Text>
              </View>
              <ProgressBar value={clamp(coupon.usagePercentage, 2, 100)} color={theme.colors.accent} height={5} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 4 }}>{coupon.expiry}</Text>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} title={t('إضافة كوبون خصم جديد')} onClose={() => { setModalVisible(false); setErrors({}); }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: Platform.OS === 'web' ? 500 : undefined }}>
          <Input
            label={t('كود الكوبون')}
            value={form.code}
            onChangeText={(v) => { setForm((f) => ({ ...f, code: v })); if (v.trim()) setErrors((e) => ({ ...e, code: undefined })); }}
            placeholder={t('مثال: SHAM20')}
            error={errors.code}
            icon="ticket-outline"
          />

          <View style={styles.typeRow}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('نوع الخصم')}</Text>
            <View style={styles.typeOptions}>
              <Pressable
                onPress={() => setForm((f) => ({ ...f, discountType: 'PERCENTAGE' }))}
                style={[styles.typeOption, { borderColor: form.discountType === 'PERCENTAGE' ? theme.colors.accent : theme.colors.border, backgroundColor: form.discountType === 'PERCENTAGE' ? theme.colors.accentLight : 'transparent' }]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: form.discountType === 'PERCENTAGE' ? theme.colors.accent : theme.colors.textPrimary }}>{t('نسبة مئوية')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setForm((f) => ({ ...f, discountType: 'FIXED' }))}
                style={[styles.typeOption, { borderColor: form.discountType === 'FIXED' ? theme.colors.accent : theme.colors.border, backgroundColor: form.discountType === 'FIXED' ? theme.colors.accentLight : 'transparent' }]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: form.discountType === 'FIXED' ? theme.colors.accent : theme.colors.textPrimary }}>{t('قيمة ثابتة')}</Text>
              </Pressable>
            </View>
          </View>

          <Input
            label={form.discountType === 'PERCENTAGE' ? t('نسبة الخصم (%)') : t('قيمة الخصم (ر.س)')}
            value={form.discount}
            onChangeText={(v) => { setForm((f) => ({ ...f, discount: v })); if (v && !isNaN(Number(v)) && Number(v) > 0) setErrors((e) => ({ ...e, discount: undefined })); }}
            placeholder={form.discountType === 'PERCENTAGE' ? '20' : '50'}
            keyboardType="numeric"
            error={errors.discount}
            icon="cash-outline"
          />

          <Input
            label={t('الوصف')}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder={t('وصف الكوبون (اختياري)')}
            multiline
            icon="document-text-outline"
          />

          <Input
            label={t('الحد الأدنى للطلب')}
            value={form.minOrder}
            onChangeText={(v) => setForm((f) => ({ ...f, minOrder: v }))}
            placeholder={t('اختياري')}
            keyboardType="numeric"
            icon="trending-up-outline"
          />

          <Input
            label={t('حد الاستخدام')}
            value={form.usageLimit}
            onChangeText={(v) => setForm((f) => ({ ...f, usageLimit: v }))}
            placeholder={t('اختياري - اتركه فارغاً لغير محدود')}
            keyboardType="numeric"
            icon="infinite-outline"
          />

          <Input
            label={t('تاريخ البداية')}
            value={form.startDate}
            onChangeText={(v) => setForm((f) => ({ ...f, startDate: v }))}
            placeholder={todayStr}
            icon="calendar-outline"
          />

          <Input
            label={t('تاريخ الانتهاء')}
            value={form.endDate}
            onChangeText={(v) => { setForm((f) => ({ ...f, endDate: v })); }}
            placeholder={todayStr}
            icon="calendar-outline"
          />

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>{t('الحالة')}</Text>
              <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                {form.isActive ? t('الكوبون نشط وجاهز للاستخدام') : t('الكوبون موقوف')}
              </Text>
            </View>
            <Switch
              value={form.isActive}
              onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={form.isActive ? theme.colors.accentText : theme.colors.textMuted}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button label={t('إلغاء')} onPress={() => { setModalVisible(false); setErrors({}); }} variant="outline" style={{ flex: 1 }} />
            <Button label={t('حفظ الكوبون')} onPress={handleAdd} disabled={saving} loading={saving} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontSize: 20, fontWeight: '700' },
  list: { flex: 1 },
  card: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  codeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  typeRow: { marginBottom: 16 },
  typeOptions: { flexDirection: 'row', gap: 8 },
  typeOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginVertical: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600' },
  switchHint: { fontSize: 11, marginTop: 2 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
});