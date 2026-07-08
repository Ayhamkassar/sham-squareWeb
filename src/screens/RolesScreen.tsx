import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, Modal } from '../components/ui';
import { Role } from '../types';

export default function RolesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, updateRolePermissions } = useStore();

  const AVAILABLE_PERMISSIONS = [
    t('الوصول الكامل'), t('إدارة المستخدمين'), t('التقارير المالية'), t('إدارة الطلبات'),
    t('تعديل المنتجات'), t('دعم العملاء'), t('إضافة منتجات'), t('تعديل المحتوى'), t('إدارة المدونة'),
  ];

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  function openEdit(role: Role) {
    setEditingRole(role);
    setTempPermissions([...role.permissionsAr]);
  }

  function togglePermission(perm: string) {
    setTempPermissions((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]);
  }

  function save() {
    if (!editingRole) return;
    updateRolePermissions(editingRole.id, tempPermissions);
    setEditingRole(null);
  }

  return (
    <ScreenContainer>
      {state.roles.map((role) => (
        <Card key={role.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.roleNameRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{role.nameAr}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{role.usersCount} {t('مستخدم')}</Text>
              </View>
            </View>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{role.description}</Text>
          <View style={styles.permRow}>
            {role.permissionsAr.map((perm) => (
              <Badge key={perm} label={perm} tone="info" size="sm" />
            ))}
          </View>
          <Button variant="outline" label={t('تعديل الصلاحيات')} onPress={() => openEdit(role)} size="sm" fullWidth />
        </Card>
      ))}

      <Modal visible={!!editingRole} title={t('تعديل الصلاحيات')} onClose={() => setEditingRole(null)}>
        {AVAILABLE_PERMISSIONS.map((perm) => {
          const checked = tempPermissions.includes(perm);
          return (
            <Pressable key={perm} onPress={() => togglePermission(perm)} style={styles.permOption}>
              <View style={[styles.checkbox, { borderColor: checked ? theme.colors.accent : theme.colors.border, backgroundColor: checked ? theme.colors.accent : 'transparent' }]}>
                {checked && <Ionicons name="checkmark" size={14} color={theme.colors.accentText} />}
              </View>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 13 }}>{perm}</Text>
            </Pressable>
          );
        })}
        <Button label={t('حفظ')} onPress={save} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600' },
  permRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  permOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
