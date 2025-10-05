import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { buildTodaySummary, loadWalkLogs, sortDatesDesc } from '@/lib/walk-storage';
import { useLocalization } from '@/lib/i18n';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HomeScreen() {
  const router = useRouter();
  const { strings, formatDuration, formatDistance } = useLocalization();
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
        <Text style={styles.greeting}>{strings.home.greeting}</Text>
        <Text style={styles.title}>{strings.home.title}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{strings.home.summaryTitle}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(totalTime)}</Text>
            <Text style={styles.summaryCaption}>{strings.common.walkTimeLabel}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(totalDistance)}</Text>
            <Text style={styles.summaryCaption}>{strings.common.walkDistanceLabel}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.tipText}>{strings.home.startTip}</Text>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/activity')}>
        <Text style={styles.secondaryLabel}>{strings.home.historyButton}</Text>
      </Pressable>

      {lastMemo ? (
        <View style={styles.memoCard}>
          <Text style={styles.memoTitle}>{strings.home.memoTitle}</Text>
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
