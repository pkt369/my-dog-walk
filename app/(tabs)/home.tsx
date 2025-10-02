import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { formatDistance, formatDuration } from '@/lib/format';
import { buildTodaySummary, loadWalkLogs, sortDatesDesc } from '@/lib/walk-storage';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HomeScreen() {
  const router = useRouter();
  const [totalTime, setTotalTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastMemo, setLastMemo] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchLogs = async () => {
        const logs = await loadWalkLogs();
        if (!isActive) return;
        const summary = buildTodaySummary(logs, todayKey());
        setTotalTime(summary.time);
        setTotalDistance(summary.distance);
        const [latestDate] = sortDatesDesc(logs);
        const latestEntry = latestDate ? logs[latestDate]?.[0] : undefined;
        setLastMemo(latestEntry?.memo);
      };

      fetchLogs();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.greeting}>오늘도 산책하기 좋은 날이에요</Text>
        <Text style={styles.title}>댕댕이와 떠나볼까요?</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>오늘의 기록</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(totalTime)}</Text>
            <Text style={styles.summaryCaption}>산책 시간</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(totalDistance)}</Text>
            <Text style={styles.summaryCaption}>이동 거리</Text>
          </View>
        </View>
      </View>

      <Text style={styles.tipText}>Walk 탭의 START 버튼을 눌러 산책을 시작하세요.</Text>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/activity')}>
        <Text style={styles.secondaryLabel}>히스토리 보기</Text>
      </Pressable>

      {lastMemo ? (
        <View style={styles.memoCard}>
          <Text style={styles.memoTitle}>최근 메모</Text>
          <Text style={styles.memoText}>{lastMemo}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    gap: 24,
  },
  headerBlock: {
    marginTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 20,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCaption: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#d1d5db',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  memoCard: {
    backgroundColor: '#ecfdf3',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  memoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.tint,
    marginBottom: 6,
  },
  memoText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
});
