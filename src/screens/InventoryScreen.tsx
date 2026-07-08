import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Modal, Input, ProgressBar } from '../components/ui';
import { clamp } from '../utils/formatters';
import { Product } from '../types';

const LOW_STOCK_THRESHOLD = 15;

function stockTone(stock: number): 'success' | 'warning' | 'danger' {
  if (stock === 0) return 'danger';
  if (stock <= LOW_STOCK_THRESHOLD) return 'warning';
  return 'success';
}

function stockColor(stock: number, theme: any): string {
  if (stock === 0) return theme.colors.danger;
  if (stock <= LOW_STOCK_THRESHOLD) return theme.colors.warning;
  return theme.colors.success;
}

export default function InventoryScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, restockProduct } = useStore();

  const [target, setTarget] = useState<Product | null>(null);
  const [amount, setAmount] = useState('10');

  function submitRestock() {
    if (!target) return;
    restockProduct(target.id, Number(amount) || 0);
    setTarget(null);
    setAmount('10');
  }

  return (
    <ScreenContainer>
      {state.products.length === 0 ? (
        <EmptyState icon="file-tray-stacked-outline" title={t('لا توجد منتجات')} />
      ) : (
        state.products.map((product) => {
          const percentage = clamp((product.stock / 200) * 100, 2, 100);
          return (
            <Card key={product.id} style={styles.card}>
              <View style={styles.row}>
                <Image source={{ uri: product.image }} style={styles.image} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{product.name}</Text>
                  <View style={styles.stockRow}>
                    <Badge label={`${product.stock}`} tone={stockTone(product.stock)} size="sm" />
                    <Text style={[styles.stockLabel, { color: theme.colors.textMuted }]}>{t('مخزون')}</Text>
                  </View>
                </View>
              </View>
              <ProgressBar value={percentage} color={stockColor(product.stock, theme)} height={5} />
              <View style={{ marginTop: 4 }}>
                <Button variant="outline" label={t('إعادة تموين')} onPress={() => setTarget(product)} size="sm" fullWidth />
              </View>
            </Card>
          );
        })
      )}

      <Modal visible={!!target} title={t('إعادة تموين المخزون')} onClose={() => setTarget(null)}>
        <Input label={t('الكمية المضافة')} value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Button label={t('تأكيد')} onPress={submitRestock} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 48, height: 48, borderRadius: 10 },
  name: { fontSize: 13, fontWeight: '600' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  stockLabel: { fontSize: 11 },
});
