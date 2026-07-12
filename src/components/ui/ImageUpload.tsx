import React, { useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { uploadByFile } from '../../services/uploadService';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = 'products', label }: Props) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview || value;

  function handlePress() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLocalPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await uploadByFile(file, folder);
      onChange(result.url);
    } catch {
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemove() {
    onChange('');
    setLocalPreview(null);
  }

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}

      {displayUrl ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: displayUrl }} style={styles.preview} />
          <TouchableOpacity onPress={handleRemove} style={[styles.removeBtn, { backgroundColor: theme.colors.dangerLight }]}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.uploadArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.accent} />
          )}
          <Text style={[styles.uploadText, { color: theme.colors.textMuted }]}>
            {uploading ? 'جاري الرفع...' : 'اختر صورة'}
          </Text>
        </TouchableOpacity>
      )}

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  previewRow: { position: 'relative', alignSelf: 'flex-start' },
  preview: { width: 100, height: 100, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadText: { fontSize: 12, fontWeight: '500' },
});
