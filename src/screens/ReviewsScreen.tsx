import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Button, EmptyState, Input, Modal, Avatar, Badge } from '../components/ui';
import { Review } from '../types';

function StarRow({ rating, color }: { rating: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={13} color={color} />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addReviewReply, deleteReviewReply } = useStore();

  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  function submitReply() {
    if (!replyTarget || !replyText.trim()) return;
    addReviewReply(replyTarget.id, replyText.trim());
    setReplyText('');
    setReplyTarget(null);
  }

  return (
    <ScreenContainer>
      {state.reviews.length === 0 ? (
        <EmptyState icon="star-outline" title={t('لا توجد مراجعات')} />
      ) : (
        state.reviews.map((review) => (
          <Card key={review.id} style={styles.card}>
            <View style={styles.row}>
              <Image source={{ uri: review.productImage }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.customer, { color: theme.colors.textPrimary }]} numberOfLines={1}>{review.customerName}</Text>
                  <StarRow rating={review.rating} color={theme.colors.warning} />
                </View>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }} numberOfLines={1}>{review.productName}</Text>
              </View>
            </View>

            <View style={[styles.commentBox, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{review.comment}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{review.date}</Text>
              {review.customerAvatar && <Avatar uri={review.customerAvatar} name={review.customerName} size={20} />}
            </View>

            {review.storeReply ? (
              <View style={[styles.replyBox, { backgroundColor: theme.colors.infoLight }]}>
                <View style={styles.replyHeader}>
                  <Badge label={t('رد الإدارة')} tone="info" size="sm" />
                  <Button variant="ghost" label={t('حذف')} onPress={() => deleteReviewReply(review.id)} size="sm" icon="trash-outline" />
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{review.storeReply}</Text>
              </View>
            ) : (
              <Button variant="outline" label={t('الرد على المراجعة')} onPress={() => setReplyTarget(review)} size="sm" fullWidth />
            )}
          </Card>
        ))
      )}

      <Modal visible={!!replyTarget} title={t('الرد على المراجعة')} onClose={() => setReplyTarget(null)}>
        <Input label={t('نص الرد')} value={replyText} onChangeText={setReplyText} multiline />
        <Button label={t('إرسال')} onPress={submitReply} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { flexDirection: 'row', gap: 10 },
  productImage: { width: 48, height: 48, borderRadius: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customer: { fontSize: 13, fontWeight: '600' },
  commentBox: { borderRadius: 10, padding: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  replyBox: { borderRadius: 10, padding: 12 },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
