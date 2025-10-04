import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { Colors } from '@/constants/theme';
import { formatDateLabel, formatDistance, formatDuration } from '@/lib/format';
import { loadWalkLogs, removeWalkLog, type WalkEntry } from '@/lib/walk-storage';


export default function ActivityDetailScreen() {
  const router = useRouter();
  const { date, id } = useLocalSearchParams<{ date?: string; id?: string }>();
  const [entry, setEntry] = useState<WalkEntry | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const shareRef = useRef<ViewShot | null>(null);

  const isParamsValid = typeof date === 'string' && typeof id === 'string';

  useEffect(() => {
    if (!isParamsValid) return;
    const load = async () => {
      const logs = await loadWalkLogs();
      const entries = logs[date] ?? [];
      const found = entries.find((item) => item.id === id) ?? null;
      setEntry(found);
    };
    load();
  }, [date, id, isParamsValid]);

  const handleShare = async () => {
    if (!entry?.snapshotUri) {
      Alert.alert('이미지가 없어요', '지도 스냅샷을 찾을 수 없어 공유할 수 없어요.');
      return;
    }

    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('공유를 지원하지 않아요', '이 기기에서는 공유 기능을 사용할 수 없어요.');
        return;
      }
      setIsSharing(true);
      let shareUri = entry.snapshotUri;

      if (shareRef.current) {
        try {
          const captured = await captureRef(shareRef.current, {
            format: 'png',
            quality: 0.95,
          });
          if (captured) {
            shareUri = captured;
          }
        } catch (captureError) {
          console.warn('Failed to capture activity share view', captureError);
        }
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: '산책 공유하기',
      });
    } catch (error) {
      console.warn('Failed to share activity entry', error);
      Alert.alert('공유 실패', '공유하는 중 문제가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    if (!entry || typeof date !== 'string') return;

    Alert.alert('산책 삭제', '해당 산책 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await removeWalkLog(date, entry.id);
            setIsDeleting(false);
            router.back();
          } catch (error) {
            console.warn('Failed to delete walk entry', error);
            setIsDeleting(false);
            Alert.alert('삭제 실패', '산책 기록을 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.');
          }
        },
      },
    ]);
  };

  const metricsLabel = useMemo(() => {
    if (!entry || typeof date !== 'string') return null;
    return formatDateLabel(date);
  }, [entry, date]);

  if (!isParamsValid) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>잘못된 경로로 접근했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryLabel}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>산책 기록을 찾지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryLabel}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: metricsLabel ?? '산책 기록' }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              {entry.snapshotUri ? (
                <View style={styles.captureContainer}>
                  <ViewShot ref={shareRef} style={styles.shareCapture} options={{ format: 'png', quality: 1 }} >
                    <View style={styles.metricCardCapture}>
                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>산책 시간</Text>
                        <Text style={styles.metricValue}>{formatDuration(entry.time)}</Text>
                      </View>
                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>이동 거리</Text>
                        <Text style={styles.metricValue}>{formatDistance(entry.distance)}</Text>
                      </View>
                    </View>
                    <View style={styles.snapshotCardCapture}>
                      <Image source={{ uri: entry.snapshotUri }} style={styles.snapshotImage} contentFit="cover" />
                    </View>
                  </ViewShot>
                </View>
              ) : (
                <View style={styles.snapshotPlaceholder}>
                  <Text style={styles.snapshotTitle}>지도 이미지를 찾을 수 없어요</Text>
                  <Text style={styles.snapshotSubtitle}>이 산책에는 저장된 지도 스냅샷이 없어요.</Text>
                </View>
              )}

              {entry.memo ? (
                <View style={styles.memoBlock}>
                  <Text style={styles.memoLabel}>메모</Text>
                  <Text style={styles.memoValue}>{entry.memo}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShare}
                  disabled={isSharing || !entry.snapshotUri}>
                  <Text style={styles.actionButtonText}>{isSharing ? '공유 준비 중...' : '공유하기'}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={isDeleting}>
                  <Text style={styles.actionButtonText}>{isDeleting ? '삭제 중...' : '삭제하기'}</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  content: {
    gap: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
  },
  captureContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  metricCardCapture: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    marginBottom: 16,
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
  snapshotImage: {
    width: '100%',
    height: 280,
  },
  snapshotPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  snapshotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  snapshotSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  memoBlock: {
    gap: 8,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
  },
  memoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memoValue: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  shareButton: {
    backgroundColor: Colors.light.tint,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  primaryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  shareCapture: {
    gap: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  snapshotCardCapture: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
});
