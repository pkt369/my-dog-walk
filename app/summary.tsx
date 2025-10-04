import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { Colors } from '@/constants/theme';
import { formatDistance, formatDuration } from '@/lib/format';
import type { CoordinateTuple } from '@/lib/geo';
import { addWalkLog } from '@/lib/walk-storage';
import { shareCaptureStyles } from '../components/share-capture-styles';

interface SummaryPayload {
  duration: number;
  distance: number;
  path: CoordinateTuple[];
  snapshotUri?: string;
}

const waitForFrames = async (count: number = 2) => {
  for (let i = 0; i < count; i++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
};

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const sharePreviewRef = useRef<ViewShot | null>(null);

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
      snapshotUri: payload.snapshotUri,
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

  const handleShare = async () => {
    if (!payload?.snapshotUri) {
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
      await waitForFrames(2);
      let shareUri = payload.snapshotUri;

      if (sharePreviewRef.current) {
        try {
          const captured = await captureRef(sharePreviewRef.current, {
            format: 'png',
            quality: 0.95,
          });
          if (captured) {
            shareUri = captured;
          }
        } catch (captureError) {
          console.warn('Failed to capture share preview', captureError);
        }
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: '산책 공유하기',
      });
    } catch (error) {
      console.warn('Failed to share walk summary', error);
      Alert.alert('공유 실패', '공유하는 중 문제가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  if (!payload) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContent]}>
        <Text style={styles.errorText}>요약 정보를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.primaryLabel}>홈으로 돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.scrollInner}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>산책 완료!</Text>
              <Text style={styles.heroSubtitle}>댕댕이가 행복해하고 있어요 🐾</Text>
            </View>

            {payload.snapshotUri ? (
              <View style={shareCaptureStyles.container}>
                <ViewShot
                  ref={sharePreviewRef}
                  style={[
                    shareCaptureStyles.captureSurface,
                    !isSharing && shareCaptureStyles.captureSurfaceRounded // 화면에서는 둥근 사각형, 공유 캡처 시엔 네모
                  ]}
                  options={{ format: 'png', quality: 1 }}>
                  <View style={shareCaptureStyles.metricsCard}>
                    <View style={shareCaptureStyles.metricRow}>
                      <Text style={shareCaptureStyles.metricLabel}>산책 시간</Text>
                      <Text style={shareCaptureStyles.metricValue}>{formatDuration(payload.duration)}</Text>
                    </View>
                    <View style={shareCaptureStyles.metricRow}>
                      <Text style={shareCaptureStyles.metricLabel}>이동 거리</Text>
                      <Text style={shareCaptureStyles.metricValue}>{formatDistance(payload.distance)}</Text>
                    </View>
                  </View>

                  <View style={shareCaptureStyles.snapshotCard}>
                    <Image
                      source={{ uri: payload.snapshotUri }}
                      style={shareCaptureStyles.snapshotImage}
                      contentFit="cover"
                    />
                  </View>
                </ViewShot>
              </View>
            ) : (
              <View style={shareCaptureStyles.placeholderCard}>
                <Text style={shareCaptureStyles.placeholderTitle}>지도 이미지를 만들지 못했어요</Text>
                <Text style={shareCaptureStyles.placeholderSubtitle}>네트워크 또는 권한 문제로 스냅샷 생성이 실패했을 수 있어요.</Text>
              </View>
            )}

            {payload.snapshotUri ? (
              <Pressable
                style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
                onPress={handleShare}
                disabled={isSharing}
              >
                <Text style={styles.shareLabel}>{isSharing ? '공유 준비 중...' : '산책 공유하기'}</Text>
              </Pressable>
            ) : null}

            <View style={styles.memoBlock}>
              <Text style={styles.memoLabel}>메모 (선택)</Text>
              <TextInput
                placeholder="산책 중 느낀 점이나 강아지 상태를 기록해보세요"
                placeholderTextColor="#9ca3af"
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                multiline
                returnKeyType="done"
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
              <Text style={styles.primaryLabel}>{isSaving ? '저장 중...' : '기록 저장하기'}</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
    padding: 24,
    gap: 24,
    paddingBottom: 40,
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
  memoBlock: {
    gap: 12,
  },
  memoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  snapshotImage: {
    width: '100%',
    height: 220,
  },
  shareButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  errorContent: {
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
});
