import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, SearchBar, Button, EmptyState, Input, Modal, SegmentedControl } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { Product } from '../types';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  departmentId: string;
  image: string;
  isFeatured: boolean;
}

const EMPTY_FORM: ProductFormState = { name: '', description: '', price: '', stock: '', category: '', departmentId: '', image: '', isFeatured: false };

export default function ProductsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, loading, addProduct, editProduct, deleteProduct } = useStore();
  const { isDepartmentAdmin, adminDepartmentId } = useAuth();

  const CAT_FILTERS = useMemo(() => {
    const filters = [{ key: 'all', label: t('الكل') }];
    state.categories.forEach((cat) => {
      filters.push({ key: cat.name, label: cat.name });
    });
    return filters;
  }, [state.categories, t]);

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const scopedProducts = useMemo(
    () => isDepartmentAdmin && adminDepartmentId
      ? state.products.filter((p) => p.departmentId === adminDepartmentId)
      : state.products,
    [isDepartmentAdmin, adminDepartmentId, state.products]
  );

  const filteredProducts = useMemo(
    () => scopedProducts.filter((p) => {
      const matchesSearch = p.name.includes(query) || p.sku.includes(query);
      const matchesCat = catFilter === 'all' || p.category === catFilter;
      return matchesSearch && matchesCat;
    }),
    [scopedProducts, query, catFilter]
  );

  function openAddModal() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, departmentId: adminDepartmentId || '' });
    setModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      departmentId: product.departmentId,
      image: product.image,
      isFeatured: product.isFeatured,
    });
    setModalVisible(true);
  }

  function handleSubmit() {
    const price = Number(form.price) || 0;
    const stock = Number(form.stock) || 0;
    const deptId = isDepartmentAdmin && adminDepartmentId ? adminDepartmentId : form.departmentId || state.departments[0]?.id || '';
    if (editingId) {
      const existing = state.products.find((p) => p.id === editingId);
      if (!existing) return;
      editProduct({ ...existing, name: form.name, description: form.description, price, stock, category: form.category, departmentId: deptId, image: form.image, isFeatured: form.isFeatured, isAvailable: stock > 0 });
    } else {
      addProduct({ name: form.name, description: form.description, price, stock, category: form.category, departmentId: deptId, image: form.image || 'https://placehold.co/200x200', isAvailable: stock > 0, isFeatured: form.isFeatured });
    }
    setModalVisible(false);
  }

  function handleDelete(product: Product) {
    Alert.alert(t('حذف منتج'), `${t('تم سحب المنتج')} "${product.name}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: () => deleteProduct(product.id) },
    ]);
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('بحث في النظام...')} />
        <Button label={t('إضافة')} onPress={openAddModal} icon="add" iconPosition="right" />
      </View>

      <SegmentedControl options={CAT_FILTERS} selected={catFilter} onSelect={setCatFilter} />

      {loading ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : filteredProducts.length === 0 ? (
        <EmptyState icon="cube-outline" title={t('لا توجد نتائج')} subtitle={t('حاول تغيير كلمة البحث')} />
      ) : (
        filteredProducts.map((product) => (
          <Card key={product.id} style={styles.productCard}>
            <View style={styles.row}>
              <Image source={{ uri: product.image }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{product.name}</Text>
                <Text style={[styles.sku, { color: theme.colors.textMuted }]}>{product.sku}</Text>
                <View style={styles.badgeRow}>
                  <Badge label={product.isAvailable ? t('متوفر') : t('غير متوفر')} tone={product.isAvailable ? 'success' : 'danger'} size="sm" />
                  {product.isFeatured && <Badge label={t('مميز')} tone="accent" size="sm" />}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{formatCurrency(product.price)}</Text>
                <Badge label={`${product.stock} ${t('مخزون')}`} tone="neutral" size="sm" variant="dot" />
              </View>
            </View>
            <View style={[styles.actions, { borderColor: theme.colors.borderLight }]}>
              <Pressable onPress={() => openEditModal(product)} style={styles.actionBtn}>
                <Ionicons name="create-outline" size={15} color={theme.colors.accent} />
                <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>{t('تعديل')}</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(product)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '600' }}>{t('حذف')}</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}

      <Modal visible={modalVisible} title={editingId ? t('تعديل منتج') : t('إضافة منتج جديد')} onClose={() => setModalVisible(false)}>
        <Input label={t('اسم المنتج')} value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
        <Input label={t('الوصف')} value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} multiline />
        <Input label={t('السعر')} value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} keyboardType="numeric" />
        <Input label={t('الكمية')} value={form.stock} onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))} keyboardType="numeric" />
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('الفئة')}</Text>
        <View style={styles.categoryOptions}>
          {state.categories.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{t('لا توجد فئات')}</Text>
          ) : (
            state.categories.map((cat) => {
              const selected = form.category === cat.name;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setForm((f) => ({ ...f, category: cat.name }))}
                  style={[styles.categoryOption, { borderColor: selected ? theme.colors.accent : theme.colors.border, backgroundColor: selected ? theme.colors.accentLight : 'transparent' }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? theme.colors.accent : theme.colors.textPrimary }}>{cat.name}</Text>
                </Pressable>
              );
            })
          )}
        </View>
        <Input label={t('رابط الصورة')} value={form.image} onChangeText={(v) => setForm((f) => ({ ...f, image: v }))} />
        <View style={styles.switchRow}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('منتج مميز')}</Text>
          <Switch value={form.isFeatured} onValueChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
        </View>
        <Button label={editingId ? t('حفظ التعديلات') : t('إضافة المنتج')} onPress={handleSubmit} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  productCard: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  image: { width: 56, height: 56, borderRadius: 12 },
  name: { fontSize: 14, fontWeight: '600' },
  sku: { fontSize: 10, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  price: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 24, marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  categoryOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
});
