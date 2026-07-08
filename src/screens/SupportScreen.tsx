import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Button, EmptyState, Input, Modal, SegmentedControl } from '../components/ui';
import { BadgeTone } from '../components/ui/Badge';
import { SupportTicket } from '../types';

const STATUS_TONE: Record<SupportTicket['status'], BadgeTone> = { Urgent: 'danger', Open: 'warning', Resolved: 'success' };
const STATUS_FLOW: SupportTicket['status'][] = ['Open', 'Urgent', 'Resolved'];

export default function SupportScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, addSupportTicket, updateTicketStatus, addTicketReply } = useStore();

  const FILTERS = useMemo(() => [
    { key: 'all', label: t('الكل') },
    { key: 'Open', label: t('مفتوحة') },
    { key: 'Urgent', label: t('عاجلة') },
    { key: 'Resolved', label: t('محلولة') },
  ], [t]);

  const [filter, setFilter] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [replyTarget, setReplyTarget] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const tickets = filter === 'all' ? state.supportTickets : state.supportTickets.filter((t) => t.status === filter);

  function handleAddTicket() {
    if (!title.trim() || !customerName.trim()) return;
    addSupportTicket({ title: title.trim(), customerName: customerName.trim(), category: category.trim() || 'عام', description: description.trim(), status: 'Open', lastMessageTime: t('الآن') });
    setTitle(''); setCustomerName(''); setCategory(''); setDescription('');
    setAddModalVisible(false);
  }

  function handleReply() {
    if (!replyTarget || !replyText.trim()) return;
    addTicketReply(replyTarget.id, replyText.trim());
    setReplyText('');
    setReplyTarget(null);
  }

  function cycleStatus(ticket: SupportTicket) {
    const idx = STATUS_FLOW.indexOf(ticket.status);
    updateTicketStatus(ticket.id, STATUS_FLOW[(idx + 1) % STATUS_FLOW.length]);
  }

  return (
    <ScreenContainer>
      <Button label={t('فتح تذكرة جديدة')} onPress={() => setAddModalVisible(true)} icon="add" iconPosition="right" />

      <SegmentedControl options={FILTERS} selected={filter} onSelect={setFilter} />

      {tickets.length === 0 ? (
        <EmptyState icon="headset-outline" title={t('لا توجد تذاكر')} />
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={[styles.ticketTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{ticket.title}</Text>
              <Badge label={ticket.status} tone={STATUS_TONE[ticket.status]} size="sm" />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{ticket.customerName} • {ticket.category}</Text>
            <View style={[styles.descBox, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 }} numberOfLines={4}>{ticket.description}</Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{ticket.lastMessageTime}</Text>
            <View style={styles.actionsRow}>
              <Button variant="outline" label={t('رد')} onPress={() => setReplyTarget(ticket)} size="sm" style={{ flex: 1 }} />
              <Button variant="outline" label={t('تغيير الحالة')} onPress={() => cycleStatus(ticket)} size="sm" style={{ flex: 1 }} />
            </View>
          </Card>
        ))
      )}

      <Modal visible={addModalVisible} title={t('فتح تذكرة جديدة')} onClose={() => setAddModalVisible(false)}>
        <Input label={t('العنوان')} value={title} onChangeText={setTitle} />
        <Input label={t('العميل')} value={customerName} onChangeText={setCustomerName} />
        <Input label={t('التصنيف')} value={category} onChangeText={setCategory} />
        <Input label={t('الوصف')} value={description} onChangeText={setDescription} multiline />
        <Button label={t('إرسال التذكرة')} onPress={handleAddTicket} fullWidth />
      </Modal>

      <Modal visible={!!replyTarget} title={t('رد على تذكرة')} onClose={() => setReplyTarget(null)}>
        <Input label={t('نص الرد')} value={replyText} onChangeText={setReplyText} multiline />
        <Button label={t('إرسال')} onPress={handleReply} fullWidth />
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  ticketTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  descBox: { borderRadius: 10, padding: 12 },
  actionsRow: { flexDirection: 'row', gap: 10 },
});
