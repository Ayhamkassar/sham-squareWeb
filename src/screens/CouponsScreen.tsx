import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function CouponsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCoupon, deleteCoupon } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');

  function handleAdd() {
    if (!code.trim() || !discount.trim()) return;
    addCoupon({ id: `CPN-${Date.now()}`, code: code.trim().toUpperCase(), discount: discount.trim(), description: description.trim(), usage: '0/100', usagePercentage: 0, expiry: expiry.trim() || '—', status: 'active' });
    setCode(''); setDiscount(''); setDescription(''); setExpiry('');
    setModalVisible(false);
  }

  function handleDelete(coupon: Coupon) {
    Alert.alert(t('إلغاء كوبون'), coupon.code, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: () => deleteCoupon(coupon.id) },
    ]);
  }

  return (
    <ScreenContainer>
      <Button label={t('إضافة كوبون')} onPress={() => setModalVisible(true)} icon="add" iconPosition="right" />

      {state.coupons.length === 0 ? (
        <EmptyState icon="ticket-outline" title={t('لا توجد كوبونات')} />
      ) : (
        state.coupons.map((coupon) => (
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
        ))
      )}

      <Modal visible={modalVisible} title={t('إضافة كوبون')} onClose={() => setModalVisible(false)}>
        <Input label={t('الكود')} value={code} onChangeText={setCode} placeholder={t('مثال: SHAM20')} />
        <Input label={t('نسبة الخصم')} value={discount} onChangeText={setDiscount} placeholder="20%" />
        <Input label={t('الوصف')} value={description} onChangeText={setDescription} multiline />
        <Input label={t('تاريخ الانتهاء')} value={expiry} onChangeText={setExpiry} placeholder="2026-12-31" />
        <Button label={t('حفظ الكوبون')} onPress={handleAdd} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  codeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
