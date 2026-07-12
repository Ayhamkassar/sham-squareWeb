import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function CustomersScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCustomer } = useStore();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  const customers = state.customers.filter((c) => c.name.includes(query) || c.phone.includes(query));

  async function handleAdd() {
    if (!name.trim() || !phone.trim()) return;
    try {
      await addCustomer({ name: name.trim(), phone: phone.trim(), email: email.trim(), city: city.trim(), status: 'Active', totalOrders: 0, lifetimeValue: 0, memberSince: new Date().toISOString().slice(0, 10) });
      setName(''); setPhone(''); setEmail(''); setCity('');
      setModalVisible(false);
    } catch { /* error toast shown by context */ }
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('بحث في النظام...')} />
        <Button label={t('إضافة')} onPress={() => setModalVisible(true)} icon="add" iconPosition="right" />
      </View>

      {customers.length === 0 ? (
        <EmptyState icon="people-outline" title={t('لا توجد نتائج')} />
      ) : (
        customers.map((customer) => (
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
        ))
      )}

      <Modal visible={modalVisible} title={t('إضافة عميل')} onClose={() => setModalVisible(false)}>
        <Input label={t('الاسم')} value={name} onChangeText={setName} />
        <Input label={t('رقم الهاتف')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label={t('البريد الإلكتروني')} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={t('المدينة')} value={city} onChangeText={setCity} />
        <Button label={t('إضافة العميل')} onPress={handleAdd} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
});
