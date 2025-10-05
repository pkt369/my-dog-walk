import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  createRef,
  useCallback,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import {
  loadWalkLogs,
  removeWalkLog,
  sortDatesDesc,
  type WalkEntry,
  type WalkLogMap,
} from '@/lib/walk-storage';
import { useLocalization } from '@/lib/i18n';

const DELETE_ACTION_WIDTH = 100;

export default function ActivityScreen() {
  const router = useRouter();
  const {
    strings,
    formatDuration,
    formatDistance,
    formatDateLabel,
    formatTime,
  } = useLocalization();
  const [walkLogs, setWalkLogs] = useState<WalkLogMap>({});

  const swipeableRefs = useRef<Record<string, RefObject<SwipeableMethods | null>>>({});

  const getSwipeableRef = (id: string) => {
    if (!swipeableRefs.current[id]) {
      swipeableRefs.current[id] = createRef<SwipeableMethods | null>();
    }
    return swipeableRefs.current[id];
  };

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

  const closeSwipeable = (id: string) => {
    const ref = swipeableRefs.current[id];
    ref?.current?.close();
  };

  const handleDeleteEntry = (dateKey: string, entry: WalkEntry) => {
    closeSwipeable(entry.id);
    Alert.alert(strings.activity.deleteTitle, strings.activity.deleteMessage, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          const nextLogs = await removeWalkLog(dateKey, entry.id);
          setWalkLogs(nextLogs);
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.container}>
        {dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{strings.activity.emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{strings.activity.emptySubtitle}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {dates.map((dateKey) => (
              <View key={dateKey} style={styles.section}>
                <Text style={styles.sectionTitle}>{formatDateLabel(dateKey)}</Text>
                <View style={styles.sectionCard}>
                  {walkLogs[dateKey]?.map((entry: WalkEntry, index: number, arr) => (
                    <Swipeable
                      key={entry.id}
                      ref={getSwipeableRef(entry.id)}
                      renderLeftActions={(progress, translation) => (
                        <SwipeDeleteAction
                          progress={progress}
                          translation={translation}
                          label={strings.activity.swipeDelete}
                        />
                      )}
                      overshootLeft={false}
                      onSwipeableOpen={() =>
                        handleDeleteEntry(dateKey, entry)
                      }>
                      <View style={[styles.entryRow, index === arr.length - 1 && styles.entryRowLast]}>
                        <View style={styles.entryMeta}>
                          <Text style={styles.entryTime}>{formatTime(entry.endedAt)}</Text>
                          <Text style={styles.entryDetail}>
                            {formatDuration(entry.time)} · {formatDistance(entry.distance)}
                          </Text>
                        </View>
                        {entry.snapshotUri ? (
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: '/activity/[date]/[id]',
                                params: { date: dateKey, id: entry.id },
                              })
                            }>
                            <Image
                              source={{ uri: entry.snapshotUri }}
                              style={styles.entryImage}
                              contentFit="cover"
                            />
                          </Pressable>
                        ) : null}
                        {entry.memo ? <Text style={styles.entryMemo}>{entry.memo}</Text> : null}
                      </View>
                    </Swipeable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

type SwipeDeleteActionProps = {
  progress: SharedValue<number>;
  translation: SharedValue<number>;
  label: string;
};

const SwipeDeleteAction = ({ progress, translation, label }: SwipeDeleteActionProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const clampedTranslation = Math.min(
      Math.max(translation.value, 0),
      DELETE_ACTION_WIDTH
    );
    const visibleProgress = Math.min(Math.max(progress.value, 0), 1);

    return {
      opacity: visibleProgress,
      transform: [
        {
          translateX: clampedTranslation - DELETE_ACTION_WIDTH,
        },
      ],
    };
  }, [progress, translation]);

  return (
    <Animated.View style={[styles.swipeDeleteContainer, animatedStyle]}>
      <View style={styles.swipeDeleteAction}>
        <Text style={styles.swipeDeleteText}>{label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  swipeDeleteContainer: {
    height: '100%',
    justifyContent: 'center',
    width: DELETE_ACTION_WIDTH,
    overflow: 'hidden',
  },
  swipeDeleteAction: {
    height: '100%',
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
