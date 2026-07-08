import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal } from '../components/ui';
import { Department } from '../types';

export default function DepartmentsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addDepartment, editDepartment, deleteDepartment, departmentAdmins: admins } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');

  function openAdd() {
    setName('');
    setNameAr('');
    setDescription('');
    setModalVisible(true);
  }

  function openEdit(dept: Department) {
    setEditingDept(dept);
    setName(dept.name);
    setNameAr(dept.nameAr);
    setDescription(dept.description);
    setModalVisible(true);
  }

  function handleSave() {
    if (!name.trim() || !nameAr.trim()) return;
    if (editingDept) {
      editDepartment({ ...editingDept, name: name.trim(), nameAr: nameAr.trim(), description: description.trim() });
    } else {
      addDepartment(name.trim(), nameAr.trim(), description.trim());
    }
    setModalVisible(false);
    setEditingDept(null);
  }

  function handleDelete(id: string, deptName: string) {
    Alert.alert(t('حذف قسم'), deptName, [
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

  return (
    <ScreenContainer>
      <Button label={t('إضافة قسم')} onPress={openAdd} icon="add" iconPosition="right" />

      {state.departments.length === 0 ? (
        <EmptyState icon="layers-outline" title={t('لا توجد أقسام')} subtitle={t('أضف قسماً جديداً للبدء')} />
      ) : (
        state.departments.map((dept) => (
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
              <Pressable onPress={() => openEdit(dept)} hitSlop={8}>
                <Ionicons name="create-outline" size={18} color={theme.colors.textMuted} />
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
            <Pressable onPress={() => handleDelete(dept.id, dept.nameAr)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{t('حذف')}</Text>
            </Pressable>
          </Card>
        ))
      )}

      <Modal visible={modalVisible} title={editingDept ? t('تعديل قسم') : t('إضافة قسم')} onClose={() => { setModalVisible(false); setEditingDept(null); }}>
        <Input label={t('الاسم (إنجليزي)')} value={name} onChangeText={setName} />
        <Input label={t('الاسم (عربي)')} value={nameAr} onChangeText={setNameAr} />
        <Input label={t('الوصف')} value={description} onChangeText={setDescription} />
        <Button label={t('حفظ')} onPress={handleSave} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  adminRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
});
