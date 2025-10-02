import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { formatDistance, formatDuration } from '@/lib/format';
import type { CoordinateTuple } from '@/lib/geo';
import { addWalkLog } from '@/lib/walk-storage';

interface SummaryPayload {
  duration: number;
  distance: number;
  path: CoordinateTuple[];
}

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const payload = useMemo<SummaryPayload | null>(() => {
    const raw = params.payload;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SummaryPayload;
    } catch (error) {
      console.warn('Failed to parse summary payload', error);
      return null;
    }
  }, [params.payload]);

  const handleSave = async () => {
    if (!payload) {
      router.replace('/(tabs)/home');
      return;
    }
    setIsSaving(true);
    const endedAt = new Date();
    const dateKey = endedAt.toISOString().slice(0, 10);

    await addWalkLog(dateKey, {
      id: endedAt.toISOString(),
      time: payload.duration,
      distance: payload.distance,
      path: payload.path,
      memo: memo.trim() ? memo.trim() : undefined,
      endedAt: endedAt.toISOString(),
    });

    setIsSaving(false);
    Alert.alert('산책 완료!', '기록이 저장되었어요.', [
      {
        text: '확인',
        onPress: () => router.replace('/(tabs)/home'),
      },
    ]);
  };

  if (!payload) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>요약 정보를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.primaryLabel}>홈으로 돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>산책 완료!</Text>
        <Text style={styles.heroSubtitle}>댕댕이가 행복해하고 있어요 🐾</Text>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>산책 시간</Text>
          <Text style={styles.metricValue}>{formatDuration(payload.duration)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>이동 거리</Text>
          <Text style={styles.metricValue}>{formatDistance(payload.distance)}</Text>
        </View>
      </View>

      <View style={styles.memoBlock}>
        <Text style={styles.memoLabel}>메모 (선택)</Text>
        <TextInput
          placeholder="산책 중 느낀 점이나 강아지 상태를 기록해보세요"
          placeholderTextColor="#9ca3af"
          style={styles.memoInput}
          value={memo}
          onChangeText={setMemo}
          multiline
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
        <Text style={styles.primaryLabel}>{isSaving ? '저장 중...' : '기록 저장하기'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 24,
    gap: 24,
  },
  heroCard: {
    backgroundColor: '#ecfdf3',
    borderRadius: 20,
    padding: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#4b5563',
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  memoBlock: {
    gap: 12,
  },
  memoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memoInput: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
  },
});
