import React, { useMemo, useState, useCallback } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, SearchBar, Button, EmptyState, Input, Modal, SegmentedControl, ImageUpload } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { Product } from '../types';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  subCategoryId: string;
  departmentId: string;
  image: string;
  isFeatured: boolean;
}

interface ValidationErrors {
  name?: string;
  price?: string;
  category?: string;
  stock?: string;
}

const EMPTY_FORM: ProductFormState = { name: '', description: '', price: '', stock: '', category: '', subCategoryId: '', departmentId: '', image: '', isFeatured: false };

export default function ProductsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, loading, addProduct, editProduct, deleteProduct } = useStore();
  const { isDepartmentAdmin, adminDepartmentId } = useAuth();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [subCatDropdownOpen, setSubCatDropdownOpen] = useState(false);

  const CAT_FILTERS = useMemo(() => {
    const filters = [{ key: 'all', label: t('الكل') }];
    state.categories.forEach((cat) => {
      filters.push({ key: cat.name, label: cat.name });
    });
    return filters;
  }, [state.categories, t]);

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

  const filteredSubCategories = useMemo(() => {
    return state.subCategories.filter((sc) => {
      const cat = state.categories.find((c) => c.name === form.category);
      return cat ? sc.categoryId === cat.id : false;
    });
  }, [state.subCategories, state.categories, form.category]);

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = t('اسم المنتج مطلوب');
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) newErrors.price = t('سعر صالح مطلوب');
    if (!form.category) newErrors.category = t('يرجى اختيار فئة');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function openAddModal() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, departmentId: adminDepartmentId || '' });
    setErrors({});
    setModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    const cat = state.categories.find((c) => c.name === product.category);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      subCategoryId: product.subCategoryId || '',
      departmentId: product.departmentId,
      image: product.image,
      isFeatured: product.isFeatured,
    });
    setErrors({});
    setModalVisible(true);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    const price = Number(form.price) || 0;
    const stock = Number(form.stock) || 0;
    const deptId = isDepartmentAdmin && adminDepartmentId ? adminDepartmentId : form.departmentId || state.departments[0]?.id || '';
    try {
      if (editingId) {
        const existing = state.products.find((p) => p.id === editingId);
        if (!existing) return;
        await editProduct({
          ...existing,
          name: form.name,
          description: form.description,
          price,
          stock,
          category: form.category,
          categoryId: state.categories.find((c) => c.name === form.category)?.id || '',
          subCategoryId: form.subCategoryId,
          departmentId: deptId,
          image: form.image,
          isFeatured: form.isFeatured,
          isAvailable: stock > 0,
        });
      } else {
        await addProduct({
          name: form.name,
          description: form.description,
          price,
          stock,
          category: form.category,
          categoryId: state.categories.find((c) => c.name === form.category)?.id || '',
          subCategoryId: form.subCategoryId,
          departmentId: deptId,
          image: form.image || '',
          isAvailable: stock > 0,
          isFeatured: form.isFeatured,
        });
      }
      setModalVisible(false);
    } catch {
      // error toast shown by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(product: Product) {
    Alert.alert(t('حذف منتج'), `${t('هل أنت متأكد من حذف')} "${product.name}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: async () => { try { await deleteProduct(product.id); } catch { /* error toast shown by context */ } } },
    ]);
  }

  const getSubCategoryName = useCallback((id: string) => {
    const sc = state.subCategories.find((s) => s.id === id);
    return sc?.name || '';
  }, [state.subCategories]);

  function renderDropdown(label: string, value: string, options: { id: string; label: string }[], isOpen: boolean, setOpen: (v: boolean) => void, onChange: (id: string) => void, error?: string) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          {label} <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <Pressable
          onPress={() => setOpen(!isOpen)}
          style={[styles.dropdown, { borderColor: error ? theme.colors.danger : theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.dropdownText, { color: value ? theme.colors.textPrimary : theme.colors.textMuted }]}>
            {value ? options.find((o) => o.id === value)?.label || options.find((o) => o.label === value)?.label || value : t('اختر...')}
          </Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textMuted} />
        </Pressable>
        {isOpen && (
          <View style={[styles.dropdownList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {options.length === 0 ? (
                <Text style={[styles.dropdownItemText, { color: theme.colors.textMuted, padding: 12 }]}>
                  {t('لا توجد خيارات')}
                </Text>
              ) : (
                options.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => { onChange(opt.id); setOpen(false); }}
                    style={[styles.dropdownItem, value === opt.id && { backgroundColor: theme.colors.accentLight }]}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>{opt.label}</Text>
                    {value === opt.id && <Ionicons name="checkmark" size={16} color={theme.colors.accent} />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}
        {error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={12} color={theme.colors.danger} />
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </View>
        )}
      </View>
    );
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
        <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
          {filteredProducts.map((product) => (
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
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} title={editingId ? t('تعديل منتج') : t('إضافة منتج جديد')} onClose={() => { setModalVisible(false); setErrors({}); }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: Platform.OS === 'web' ? 500 : undefined }}>
          <Input
            label={t('اسم المنتج')}
            value={form.name}
            onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); if (v.trim()) setErrors((e) => ({ ...e, name: undefined })); }}
            placeholder={t('أدخل اسم المنتج')}
            error={errors.name}
            icon="text-outline"
          />
          <Input
            label={t('الوصف')}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder={t('وصف المنتج')}
            multiline
            icon="document-text-outline"
          />
          <Input
            label={t('السعر')}
            value={form.price}
            onChangeText={(v) => { setForm((f) => ({ ...f, price: v })); if (v && !isNaN(Number(v)) && Number(v) > 0) setErrors((e) => ({ ...e, price: undefined })); }}
            placeholder="0.00"
            keyboardType="numeric"
            icon="cash-outline"
            error={errors.price}
          />
          <Input
            label={t('الكمية')}
            value={form.stock}
            onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
            placeholder="0"
            keyboardType="numeric"
            icon="cube-outline"
          />

          {renderDropdown(
            t('الفئة'),
            form.category,
            state.categories.map((c) => ({ id: c.name, label: c.name })),
            catDropdownOpen,
            setCatDropdownOpen,
            (val) => { setForm((f) => ({ ...f, category: val, subCategoryId: '' })); setErrors((e) => ({ ...e, category: undefined })); },
            errors.category
          )}

          {form.category && filteredSubCategories.length > 0 && renderDropdown(
            t('التصنيف الفرعي'),
            form.subCategoryId,
            filteredSubCategories.map((sc) => ({ id: sc.id, label: sc.name })),
            subCatDropdownOpen,
            setSubCatDropdownOpen,
            (val) => setForm((f) => ({ ...f, subCategoryId: val })),
          )}

          <ImageUpload label={t('صورة المنتج')} value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} folder="products" />

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>{t('منتج مميز')}</Text>
              <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                {form.isFeatured ? t('سيظهر في قسم المنتجات المميزة') : t('منتج عادي')}
              </Text>
            </View>
            <Switch
              value={form.isFeatured}
              onValueChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={form.isFeatured ? theme.colors.accentText : theme.colors.textMuted}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button label={t('إلغاء')} onPress={() => { setModalVisible(false); setErrors({}); }} variant="outline" style={{ flex: 1 }} />
            <Button label={editingId ? t('حفظ التعديلات') : t('إضافة المنتج')} onPress={handleSubmit} disabled={saving} loading={saving} style={{ flex: 1 }} />
          </View>
        </ScrollView>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginVertical: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600' },
  switchHint: { fontSize: 11, marginTop: 2 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, minHeight: 50 },
  dropdownText: { fontSize: 13, flex: 1 },
  dropdownList: { borderWidth: 1.5, borderRadius: 12, marginTop: 4, maxHeight: 200 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  dropdownItemText: { fontSize: 13 },
  listContainer: { flex: 1 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  errorText: { fontSize: 11, fontWeight: '500' },
});