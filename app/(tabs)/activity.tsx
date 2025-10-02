import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { formatDateLabel, formatDistance, formatDuration } from '@/lib/format';
import { loadWalkLogs, sortDatesDesc, type WalkEntry, type WalkLogMap } from '@/lib/walk-storage';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ActivityScreen() {
  const [walkLogs, setWalkLogs] = useState<WalkLogMap>({});

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetch = async () => {
        const logs = await loadWalkLogs();
        if (!isMounted) return;
        setWalkLogs(logs);
      };
      fetch();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const dates = sortDatesDesc(walkLogs);

  return (
    <SafeAreaView style={styles.container}>
      {dates.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptySubtitle}>첫 산책을 기록하면 여기에서 확인할 수 있어요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {dates.map((dateKey) => (
            <View key={dateKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{formatDateLabel(dateKey)}</Text>
              <View style={styles.sectionCard}>
                {walkLogs[dateKey]?.map((entry: WalkEntry, index: number, arr) => (
                  <View
                    key={entry.id}
                    style={[styles.entryRow, index === arr.length - 1 && styles.entryRowLast]}>
                    <View style={styles.entryMeta}>
                      <Text style={styles.entryTime}>{formatTime(entry.endedAt)}</Text>
                      <Text style={styles.entryDetail}>
                        {formatDuration(entry.time)} · {formatDistance(entry.distance)}
                      </Text>
                    </View>
                    {entry.snapshotUri ? (
                      <Image
                        source={{ uri: entry.snapshotUri }}
                        style={styles.entryImage}
                        contentFit="cover"
                      />
                    ) : null}
                    {entry.memo ? <Text style={styles.entryMemo}>{entry.memo}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
  entryRow: {
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
  },
  entryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  entryImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
  },
  entryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  entryDetail: {
    fontSize: 14,
    color: '#4b5563',
  },
  entryMemo: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
});
