import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal, ImageUpload } from '../components/ui';

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addCategory, deleteCategory } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  async function handleAdd() {
    if (!name.trim()) return;
    try {
      await addCategory(name.trim(), 'Tag', image);
      setName('');
      setImage('');
      setModalVisible(false);
    } catch { /* error toast shown by context */ }
  }

  function handleDelete(id: string, catName: string) {
    Alert.alert(t('حذف فئة'), catName, [
      { text: t('إلغاء'), style: 'cancel' },
      { text: t('حذف'), style: 'destructive', onPress: async () => { try { await deleteCategory(id); } catch { /* error toast shown by context */ } } },
    ]);
  }

  return (
    <ScreenContainer>
      <Button label={t('إضافة فئة')} onPress={() => setModalVisible(true)} icon="add" iconPosition="right" />

      {state.categories.length === 0 ? (
        <EmptyState icon="pricetag-outline" title={t('لا توجد فئات')}         subtitle={t('أضف فئة جديدة للبدء')} />
      ) : (
        state.categories.map((category) => (
          <Card key={category.id} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentLight }]}>
              <Ionicons name="pricetag-outline" size={18} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{category.name}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{category.productCount} {t('منتجات')}</Text>
            </View>
            <Badge label={`${category.productCount}`} tone="accent" size="sm" />
            <Pressable onPress={() => handleDelete(category.id, category.name)} hitSlop={8}>
              <View style={[styles.deleteBtn, { backgroundColor: theme.colors.dangerLight }]}>
                <Ionicons name="trash-outline" size={14} color={theme.colors.danger} />
              </View>
            </Pressable>
          </Card>
        ))
      )}

      <Modal visible={modalVisible} title={t('إضافة فئة')} onClose={() => setModalVisible(false)}>
        <Input label={t('اسم الفئة')} value={name} onChangeText={setName} />
        <ImageUpload label={t('صورة الفئة')} value={image} onChange={setImage} folder="categories" />
        <Button label={t('إضافة')} onPress={handleAdd} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
