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
import { loadWalkLogs, removeWalkLog, type WalkEntry } from '@/lib/walk-storage';
import { shareCaptureStyles } from '../../../components/share-capture-styles';
import { useLocalization } from '@/lib/i18n';

const waitForFrames = async (count: number = 2) => {
  for (let i = 0; i < count; i++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
};

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { date, id } = useLocalSearchParams<{ date?: string; id?: string }>();
  const {
    strings,
    formatDuration,
    formatDistance,
    formatDateLabel,
  } = useLocalization();
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
        dialogTitle: strings.common.shareDialogTitle,
      });
    } catch (error) {
      console.warn('Failed to share activity entry', error);
      Alert.alert(strings.common.shareFailedTitle, strings.common.shareFailedMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    if (!entry || typeof date !== 'string') return;

    Alert.alert(strings.activity.deleteTitle, strings.activity.deleteMessage, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
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
            Alert.alert(strings.common.deleteFailedTitle, strings.common.deleteFailedMessage);
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
        <Text style={styles.errorText}>{strings.activityDetail.invalidRouteMessage}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryLabel}>{strings.common.backButton}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{strings.activityDetail.missingMessage}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryLabel}>{strings.common.backButton}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: metricsLabel ?? strings.activityDetail.screenTitle }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              {entry.snapshotUri ? (
                <View style={shareCaptureStyles.container}>
                  <ViewShot
                    ref={shareRef}
                    style={[
                      shareCaptureStyles.captureSurface,
                      !isSharing && shareCaptureStyles.captureSurfaceRounded // 화면에서는 둥근 사각형, 공유 캡처 시엔 네모
                    ]}
                    options={{ format: 'png', quality: 1 }}>
                    <View style={shareCaptureStyles.metricsCard}>
                      <View style={shareCaptureStyles.metricRow}>
                        <Text style={shareCaptureStyles.metricLabel}>{strings.common.walkTimeLabel}</Text>
                        <Text style={shareCaptureStyles.metricValue}>{formatDuration(entry.time)}</Text>
                      </View>
                      <View style={shareCaptureStyles.metricRow}>
                        <Text style={shareCaptureStyles.metricLabel}>{strings.common.walkDistanceLabel}</Text>
                        <Text style={shareCaptureStyles.metricValue}>{formatDistance(entry.distance)}</Text>
                      </View>
                    </View>
                    <View style={shareCaptureStyles.snapshotCard}>
                      <Image source={{ uri: entry.snapshotUri }} style={shareCaptureStyles.snapshotImage} contentFit="cover" />
                    </View>
                  </ViewShot>
                </View>
              ) : (
                <View style={shareCaptureStyles.placeholderCard}>
                  <Text style={shareCaptureStyles.placeholderTitle}>{strings.activityDetail.snapshotMissingTitle}</Text>
                  <Text style={shareCaptureStyles.placeholderSubtitle}>{strings.activityDetail.snapshotMissingSubtitle}</Text>
                </View>
              )}

              {entry.memo ? (
                <View style={styles.memoBlock}>
                  <Text style={styles.memoLabel}>{strings.activityDetail.memoLabel}</Text>
                  <Text style={styles.memoValue}>{entry.memo}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShare}
                  disabled={isSharing || !entry.snapshotUri}>
                  <Text style={styles.actionButtonText}>
                    {isSharing ? strings.common.shareInProgress : strings.common.share}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={isDeleting}>
                  <Text style={styles.actionButtonText}>
                    {isDeleting ? strings.common.deleteInProgress : strings.common.deleteAction}
                  </Text>
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
});
