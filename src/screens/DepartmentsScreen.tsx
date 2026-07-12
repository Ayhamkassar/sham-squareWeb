import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal } from '../components/ui';
import { Department } from '../types';

interface DepartmentFormState {
  name: string;
  nameAr: string;
  description: string;
}

interface ValidationErrors {
  name?: string;
  nameAr?: string;
}

const EMPTY_FORM: DepartmentFormState = { name: '', nameAr: '', description: '' };

export default function DepartmentsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addDepartment, editDepartment, deleteDepartment, departmentAdmins: admins } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = t('الاسم بالإنجليزية مطلوب');
    if (!form.nameAr.trim()) newErrors.nameAr = t('الاسم بالعربية مطلوب');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function openAdd() {
    setEditingDept(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  }

  function openEdit(dept: Department) {
    setEditingDept(dept);
    setForm({ name: dept.name, nameAr: dept.nameAr, description: dept.description });
    setErrors({});
    setModalVisible(true);
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingDept) {
        editDepartment({ ...editingDept, name: form.name.trim(), nameAr: form.nameAr.trim(), description: form.description.trim() });
      } else {
        addDepartment(form.name.trim(), form.nameAr.trim(), form.description.trim());
      }
      setModalVisible(false);
      setEditingDept(null);
    } catch {
      // error handled by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, deptName: string) {
    Alert.alert(t('حذف قسم'), `${t('هل أنت متأكد من حذف')} "${deptName}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: () => deleteDepartment(id) },
    ]);
  }

  function getAdminNames(dept: Department): string {
    return dept.adminIds.map((aid) => {
      const a = admins.find((ad) => ad.id === aid);
      return a ? a.name : '';
    }).filter(Boolean).join('، ') || '-';
  }

  function handleClose() {
    setModalVisible(false);
    setErrors({});
    setEditingDept(null);
  }

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>{t('الأقسام')}</Text>
        <Button label={t('إضافة قسم')} onPress={openAdd} icon="add" iconPosition="right" />
      </View>

      {state.departments.length === 0 ? (
        <EmptyState icon="layers-outline" title={t('لا توجد أقسام')} subtitle={t('أضف قسماً جديداً للبدء')} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {state.departments.map((dept) => (
            <Card key={dept.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
                    <Ionicons name="layers-outline" size={18} color={theme.colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{dept.nameAr}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{dept.name}</Text>
                  </View>
                </View>
                <Pressable onPress={() => openEdit(dept)} hitSlop={8} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color={theme.colors.accent} />
                </Pressable>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{dept.description}</Text>
              <View style={styles.statsRow}>
                <Badge label={`${dept.productCount} ${t('منتجات')}`} tone="accent" size="sm" />
                <Badge label={`${dept.orderCount} ${t('طلبات')}`} tone="info" size="sm" />
                <Badge label={`${dept.revenue.toLocaleString()} ${t('ر.س')}`} tone="success" size="sm" />
              </View>
              <View style={styles.adminRow}>
                <Ionicons name="person-outline" size={13} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{getAdminNames(dept)}</Text>
              </View>
              <View style={[styles.itemActions, { borderColor: theme.colors.borderLight }]}>
                <Pressable onPress={() => openEdit(dept)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={15} color={theme.colors.accent} />
                  <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>{t('تعديل')}</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(dept.id, dept.nameAr)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                  <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '600' }}>{t('حذف')}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} title={editingDept ? t('تعديل قسم') : t('إضافة قسم جديد')} onClose={handleClose}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: Platform.OS === 'web' ? 500 : undefined }}>
          <Input
            label={t('الاسم (إنجليزي)')}
            value={form.name}
            onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); if (v.trim()) setErrors((e) => ({ ...e, name: undefined })); }}
            placeholder="Department name"
            error={errors.name}
            icon="text-outline"
          />
          <Input
            label={t('الاسم (عربي)')}
            value={form.nameAr}
            onChangeText={(v) => { setForm((f) => ({ ...f, nameAr: v })); if (v.trim()) setErrors((e) => ({ ...e, nameAr: undefined })); }}
            placeholder="اسم القسم"
            error={errors.nameAr}
            icon="text-outline"
          />
          <Input
            label={t('الوصف')}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder={t('وصف القسم (اختياري)')}
            multiline
            icon="document-text-outline"
          />

          <View style={styles.modalButtons}>
            <Button label={t('إلغاء')} onPress={handleClose} variant="outline" style={{ flex: 1 }} />
            <Button label={editingDept ? t('حفظ التعديلات') : t('إضافة')} onPress={handleSave} disabled={saving} loading={saving} style={{ flex: 1 }} />
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
  card: { gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600' },
  editBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  adminRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemActions: { flexDirection: 'row', gap: 24, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
});