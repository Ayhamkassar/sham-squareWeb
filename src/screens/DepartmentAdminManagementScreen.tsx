import React, { useMemo, useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, SearchBar, Button, EmptyState, Input, Modal, Avatar, SegmentedControl, ImageUpload } from '../components/ui';
import { AdminUser } from '../types';

const ITEMS_PER_PAGE = 5;

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  departmentId: string;
  status: 'active' | 'disabled';
  role: string;
  avatar: string;
}

export default function DepartmentAdminManagementScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addDepartmentAdmin, editDepartmentAdmin, deleteDepartmentAdmin, toggleDepartmentAdminStatus } = useStore();

  const STATUS_OPTIONS = useMemo(() => [
    { key: 'all', label: t('الكل') },
    { key: 'active', label: t('نشط') },
    { key: 'disabled', label: t('معطل') },
  ], [t]);
  const { width } = useWindowDimensions();
  const isCompact = width < 600;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const EMPTY_FORM: AdminFormData = {
    name: '', email: '', password: '', phone: '',
    departmentId: '', status: 'active', role: t('مشرف قسم'),
    avatar: '',
  };
  const [form, setForm] = useState<AdminFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  const filteredAdmins = useMemo(() => {
    let list = state.departmentAdmins;
    if (query) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) => a.name.includes(q) || a.email.includes(q) || a.phone.includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((a) => a.status === statusFilter);
    if (deptFilter !== 'all') list = list.filter((a) => a.departmentId === deptFilter);
    return list;
  }, [state.departmentAdmins, query, statusFilter, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE));
  const paginatedAdmins = filteredAdmins.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  React.useEffect(() => { setPage(1); }, [query, statusFilter, deptFilter]);

  function getDepartmentName(deptId?: string): string {
    if (!deptId) return '-';
    const dept = state.departments.find((d) => d.id === deptId);
    return dept ? dept.nameAr : deptId;
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = t('الاسم مطلوب');
    if (!form.email.trim()) errs.email = t('البريد الإلكتروني مطلوب');
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('بريد إلكتروني غير صالح');
    if (!editingId && !form.password.trim()) errs.password = t('كلمة المرور مطلوبة');
    else if (!editingId && form.password.length < 8) errs.password = t('يجب أن تكون 8 محارف على الأقل');
    if (!form.phone.trim()) errs.phone = t('رقم الهاتف مطلوب');
    if (!form.departmentId) errs.departmentId = t('يجب اختيار قسم');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  }

  function openEdit(admin: AdminUser) {
    setEditingId(admin.id);
    setForm({
      name: admin.name,
      email: admin.email,
      password: '',
      phone: admin.phone,
      departmentId: admin.departmentId || '',
      status: admin.status,
      role: admin.role,
      avatar: admin.avatar,
    });
    setErrors({});
    setModalVisible(true);
  }

  function openView(admin: AdminUser) {
    setViewingAdmin(admin);
    setViewModalVisible(true);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        const existing = state.departmentAdmins.find((a) => a.id === editingId);
        if (!existing) return;
        await editDepartmentAdmin({
          ...existing,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          departmentId: form.departmentId,
          status: form.status,
          role: form.role,
          avatar: form.avatar,
        });
      } else {
        await addDepartmentAdmin({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          departmentId: form.departmentId,
          status: form.status,
          role: form.role,
          roleType: 'department',
          avatar: form.avatar,
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }
      setModalVisible(false);
    } catch {
      // error handled by context
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(admin: AdminUser) {
    Alert.alert(t('حذف مشرف'), `${t('سيتم حذف المشرف')} "${admin.name}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: async () => {
        try {
          await deleteDepartmentAdmin(admin.id);
        } catch {
          // error handled by context
        }
      }},
    ]);
  }

  function handleToggleStatus(admin: AdminUser) {
    const nextStatus = admin.status === 'active' ? 'disabled' : 'active';
    const label = nextStatus === 'disabled' ? t('تعطيل') : t('تفعيل');
    Alert.alert(`${label} مشرف`, `${label} حساب "${admin.name}"?`, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: label, onPress: () => toggleDepartmentAdminStatus(admin.id) },
    ]);
  }

  const deptOptions = useMemo(() => {
    const opts = [{ key: 'all', label: t('جميع الأقسام') }];
    state.departments.forEach((d) => opts.push({ key: d.id, label: d.nameAr }));
    return opts;
  }, [state.departments]);

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('بحث باسم أو بريد أو هاتف...')} />
        <Button label={t('إضافة')} onPress={openAdd} icon="add" iconPosition="right" />
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <>
      <View style={[styles.filterRow, isCompact && styles.filterRowCompact]}>
        <View style={styles.filterGroup}>
          <Ionicons name="funnel-outline" size={14} color={theme.colors.textMuted} />
          <SegmentedControl options={STATUS_OPTIONS} selected={statusFilter} onSelect={setStatusFilter} />
        </View>
        <View style={styles.filterGroup}>
          <SegmentedControl options={deptOptions} selected={deptFilter} onSelect={setDeptFilter} />
        </View>
      </View>

      {paginatedAdmins.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('لا يوجد مشرفين')}
          subtitle={query || statusFilter !== 'all' || deptFilter !== 'all' ? t('حاول تغيير معايير البحث') : t('أضف أول مشرف قسم للبدء')}
        />
      ) : (
        paginatedAdmins.map((admin) => (
          <Card key={admin.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardProfile}>
                <Avatar uri={admin.avatar} name={admin.name} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{admin.name}</Text>
                  <Text style={[styles.adminMeta, { color: theme.colors.textMuted }]}>{admin.email}</Text>
                </View>
                <Badge
                  label={admin.status === 'active' ? t('نشط') : t('معطل')}
                  tone={admin.status === 'active' ? 'success' : 'danger'}
                  size="sm"
                  variant="dot"
                />
              </View>
            </View>
            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={13} color={theme.colors.textMuted} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{admin.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="layers-outline" size={13} color={theme.colors.textMuted} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{getDepartmentName(admin.departmentId)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={13} color={theme.colors.textMuted} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{admin.createdAt}</Text>
              </View>
            </View>
            <View style={[styles.cardActions, { borderTopColor: theme.colors.borderLight }]}>
              <Pressable onPress={() => openView(admin)} style={styles.actionBtn}>
                <Ionicons name="eye-outline" size={15} color={theme.colors.accent} />
                <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '600' }}>{t('عرض')}</Text>
              </Pressable>
              <Pressable onPress={() => openEdit(admin)} style={styles.actionBtn}>
                <Ionicons name="create-outline" size={15} color={theme.colors.info} />
                <Text style={{ color: theme.colors.info, fontSize: 11, fontWeight: '600' }}>{t('تعديل')}</Text>
              </Pressable>
              <Pressable onPress={() => handleToggleStatus(admin)} style={styles.actionBtn}>
                <Ionicons name={admin.status === 'active' ? 'pause-circle-outline' : 'checkmark-circle-outline'} size={15} color={theme.colors.warning} />
                <Text style={{ color: theme.colors.warning, fontSize: 11, fontWeight: '600' }}>{admin.status === 'active' ? t('تعطيل') : t('تفعيل')}</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(admin)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                <Text style={{ color: theme.colors.danger, fontSize: 11, fontWeight: '600' }}>{t('حذف')}</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            style={[styles.pageBtn, { backgroundColor: theme.colors.surfaceAlt, opacity: page === 1 ? 0.4 : 1 }]}
            disabled={page === 1}
          >
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            {page} / {totalPages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={[styles.pageBtn, { backgroundColor: theme.colors.surfaceAlt, opacity: page === totalPages ? 0.4 : 1 }]}
            disabled={page === totalPages}
          >
            <Ionicons name="chevron-back" size={14} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        title={editingId ? t('تعديل مشرف قسم') : t('إضافة مشرف قسم جديد')}
        onClose={() => setModalVisible(false)}
      >
        <Input
          label={t('الاسم الكامل')}
          value={form.name}
          onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: undefined })); }}
          error={errors.name}
        />
        <Input
          label={t('البريد الإلكتروني')}
          value={form.email}
          onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setErrors((e) => ({ ...e, email: undefined })); }}
          keyboardType="email-address"
          error={errors.email}
        />
        <Input
          label={editingId ? t('كلمة المرور (اترك فارغاً دون تغيير)') : t('كلمة المرور')}
          value={form.password}
          onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setErrors((e) => ({ ...e, password: undefined })); }}
          secureTextEntry
          error={errors.password}
        />
        <ImageUpload label={t('الصورة الشخصية')} value={form.avatar} onChange={(v) => setForm((f) => ({ ...f, avatar: v }))} folder="users" />
        <Input
          label={t('رقم الهاتف')}
          value={form.phone}
          onChangeText={(v) => { setForm((f) => ({ ...f, phone: v })); setErrors((e) => ({ ...e, phone: undefined })); }}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('القسم')}</Text>
          <View style={styles.deptOptions}>
            {state.departments.map((dept) => {
              const selected = form.departmentId === dept.id;
              return (
                <Pressable
                  key={dept.id}
                  onPress={() => { setForm((f) => ({ ...f, departmentId: dept.id })); setErrors((e) => ({ ...e, departmentId: undefined })); }}
                  style={[
                    styles.deptOption,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected ? theme.colors.accentLight : 'transparent',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? theme.colors.accent : theme.colors.textPrimary }}>
                    {dept.nameAr}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.departmentId && (
            <Text style={{ color: theme.colors.danger, fontSize: 11, marginTop: 4 }}>{errors.departmentId}</Text>
          )}
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('الحالة')}</Text>
          <View style={styles.statusToggle}>
            <Pressable
              onPress={() => setForm((f) => ({ ...f, status: 'active' }))}
              style={[styles.statusOption, { backgroundColor: form.status === 'active' ? theme.colors.successLight : 'transparent' }]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: form.status === 'active' ? theme.colors.success : theme.colors.textMuted }}>
                {t('نشط')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setForm((f) => ({ ...f, status: 'disabled' }))}
              style={[styles.statusOption, { backgroundColor: form.status === 'disabled' ? theme.colors.dangerLight : 'transparent' }]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: form.status === 'disabled' ? theme.colors.danger : theme.colors.textMuted }}>
                {t('معطل')}
              </Text>
            </Pressable>
          </View>
        </View>
          <View style={styles.modalBtnRow}>
            <Button label={t('إلغاء')} onPress={() => setModalVisible(false)} variant="outline" style={{ flex: 1 }} />
            <Button label={editingId ? t('حفظ التعديلات') : t('إضافة المشرف')} onPress={handleSubmit} disabled={saving} loading={saving} style={{ flex: 1 }} />
          </View>
      </Modal>

      {/* View Details Modal */}
      <Modal
        visible={viewModalVisible}
        title={t('تفاصيل المشرف')}
        onClose={() => { setViewModalVisible(false); setViewingAdmin(null); }}
      >
        {viewingAdmin && (
          <View style={styles.viewContent}>
            <View style={styles.viewAvatarRow}>
              <Avatar uri={viewingAdmin.avatar} name={viewingAdmin.name} size={72} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={[styles.viewName, { color: theme.colors.textPrimary }]}>{viewingAdmin.name}</Text>
                <Badge
                  label={viewingAdmin.status === 'active' ? t('نشط') : t('معطل')}
                  tone={viewingAdmin.status === 'active' ? 'success' : 'danger'}
                  size="sm"
                />
              </View>
            </View>
            <View style={[styles.viewDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.viewField}>
              <Text style={[styles.viewLabel, { color: theme.colors.textMuted }]}>{t('البريد الإلكتروني')}</Text>
              <Text style={[styles.viewValue, { color: theme.colors.textPrimary }]}>{viewingAdmin.email}</Text>
            </View>
            <View style={styles.viewField}>
              <Text style={[styles.viewLabel, { color: theme.colors.textMuted }]}>{t('رقم الهاتف')}</Text>
              <Text style={[styles.viewValue, { color: theme.colors.textPrimary }]}>{viewingAdmin.phone}</Text>
            </View>
            <View style={styles.viewField}>
              <Text style={[styles.viewLabel, { color: theme.colors.textMuted }]}>{t('القسم')}</Text>
              <Text style={[styles.viewValue, { color: theme.colors.textPrimary }]}>{getDepartmentName(viewingAdmin.departmentId)}</Text>
            </View>
            <View style={styles.viewField}>
              <Text style={[styles.viewLabel, { color: theme.colors.textMuted }]}>{t('الوظيفة')}</Text>
              <Text style={[styles.viewValue, { color: theme.colors.textPrimary }]}>{viewingAdmin.role}</Text>
            </View>
            <View style={styles.viewField}>
              <Text style={[styles.viewLabel, { color: theme.colors.textMuted }]}>{t('تاريخ الإنشاء')}</Text>
              <Text style={[styles.viewValue, { color: theme.colors.textPrimary }]}>{viewingAdmin.createdAt}</Text>
            </View>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  filterRowCompact: { flexDirection: 'column', alignItems: 'stretch' },
  filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { gap: 0 },
  cardHeader: { paddingBottom: 8 },
  cardProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminName: { fontSize: 14, fontWeight: '600' },
  adminMeta: { fontSize: 11, marginTop: 1 },
  cardDetails: { gap: 4, paddingVertical: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12 },
  cardActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 10, marginTop: 4, borderTopWidth: 1,
  },
  actionBtn: { alignItems: 'center', gap: 3, padding: 4 },
  pagination: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 16,
  },
  pageBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600' },
  deptOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deptOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusToggle: { flexDirection: 'row', gap: 6 },
  statusOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  viewContent: { gap: 12 },
  viewAvatarRow: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  viewName: { fontSize: 16, fontWeight: '700' },
  viewDivider: { height: 1, marginVertical: 4 },
  viewField: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  viewLabel: { fontSize: 12 },
  viewValue: { fontSize: 13, fontWeight: '500', textAlign: 'right', flex: 1, paddingLeft: 12 },
  modalBtnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
