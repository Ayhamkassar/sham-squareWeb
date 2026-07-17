import React, { useState, useMemo } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal, ImageUpload } from '../components/ui';
import { Category } from '../types';

interface CategoryFormState {
  name: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
  image: '',
  sortOrder: '0',
  isActive: true,
};

interface ValidationErrors {
  name?: string;
  sortOrder?: string;
}

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCategory, editCategory, deleteCategory } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...state.categories].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [state.categories]);

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = t('اسم الفئة مطلوب');
    if (form.sortOrder && isNaN(Number(form.sortOrder))) newErrors.sortOrder = t('ترتيب غير صالح');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  }

  function openEditModal(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: String(cat.sortOrder ?? 0),
      isActive: cat.isActive ?? true,
    });
    setErrors({});
    setModalVisible(true);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await editCategory(editingId, {
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.image,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
        });
      } else {
        await addCategory(form.name.trim(), 'Tag', form.image);
      }
      setModalVisible(false);
    } catch {
      // error toast shown by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(cat: Category) {
    Alert.alert(
      t('حذف فئة'),
      `${t('هل أنت متأكد من حذف')} "${cat.name}"?`,
      [
        { text: t('إلغاء'), style: 'cancel' },
        {
          text: t('حذف'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
            } catch { /* error toast shown by context */ }
          },
        },
      ]
    );
  }

  function handleCloseModal() {
    setModalVisible(false);
    setErrors({});
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>{t('الفئات')}</Text>
        <Button label={t('إضافة فئة')} onPress={openAddModal} icon="add" iconPosition="right" />
      </View>

      {sortedCategories.length === 0 ? (
        <EmptyState icon="pricetag-outline" title={t('لا توجد فئات')} subtitle={t('أضف فئة جديدة للبدء')} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {sortedCategories.map((category) => (
            <Card key={category.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                {category.image ? (
                  <Image source={{ uri: category.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.accentLight }]}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.colors.accent} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: theme.colors.textPrimary }]}>{category.name}</Text>
                  <View style={styles.itemMeta}>
                    <Badge label={`${category.productCount} ${t('منتجات')}`} tone="accent" size="sm" />
                    {category.isActive !== undefined && (
                      <Badge
                        label={category.isActive ? t('نشط') : t('غير نشط')}
                        tone={category.isActive ? 'success' : 'danger'}
                        size="sm"
                        variant="dot"
                      />
                    )}
                  </View>
                </View>
              </View>
              <View style={[styles.itemActions, { borderColor: theme.colors.borderLight }]}>
                <Pressable onPress={() => openEditModal(category)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={15} color={theme.colors.accent} />
                  <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>{t('تعديل')}</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(category)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                  <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '600' }}>{t('حذف')}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        title={editingId ? t('تعديل فئة') : t('إضافة فئة جديدة')}
        onClose={handleCloseModal}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Input
            label={t('اسم الفئة')}
            value={form.name}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, name: v }));
              if (v.trim()) setErrors((e) => ({ ...e, name: undefined }));
            }}
            placeholder={t('أدخل اسم الفئة')}
            error={errors.name}
            icon="text-outline"
          />

          <Input
            label={t('الوصف')}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder={t('وصف الفئة (اختياري)')}
            multiline
            icon="document-text-outline"
          />

          <Input
            label={t('ترتيب الفرز')}
            value={form.sortOrder}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, sortOrder: v }));
              if (v && !isNaN(Number(v))) setErrors((e) => ({ ...e, sortOrder: undefined }));
            }}
            placeholder="0"
            keyboardType="numeric"
            icon="swap-vertical-outline"
            error={errors.sortOrder}
          />

          <ImageUpload
            label={t('صورة الفئة')}
            value={form.image}
            onChange={(v) => setForm((f) => ({ ...f, image: v }))}
            folder="categories"
          />

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>{t('الحالة')}</Text>
              <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                {form.isActive ? t('الفئة نشطة ومرئية') : t('الفئة غير نشطة')}
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
            <Button
              label={t('إلغاء')}
              onPress={handleCloseModal}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              label={editingId ? t('حفظ التعديلات') : t('إضافة')}
              onPress={handleSubmit}
              disabled={saving}
              loading={saving}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  itemCard: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchHint: {
    fontSize: 11,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
