import React, { useState, useMemo, useCallback } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal, ImageUpload } from '../components/ui';
import { SubCategory } from '../types';

interface SubCategoryFormState {
  categoryId: string;
  name: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
  slug: string;
}

const EMPTY_FORM: SubCategoryFormState = {
  categoryId: '',
  name: '',
  description: '',
  image: '',
  sortOrder: '0',
  isActive: true,
  slug: '',
};

interface ValidationErrors {
  categoryId?: string;
  name?: string;
  sortOrder?: string;
  slug?: string;
}

export default function SubCategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addSubCategory, editSubCategory, deleteSubCategory } = useStore();
  const { subCategories, categories } = state;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubCategoryFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const filteredSubCategories = useMemo(() => {
    return subCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [subCategories]);

  const getCategoryName = useCallback((categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  }, [categories]);

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.categoryId) newErrors.categoryId = t('يرجى اختيار الفئة الأم');
    if (!form.name.trim()) newErrors.name = t('اسم التصنيف الفرعي مطلوب');
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

  function openEditModal(sub: SubCategory) {
    setEditingId(sub.id);
    setForm({
      categoryId: sub.categoryId,
      name: sub.name,
      description: sub.description || '',
      image: sub.image || '',
      sortOrder: String(sub.sortOrder),
      isActive: sub.isActive,
      slug: sub.slug,
    });
    setErrors({});
    setModalVisible(true);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await editSubCategory(editingId, {
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.image,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        });
      } else {
        await addSubCategory({
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.image,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
          categoryName: getCategoryName(form.categoryId),
          productCount: 0,
        });
      }
      setModalVisible(false);
    } catch {
      // error toast shown by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(sub: SubCategory) {
    Alert.alert(
      t('حذف تصنيف فرعي'),
      `${t('هل أنت متأكد من حذف')} "${sub.name}"?`,
      [
        { text: t('إلغاء'), style: 'cancel' },
        {
          text: t('حذف'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubCategory(sub.id);
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

  function renderCategorySelector() {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          {t('الفئة الأم')} <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <Pressable
          onPress={() => setCatDropdownOpen(!catDropdownOpen)}
          style={[
            styles.dropdown,
            {
              borderColor: errors.categoryId ? theme.colors.danger : theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={[styles.dropdownText, { color: form.categoryId ? theme.colors.textPrimary : theme.colors.textMuted }]}>
            {form.categoryId ? getCategoryName(form.categoryId) : t('اختر فئة')}
          </Text>
          <Ionicons name={catDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textMuted} />
        </Pressable>
        {catDropdownOpen && (
          <View style={[styles.dropdownList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {categories.length === 0 ? (
                <Text style={[styles.dropdownItemText, { color: theme.colors.textMuted, padding: 12 }]}>
                  {t('لا توجد فئات')}
                </Text>
              ) : (
                categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      setForm((f) => ({ ...f, categoryId: cat.id }));
                      setCatDropdownOpen(false);
                      setErrors((e) => ({ ...e, categoryId: undefined }));
                    }}
                    style={[
                      styles.dropdownItem,
                      form.categoryId === cat.id && { backgroundColor: theme.colors.accentLight },
                    ]}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                      {cat.name}
                    </Text>
                    {form.categoryId === cat.id && (
                      <Ionicons name="checkmark" size={16} color={theme.colors.accent} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}
        {errors.categoryId && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={12} color={theme.colors.danger} />
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errors.categoryId}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>{t('التصنيفات الفرعية')}</Text>
        <Button label={t('إضافة تصنيف فرعي')} onPress={openAddModal} icon="add" iconPosition="right" />
      </View>

      {filteredSubCategories.length === 0 ? (
        <EmptyState
          icon="layers-outline"
          title={t('لا توجد تصنيفات فرعية')}
          subtitle={t('أضف تصنيفاً فرعياً جديداً للبدء')}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {filteredSubCategories.map((sub) => {
            const catName = getCategoryName(sub.categoryId);
            return (
              <Card key={sub.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  {sub.image ? (
                    <Image source={{ uri: sub.image }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.accentLight }]}>
                      <Ionicons name="layers-outline" size={20} color={theme.colors.accent} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: theme.colors.textPrimary }]}>{sub.name}</Text>
                    <Text style={[styles.itemCat, { color: theme.colors.textMuted }]}>{catName}</Text>
                    {sub.description ? (
                      <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {sub.description}
                      </Text>
                    ) : null}
                    <View style={styles.itemMeta}>
                      <Badge
                        label={sub.isActive ? t('نشط') : t('غير نشط')}
                        tone={sub.isActive ? 'success' : 'danger'}
                        size="sm"
                        variant="dot"
                      />
                      <Text style={[styles.itemSort, { color: theme.colors.textMuted }]}>
                        {t('ترتيب')}: {sub.sortOrder}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.itemActions, { borderColor: theme.colors.borderLight }]}>
                  <Pressable onPress={() => openEditModal(sub)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={15} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>{t('تعديل')}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(sub)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                    <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '600' }}>{t('حذف')}</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        title={editingId ? t('تعديل تصنيف فرعي') : t('إضافة تصنيف فرعي جديد')}
        onClose={handleCloseModal}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          {renderCategorySelector()}

          <Input
            label={t('اسم التصنيف الفرعي')}
            value={form.name}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, name: v }));
              if (v.trim()) setErrors((e) => ({ ...e, name: undefined }));
            }}
            placeholder={t('أدخل اسم التصنيف الفرعي')}
            error={errors.name}
            icon="text-outline"
          />

          <Input
            label={t('الوصف')}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder={t('وصف التصنيف الفرعي (اختياري)')}
            multiline
            icon="document-text-outline"
          />

          <Input
            label={t('الرابط المختصر (Slug)')}
            value={form.slug}
            onChangeText={(v) => setForm((f) => ({ ...f, slug: v }))}
            placeholder={t('اختياري - سيتم توليده تلقائياً')}
            icon="link-outline"
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
            label={t('صورة التصنيف الفرعي')}
            value={form.image}
            onChange={(v) => setForm((f) => ({ ...f, image: v }))}
            folder="subcategories"
          />

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>{t('الحالة')}</Text>
              <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                {form.isActive ? t('التصنيف الفرعي نشط ومرئي') : t('التصنيف الفرعي غير نشط')}
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
  itemCat: {
    fontSize: 11,
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  itemSort: {
    fontSize: 11,
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
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 13,
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 13,
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
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? 500 : undefined,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
  },
});