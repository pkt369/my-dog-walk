import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInterstitialAd } from '@/hooks/use-interstitial-ad';
import { CoordinateTuple, haversineDistance } from '@/lib/geo';
import { useLocalization } from '@/lib/i18n';

interface WalkPayload {
  duration: number;
  distance: number;
  path: CoordinateTuple[];
  snapshotUri?: string;
}

const REGION_PADDING_FACTOR = 1.05;
const MIN_REGION_DELTA = 0.002;

const computeBoundingRegion = (points: CoordinateTuple[]): Region => {
  if (points.length === 0) {
    return {
      latitude: 0,
      longitude: 0,
      latitudeDelta: MIN_REGION_DELTA,
      longitudeDelta: MIN_REGION_DELTA,
    };
  }

  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLon = points[0][1];
  let maxLon = points[0][1];

  for (const [lat, lon] of points) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLon + maxLon) / 2;
  const latDelta = Math.max((maxLat - minLat) * REGION_PADDING_FACTOR, MIN_REGION_DELTA);
  const lonDelta = Math.max((maxLon - minLon) * REGION_PADDING_FACTOR, MIN_REGION_DELTA);

  return {
    latitude,
    longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
};

const waitForFrames = (frameCount = 2) =>
  new Promise<void>((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(remaining - 1));
    };
    step(frameCount);
  });

export default function WalkScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const pathPrimaryColor = themeColors.tint;
  const pathOutlineColor = colorScheme === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.92)';
  const { strings, formatDuration, formatDistance } = useLocalization();
  const [path, setPath] = useState<CoordinateTuple[]>([]);
  const [region, setRegion] = useState<Region | undefined>();
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const { showAd } = useInterstitialAd();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const startTsRef = useRef<number | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const isMountedRef = useRef(true);
  const showUserLocationRef = useRef(true);

  const snapshotDirectory = useMemo(() => {
    const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? null;
    if (!base) return null;
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return `${normalized}walk-snapshots`;
  }, []);

  useEffect(() => {
    showUserLocationRef.current = showUserLocation;
  }, [showUserLocation]);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const ensureSnapshotDirectory = async () => {
    if (!snapshotDirectory) return null;
    try {
      const info = await FileSystem.getInfoAsync(snapshotDirectory);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(snapshotDirectory, { intermediates: true });
      }
      return snapshotDirectory;
    } catch (error) {
      console.warn('Failed to prepare snapshot directory', error);
      return null;
    }
  };

  const captureSnapshot = async () => {
    const map = mapRef.current;
    if (!map) return null;
    let restoreUserLocation = false;
    let regionBeforeSnapshot: Region | undefined;
    try {
      if (showUserLocationRef.current) {
        restoreUserLocation = true;
        setShowUserLocation(false);
        showUserLocationRef.current = false;
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      }

      if (path.length > 0) {
        regionBeforeSnapshot = region;
        const boundingRegion = computeBoundingRegion(path);
        setRegion(boundingRegion);
        await waitForFrames(3);
      }

      const snapshotPath = await map.takeSnapshot({
        width: 600,
        height: 600,
        format: 'png',
        quality: 0.9,
        result: 'file',
      });
      if (!snapshotPath) return null;

      const normalized = snapshotPath.startsWith('file://') ? snapshotPath : `file://${snapshotPath}`;
      const targetDir = await ensureSnapshotDirectory();
      if (!targetDir) {
        return normalized;
      }
      const fileName = `walk-${Date.now()}.png`;
      const destination = `${targetDir}/${fileName}`;
      await FileSystem.moveAsync({ from: normalized, to: destination });
      return destination;
    } catch (error) {
      console.warn('Failed to capture map snapshot', error);
      return null;
    } finally {
      if (restoreUserLocation && isMountedRef.current) {
        setShowUserLocation(true);
        showUserLocationRef.current = true;
      }
      if (regionBeforeSnapshot && isMountedRef.current) {
        setRegion(regionBeforeSnapshot);
      }
    }
  };

  useEffect(() => {
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.walkSession.locationPermissionTitle, strings.walkSession.locationPermissionMessage, [
          { text: strings.common.confirm, onPress: () => router.back() },
        ]);
        return;
      }

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const initialPoint: CoordinateTuple = [
        initial.coords.latitude,
        initial.coords.longitude,
      ];

      setDistance(0);
      setElapsed(0);
      setPath([initialPoint]);
      setRegion({
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });

      startTsRef.current = Date.now();
      setIsTracking(true);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (location) => {
          if (!isMountedRef.current) {
            return;
          }

          setRegion((prev) => ({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: prev?.latitudeDelta ?? 0.002,
            longitudeDelta: prev?.longitudeDelta ?? 0.002,
          }));

          const nextPoint: CoordinateTuple = [
            location.coords.latitude,
            location.coords.longitude,
          ];

          setPath((prev) => {
            if (prev.length === 0) {
              return [nextPoint];
            }

            const lastPoint = prev[prev.length - 1];
            const segment = haversineDistance(
              { latitude: lastPoint[0], longitude: lastPoint[1] },
              { latitude: nextPoint[0], longitude: nextPoint[1] }
            );
            setDistance((current) => current + segment);
            return [...prev, nextPoint];
          });
        }
      );
    };

    startTracking();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [router]);

  useEffect(() => {
    if (!isTracking) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (!startTsRef.current) return;
      const delta = Math.floor((Date.now() - startTsRef.current) / 1000);
      setElapsed(delta);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTracking]);

  const handleStop = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);

    const finalDuration = startTsRef.current
      ? Math.floor((Date.now() - startTsRef.current) / 1000)
      : elapsed;

    const snapshotUri = await captureSnapshot();

    const payload: WalkPayload = {
      duration: finalDuration,
      distance,
      path,
      snapshotUri: snapshotUri ?? undefined,
    };
    const serializedPayload = JSON.stringify(payload);

    try {
      await showAd();
    } catch (error) {
      if (__DEV__) {
        console.warn('[ads] Interstitial show failed', error);
      }
    } finally {
      setIsCompleting(false);
    }

    router.replace({ pathname: '/summary', params: { payload: serializedPayload } });
  };

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          region={region}
          showsUserLocation={showUserLocation}
          followsUserLocation>
          {path.length > 1 ? (
            <>
              <Polyline
                coordinates={path.map(([latitude, longitude]) => ({ latitude, longitude }))}
                strokeColor={pathOutlineColor}
                strokeWidth={11}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={path.map(([latitude, longitude]) => ({ latitude, longitude }))}
                strokeColor={pathPrimaryColor}
                strokeWidth={7}
                lineCap="round"
                lineJoin="round"
              />
            </>
          ) : null}
        </MapView>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{strings.walkSession.loadingPosition}</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay}>
        <View style={styles.statsCard}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>{strings.common.timeLabel}</Text>
            <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>{strings.common.walkDistanceLabel}</Text>
            <Text style={styles.statValue}>{formatDistance(distance)}</Text>
          </View>
        </View>

        <Pressable style={styles.stopButton} onPress={handleStop} disabled={isCompleting}>
          <Text style={styles.stopLabel}>
            {isCompleting ? strings.walkSession.stopInProgress : strings.walkSession.stopButton}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    gap: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  stopLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
