import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDistance, formatDuration } from '@/lib/format';
import { CoordinateTuple, haversineDistance } from '@/lib/geo';

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
  const [path, setPath] = useState<CoordinateTuple[]>([]);
  const [region, setRegion] = useState<Region | undefined>();
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mockMovementRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef<number | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const mockHeadingRef = useRef(0);
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
        Alert.alert('위치 권한 필요', '산책을 기록하려면 위치 접근 허용이 필요해요.', [
          { text: '확인', onPress: () => router.back() },
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

      // 기존 위치 추적 로직 (실제 GPS 이동 감지)
      // subscriptionRef.current = await Location.watchPositionAsync(
      //   {
      //     accuracy: Location.Accuracy.High,
      //     timeInterval: 4000,
      //     distanceInterval: 5,
      //   },
      //   (location) => {
      //     setRegion((prev) => ({
      //       latitude: location.coords.latitude,
      //       longitude: location.coords.longitude,
      //       latitudeDelta: prev?.latitudeDelta ?? 0.002,
      //       longitudeDelta: prev?.longitudeDelta ?? 0.002,
      //     }));

      //     setPath((prev) => {
      //       const nextPoint: CoordinateTuple = [
      //         location.coords.latitude,
      //         location.coords.longitude,
      //       ];
      //       if (prev.length === 0) {
      //         return [nextPoint];
      //       }
      //       const lastPoint = prev[prev.length - 1];
      //       const segment = haversineDistance(
      //         { latitude: lastPoint[0], longitude: lastPoint[1] },
      //         { latitude: nextPoint[0], longitude: nextPoint[1] }
      //       );
      //       setDistance((current) => current + segment);
      //       return [...prev, nextPoint];
      //     });
      //   }
      // );

      const SIMULATION_INTERVAL_MS = 2000;
      const WALK_SPEED_MPS = 5; // 평균 보행 속도

      const advanceMockPosition = () => {
        setPath((prev) => {
          const lastPoint = prev[prev.length - 1] ?? initialPoint;
          const stepSeconds = SIMULATION_INTERVAL_MS / 1000;
          const stepDistanceMeters = WALK_SPEED_MPS * stepSeconds;
          const headingDeg = mockHeadingRef.current;
          const headingRad = (headingDeg * Math.PI) / 180;
          mockHeadingRef.current = 90;

          const metersNorth = Math.cos(headingRad) * stepDistanceMeters;
          const metersEast = Math.sin(headingRad) * stepDistanceMeters;
          const metersPerDegreeLat = 111_139;
          const metersPerDegreeLonRaw = 111_139 * Math.cos((lastPoint[0] * Math.PI) / 180);
          const metersPerDegreeLon = Math.max(1, Math.abs(metersPerDegreeLonRaw));

          const deltaLat = metersNorth / metersPerDegreeLat;
          const deltaLon = (metersEast / metersPerDegreeLon) * Math.sign(metersPerDegreeLonRaw || 1);

          const nextPoint: CoordinateTuple = [lastPoint[0] + deltaLat, lastPoint[1] + deltaLon];

          setRegion((prevRegion) => ({
            latitude: nextPoint[0],
            longitude: nextPoint[1],
            latitudeDelta: prevRegion?.latitudeDelta ?? 0.002,
            longitudeDelta: prevRegion?.longitudeDelta ?? 0.002,
          }));

          const segmentKm = haversineDistance(
            { latitude: lastPoint[0], longitude: lastPoint[1] },
            { latitude: nextPoint[0], longitude: nextPoint[1] }
          );
          setDistance((current) => current + segmentKm);

          return [...prev, nextPoint];
        });
      };

      if (mockMovementRef.current) {
        clearInterval(mockMovementRef.current);
        mockMovementRef.current = null;
      }

      advanceMockPosition();
      mockMovementRef.current = setInterval(advanceMockPosition, SIMULATION_INTERVAL_MS);
    };

    startTracking();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mockMovementRef.current) {
        clearInterval(mockMovementRef.current);
        mockMovementRef.current = null;
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
    if (mockMovementRef.current) {
      clearInterval(mockMovementRef.current);
      mockMovementRef.current = null;
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

    setIsCompleting(false);
    router.replace({ pathname: '/summary', params: { payload: JSON.stringify(payload) } });
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
          <Text style={styles.placeholderText}>위치 정보를 불러오는 중이에요…</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay}>
        <View style={styles.statsCard}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>경과 시간</Text>
            <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>이동 거리</Text>
            <Text style={styles.statValue}>{formatDistance(distance)}</Text>
          </View>
        </View>

        <Pressable style={styles.stopButton} onPress={handleStop} disabled={isCompleting}>
          <Text style={styles.stopLabel}>{isCompleting ? '처리 중...' : '산책 종료'}</Text>
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
