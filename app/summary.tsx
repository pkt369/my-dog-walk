import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { Colors } from '@/constants/theme';
import type { CoordinateTuple } from '@/lib/geo';
import { addWalkLog } from '@/lib/walk-storage';
import { shareCaptureStyles } from '../components/share-capture-styles';
import { useLocalization } from '@/lib/i18n';

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
  const { strings, formatDuration, formatDistance } = useLocalization();
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const sharePreviewRef = useRef<ViewShot | null>(null);
  const scrollRef = useRef<ScrollViewType | null>(null);
  const insets = useSafeAreaInsets();
  const paddingBottom = 40 + insets.bottom;
  const keyboardOffset = Platform.OS === 'ios' ? insets.top + 12 : 0;

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
    Alert.alert(strings.summary.alertCompleteTitle, strings.summary.alertCompleteMessage, [
      {
        text: strings.common.confirm,
        onPress: () => router.replace('/(tabs)/home'),
      },
    ]);
  };

  const handleShare = async () => {
    if (!payload?.snapshotUri) {
      Alert.alert(strings.common.missingImageTitle, strings.common.missingImageMessage);
      return;
    }

    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(strings.common.shareUnavailableTitle, strings.common.shareUnavailableMessage);
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
        dialogTitle: strings.common.shareDialogTitle,
      });
    } catch (error) {
      console.warn('Failed to share walk summary', error);
      Alert.alert(strings.common.shareFailedTitle, strings.common.shareFailedMessage);
    } finally {
      setIsSharing(false);
    }
  };

  if (!payload) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContent]}>
        <Text style={styles.errorText}>{strings.summary.loadErrorMessage}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.primaryLabel}>{strings.common.homeButton}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={[styles.scrollInner, { paddingBottom }]}>
              <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>{strings.summary.heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{strings.summary.heroSubtitle}</Text>
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
                        <Text style={shareCaptureStyles.metricLabel}>{strings.common.walkTimeLabel}</Text>
                        <Text style={shareCaptureStyles.metricValue}>{formatDuration(payload.duration)}</Text>
                      </View>
                      <View style={shareCaptureStyles.metricRow}>
                        <Text style={shareCaptureStyles.metricLabel}>{strings.common.walkDistanceLabel}</Text>
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
                  <Text style={shareCaptureStyles.placeholderTitle}>{strings.summary.snapshotMissingTitle}</Text>
                  <Text style={shareCaptureStyles.placeholderSubtitle}>{strings.summary.snapshotMissingSubtitle}</Text>
                </View>
              )}

              {payload.snapshotUri ? (
                <Pressable
                  style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  <Text style={styles.shareLabel}>
                    {isSharing ? strings.summary.shareInProgress : strings.summary.shareButton}
                  </Text>
                </Pressable>
              ) : null}

              <View style={styles.memoBlock}>
                <Text style={styles.memoLabel}>{strings.summary.memoLabel}</Text>
                <TextInput
                  placeholder={strings.summary.memoPlaceholder}
                  placeholderTextColor="#9ca3af"
                  style={styles.memoInput}
                  value={memo}
                  onChangeText={setMemo}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 50);
                  }}
                  multiline
                  returnKeyType="done"
                />
              </View>

              <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
                <Text style={styles.primaryLabel}>
                  {isSaving ? strings.summary.saveInProgress : strings.summary.saveButton}
                </Text>
              </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
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
