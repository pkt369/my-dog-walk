import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { formatDistance, formatDuration } from '@/lib/format';
import { loadWalkLogs, sortDatesDesc, type WalkEntry } from '@/lib/walk-storage';

export default function WalkTab() {
  const router = useRouter();
  const [recentWalk, setRecentWalk] = useState<WalkEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const logs = await loadWalkLogs();
        if (!active) return;
        const [latestDate] = sortDatesDesc(logs);
        const latestEntry = latestDate ? logs[latestDate]?.[0] ?? null : null;
        setRecentWalk(latestEntry ?? null);
      };
      load();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Ready to walk?</Text>
        <Text style={styles.heroSubtitle}>Nike Run Club 감성으로 가볍게 시작해요.</Text>
      </View>

      <Pressable style={styles.startButton} onPress={() => router.push('/walk-session')}>
        <Text style={styles.startLabel}>START</Text>
      </Pressable>

      {recentWalk ? (
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>마지막 산책</Text>
          <Text style={styles.recentMetrics}>
            {formatDuration(recentWalk.time)} · {formatDistance(recentWalk.distance)}
          </Text>
          {recentWalk.memo ? <Text style={styles.recentMemo}>{recentWalk.memo}</Text> : null}
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>첫 산책을 시작해보세요</Text>
          <Text style={styles.placeholderSubtitle}>START 버튼을 눌러 산책을 기록합니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 24,
    gap: 32,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  startButton: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  startLabel: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  recentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  recentMetrics: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  recentMemo: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  placeholderCard: {
    backgroundColor: '#ecfdf3',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  placeholderSubtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
  },
});
